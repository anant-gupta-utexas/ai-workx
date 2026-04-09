# **Repository Pattern - Generic Base Repository**

Complete guide to implementing the Repository pattern with generics in Clean Architecture.

## **Table of Contents**

- [Purpose and Rules](#purpose-and-rules)
- [Generic Base Repository](#generic-base-repository)
- [Concrete Repository](#concrete-repository)
- [ORM Models](#orm-models)
- [Query Patterns](#query-patterns)
- [Best Practices](#best-practices)

---

## **Purpose and Rules**

### **What is the Repository Pattern?**

The **Repository Pattern** abstracts data access, separating domain logic from persistence concerns.

**Location**: `src/infrastructure/persistence/repositories/`

**Purpose**:
- Implement domain repository interfaces
- Convert between domain entities and ORM models
- Handle database operations
- Provide clean abstraction over SQLAlchemy

**Rules**:
- ✅ Implements domain `I*Repository` interfaces
- ✅ Uses SQLAlchemy for database access
- ✅ Converts ORM models ↔ domain entities
- ❌ No business logic (that's domain layer)

---

## **Generic Base Repository**

### **Why Generic Base Repository?**

- **Type Safety**: TypeVar ensures correct types
- **Code Reuse**: Common CRUD operations
- **Consistency**: All repositories follow same pattern
- **Less Boilerplate**: Write less code

### **Implementation**

```python
# src/infrastructure/persistence/repositories/base_repository.py
import logging
from typing import Generic, TypeVar, Optional, List, Type
from uuid import UUID
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError, IntegrityError
from src.domain.exceptions import EntityNotFoundError, EntityAlreadyExistsError

logger = logging.getLogger(__name__)

TModel = TypeVar('TModel')
TEntity = TypeVar('TEntity')

class BaseRepository(Generic[TModel, TEntity]):
    def __init__(self, session: AsyncSession, model_class: Type[TModel], entity_name: str):
        self.session = session
        self.model_class = model_class
        self.entity_name = entity_name

    async def _get_by_id(self, entity_id: UUID) -> Optional[TModel]:
        try:
            return await self.session.get(self.model_class, entity_id)
        except SQLAlchemyError as e:
            logger.error(f"Error getting {self.entity_name} by ID {entity_id}: {e}")
            raise

    async def _create(self, model: TModel) -> TModel:
        try:
            self.session.add(model)
            await self.session.commit()
            await self.session.refresh(model)
            return model
        except IntegrityError as e:
            await self.session.rollback()
            logger.error(f"Integrity error creating {self.entity_name}: {e}")
            raise EntityAlreadyExistsError(self.entity_name, "Entity already exists")
        except SQLAlchemyError as e:
            await self.session.rollback()
            logger.error(f"Error creating {self.entity_name}: {e}")
            raise

    async def _update(self, model: TModel) -> TModel:
        try:
            await self.session.commit()
            await self.session.refresh(model)
            return model
        except SQLAlchemyError as e:
            await self.session.rollback()
            logger.error(f"Error updating {self.entity_name}: {e}")
            raise

    async def _delete(self, entity_id: UUID) -> bool:
        try:
            result = await self.session.execute(
                delete(self.model_class).where(self.model_class.id == entity_id)
            )
            await self.session.commit()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            await self.session.rollback()
            logger.error(f"Error deleting {self.entity_name} {entity_id}: {e}")
            raise

    def _to_entity(self, model: TModel) -> TEntity:
        raise NotImplementedError

    def _to_model(self, entity: TEntity) -> TModel:
        raise NotImplementedError
```

---

## **Concrete Repository**

### **Implementation Example**

```python
# src/infrastructure/persistence/repositories/task_repository.py
from typing import Optional, List
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.domain.entities import Task
from src.domain.interfaces import ITaskRepository
from src.domain.value_objects import TaskStatus
from src.domain.exceptions import EntityNotFoundError
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

---

## **ORM Models**

### **SQLAlchemy Model**

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
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )
```

---

## **Query Patterns**

### **Session Management**

```python
# src/infrastructure/persistence/session.py
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from typing import AsyncGenerator

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None

def create_engine(url: str, echo: bool = False) -> AsyncEngine:
    return create_async_engine(url, echo=echo, pool_pre_ping=True, pool_size=10, max_overflow=20)

def init_engine(url: str, echo: bool = False) -> None:
    global _engine, _session_factory
    _engine = create_engine(url, echo)
    _session_factory = async_sessionmaker(_engine, class_=AsyncSession, expire_on_commit=False)

async def get_session() -> AsyncGenerator[AsyncSession, None]:
    if _session_factory is None:
        raise RuntimeError("Database not initialized. Call init_engine() first.")
    async with _session_factory() as session:
        try:
            yield session
        finally:
            await session.close()
```

### **FastAPI Dependency**

```python
# src/infrastructure/api/rest/dependencies.py
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from src.infrastructure.persistence.session import get_session

async def get_task_repository(session: AsyncSession = Depends(get_session)):
    return TaskRepository(session)
```

### **Eager Loading (Avoid N+1)**

```python
from sqlalchemy.orm import selectinload

# ✅ GOOD: Single query with eager loading
async def find_with_tasks(self, user_id: str):
    query = select(ConversationModel).where(
        ConversationModel.user_id == user_id
    ).options(selectinload(ConversationModel.tasks))
    result = await self.session.execute(query)
    models = list(result.scalars().all())
    return [self._to_entity(m) for m in models]

# ❌ BAD: N+1 queries
async def get_conversations_with_tasks(self, user_id: str):
    conversations = await self.find_by_user(user_id)
    for conv in conversations:
        tasks = await self.task_repo.find_by_conversation(conv.id)  # N queries!
```

### **Complex Filtering**

```python
from sqlalchemy import and_, or_, func

async def search_tasks(
    self,
    conversation_id: UUID,
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    search_term: Optional[str] = None,
) -> List[Task]:
    query = select(TaskModel)
    conditions = [TaskModel.conversation_id == conversation_id]

    if agent_id:
        conditions.append(TaskModel.agent_id == agent_id)
    if status:
        conditions.append(TaskModel.status == status)
    if search_term:
        conditions.append(func.cast(TaskModel.input, String).ilike(f"%{search_term}%"))

    query = query.where(and_(*conditions)).order_by(TaskModel.created_at.desc())
    result = await self.session.execute(query)
    models = list(result.scalars().all())
    return [self._to_entity(m) for m in models]
```

### **Pagination**

```python
async def find_paginated(
    self,
    page: int = 1,
    page_size: int = 50,
    filters: Optional[dict] = None
) -> tuple[List[Task], int]:
    query = select(TaskModel)
    if filters:
        for field, value in filters.items():
            query = query.where(getattr(TaskModel, field) == value)

    count_query = select(func.count()).select_from(query.subquery())
    total = await self.session.scalar(count_query)

    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await self.session.execute(query)
    models = list(result.scalars().all())
    return [self._to_entity(m) for m in models], total
```

### **Transactions**

```python
# Automatic transaction
async def create(self, task: Task) -> Task:
    model = self._to_model(task)
    created_model = await self._create(model)
    return self._to_entity(created_model)

# Manual transaction for multi-entity operations
async def create_conversation_with_task(self, conversation: Conversation, task: Task) -> tuple[Conversation, Task]:
    try:
        async with self.session.begin():
            conv_model = self._to_model(conversation)
            self.session.add(conv_model)
            await self.session.flush()

            task.conversation_id = conv_model.id
            task_model = self._to_model(task)
            self.session.add(task_model)

        await self.session.refresh(conv_model)
        await self.session.refresh(task_model)
        return (self._to_entity(conv_model), self._to_entity(task_model))
    except Exception as e:
        logger.error(f"Transaction failed: {e}")
        raise
```

---

## **Best Practices**

### **1. Always Use Generic Base**

```python
# ✅ GOOD: Inherit from generic base
class TaskRepository(BaseRepository[TaskModel, Task], ITaskRepository):
    ...

# ❌ BAD: Duplicate CRUD operations
class TaskRepository(ITaskRepository):
    async def create(self, task):
        ...
```

### **2. Implement Required Conversions**

```python
# ✅ GOOD: Clear conversion methods
def _to_entity(self, model: TaskModel) -> Task:
    return Task(id=model.id, status=TaskStatus.from_string(model.status), ...)

# ❌ BAD: No conversion
def get_by_id(self, task_id: UUID) -> TaskModel:  # Returns model!
    ...
```

### **3. Handle Errors Properly**

```python
# ✅ GOOD: Proper error handling
try:
    model = await self._create(model)
except IntegrityError:
    raise EntityAlreadyExistsError(...)

# ❌ BAD: Silent failures
model = await self._create(model)
```

### **4. Alembic Migrations**

```bash
# Add to dependency group
uv add --group persistence alembic

# Initialize
alembic init alembic

# Create and run migrations
alembic revision --autogenerate -m "Create tasks table"
alembic upgrade head
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./domain-layer.md` - Domain interfaces
- `./application-layer.md` - Using repositories
