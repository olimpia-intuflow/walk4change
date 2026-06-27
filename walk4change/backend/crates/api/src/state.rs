use std::sync::Arc;
use sqlx::PgPool;
use crate::config::AppConfig;

/// Shared application state threaded through every Axum handler.
/// `hub` is a placeholder `()` until Task 14 introduces the WebSocket hub.
#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub config: Arc<AppConfig>,
    pub hub: (),
}
