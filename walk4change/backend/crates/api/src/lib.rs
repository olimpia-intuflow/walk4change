use axum::{routing::get, Router};

pub mod auth;
pub mod config;
pub mod db;
pub mod error;
pub mod response;
pub mod scoring;
pub mod state;

pub fn router_health() -> Router {
    Router::new().route("/api/v1/health", get(|| async { "ok" }))
}
