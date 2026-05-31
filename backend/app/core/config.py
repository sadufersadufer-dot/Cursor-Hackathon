import os
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    # App
    app_name: str = "Swipe API"
    debug: bool = True
    # Comma-separated list of allowed CORS origins.
    cors_origins: str = "http://localhost:3000"

    # Database (async asyncpg URL, e.g. postgresql+asyncpg://user:pass@localhost/db)
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/swipe"

    # Auth (Firebase) -- wired in a later pass. Until then auth runs in dev-stub mode.
    # Emails listed here are treated as admins by require_admin.
    admin_emails: str = ""
    firebase_admin_credentials_path: str | None = None

    # External services -- placeholders, wired later.
    anthropic_api_key: str | None = None
    gis_api_key: str | None = None

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def admin_emails_list(self) -> list[str]:
        return [e.strip().lower() for e in self.admin_emails.split(",") if e.strip()]

    @property
    def is_cloud_run(self) -> bool:
        return bool(os.getenv("K_SERVICE"))

    @property
    def firebase_admin_json_path(self) -> str | None:
        """Use a local Firebase Admin JSON path, but rely on Cloud Run ADC in production."""
        if self.is_cloud_run:
            return None
        return self.firebase_admin_credentials_path


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
