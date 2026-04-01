# **Configuration Management - Pydantic Settings & uv**

Complete guide to configuration management using Pydantic Settings and dependency management with uv.

## **Table of Contents**

- [Pydantic Settings](#pydantic-settings)
- [Environment Variables](#environment-variables)
- [Dependency Management with uv](#dependency-management-with-uv)
- [Configuration Best Practices](#configuration-best-practices)

---

## **Pydantic Settings**

### **Why Pydantic Settings?**

- **Type Safety**: Automatic validation and type coercion
- **Environment Support**: Load from .env files automatically
- **Validation**: Built-in validation rules
- **IDE Support**: Full autocomplete and type checking
- **No Magic Strings**: No more `os.environ.get("VAR", "default")`

### **Basic Setup**

```python
# src/infrastructure/api/rest/settings.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    """Application settings loaded from environment."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore"
    )

    # Application
    APP_NAME: str = "My API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 10
    DB_MAX_OVERFLOW: int = 20

    # API
    API_V1_PREFIX: str = "/api/v1"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]

    # OpenTelemetry
    OTEL_SERVICE_NAME: str = "backend-service"
    OTEL_EXPORTER_OTLP_ENDPOINT: Optional[str] = None
    OTEL_TRACES_ENABLED: bool = True

    # Security
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

# Global settings instance
settings = Settings()
```

### **Usage in Code**

```python
# ❌ NEVER use os.environ
import os
timeout = int(os.environ.get("TIMEOUT_MS", "5000"))
database_url = os.getenv("DATABASE_URL")

# ✅ ALWAYS use Pydantic Settings
from src.infrastructure.api.rest.settings import settings

timeout = settings.TIMEOUT_MS
database_url = settings.DATABASE_URL
```

### **Advanced Configuration**

```python
from pydantic import Field, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Custom validation
    DATABASE_URL: str = Field(..., min_length=1)

    # Computed fields
    @property
    def async_database_url(self) -> str:
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

    # Validators
    @validator("ALLOWED_ORIGINS", pre=True)
    def parse_cors(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # Nested configuration
    class DatabaseConfig:
        pool_size: int = 10
        echo: bool = False

    database: DatabaseConfig = DatabaseConfig()
```

---

## **Environment Variables**

### **.env File Structure**

```bash
# .env
# Application
APP_NAME="My Backend API"
ENVIRONMENT="development"
DEBUG=true

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/mydb"
DB_POOL_SIZE=10

# API
API_V1_PREFIX="/api/v1"
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:8000"

# Security
SECRET_KEY="your-secret-key-here"

# OpenTelemetry
OTEL_SERVICE_NAME="backend-service"
OTEL_EXPORTER_OTLP_ENDPOINT="http://localhost:4318"
OTEL_TRACES_ENABLED=true
```

### **Environment-Specific Configs**

```python
# .env.development
DEBUG=true
DATABASE_URL="postgresql://user:pass@localhost:5432/dev_db"
OTEL_TRACES_ENABLED=false

# .env.production
DEBUG=false
DATABASE_URL="postgresql://user:pass@prod-host:5432/prod_db"
OTEL_TRACES_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT="https://otel-collector:4318"
```

### **Loading Different Environments**

```python
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=f".env.{os.getenv('ENVIRONMENT', 'development')}",
        env_file_encoding="utf-8"
    )
```

---

## **Dependency Management with uv**

### **Dependency Groups**

**File:** `pyproject.toml`

```toml
[project]
name = "my-backend"
version = "0.1.0"
requires-python = ">=3.13"
dependencies = [
    "fastapi>=0.111.0",
    "pydantic>=2.8.0",
    "pydantic-settings>=2.2.0",
]

[dependency-groups]
# Database and persistence
persistence = [
    "sqlalchemy[asyncio]>=2.0.0",
    "asyncpg>=0.29.0",
    "alembic>=1.13.0",
]

# Testing
test = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "pytest-mock>=3.12.0",
    "pytest-cov>=4.1.0",
    "httpx>=0.27.0",
]

# Development
dev = [
    "ruff>=0.4.0",
    "mypy>=1.10.0",
    "pre-commit>=3.7.0",
]

[tool.ruff]
line-length = 100
target-version = "py311"

[tool.ruff.lint]
select = ["E", "F", "I", "N", "W", "UP"]
```

### **Managing Dependencies**

Use `uv` for dependency management:

```bash
# Add dependency to specific group
uv add --group test pytest-cov
uv add --group persistence asyncpg

# Add core dependency
uv add fastapi
```

---

## **Configuration Best Practices**

### **1. Never Hardcode Secrets**

```python
# ❌ BAD
SECRET_KEY = "my-secret-key-123"
DATABASE_URL = "postgresql://user:password@localhost/db"

# ✅ GOOD
from src.infrastructure.api.rest.settings import settings
secret_key = settings.SECRET_KEY
database_url = settings.DATABASE_URL
```

### **2. Use Type Hints**

```python
# ✅ GOOD
class Settings(BaseSettings):
    DATABASE_URL: str
    DEBUG: bool = False
    TIMEOUT_MS: int = 5000
    ALLOWED_ORIGINS: list[str] = []
```

### **3. Provide Defaults for Non-Secrets**

```python
class Settings(BaseSettings):
    # Required (no default)
    DATABASE_URL: str
    SECRET_KEY: str

    # Optional with defaults
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
    TIMEOUT_MS: int = 5000
```

### **4. Validate Configuration**

```python
from pydantic import Field, validator

class Settings(BaseSettings):
    DATABASE_URL: str = Field(..., regex=r"^postgresql://")

    @validator("ENVIRONMENT")
    def validate_environment(cls, v):
        allowed = ["development", "staging", "production"]
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT must be one of {allowed}")
        return v
```

### **5. Document Required Variables**

```python
class Settings(BaseSettings):
    """
    Application settings.

    Required Environment Variables:
    - DATABASE_URL: PostgreSQL connection string
    - SECRET_KEY: Secret key for JWT signing

    Optional Environment Variables:
    - DEBUG: Enable debug mode (default: False)
    - LOG_LEVEL: Logging level (default: INFO)
    """
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"
```

### **6. Use .env for Local Development**

```bash
# .env (gitignored)
DATABASE_URL="postgresql://localhost/dev_db"
SECRET_KEY="dev-secret-key"
DEBUG=true

# .env.example (committed)
DATABASE_URL="postgresql://user:pass@host/db"
SECRET_KEY="your-secret-here"
DEBUG=false
```

### **7. Dependency Groups by Layer**

```toml
[dependency-groups]
# Infrastructure - Database
persistence = ["sqlalchemy[asyncio]", "asyncpg", "alembic"]

# Infrastructure - Messaging
messaging = ["aiokafka"]

# Infrastructure - Observability
observability = ["opentelemetry-api", "opentelemetry-sdk"]

# Testing
test = ["pytest", "pytest-asyncio", "pytest-cov"]
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./observability.md` - OpenTelemetry configuration
