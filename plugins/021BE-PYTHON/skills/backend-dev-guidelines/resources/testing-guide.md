# **Testing Guide - pytest with Clean Architecture**

Complete guide to testing Python/FastAPI Clean Architecture projects with pytest.

## **Table of Contents**

- [Testing Setup](#testing-setup)
- [pytest Custom Markers](#pytest-custom-markers)
- [Domain Layer Tests](#domain-layer-tests)
- [Application Layer Tests](#application-layer-tests)
- [Infrastructure Layer Tests](#infrastructure-layer-tests)
- [Testing Async Code](#testing-async-code)
- [Fixtures and Mocking](#fixtures-and-mocking)
- [Coverage and Best Practices](#coverage-and-best-practices)

---

## **Testing Setup**

### **Install Testing Dependencies**

```bash
# Using uv
uv add --group test pytest pytest-asyncio pytest-mock pytest-cov

# Or add to pyproject.toml
[dependency-groups]
test = [
    "pytest>=8.0.0",
    "pytest-asyncio>=0.23.0",
    "pytest-mock>=3.12.0",
    "pytest-cov>=4.1.0",
]
```

### **pytest Configuration**

**File:** `pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
asyncio_mode = auto
pythonpath = . src
addopts =
    --verbose
    --color=yes
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --strict-markers
markers =
    unit: Domain unit tests (pure logic, no mocks)
    use_case: Application use case tests
    service: Application service tests
    integration: Infrastructure integration tests
    workflow: End-to-end workflow tests
env_files =
    .env.test
filterwarnings =
    ignore::DeprecationWarning
```

### **Test Directory Structure**

```
tests/
├── conftest.py                    # Shared fixtures
├── domain/                        # Domain tests (unit marker)
│   ├── test_entities/
│   └── test_services/
├── application/                   # Application tests
│   ├── use_cases/                # use_case marker
│   └── services/                 # service marker
├── infrastructure/                # Infrastructure tests (integration marker)
│   ├── persistence/
│   └── api/
└── integration/                   # E2E tests (workflow marker)
```

---

## **pytest Custom Markers**

### **Available Markers**

| Marker | Purpose | No Mocks? | Fast? |
| --- | --- | --- | --- |
| `@pytest.mark.unit` | Domain tests | ✅ | ✅ |
| `@pytest.mark.use_case` | Use case tests | ❌ | ✅ |
| `@pytest.mark.service` | Service tests | ❌ | ✅ |
| `@pytest.mark.integration` | Infrastructure tests | ❌ | ❌ |
| `@pytest.mark.workflow` | E2E tests | ❌ | ❌ |

### **Running Tests by Marker**

```bash
# Run only domain tests (fast, no mocks)
pytest -m unit

# Run application layer tests
pytest -m "use_case or service"

# Run everything except slow integration tests
pytest -m "not integration and not workflow"

# Run with coverage
pytest -m "unit or use_case" --cov=src/domain --cov=src/application
```

### **Using Markers in Tests**

```python
import pytest

# Single marker
@pytest.mark.unit
def test_conversation_creation():
    ...

# Multiple markers
pytestmark = [pytest.mark.asyncio, pytest.mark.use_case]

class TestCreateConversationUseCase:
    async def test_success(self):
        ...
```

---

## **Domain Layer Tests**

### **Pure Domain Tests (NO MOCKS)**

Domain tests are **pure unit tests** - no mocks, no infrastructure, just business logic.

**File:** `tests/domain/test_entities/test_conversation.py`

```python
import pytest
from datetime import datetime
from uuid import uuid4
from src.domain.entities import Conversation
from src.domain.value_objects import ConversationStatus, ConversationPhase

pytestmark = pytest.mark.unit

def test_conversation_creation():
    conversation = Conversation(user_id="user123")
    assert conversation.id is not None
    assert conversation.user_id == "user123"
    assert conversation.status == ConversationStatus.ACTIVE

def test_conversation_requires_user_id():
    with pytest.raises(ValueError, match="user_id is required"):
        Conversation(user_id="")

def test_conversation_phase_transition():
    conversation = Conversation(user_id="user123")
    conversation.transition_phase(ConversationPhase.REQUIREMENTS_GATHERING)
    assert conversation.phase == ConversationPhase.REQUIREMENTS_GATHERING

def test_conversation_invalid_phase_transition():
    conversation = Conversation(user_id="user123")
    conversation.phase = ConversationPhase.EXECUTION
    with pytest.raises(ValueError, match="Invalid"):
        conversation.transition_phase(ConversationPhase.REQUIREMENTS_GATHERING)
```

---

## **Application Layer Tests**

### **Use Case Tests (WITH MOCKS)**

Use case tests mock infrastructure dependencies.

**File:** `tests/application/use_cases/test_create_conversation.py`

```python
import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from src.application.use_cases.conversation import CreateConversationUseCase
from src.application.dtos import CreateConversationRequest
from src.application.exceptions import AgentNotFoundException
from tests.factories import ConversationFactory, AgentFactory

pytestmark = [pytest.mark.asyncio, pytest.mark.use_case]

@pytest.fixture
def conversation_repo():
    return AsyncMock()

@pytest.fixture
def agent_repo():
    return AsyncMock()

@pytest.fixture
def messaging_gateway():
    return AsyncMock()

@pytest.fixture
def use_case(conversation_repo, agent_repo, messaging_gateway):
    return CreateConversationUseCase(
        conversation_repo=conversation_repo,
        agent_repo=agent_repo,
        messaging=messaging_gateway,
    )

class TestCreateConversationUseCase:
    async def test_create_conversation_successfully(
        self, use_case, conversation_repo, agent_repo, messaging_gateway
    ):
        # Arrange
        agent = AgentFactory.create(agent_id="test_agent")
        agent_repo.get_by_id.return_value = agent
        conversation = ConversationFactory.create()
        conversation_repo.create.return_value = conversation
        request = CreateConversationRequest(
            user_id="user123",
            initial_message="Hello",
            agent_id="test_agent",
        )

        # Act
        result = await use_case.execute(request)

        # Assert
        assert result.conversation.id == conversation.id
        agent_repo.get_by_id.assert_called_once_with("test_agent")
        conversation_repo.create.assert_called_once()
        messaging_gateway.publish_message.assert_called_once()

    async def test_create_conversation_agent_not_found(self, use_case, agent_repo):
        agent_repo.get_by_id.return_value = None
        request = CreateConversationRequest(
            user_id="user123",
            initial_message="Hello",
            agent_id="nonexistent",
        )
        with pytest.raises(AgentNotFoundException):
            await use_case.execute(request)
```

---

## **Infrastructure Layer Tests**

### **API Endpoint Testing**

**File:** `tests/infrastructure/api/test_conversations_routes.py`

```python
import pytest
from httpx import AsyncClient
from app.main import app
from app.core.database import Base
from sqlalchemy.ext.asyncio import create_async_engine

TEST_DATABASE_URL = "postgresql+asyncpg://test:test@localhost/test_db"

@pytest.fixture
async def test_db():
    test_engine = create_async_engine(TEST_DATABASE_URL, echo=True)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield test_engine
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()

@pytest.fixture
async def client(test_db):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
async def auth_headers():
    token = create_test_token()
    return {"Authorization": f"Bearer {token}"}

class TestConversationAPI:
    @pytest.mark.asyncio
    async def test_create_conversation(self, client):
        conversation_data = {
            "user_id": "user123",
            "initial_message": "Hello",
            "agent_id": "test_agent",
        }
        response = await client.post("/api/v1/conversations", json=conversation_data)
        assert response.status_code == 201
        data = response.json()
        assert data["user_id"] == conversation_data["user_id"]
        assert "id" in data

    @pytest.mark.asyncio
    async def test_get_conversation(self, client):
        conversation_data = {"user_id": "user123", "initial_message": "Hello"}
        create_response = await client.post("/api/v1/conversations", json=conversation_data)
        conversation_id = create_response.json()["id"]
        response = await client.get(f"/api/v1/conversations/{conversation_id}")
        assert response.status_code == 200
        assert response.json()["id"] == conversation_id

    @pytest.mark.asyncio
    async def test_get_conversation_not_found(self, client):
        response = await client.get("/api/v1/conversations/nonexistent-id")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
```

### **Repository Testing**

```python
import pytest
from src.infrastructure.persistence.repositories import TaskRepository
from src.domain.entities import Task
from src.domain.value_objects import TaskStatus

pytestmark = [pytest.mark.asyncio, pytest.mark.integration]

async def test_repository_create(db_session):
    repository = TaskRepository(db_session)
    task = Task(
        conversation_id=uuid4(),
        agent_id="test_agent",
        status=TaskStatus.PENDING,
        input={"message": "test"},
    )
    created_task = await repository.create(task)
    assert created_task.id is not None
    assert created_task.agent_id == task.agent_id

async def test_repository_find_by_id(db_session):
    repository = TaskRepository(db_session)
    task = Task(conversation_id=uuid4(), agent_id="test_agent", status=TaskStatus.PENDING)
    created_task = await repository.create(task)
    found_task = await repository.get_by_id(created_task.id)
    assert found_task is not None
    assert found_task.id == created_task.id
```

---

## **Testing Async Code**

### **pytest-asyncio Configuration**

```python
import pytest
import asyncio

pytestmark = pytest.mark.asyncio

async def test_async_operation():
    result = await some_async_function()
    assert result is not None

async def test_async_with_timeout():
    async with asyncio.timeout(5):
        result = await slow_async_function()
        assert result is not None
```

---

## **Fixtures and Mocking**

### **Shared Fixtures**

**File:** `tests/conftest.py`

```python
import pytest
from unittest.mock import AsyncMock
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from app.core.database import Base
from app.core.config import Settings

@pytest.fixture
def test_settings():
    return Settings(
        environment="testing",
        database_url="postgresql+asyncpg://test:test@localhost/test_db",
        secret_key="test-secret-key",
        debug=True,
        otel_traces_enabled=False,
    )

@pytest.fixture
async def db_session():
    engine = create_async_engine("postgresql+asyncpg://test:test@localhost/test_db", echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSession(engine) as session:
        yield session
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
def mock_db_session():
    return AsyncMock(spec=AsyncSession)
```

### **Mocking External Services**

```python
from unittest.mock import patch, AsyncMock

@pytest.mark.asyncio
@patch('app.services.email_service.send_email')
async def test_user_creation_sends_email(mock_send_email, user_service):
    mock_send_email.return_value = True
    user_data = UserCreate(email="test@example.com", name="Test", age=25)
    user = await user_service.create_user(user_data)
    mock_send_email.assert_called_once_with(to=user.email, subject="Welcome!")
```

---

## **Coverage and Best Practices**

### **Run Tests with Coverage**

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_services/test_user_service.py

# Run specific test
pytest tests/unit/test_services/test_user_service.py::TestUserService::test_create_user_success

# Run with markers
pytest -m unit  # Only unit tests
pytest -m integration  # Only integration tests
pytest -m "not slow"  # Exclude slow tests
```

### **Coverage Targets**

- **Unit Tests**: 80%+ coverage
- **Integration Tests**: Critical paths covered
- **Overall**: 70%+ coverage

### **Test Best Practices**

```python
# ✅ GOOD: Descriptive test names
async def test_create_user_with_duplicate_email_returns_409():
    ...

# ❌ BAD: Vague test names
async def test_user():
    ...

# ✅ GOOD: Arrange, Act, Assert pattern
async def test_something():
    # Arrange
    user_data = UserCreate(...)
    # Act
    result = await service.create_user(user_data)
    # Assert
    assert result.id is not None

# ✅ GOOD: One assertion per test (when possible)
async def test_user_email():
    user = await service.create_user(data)
    assert user.email == data.email

async def test_user_name():
    user = await service.create_user(data)
    assert user.name == data.name
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./domain-layer.md` - Domain entities to test
- `./application-layer.md` - Use cases to test
- `./repository-pattern.md` - Repository testing
- `./complete-examples.md` - Full test examples
