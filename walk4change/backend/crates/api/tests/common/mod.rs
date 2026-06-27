use std::sync::Arc;
use sqlx::PgPool;
use tokio::net::TcpListener;
use walk4change_api::{config::AppConfig, db, router_health, state::AppState};

/// Shared test app handle. `base_url` and `client` are unused until Task 4+
/// but are intentionally kept public for the integration test harness.
#[allow(dead_code)]
pub struct TestApp {
    pub pool: PgPool,
    pub base_url: String,
    pub client: reqwest::Client,
}

/// Spawn a test instance of the API server against `TEST_DATABASE_URL`.
///
/// - Connects a pool
/// - Runs pending migrations
/// - TRUNCATEs all tables for test isolation
/// - Binds the current router to an ephemeral port
/// - Returns pool, base URL, and a reqwest client
pub async fn spawn() -> TestApp {
    let db_url = std::env::var("TEST_DATABASE_URL")
        .expect("TEST_DATABASE_URL must be set for integration tests");

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
    }
}
