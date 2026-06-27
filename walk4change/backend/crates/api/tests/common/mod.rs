use std::sync::Arc;
use sqlx::{PgPool, postgres::PgPoolOptions};
use tokio::net::TcpListener;
use walk4change_api::{config::AppConfig, db, router_health, state::AppState};

/// Shared test app handle. `base_url` and `client` are unused until Task 4+
/// but are intentionally kept public for the integration test harness.
///
/// `_db_guard` holds a single-connection pool that owns the Postgres session
/// advisory lock (key 727274).  When `TestApp` is dropped the pool closes,
/// Postgres releases the lock, and the next queued test may proceed.
#[allow(dead_code)]
pub struct TestApp {
    pub pool: PgPool,
    pub base_url: String,
    pub client: reqwest::Client,
    _db_guard: PgPool,
}

/// Spawn a test instance of the API server against `TEST_DATABASE_URL`.
///
/// - Acquires a Postgres session advisory lock so that concurrent test
///   processes are serialized (one truncate + setup at a time).
/// - Connects a pool
/// - Runs pending migrations
/// - TRUNCATEs all tables for test isolation
/// - Binds the current router to an ephemeral port
/// - Returns pool, base URL, and a reqwest client
pub async fn spawn() -> TestApp {
    let db_url = std::env::var("TEST_DATABASE_URL")
        .expect("TEST_DATABASE_URL must be set for integration tests");

    // ── advisory lock ────────────────────────────────────────────────────────
    // A dedicated single-connection pool keeps the session alive for the
    // lifetime of TestApp.  pg_advisory_lock blocks until no other test holds
    // the lock, serializing DB-touching setup across parallel processes.
    let guard_pool = PgPoolOptions::new()
        .max_connections(1)
        .connect(&db_url)
        .await
        .expect("failed to connect guard pool for advisory lock");

    sqlx::query("SELECT pg_advisory_lock(727274)")
        .execute(&guard_pool)
        .await
        .expect("failed to acquire pg advisory lock");

    // ── main pool + migrations + truncate ────────────────────────────────────
    let pool = db::make_pool(&db_url)
        .await
        .expect("failed to connect to test database");

    db::run_migrations(&pool)
        .await
        .expect("migrations failed in test harness");

    // TRUNCATE all tables in dependency order; CASCADE handles FK constraints.
    sqlx::query(
        "TRUNCATE \
            reward_redemptions, user_totals, location_pings, walk_participants, \
            walk_sessions, friendships, nature_zones, users, rewards_catalog \
         RESTART IDENTITY CASCADE",
    )
    .execute(&pool)
    .await
    .expect("failed to truncate tables for test isolation");

    let mut config = AppConfig::test_default();
    config.database_url = db_url;
    config.jwt_secret = "test-secret-that-is-at-least-32-chars!!".into();

    // AppState is built; router_health() doesn't consume it yet (Task 9 wires state).
    let _state = AppState {
        pool: pool.clone(),
        config: Arc::new(config),
        hub: (),
    };

    // router_health() returns Router<()> — serve it directly on an ephemeral port.
    let app = router_health();
    let listener = TcpListener::bind("127.0.0.1:0")
        .await
        .expect("failed to bind ephemeral port");
    let addr = listener.local_addr().unwrap();
    let base_url = format!("http://{addr}");

    tokio::spawn(async move {
        axum::serve(listener, app).await.unwrap();
    });

    TestApp {
        pool,
        base_url,
        client: reqwest::Client::new(),
        _db_guard: guard_pool,
    }
}
