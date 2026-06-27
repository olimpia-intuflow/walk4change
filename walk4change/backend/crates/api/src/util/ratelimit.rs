//! In-memory fixed-window per-IP rate limiter.
//!
//! Two instances are created in [`crate::build_app`]:
//! - **auth** — strict bucket for `/api/v1/auth/*`
//! - **global** — moderate bucket for all other routes
//!
//! Uses `std::time::Instant` (monotonic) for window tracking.

use std::collections::HashMap;
use std::net::IpAddr;
use std::sync::Mutex;
use std::time::{Duration, Instant};

struct Window {
    count: u32,
    start: Instant,
}

/// Thread-safe fixed-window per-IP rate limiter.
pub struct RateLimiter {
    buckets: Mutex<HashMap<IpAddr, Window>>,
    max_requests: u32,
    window: Duration,
}

impl RateLimiter {
    /// Create a new limiter allowing `max_requests` per `window_secs` seconds.
    pub fn new(max_requests: u32, window_secs: u64) -> Self {
        Self {
            buckets: Mutex::new(HashMap::new()),
            max_requests,
            window: Duration::from_secs(window_secs),
        }
    }

    /// Check whether `ip` is within quota.
    ///
    /// Returns `Ok(())` if the request may proceed (counter is incremented).
    /// Returns `Err(retry_after_secs)` if quota is exhausted (≥1 second).
    pub fn check(&self, ip: IpAddr) -> Result<(), u64> {
        let mut buckets = self
            .buckets
            .lock()
            .unwrap_or_else(|poisoned| poisoned.into_inner());

        let now = Instant::now();

        let entry = buckets.entry(ip).or_insert_with(|| Window {
            count: 0,
            start: now,
        });

        // Roll the window when it has fully elapsed.
        if now.duration_since(entry.start) >= self.window {
            entry.count = 0;
            entry.start = now;
        }

        if entry.count >= self.max_requests {
            let elapsed = now.duration_since(entry.start);
            let remaining = self.window.saturating_sub(elapsed);
            // Report at least 1 second so clients never get Retry-After: 0.
            let retry_after = remaining.as_secs().max(1);
            return Err(retry_after);
        }

        entry.count += 1;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::Ipv4Addr;

    #[test]
    fn allows_up_to_max_requests() {
        let lim = RateLimiter::new(3, 60);
        let ip = IpAddr::V4(Ipv4Addr::LOCALHOST);
        assert!(lim.check(ip).is_ok());
        assert!(lim.check(ip).is_ok());
        assert!(lim.check(ip).is_ok());
        assert!(lim.check(ip).is_err());
    }

    #[test]
    fn different_ips_have_separate_buckets() {
        let lim = RateLimiter::new(1, 60);
        let ip_a = IpAddr::V4(Ipv4Addr::new(10, 0, 0, 1));
        let ip_b = IpAddr::V4(Ipv4Addr::new(10, 0, 0, 2));
        assert!(lim.check(ip_a).is_ok());
        assert!(lim.check(ip_b).is_ok());
        assert!(lim.check(ip_a).is_err());
    }

    #[test]
    fn retry_after_is_at_least_one() {
        let lim = RateLimiter::new(1, 60);
        let ip = IpAddr::V4(Ipv4Addr::LOCALHOST);
        lim.check(ip).unwrap();
        let retry = lim.check(ip).unwrap_err();
        assert!(retry >= 1);
    }
}
