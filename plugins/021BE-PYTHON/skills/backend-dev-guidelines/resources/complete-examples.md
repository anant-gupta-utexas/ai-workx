# **Complete Examples - Full Feature Implementation**

End-to-end example showing a feature implemented across all Clean Architecture layers.

## **Task Management Feature**

Complete implementation of task creation from Domain → Application → Infrastructure → API.

## **1. Domain Layer**

### **Task Entity**

```python
# src/domain/entities/task.py
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import UUID, uuid4
from ..value_objects import TaskStatus

@dataclass
class Task:
    id: UUID = field(default_factory=uuid4)
    conversation_id: UUID = field(default=None)
    agent_id: str = field(default="")
    parent_task_id: Optional[UUID] = None
    status: TaskStatus = TaskStatus.PENDING
    input: Dict[str, Any] = field(default_factory=dict)
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        if not self.conversation_id:
            raise ValueError("conversation_id is required")
        if not self.agent_id:
            raise ValueError("agent_id is required")

    def start(self) -> None:
        if self.status != TaskStatus.PENDING:
            raise ValueError(f"Can only start pending tasks, current: {self.status}")
        self.status = TaskStatus.RUNNING
        self.started_at = datetime.now(timezone.utc)
        self.updated_at = self.started_at

    def complete(self, output: Dict[str, Any]) -> None:
        if self.status != TaskStatus.RUNNING:
            raise ValueError(f"Can only complete running tasks, current: {self.status}")
        self.status = TaskStatus.COMPLETED
        self.output = output
        self.completed_at = datetime.now(timezone.utc)
        self.updated_at = self.completed_at
```

### **Task Status Value Object**

```python
# src/domain/value_objects/task_status.py
from enum import Enum

class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    WAITING_FOR_USER = "waiting_for_user"
    WAITING_FOR_SUBTASK = "waiting_for_subtask"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

    @classmethod
    def from_string(cls, value: str) -> "TaskStatus":
        try:
            return cls(value)
        except ValueError:
            raise ValueError(f"Invalid task status: {value}")

    def is_terminal(self) -> bool:
        return self in {self.COMPLETED, self.FAILED, self.CANCELLED}
```

### **Repository Interface**

```python
# src/domain/interfaces/repositories.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID
from ..entities import Task

class ITaskRepository(ABC):
    @abstractmethod
    async def create(self, task: Task) -> Task:
        pass

    @abstractmethod
    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        pass

    @abstractmethod
    async def update(self, task: Task) -> Task:
        pass

    @abstractmethod
    async def find_pending_for_agent(self, agent_id: str) -> List[Task]:
        pass
```

## **2. Application Layer**

### **DTOs**

```python
# src/application/dtos/task_dto.py
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional
from uuid import UUID

@dataclass
class TaskDTO:
    id: UUID
    conversation_id: UUID
    agent_id: str
    status: str
    input: Dict[str, Any]
    output: Optional[Dict[str, Any]]
    created_at: datetime

    @classmethod
    def from_entity(cls, entity: Task) -> "TaskDTO":
        return cls(
            id=entity.id,
            conversation_id=entity.conversation_id,
            agent_id=entity.agent_id,
            status=entity.status.value,
            input=entity.input,
            output=entity.output,
            created_at=entity.created_at,
        )

@dataclass
class CreateTaskRequest:
    conversation_id: UUID
    agent_id: str
    input: Dict[str, Any]
    parent_task_id: Optional[UUID] = None

@dataclass
class CreateTaskResponse:
    task: TaskDTO
    status: str
```

### **Use Case**

```python
# src/application/use_cases/task/create_task.py
from uuid import UUID
from ...dtos import CreateTaskRequest, CreateTaskResponse, TaskDTO
from ...exceptions import AgentNotFoundException
from ....domain.entities import Task
from ....domain.interfaces import ITaskRepository, IMessagingGateway, IAgentRepository
from ....domain.value_objects import TaskStatus

class CreateTaskUseCase:
    def __init__(
        self,
        task_repository: ITaskRepository,
        messaging_gateway: IMessagingGateway,
        agent_repository: IAgentRepository,
    ):
        self.task_repo = task_repository
        self.messaging = messaging_gateway
        self.agent_repo = agent_repository

    async def execute(self, request: CreateTaskRequest) -> CreateTaskResponse:
        agent = await self.agent_repo.get_by_id(request.agent_id)
        if not agent:
            raise AgentNotFoundException(request.agent_id)

        task = Task(
            conversation_id=request.conversation_id,
            agent_id=request.agent_id,
            parent_task_id=request.parent_task_id,
            status=TaskStatus.PENDING,
            input=request.input,
        )

        created_task = await self.task_repo.create(task)

        await self.messaging.publish_message(
            agent_id=request.agent_id,
            payload={
                "task_id": str(created_task.id),
                "conversation_id": str(created_task.conversation_id),
                "input": created_task.input,
            }
        )

        return CreateTaskResponse(
            task=TaskDTO.from_entity(created_task),
            status="initiated",
        )
```

## **3. Infrastructure Layer**

### **ORM Model**

```python
# src/infrastructure/persistence/models/task_model.py
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from uuid import UUID, uuid4
from sqlalchemy import String, Text, JSON, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base

class TaskModel(Base):
    __tablename__ = "tasks"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    conversation_id: Mapped[UUID] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"))
    parent_task_id: Mapped[Optional[UUID]] = mapped_column(ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True)
    agent_id: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    input: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    output: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    metadata_: Mapped[Optional[Dict[str, Any]]] = mapped_column("metadata", JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
```

### **Repository Implementation**

```python
# src/infrastructure/persistence/repositories/task_repository.py
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities import Task
from src.domain.interfaces import ITaskRepository
from src.domain.value_objects import TaskStatus
from ..models import TaskModel
from .base_repository import BaseRepository

class TaskRepository(BaseRepository[TaskModel, Task], ITaskRepository):
    def __init__(self, session: AsyncSession):
        super().__init__(session, TaskModel, "Task")

    def _to_entity(self, model: TaskModel) -> Task:
        return Task(
            id=model.id,
            conversation_id=model.conversation_id,
            agent_id=model.agent_id,
            parent_task_id=model.parent_task_id,
            status=TaskStatus.from_string(model.status),
            input=model.input or {},
            output=model.output,
            error=model.error,
            metadata=model.metadata_ or {},
            created_at=model.created_at,
            started_at=model.started_at,
            completed_at=model.completed_at,
            updated_at=model.updated_at
        )

    def _to_model(self, entity: Task) -> TaskModel:
        return TaskModel(
            id=entity.id,
            conversation_id=entity.conversation_id,
            agent_id=entity.agent_id,
            parent_task_id=entity.parent_task_id,
            status=entity.status.value,
            input=entity.input,
            output=entity.output,
            error=entity.error,
            metadata_=entity.metadata,
            created_at=entity.created_at,
            started_at=entity.started_at,
            completed_at=entity.completed_at,
            updated_at=entity.updated_at
        )

    async def create(self, task: Task) -> Task:
        model = self._to_model(task)
        created_model = await self._create(model)
        return self._to_entity(created_model)

    async def get_by_id(self, task_id: UUID) -> Optional[Task]:
        model = await self._get_by_id(task_id)
        return self._to_entity(model) if model else None

    async def update(self, task: Task) -> Task:
        existing = await self._get_by_id(task.id)
        if not existing:
            raise EntityNotFoundError("Task", task.id)
        existing.status = task.status.value
        existing.output = task.output
        existing.error = task.error
        existing.started_at = task.started_at
        existing.completed_at = task.completed_at
        existing.updated_at = task.updated_at
        updated_model = await self._update(existing)
        return self._to_entity(updated_model)

    async def find_pending_for_agent(self, agent_id: str) -> List[Task]:
        query = select(TaskModel).where(
            TaskModel.agent_id == agent_id,
            TaskModel.status == TaskStatus.PENDING.value
        )
        result = await self.session.execute(query)
        models = list(result.scalars().all())
        return [self._to_entity(model) for model in models]
```

### **API Route**

```python
# src/infrastructure/api/rest/routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from uuid import UUID
from ..dependencies import get_create_task_use_case
from src.application.use_cases.task import CreateTaskUseCase
from src.application.dtos import CreateTaskRequest
from src.application.exceptions import AgentNotFoundException

router = APIRouter()

class CreateTaskApiRequest(BaseModel):
    agent_id: str = Field(..., min_length=1)
    input: Dict[str, Any]
    parent_task_id: Optional[str] = None

class TaskApiResponse(BaseModel):
    id: str
    conversation_id: str
    agent_id: str
    status: str
    input: Dict[str, Any]
    created_at: str

@router.post("", response_model=TaskApiResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    conversation_id: UUID,
    request: CreateTaskApiRequest,
    use_case: CreateTaskUseCase = Depends(get_create_task_use_case),
) -> TaskApiResponse:
    try:
        app_request = CreateTaskRequest(
            conversation_id=conversation_id,
            agent_id=request.agent_id,
            input=request.input,
            parent_task_id=UUID(request.parent_task_id) if request.parent_task_id else None,
        )
        result = await use_case.execute(app_request)
        return TaskApiResponse(
            id=str(result.task.id),
            conversation_id=str(result.task.conversation_id),
            agent_id=result.task.agent_id,
            status=result.task.status,
            input=result.task.input,
            created_at=result.task.created_at.isoformat(),
        )
    except AgentNotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Agent not found: {e.agent_id}"
        )
```

## **4. Testing**

### **Domain Tests**

```python
# tests/domain/test_entities/test_task.py
import pytest
from uuid import uuid4
from src.domain.entities import Task
from src.domain.value_objects import TaskStatus

pytestmark = pytest.mark.unit

def test_task_creation():
    task = Task(conversation_id=uuid4(), agent_id="test_agent")
    assert task.id is not None
    assert task.status == TaskStatus.PENDING

def test_task_requires_conversation_id():
    with pytest.raises(ValueError, match="conversation_id is required"):
        Task(conversation_id=None, agent_id="test_agent")

def test_task_start():
    task = Task(conversation_id=uuid4(), agent_id="test_agent")
    task.start()
    assert task.status == TaskStatus.RUNNING
    assert task.started_at is not None
```

### **Use Case Tests**

```python
# tests/application/use_cases/test_create_task.py
import pytest
from unittest.mock import AsyncMock
from uuid import uuid4
from src.application.use_cases.task import CreateTaskUseCase
from src.application.dtos import CreateTaskRequest
from src.application.exceptions import AgentNotFoundException

pytestmark = [pytest.mark.asyncio, pytest.mark.use_case]

@pytest.fixture
def use_case(task_repo, messaging_gateway, agent_repo):
    return CreateTaskUseCase(
        task_repository=task_repo,
        messaging_gateway=messaging_gateway,
        agent_repository=agent_repo,
    )

async def test_create_task_successfully(use_case, task_repo, agent_repo, messaging_gateway):
    agent_repo.get_by_id.return_value = AgentFactory.create()
    task_repo.create.return_value = TaskFactory.create()
    request = CreateTaskRequest(
        conversation_id=uuid4(),
        agent_id="test_agent",
        input={"message": "test"},
    )
    result = await use_case.execute(request)
    assert result.task.id is not None
    task_repo.create.assert_called_once()
    messaging_gateway.publish_message.assert_called_once()

async def test_create_task_agent_not_found(use_case, agent_repo):
    agent_repo.get_by_id.return_value = None
    request = CreateTaskRequest(
        conversation_id=uuid4(),
        agent_id="nonexistent",
        input={"message": "test"},
    )
    with pytest.raises(AgentNotFoundException):
        await use_case.execute(request)
```

### **Integration Tests**

```python
# tests/infrastructure/persistence/test_task_repository.py
import pytest
from uuid import uuid4
from src.domain.entities import Task
from src.domain.value_objects import TaskStatus
from src.infrastructure.persistence.repositories import TaskRepository

pytestmark = [pytest.mark.asyncio, pytest.mark.integration]

async def test_create_task(db_session):
    repo = TaskRepository(db_session)
    task = Task(conversation_id=uuid4(), agent_id="test_agent", input={"message": "test"})
    created = await repo.create(task)
    assert created.id is not None
    assert created.status == TaskStatus.PENDING

async def test_find_pending_for_agent(db_session):
    repo = TaskRepository(db_session)
    task1 = Task(conversation_id=uuid4(), agent_id="agent1", input={})
    task2 = Task(conversation_id=uuid4(), agent_id="agent1", input={})
    await repo.create(task1)
    await repo.create(task2)
    pending = await repo.find_pending_for_agent("agent1")
    assert len(pending) == 2
    assert all(t.agent_id == "agent1" for t in pending)
```

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./domain-layer.md` - Domain patterns
- `./application-layer.md` - Use case patterns
- `./api-layer.md` - API patterns
- `./testing-guide.md` - Testing strategies
