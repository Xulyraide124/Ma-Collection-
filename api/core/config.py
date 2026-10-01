from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT_ENV: Path = Path(__file__).resolve().parents[2] / ".env"


class Settings(BaseSettings):
    database_url: str
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    model_config = SettingsConfigDict(env_file=ROOT_ENV, extra="ignore")


settings = Settings()