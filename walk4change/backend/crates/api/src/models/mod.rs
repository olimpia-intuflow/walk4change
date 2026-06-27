use chrono::{DateTime, Utc};
use serde::Serialize;
use uuid::Uuid;

/// Public user profile returned from the API.
#[derive(Debug, Serialize, sqlx::FromRow)]
pub struct Profile {
    pub id: Uuid,
    pub email: String,
    pub display_name: String,
    pub avatar_url: Option<String>,
    pub bio: Option<String>,
    pub interests: Vec<String>,
    pub created_at: DateTime<Utc>,
}
