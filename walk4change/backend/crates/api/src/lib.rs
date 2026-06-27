use axum::{routing::get, Router};

pub mod config;
pub mod error;
pub mod response;
pub mod scoring;

pub fn router_health() -> Router {
    Router::new().route("/api/v1/health", get(|| async { "ok" }))
}
