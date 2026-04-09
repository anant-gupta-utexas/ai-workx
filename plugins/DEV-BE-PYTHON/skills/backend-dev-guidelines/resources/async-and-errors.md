# **Async Patterns and Error Handling**

Complete guide to async/await patterns and custom error handling in Python/FastAPI.

## **Table of Contents**

- [Async Best Practices](#async-best-practices)
- [Concurrent Operations](#concurrent-operations)
- [Custom Exceptions](#custom-exceptions)
- [Error Propagation](#error-propagation)
- [Context Managers](#context-managers)

---

## **Async Best Practices**

### **Always Use Try-Except**

```python
# ❌ NEVER: Unhandled async errors
async def fetch_data():
    data = await database.query()
    return data

# ✅ ALWAYS: Wrap in try-except
async def fetch_data():
    try:
        data = await database.query()
        return data
    except Exception as e:
        capture_exception(e)
        raise
```

### **Proper Async Definition**

```python
# ✅ Async function
async def get_user(user_id: int) -> User:
    user = await db.execute(select(User).where(User.id == user_id))
    return user.scalar_one_or_none()

# ✅ Calling async function
user = await get_user(123)

# ❌ Calling without await
user = get_user(123)  # Returns coroutine, not User!
```

### **FastAPI Routes**

```python
# ✅ Async route (has await)
@router.get("/users/{user_id}")
async def get_user(user_id: int) -> UserResponse:
    user = await user_service.get_user(user_id)
    return user

# ✅ Sync route (no async operations)
@router.get("/health")
def health_check():
    return {"status": "ok"}
```

---

## **Concurrent Operations**

### **Parallel with asyncio.gather**

```python
import asyncio

# ✅ Run operations in parallel
async def get_user_dashboard(user_id: int):
    user, posts, comments = await asyncio.gather(
        user_repo.find_by_id(user_id),
        post_repo.find_by_user(user_id),
        comment_repo.find_by_user(user_id),
    )
    return {"user": user, "posts": posts, "comments": comments}

# ❌ Sequential (slower)
async def get_user_dashboard_slow(user_id: int):
    user = await user_repo.find_by_id(user_id)
    posts = await post_repo.find_by_user(user_id)
    comments = await comment_repo.find_by_user(user_id)
    return {"user": user, "posts": posts, "comments": comments}
```

### **Error Handling with gather**

```python
# ✅ Raise first exception
async def fetch_multiple():
    try:
        results = await asyncio.gather(
            fetch_users(),
            fetch_posts(),
            fetch_comments(),
            return_exceptions=False,
        )
        return results
    except Exception as e:
        capture_exception(e)
        raise

# ✅ Continue on errors
async def fetch_with_fallback():
    results = await asyncio.gather(
        fetch_users(),
        fetch_posts(),
        fetch_comments(),
        return_exceptions=True,  # Returns exceptions instead of raising
    )
    for i, result in enumerate(results):
        if isinstance(result, Exception):
            capture_exception(result)
        else:
            print(f"Operation {i} succeeded")
    return [r for r in results if not isinstance(r, Exception)]
```

### **Timeout Control**

```python
import asyncio

async def fetch_with_timeout(url: str, timeout: float = 5.0):
    try:
        async with asyncio.timeout(timeout):
            response = await http_client.get(url)
            return response
    except asyncio.TimeoutError:
        capture_message(f"Request to {url} timed out after {timeout}s")
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Request timed out",
        )
```

### **Background Tasks**

```python
from fastapi import BackgroundTasks

@router.post("/users")
async def create_user(user_data: UserCreate, background_tasks: BackgroundTasks):
    user = await user_service.create_user(user_data)
    background_tasks.add_task(send_welcome_email, user.email)
    background_tasks.add_task(log_user_creation, user.id)
    return user

async def send_welcome_email(email: str):
    try:
        await email_service.send(email, "Welcome!")
    except Exception as e:
        capture_exception(e)
```

---

## **Custom Exceptions**

### **Define Custom Exceptions**

```python
# src/application/exceptions.py
from fastapi import status

class AppException(Exception):
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status_code=status.HTTP_404_NOT_FOUND)

class ConflictError(AppException):
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status_code=status.HTTP_409_CONFLICT)

class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed"):
        super().__init__(message, status_code=status.HTTP_400_BAD_REQUEST)

class ForbiddenError(AppException):
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, status_code=status.HTTP_403_FORBIDDEN)

class UnauthorizedError(AppException):
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, status_code=status.HTTP_401_UNAUTHORIZED)
```

### **Usage**

```python
from src.application.exceptions import NotFoundError, ConflictError

class UserService:
    async def get_user(self, user_id: int) -> User:
        user = await self.repository.find_by_id(user_id)
        if not user:
            raise NotFoundError(f"User with id {user_id} not found")
        return user

    async def create_user(self, data: UserCreate) -> User:
        existing = await self.repository.find_by_email(data.email)
        if existing:
            raise ConflictError("Email already registered")
        return await self.repository.create(data)
```

### **Global Exception Handler**

```python
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from opentelemetry import trace
from opentelemetry.trace import Status, StatusCode
from src.application.exceptions import AppException
import logging

logger = logging.getLogger(__name__)
app = FastAPI()

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    span = trace.get_current_span()
    span.record_exception(exc)
    span.set_status(Status(StatusCode.ERROR, str(exc)))
    span_context = span.get_span_context()

    logger.error(
        "Unhandled exception",
        extra={
            "error": str(exc),
            "trace_id": format(span_context.trace_id, '032x'),
        },
        exc_info=True
    )

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "trace_id": format(span_context.trace_id, '032x'),
        },
    )
```

---

## **Error Propagation**

### **Proper Error Chains**

```python
# ✅ Propagate errors up the stack
class UserRepository:
    async def create(self, data: UserCreate) -> User:
        try:
            user = User(**data.model_dump())
            self.db.add(user)
            await self.db.commit()
            return user
        except IntegrityError as e:
            await self.db.rollback()
            capture_exception(e)
            raise ConflictError("Email already exists")
        except Exception as e:
            await self.db.rollback()
            capture_exception(e)
            raise

class UserService:
    async def create_user(self, data: UserCreate) -> User:
        try:
            return await self.repository.create(data)
        except ConflictError:
            raise  # Let it propagate to router
        except Exception as e:
            capture_exception(e)
            raise

@router.post("/users")
async def create_user(user_data: UserCreate):
    try:
        user = await user_service.create_user(user_data)
        return user
    except ConflictError as e:
        raise HTTPException(status_code=409, detail=str(e))
```

### **Common Async Pitfalls**

```python
# ❌ NEVER: Fire and forget (errors unhandled)
async def bad_process(request_data):
    asyncio.create_task(send_notification(request_data))
    return {"status": "ok"}

# ✅ Use FastAPI background tasks
from fastapi import BackgroundTasks

async def good_process(request_data, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_notification, request_data)
    return {"status": "ok"}

# ❌ NEVER: Blocking call in async
async def bad_blocking():
    result = time.sleep(5)  # Blocks event loop!
    return result

# ✅ Use asyncio.sleep
async def good_async():
    await asyncio.sleep(5)
    return "done"

# ✅ Run blocking code in thread pool
async def good_blocking():
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(None, blocking_operation)
    return result

def blocking_operation():
    time.sleep(5)
    return "done"
```

---

## **Context Managers**

### **Async Context Manager**

```python
class DatabaseConnection:
    async def __aenter__(self):
        self.conn = await create_connection()
        return self.conn

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.conn.close()

async def query_database():
    async with DatabaseConnection() as conn:
        result = await conn.execute("SELECT * FROM users")
        return result
```

### **Transaction Context Manager**

```python
from contextlib import asynccontextmanager

@asynccontextmanager
async def transaction(db: AsyncSession):
    try:
        async with db.begin():
            yield db
    except Exception as e:
        await db.rollback()
        capture_exception(e)
        raise

async def transfer_funds(from_id: int, to_id: int, amount: float):
    async with transaction(db) as session:
        sender = await session.get(Account, from_id)
        sender.balance -= amount

        recipient = await session.get(Account, to_id)
        recipient.balance += amount
        # Commit happens automatically
```

### **Timing Context Manager**

```python
from contextlib import asynccontextmanager
import time

@asynccontextmanager
async def timing(operation: str):
    start = time.time()
    try:
        yield
    finally:
        duration = time.time() - start
        print(f"{operation} took {duration:.2f}s")
        if duration > 1.0:
            capture_message(
                f"Slow operation: {operation} took {duration:.2f}s",
                level="warning",
            )

async def fetch_data():
    async with timing("fetch_user_data"):
        users = await db.execute(select(User))
        return users.scalars().all()
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./observability.md` - OpenTelemetry error tracking
- `./application-layer.md` - Async in use cases
- `./complete-examples.md` - Full async examples
