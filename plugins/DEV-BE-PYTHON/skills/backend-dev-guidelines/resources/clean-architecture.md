# **Clean Architecture - Three-Layer Pattern**

Complete guide to Clean Architecture (Hexagonal Architecture / Ports and Adapters) for Python/FastAPI.

## **Table of Contents**

- [Core Concepts](#core-concepts)
- [The Three Layers](#the-three-layers)
- [Dependency Rule](#dependency-rule)
- [Directory Structure](#directory-structure)
- [Request Lifecycle](#request-lifecycle)
- [Benefits](#benefits)

---

## **Core Concepts**

### **What is Clean Architecture?**

Clean Architecture organizes code into layers with strict dependency rules:

- **Inner layers** contain business logic
- **Outer layers** contain technical details
- **Dependencies point inward** only

```
┌───────────────────────────────────────┐
│   Infrastructure Layer                │  ← Frameworks, DB, HTTP
│        │                               │
│        ▼                               │
│   Application Layer                    │  ← Use Cases, DTOs
│        │                               │
│        ▼                               │
│   Domain Layer                         │  ← Business Rules
└───────────────────────────────────────┘
```

### **Key Principles**

**1. Dependency Inversion**
- Infrastructure → Application → Domain
- Domain depends on NOTHING

**2. Single Responsibility**
- Each layer has ONE clear purpose

**3. Testability**
- Domain: Pure unit tests (no mocks)
- Application: Mocked infrastructure
- Infrastructure: Integration tests

---

## **The Three Layers**

### **Domain Layer (`src/domain/`)**

**Purpose**: Pure business logic with zero external dependencies

**Contains**:
- **Entities**: Objects with identity and behavior
- **Value Objects**: Immutable data with validation
- **Domain Services**: Business logic spanning multiple entities
- **Interfaces (Ports)**: Abstractions for infrastructure
- **Exceptions**: Domain-specific errors

**Rules**:
- ✅ Only imports from domain/
- ✅ Pure Python (dataclasses, enums)
- ❌ No FastAPI, SQLAlchemy, Pydantic

**Example**:

```python
# src/domain/entities/conversation.py
from dataclasses import dataclass, field
from datetime import datetime, timezone
from uuid import UUID, uuid4
from ..value_objects import ConversationStatus

@dataclass
class Conversation:
    id: UUID = field(default_factory=uuid4)
    user_id: str = field(default="")
    status: ConversationStatus = ConversationStatus.ACTIVE
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        if not self.user_id:
            raise ValueError("user_id is required")

    def transition_phase(self, new_phase: ConversationPhase) -> None:
        if not self._is_valid_transition(self.phase, new_phase):
            raise ValueError(f"Invalid transition: {self.phase} -> {new_phase}")
        self.phase = new_phase
```

### **Application Layer (`src/application/`)**

**Purpose**: Orchestrate business logic and coordinate workflows

**Contains**:
- **Use Cases**: Specific application workflows
- **Application Services**: Coordinate multiple use cases
- **DTOs**: Boundary crossing data (dataclasses)
- **Exceptions**: Application-specific errors

**Rules**:
- ✅ Imports from domain/
- ✅ Uses dataclasses for DTOs
- ✅ Depends on domain interfaces (not implementations)
- ❌ No HTTP, database, or framework code

**Example**:

```python
# src/application/use_cases/conversation/create_conversation.py
from dataclasses import dataclass
from ....domain.entities import Conversation
from ....domain.interfaces import IConversationRepository, IAgentRepository

class CreateConversationUseCase:
    def __init__(
        self,
        conversation_repo: IConversationRepository,
        agent_repo: IAgentRepository,
    ):
        self.conversation_repo = conversation_repo
        self.agent_repo = agent_repo

    async def execute(self, request: CreateConversationRequest) -> CreateConversationResponse:
        agent = await self.agent_repo.get_by_id(request.agent_id)
        if not agent:
            raise AgentNotFoundException(request.agent_id)

        conversation = Conversation(
            user_id=request.user_id,
            agent_id=request.agent_id,
        )

        created = await self.conversation_repo.create(conversation)
        return CreateConversationResponse(
            conversation=ConversationDTO.from_entity(created),
        )
```

### **Infrastructure Layer (`src/infrastructure/`)**

**Purpose**: Implement technical details and external integrations

**Contains**:
- **API**: FastAPI routes, Pydantic models, middleware
- **Persistence**: Repository implementations, ORM models
- **Messaging**: Kafka producers/consumers
- **Observability**: OpenTelemetry, logging
- **Config**: Settings, environment configuration

**Rules**:
- ✅ Imports from domain/ and application/
- ✅ Implements domain interfaces
- ✅ All framework/library code here
- ✅ Pydantic models for API validation

**Example**:

```python
# src/infrastructure/persistence/repositories/conversation_repository.py
from src.domain.entities import Conversation
from src.domain.interfaces import IConversationRepository
from ..models import ConversationModel
from .base_repository import BaseRepository

class ConversationRepository(
    BaseRepository[ConversationModel, Conversation],
    IConversationRepository
):
    def __init__(self, session: AsyncSession):
        super().__init__(session, ConversationModel, "Conversation")

    def _to_entity(self, model: ConversationModel) -> Conversation:
        return Conversation(
            id=model.id,
            user_id=model.user_id,
            status=ConversationStatus.from_string(model.status),
            created_at=model.created_at,
        )

    def _to_model(self, entity: Conversation) -> ConversationModel:
        return ConversationModel(
            id=entity.id,
            user_id=entity.user_id,
            status=entity.status.value,
            created_at=entity.created_at,
        )
```

---

## **Dependency Rule**

### **The Golden Rule**

**Dependencies flow INWARD, never outward**

```
Infrastructure  ──▶  Application  ──▶  Domain
(can import)       (can import)     (imports nothing)
```

### **What This Means**

**Domain Layer**:

```python
# ✅ GOOD: Pure domain code
from dataclasses import dataclass
from ..value_objects import TaskStatus

# ❌ BAD: External dependencies
from sqlalchemy import Column  # NO!
from fastapi import HTTPException  # NO!
from pydantic import BaseModel  # NO!
```

**Application Layer**:

```python
# ✅ GOOD: Depends on domain interfaces
from ....domain.interfaces import ITaskRepository
from ....domain.entities import Task

# ❌ BAD: Depends on infrastructure
from ...infrastructure.persistence.repositories import TaskRepository  # NO!
```

**Infrastructure Layer**:

```python
# ✅ GOOD: Implements domain interfaces
from src.domain.interfaces import ITaskRepository
from src.domain.entities import Task
from sqlalchemy.ext.asyncio import AsyncSession
```

---

## **Directory Structure**

```
src/
├── domain/                            # Domain Layer
│   ├── entities/                     # Business entities
│   │   ├── conversation.py
│   │   └── task.py
│   ├── value_objects/                # Immutable values
│   │   ├── conversation_status.py
│   │   └── task_status.py
│   ├── services/                     # Domain services
│   │   └── state_machine.py
│   ├── interfaces/                   # Ports (abstractions)
│   │   ├── repositories.py
│   │   └── gateways.py
│   └── exceptions/                   # Domain exceptions
│       └── domain_exceptions.py
│
├── application/                       # Application Layer
│   ├── use_cases/                    # Use case implementations
│   │   ├── conversation/
│   │   │   ├── create_conversation.py
│   │   │   └── get_conversation.py
│   │   └── task/
│   │       └── create_task.py
│   ├── services/                     # Application services
│   │   └── orchestrator_service.py
│   ├── dtos/                         # Data Transfer Objects
│   │   ├── conversation_dto.py
│   │   └── task_dto.py
│   └── exceptions.py                 # Application exceptions
│
└── infrastructure/                    # Infrastructure Layer
    ├── api/rest/                     # API adapters
    │   ├── main.py                   # FastAPI app
    │   ├── settings.py               # Pydantic Settings
    │   ├── routes/                   # Endpoints (Pydantic models)
    │   │   ├── conversations.py
    │   │   └── tasks.py
    │   └── middleware/
    │       ├── logging_middleware.py
    │       └── context_middleware.py
    ├── persistence/                  # Database adapters
    │   ├── session.py                # DB session management
    │   ├── repositories/             # Repository implementations
    │   │   ├── base_repository.py
    │   │   ├── conversation_repository.py
    │   │   └── task_repository.py
    │   └── models/                   # SQLAlchemy ORM models
    │       ├── conversation_model.py
    │       └── task_model.py
    ├── messaging/                    # Message queue adapters
    │   └── kafka_publisher.py
    └── observability/                # Cross-cutting concerns
        ├── logger.py
        └── tracer_setup.py
```

---

## **Request Lifecycle**

### **Complete Flow**

```
1. HTTP Request → FastAPI Route (Infrastructure/API)
   - Pydantic validation
   ▼
2. Dependency Injection
   - Create repositories, use cases
   ▼
3. Use Case Execute (Application)
   - Orchestrate workflow
   ▼
4. Domain Logic
   - Create entities, validate rules
   ▼
5. Repository (Infrastructure/Persistence)
   - Convert entity to ORM model
   - Persist to database
   ▼
6. Return DTO (Application)
   - Convert entity to DTO
   ▼
7. HTTP Response (Infrastructure/API)
   - Convert DTO to Pydantic
   - Return JSON
```

### **Code Example**

```python
# FastAPI Route (Infrastructure)
@router.post("/conversations", status_code=201)
async def create_conversation(
    request: CreateConversationApiRequest,
    use_case: CreateConversationUseCase = Depends(get_create_conversation_use_case),
    current_user: str = Depends(get_current_user),
) -> ConversationApiResponse:
    app_request = CreateConversationRequest(
        user_id=current_user,
        initial_message=request.initial_message,
        agent_id=request.agent_id,
    )
    result = await use_case.execute(app_request)
    return ConversationApiResponse(
        id=str(result.conversation.id),
        user_id=result.conversation.user_id,
        status=result.conversation.status,
    )
```

---

## **Benefits**

### **1. Testability**

**Domain Tests**: Pure unit tests, no mocks

```python
def test_conversation_phase_transition():
    conversation = Conversation(user_id="user123")
    conversation.transition_phase(ConversationPhase.REQUIREMENTS_GATHERING)
    assert conversation.phase == ConversationPhase.REQUIREMENTS_GATHERING
```

**Application Tests**: Mock infrastructure

```python
async def test_create_conversation_use_case():
    mock_repo = AsyncMock(spec=IConversationRepository)
    use_case = CreateConversationUseCase(mock_repo, mock_agent_repo)
    result = await use_case.execute(request)
    mock_repo.create.assert_called_once()
```

### **2. Maintainability**

- Clear boundaries between layers
- Easy to locate bugs
- Isolated changes
- Type safety throughout

### **3. Flexibility**

- Swap implementations (Postgres → MongoDB)
- Multiple adapters (REST + GraphQL)
- Framework independence
- Easy refactoring

### **4. Scalability**

- Clear patterns for new features
- Teams work on different layers
- Parallel development
- Fast onboarding

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./domain-layer.md` - Domain layer details
- `./application-layer.md` - Application layer details
- `./api-layer.md` - Infrastructure API details
- `./repository-pattern.md` - Repository implementation
