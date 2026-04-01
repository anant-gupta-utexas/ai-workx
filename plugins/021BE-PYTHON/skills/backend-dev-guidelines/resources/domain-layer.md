# **Domain Layer - Pure Business Logic**

Complete guide to implementing the Domain Layer in Clean Architecture.

## **Table of Contents**

- [Purpose and Rules](#purpose-and-rules)
- [Entities](#entities)
- [Value Objects](#value-objects)
- [Domain Services](#domain-services)
- [Interfaces (Ports)](#interfaces-ports)
- [Domain Exceptions](#domain-exceptions)

---

## **Purpose and Rules**

### **What is the Domain Layer?**

The **Domain Layer** contains pure business logic with **zero external dependencies**.

**Location**: `src/domain/`

**Rules**:
- ✅ Only standard library imports
- ✅ Pure Python (dataclasses, enums, typing)
- ✅ Only imports from other domain modules
- ❌ **NO** FastAPI, SQLAlchemy, Pydantic, or any framework
- ❌ **NO** imports from application/ or infrastructure/

### **Why Zero Dependencies?**

- **Testability**: Test business logic without infrastructure
- **Portability**: Move to different framework/database
- **Clarity**: Business rules are explicit and isolated
- **Speed**: Pure Python is fast to test

---

## **Entities**

### **What is an Entity?**

An **Entity** is an object with:
- **Identity** (unique ID)
- **Business behavior** (methods that enforce rules)
- **Mutable state** (can change over time)

### **Entity Template**

```python
# src/domain/entities/conversation.py
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from uuid import UUID, uuid4

from ..value_objects import ConversationStatus, ConversationPhase

@dataclass
class Conversation:
    id: UUID = field(default_factory=uuid4)
    user_id: str = field(default="")
    status: ConversationStatus = ConversationStatus.ACTIVE
    phase: ConversationPhase = ConversationPhase.NONE
    agent_id: Optional[str] = None
    current_agent: Optional[str] = None
    message_count: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

    def __post_init__(self):
        if not self.user_id:
            raise ValueError("user_id is required")

    def assign_primary_agent(self, agent_id: str) -> None:
        if not agent_id:
            raise ValueError("agent_id cannot be empty")
        self.agent_id = agent_id
        self.current_agent = agent_id
        self.updated_at = datetime.now(timezone.utc)

    def transition_phase(self, new_phase: ConversationPhase) -> None:
        if not self._is_valid_phase_transition(self.phase, new_phase):
            raise ValueError(f"Invalid phase transition: {self.phase} -> {new_phase}")
        self.phase = new_phase
        self.updated_at = datetime.now(timezone.utc)

    def increment_message_count(self) -> None:
        self.message_count += 1
        self.updated_at = datetime.now(timezone.utc)

    def _is_valid_phase_transition(self, from_phase: ConversationPhase, to_phase: ConversationPhase) -> bool:
        if from_phase == ConversationPhase.NONE:
            return True
        if to_phase == ConversationPhase.COMPLETE:
            return True

        valid_transitions = {
            ConversationPhase.REQUIREMENTS_GATHERING: [ConversationPhase.PLANNING],
            ConversationPhase.PLANNING: [ConversationPhase.EXECUTION],
            ConversationPhase.EXECUTION: [ConversationPhase.REVIEW],
        }
        allowed = valid_transitions.get(from_phase, [])
        return to_phase in allowed
```

### **Entity Best Practices**

**✅ DO:**
- Use `@dataclass` for simplicity
- Add `__post_init__` for validation
- Use type hints for all fields
- Use `field(default_factory=...)` for mutable defaults
- Create methods that enforce business rules
- Make private helper methods for validation

**❌ DON'T:**
- Import from application/ or infrastructure/
- Use SQLAlchemy or Pydantic
- Include database concerns
- Include HTTP concerns

---

## **Value Objects**

### **What is a Value Object?**

A **Value Object** is an immutable object defined by its attributes (no identity).

**Characteristics**:
- Immutable
- Equality based on values
- Often implemented as Enum

### **Enum Value Objects**

```python
# src/domain/value_objects/conversation_status.py
from enum import Enum

class ConversationStatus(str, Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETE = "complete"
    ARCHIVED = "archived"

    @classmethod
    def from_string(cls, value: str) -> "ConversationStatus":
        try:
            return cls(value)
        except ValueError:
            raise ValueError(f"Invalid conversation status: {value}")

    def is_terminal(self) -> bool:
        return self in {self.COMPLETE, self.ARCHIVED}
```

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

    def can_transition_to(self, new_status: "TaskStatus") -> bool:
        valid_transitions = {
            self.PENDING: {self.RUNNING, self.CANCELLED},
            self.RUNNING: {
                self.COMPLETED,
                self.FAILED,
                self.WAITING_FOR_USER,
                self.WAITING_FOR_SUBTASK,
            },
            self.WAITING_FOR_USER: {self.RUNNING, self.CANCELLED},
            self.WAITING_FOR_SUBTASK: {self.RUNNING, self.FAILED},
        }
        allowed = valid_transitions.get(self, set())
        return new_status in allowed
```

### **Complex Value Objects**

```python
# src/domain/value_objects/agent_metadata.py
from dataclasses import dataclass
from typing import List

@dataclass(frozen=True)
class AgentMetadata:
    agent_id: str
    name: str
    description: str
    capabilities: tuple[str, ...]
    agent_type: str
    client_facing: bool
    endpoint: str
    protocol: str
    version: str
    tags: tuple[str, ...]

    def __post_init__(self):
        if not self.agent_id:
            raise ValueError("agent_id is required")
        if not self.name:
            raise ValueError("name is required")
        if not self.capabilities:
            raise ValueError("at least one capability required")

    def has_capability(self, capability: str) -> bool:
        return capability in self.capabilities

    def matches_tags(self, required_tags: List[str]) -> bool:
        return all(tag in self.tags for tag in required_tags)
```

---

## **Domain Services**

### **What is a Domain Service?**

A **Domain Service** contains business logic that:
- Doesn't naturally fit in a single entity
- Operates on multiple entities
- Implements domain-wide rules

### **Domain Service Example**

```python
# src/domain/services/conversation_state_machine.py
from typing import Optional
from ..entities import Conversation
from ..value_objects import ConversationPhase, ConversationStatus

class ConversationStateMachine:
    @staticmethod
    def start_conversation(user_id: str, agent_id: str) -> Conversation:
        conversation = Conversation(
            user_id=user_id,
            agent_id=agent_id,
            current_agent=agent_id,
            status=ConversationStatus.ACTIVE,
            phase=ConversationPhase.NONE,
        )
        return conversation

    @staticmethod
    def can_pause(conversation: Conversation) -> bool:
        return (
            conversation.status == ConversationStatus.ACTIVE
            and conversation.phase not in {ConversationPhase.COMPLETE}
        )

    @staticmethod
    def pause(conversation: Conversation) -> None:
        if not ConversationStateMachine.can_pause(conversation):
            raise ValueError(
                f"Cannot pause conversation in status={conversation.status}, "
                f"phase={conversation.phase}"
            )
        conversation.status = ConversationStatus.PAUSED
        conversation.updated_at = datetime.now(timezone.utc)

    @staticmethod
    def resume(conversation: Conversation) -> None:
        if conversation.status != ConversationStatus.PAUSED:
            raise ValueError(f"Cannot resume conversation in status={conversation.status}")
        conversation.status = ConversationStatus.ACTIVE
        conversation.updated_at = datetime.now(timezone.utc)

    @staticmethod
    def complete(conversation: Conversation) -> None:
        if conversation.status not in {ConversationStatus.ACTIVE, ConversationStatus.PAUSED}:
            raise ValueError(f"Cannot complete conversation in status={conversation.status}")
        conversation.status = ConversationStatus.COMPLETE
        conversation.phase = ConversationPhase.COMPLETE
        conversation.updated_at = datetime.now(timezone.utc)
```

---

## **Interfaces (Ports)**

### **What are Interfaces?**

**Interfaces** (Ports) define contracts for infrastructure to implement.

**Purpose**:
- Define what the domain needs from infrastructure
- Enable dependency inversion
- Allow infrastructure to be swapped

### **Repository Interfaces**

```python
# src/domain/interfaces/repositories.py
from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from ..entities import Conversation, Task

class IConversationRepository(ABC):
    @abstractmethod
    async def create(self, conversation: Conversation) -> Conversation:
        pass

    @abstractmethod
    async def get_by_id(self, conversation_id: UUID) -> Optional[Conversation]:
        pass

    @abstractmethod
    async def update(self, conversation: Conversation) -> Conversation:
        pass

    @abstractmethod
    async def find_active_for_user(self, user_id: str) -> List[Conversation]:
        pass

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

### **Gateway Interfaces**

```python
# src/domain/interfaces/gateways.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class AgentRequest:
    agent_id: str
    task_id: str
    input: Dict[str, Any]
    context: Dict[str, Any]

@dataclass
class AgentResponse:
    status: str
    output: Optional[Dict[str, Any]]
    expects_user_input: bool
    hitl_checkpoint: Optional[Dict[str, Any]]
    error: Optional[str]

class IAgentGateway(ABC):
    @abstractmethod
    async def invoke(self, request: AgentRequest) -> AgentResponse:
        pass
```

---

## **Domain Exceptions**

### **Custom Exceptions**

```python
# src/domain/exceptions/domain_exceptions.py
from typing import Optional
from uuid import UUID

class DomainException(Exception):
    pass

class EntityNotFoundError(DomainException):
    def __init__(self, entity_type: str, entity_id: UUID):
        self.entity_type = entity_type
        self.entity_id = entity_id
        super().__init__(f"{entity_type} not found: {entity_id}")

class InvalidStateTransitionError(DomainException):
    def __init__(self, message: str, current_state: Optional[str] = None):
        self.current_state = current_state
        super().__init__(message)

class BusinessRuleViolationError(DomainException):
    def __init__(self, rule: str, details: Optional[str] = None):
        self.rule = rule
        self.details = details
        message = f"Business rule violated: {rule}"
        if details:
            message += f" - {details}"
        super().__init__(message)
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./clean-architecture.md` - Architecture overview
- `./application-layer.md` - Application layer details
- `./repository-pattern.md` - Implementing repositories
