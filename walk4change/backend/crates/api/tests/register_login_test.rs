mod common;

use serde_json::json;

/// Register with valid data → 201, token string, profile with correct email.
#[tokio::test]
async fn register_returns_201_token_and_profile() {
    let app = common::spawn().await;

    let resp = app
        .client
        .post(format!("{}/api/v1/auth/register", app.base_url))
        .json(&json!({
            "email": "alice@example.com",
            "password": "password123",
            "display_name": "Alice"
        }))
        .send()
        .await
        .expect("request failed");

    assert_eq!(resp.status().as_u16(), 201);
    let body: serde_json::Value = resp.json().await.expect("body is not JSON");
    assert!(body["token"].is_string(), "token must be a string");
    assert_eq!(
        body["data"]["email"].as_str(),
        Some("alice@example.com"),
        "email in profile must match"
    );
    assert_eq!(
        body["data"]["display_name"].as_str(),
        Some("Alice"),
        "display_name in profile must match"
    );
}

/// Registering the same email twice → 409 Conflict.
#[tokio::test]
async fn register_duplicate_email_returns_409() {
    let app = common::spawn().await;

    let payload = json!({
        "email": "bob@example.com",
        "password": "password123",
        "display_name": "Bob"
    });

    let first = app
        .client
        .post(format!("{}/api/v1/auth/register", app.base_url))
        .json(&payload)
        .send()
        .await
        .expect("first request failed");
    assert_eq!(first.status().as_u16(), 201);

    let second = app
        .client
        .post(format!("{}/api/v1/auth/register", app.base_url))
        .json(&payload)
        .send()
        .await
        .expect("second request failed");
    assert_eq!(second.status().as_u16(), 409);
}

/// Login with correct credentials → 200 + token.
#[tokio::test]
async fn login_correct_password_returns_200_and_token() {
    let app = common::spawn().await;

    app.client
        .post(format!("{}/api/v1/auth/register", app.base_url))
        .json(&json!({
            "email": "carol@example.com",
            "password": "password123",
            "display_name": "Carol"
        }))
        .send()
        .await
        .expect("register failed");

    let resp = app
        .client
        .post(format!("{}/api/v1/auth/login", app.base_url))
        .json(&json!({
            "email": "carol@example.com",
            "password": "password123"
        }))
        .send()
        .await
        .expect("login request failed");

    assert_eq!(resp.status().as_u16(), 200);
    let body: serde_json::Value = resp.json().await.expect("body is not JSON");
    assert!(body["token"].is_string(), "token must be a string");
}

/// Login with wrong password → 401.
#[tokio::test]
async fn login_wrong_password_returns_401() {
    let app = common::spawn().await;

    app.client
        .post(format!("{}/api/v1/auth/register", app.base_url))
        .json(&json!({
            "email": "dave@example.com",
            "password": "password123",
            "display_name": "Dave"
        }))
        .send()
        .await
        .expect("register failed");

    let resp = app
        .client
        .post(format!("{}/api/v1/auth/login", app.base_url))
        .json(&json!({
            "email": "dave@example.com",
            "password": "wrongpassword"
        }))
        .send()
        .await
        .expect("login request failed");

    assert_eq!(resp.status().as_u16(), 401);
}

/// Login with unknown email → 401 (indistinguishable from wrong password).
#[tokio::test]
async fn login_unknown_email_returns_401() {
    let app = common::spawn().await;

    let resp = app
        .client
        .post(format!("{}/api/v1/auth/login", app.base_url))
        .json(&json!({
            "email": "nobody@example.com",
            "password": "password123"
        }))
        .send()
        .await
        .expect("request failed");

    assert_eq!(resp.status().as_u16(), 401);
}

/// Register with password shorter than 8 chars → 422 Validation.
#[tokio::test]
async fn register_short_password_returns_422() {
    let app = common::spawn().await;

    let resp = app
        .client
        .post(format!("{}/api/v1/auth/register", app.base_url))
        .json(&json!({
            "email": "eve@example.com",
            "password": "short",
            "display_name": "Eve"
        }))
        .send()
        .await
        .expect("request failed");

    assert_eq!(resp.status().as_u16(), 422);
}

/// Logout with valid token → 204 + Set-Cookie clearing the session.
#[tokio::test]
async fn logout_clears_session_cookie() {
    let app = common::spawn().await;

    let reg = app
        .client
        .post(format!("{}/api/v1/auth/register", app.base_url))
        .json(&json!({
            "email": "frank@example.com",
            "password": "password123",
            "display_name": "Frank"
        }))
        .send()
        .await
        .expect("register failed");
    let body: serde_json::Value = reg.json().await.unwrap();
    let token = body["token"].as_str().unwrap().to_owned();

    let resp = app
        .client
        .post(format!("{}/api/v1/auth/logout", app.base_url))
        .header("Authorization", format!("Bearer {token}"))
        .send()
        .await
        .expect("logout request failed");

    assert_eq!(resp.status().as_u16(), 204);
    let cookie = resp
        .headers()
        .get("set-cookie")
        .expect("Set-Cookie header must be present")
        .to_str()
        .unwrap();
    assert!(cookie.contains("wc_session="), "cookie must clear wc_session");
    assert!(cookie.contains("Max-Age=0"), "cookie must have Max-Age=0");
}
