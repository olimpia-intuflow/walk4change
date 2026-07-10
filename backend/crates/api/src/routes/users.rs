use axum::{
    extract::{Query, State},
    Json,
};
use serde::Deserialize;
use serde_json::Value;

use crate::{
    auth::extractor::AuthUser,
    error::{AppError, FieldError},
    repo::user as user_repo,
    response,
    state::AppState,
};

/// Query parameters for `GET /api/v1/users/search`.
#[derive(Deserialize)]
pub struct SearchQuery {
    #[serde(default)]
    pub q: String,
}

/// `GET /api/v1/users/search?q=…`
///
/// Case-insensitive display-name search for the "add friend" flow.
/// Requires at least 2 characters; returns at most 10 minimal rows
/// (id + display name + avatar — never e-mail).
pub async fn search(
    auth: AuthUser,
    State(state): State<AppState>,
    Query(query): Query<SearchQuery>,
) -> Result<Json<Value>, AppError> {
    let q = query.q.trim();
    if q.chars().count() < 2 {
        return Err(AppError::Validation(vec![FieldError {
            field: "q".into(),
            message: "query must be at least 2 characters".into(),
            code: "TOO_SHORT".into(),
        }]));
    }

    let rows = user_repo::search(&state.pool, q, auth.id).await?;
    Ok(response::data(rows))
}
