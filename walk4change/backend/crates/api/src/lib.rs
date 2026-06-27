use axum::{routing::get, Router};

pub mod auth;
pub mod config;
pub mod db;
pub mod error;
pub mod response;
pub mod scoring;
pub mod state;

use auth::extractor::AuthUser;
use state::AppState;

/// Minimal router used in unit tests that do not need application state.
pub fn router_health() -> Router {
    Router::new().route("/api/v1/health", get(|| async { "ok" }))
}

/// Full application router backed by [`AppState`].
///
/// Includes every route registered so far:
/// - `GET /api/v1/health` — liveness probe (no auth required).
/// - `GET /api/v1/_whoami` — returns the authenticated user's UUID.
pub fn router(state: AppState) -> Router {
    Router::new()
        .route("/api/v1/health", get(|| async { "ok" }))
        .route("/api/v1/_whoami", get(whoami))
        .with_state(state)
}

async fn whoami(auth: AuthUser) -> axum::Json<serde_json::Value> {
    response::data(auth.id)
}
