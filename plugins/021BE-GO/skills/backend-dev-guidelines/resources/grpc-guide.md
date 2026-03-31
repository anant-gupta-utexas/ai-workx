# **gRPC Guide - buf, connect-go, and Interceptors**

Complete guide to building gRPC services in Go Clean Architecture.

## **Table of Contents**

- [Overview](#overview)
- [buf Setup](#buf-setup)
- [Protobuf Definitions](#protobuf-definitions)
- [gRPC Server Implementation](#grpc-server-implementation)
- [connect-go Alternative](#connect-go-alternative)
- [Interceptors](#interceptors)
- [Testing gRPC Services](#testing-grpc-services)
- [Best Practices](#best-practices)

---

## **Overview**

### **When to Use gRPC**

| Use Case | Protocol |
| --- | --- |
| Public-facing REST API | HTTP/JSON (Chi) |
| Internal service-to-service | gRPC |
| Streaming (real-time data) | gRPC streams |
| Mobile/web clients | connect-go (gRPC + HTTP) |

### **Tool Choices**

- **buf**: Replaces protoc — automatic file discovery, linting, breaking change detection
- **connect-go**: Modern gRPC alternative by Buf — supports gRPC, gRPC-Web, and Connect protocols simultaneously
- **go-grpc-middleware v2**: Standard interceptor ecosystem for classic gRPC

---

## **buf Setup**

### **Installation**

```bash
go get -tool github.com/bufbuild/buf/cmd/buf@latest
```

### **buf.yaml**

```yaml
# buf.yaml (project root or api/proto/)
version: v2
modules:
  - path: api/proto
lint:
  use:
    - STANDARD
breaking:
  use:
    - FILE
```

### **buf.gen.yaml**

```yaml
# buf.gen.yaml
version: v2
plugins:
  # Standard gRPC
  - remote: buf.build/protocolbuffers/go
    out: internal/ports/grpc/gen
    opt: paths=source_relative
  - remote: buf.build/grpc/go
    out: internal/ports/grpc/gen
    opt: paths=source_relative

  # Or connect-go (pick one approach)
  # - remote: buf.build/connectrpc/go
  #   out: internal/ports/grpc/gen
  #   opt: paths=source_relative
```

### **Generate Code**

```bash
# Lint proto files
go tool buf lint

# Check for breaking changes
go tool buf breaking --against '.git#branch=main'

# Generate Go code
go tool buf generate
```

---

## **Protobuf Definitions**

### **Service Definition**

```protobuf
// api/proto/user/v1/user.proto
syntax = "proto3";

package user.v1;

option go_package = "myservice/internal/ports/grpc/gen/user/v1;userv1";

import "google/protobuf/timestamp.proto";

service UserService {
  rpc CreateUser(CreateUserRequest) returns (CreateUserResponse);
  rpc GetUser(GetUserRequest) returns (GetUserResponse);
  rpc ListUsers(ListUsersRequest) returns (ListUsersResponse);
  rpc DeleteUser(DeleteUserRequest) returns (DeleteUserResponse);
}

message CreateUserRequest {
  string email = 1;
  string name = 2;
}

message CreateUserResponse {
  User user = 1;
}

message GetUserRequest {
  string id = 1;
}

message GetUserResponse {
  User user = 1;
}

message ListUsersRequest {
  int32 limit = 1;
  int32 offset = 2;
}

message ListUsersResponse {
  repeated User users = 1;
}

message DeleteUserRequest {
  string id = 1;
}

message DeleteUserResponse {}

message User {
  string id = 1;
  string email = 2;
  string name = 3;
  string status = 4;
  google.protobuf.Timestamp created_at = 5;
}
```

### **Directory Layout**

```
api/
  proto/
    user/
      v1/
        user.proto
    order/
      v1/
        order.proto
    buf.yaml
buf.gen.yaml
```

---

## **gRPC Server Implementation**

### **Server Handler**

The gRPC handler follows the same pattern as HTTP handlers — it receives the app service and translates between protobuf and app DTOs:

```go
// internal/ports/grpc/user_server.go
package grpc

import (
    "context"
    "errors"

    "myservice/internal/app"
    "myservice/internal/domain/user"
    userv1 "myservice/internal/ports/grpc/gen/user/v1"

    "github.com/google/uuid"
    "google.golang.org/grpc/codes"
    "google.golang.org/grpc/status"
    "google.golang.org/protobuf/types/known/timestamppb"
)

type UserServer struct {
    userv1.UnimplementedUserServiceServer
    service *app.UserService
}

func NewUserServer(service *app.UserService) *UserServer {
    return &UserServer{service: service}
}

func (s *UserServer) CreateUser(ctx context.Context, req *userv1.CreateUserRequest) (*userv1.CreateUserResponse, error) {
    dto, err := s.service.CreateUser(ctx, app.CreateUserRequest{
        Email: req.Email,
        Name:  req.Name,
    })
    if err != nil {
        return nil, mapToGRPCError(err)
    }

    return &userv1.CreateUserResponse{
        User: toProtoUser(dto),
    }, nil
}

func (s *UserServer) GetUser(ctx context.Context, req *userv1.GetUserRequest) (*userv1.GetUserResponse, error) {
    id, err := uuid.Parse(req.Id)
    if err != nil {
        return nil, status.Errorf(codes.InvalidArgument, "invalid user ID")
    }

    dto, err := s.service.GetUser(ctx, id)
    if err != nil {
        return nil, mapToGRPCError(err)
    }

    return &userv1.GetUserResponse{
        User: toProtoUser(dto),
    }, nil
}

// --- Mappers ---

func toProtoUser(dto *app.UserDTO) *userv1.User {
    return &userv1.User{
        Id:        dto.ID.String(),
        Email:     dto.Email,
        Name:      dto.Name,
        Status:    dto.Status,
        CreatedAt: timestamppb.New(dto.CreatedAt),
    }
}

func mapToGRPCError(err error) error {
    switch {
    case errors.Is(err, user.ErrNotFound):
        return status.Errorf(codes.NotFound, "user not found")
    case errors.Is(err, user.ErrAlreadyExists):
        return status.Errorf(codes.AlreadyExists, "user already exists")
    case errors.Is(err, app.ErrUnauthorized):
        return status.Errorf(codes.Unauthenticated, "unauthorized")
    case errors.Is(err, app.ErrForbidden):
        return status.Errorf(codes.PermissionDenied, "forbidden")
    default:
        return status.Errorf(codes.Internal, "internal error")
    }
}
```

### **Starting the gRPC Server**

```go
// cmd/server/main.go (gRPC addition)
import (
    "google.golang.org/grpc"
    "google.golang.org/grpc/reflection"

    grpcport "myservice/internal/ports/grpc"
    userv1 "myservice/internal/ports/grpc/gen/user/v1"
)

func startGRPCServer(cfg config.Config, userService *app.UserService) {
    lis, err := net.Listen("tcp", ":"+cfg.Server.GRPCPort)
    if err != nil {
        log.Fatalf("listening on gRPC port: %v", err)
    }

    srv := grpc.NewServer(
        grpc.ChainUnaryInterceptor(
            grpcport.LoggingInterceptor(),
            grpcport.RecoveryInterceptor(),
        ),
    )

    userv1.RegisterUserServiceServer(srv, grpcport.NewUserServer(userService))

    // Enable reflection for grpcurl/grpcui debugging
    reflection.Register(srv)

    slog.Info("gRPC server starting", "port", cfg.Server.GRPCPort)
    if err := srv.Serve(lis); err != nil {
        log.Fatalf("gRPC server error: %v", err)
    }
}
```

---

## **connect-go Alternative**

### **Why connect-go?**

connect-go by the Buf team supports gRPC, gRPC-Web, and Connect protocols simultaneously. Clients can use `curl` and standard HTTP/JSON while the server still supports binary gRPC:

```bash
# Works with connect-go out of the box
curl -X POST http://localhost:8080/user.v1.UserService/CreateUser \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com", "name": "Alice"}'
```

### **connect-go Handler**

```go
// internal/ports/connectrpc/user_server.go
package connectrpc

import (
    "context"
    "errors"

    "connectrpc.com/connect"

    "myservice/internal/app"
    "myservice/internal/domain/user"
    userv1 "myservice/internal/ports/grpc/gen/user/v1"
    "myservice/internal/ports/grpc/gen/user/v1/userv1connect"
)

type UserServer struct {
    service *app.UserService
}

func NewUserServer(service *app.UserService) *UserServer {
    return &UserServer{service: service}
}

func (s *UserServer) CreateUser(
    ctx context.Context,
    req *connect.Request[userv1.CreateUserRequest],
) (*connect.Response[userv1.CreateUserResponse], error) {
    dto, err := s.service.CreateUser(ctx, app.CreateUserRequest{
        Email: req.Msg.Email,
        Name:  req.Msg.Name,
    })
    if err != nil {
        return nil, mapToConnectError(err)
    }

    return connect.NewResponse(&userv1.CreateUserResponse{
        User: toProtoUser(dto),
    }), nil
}

func mapToConnectError(err error) error {
    switch {
    case errors.Is(err, user.ErrNotFound):
        return connect.NewError(connect.CodeNotFound, err)
    case errors.Is(err, user.ErrAlreadyExists):
        return connect.NewError(connect.CodeAlreadyExists, err)
    default:
        return connect.NewError(connect.CodeInternal, errors.New("internal error"))
    }
}
```

### **Mounting connect-go with Chi**

```go
// connect-go uses net/http, so it integrates naturally with Chi
mux := http.NewServeMux()
path, handler := userv1connect.NewUserServiceHandler(connectrpc.NewUserServer(userService))
mux.Handle(path, handler)

// Mount under Chi router
r.Mount("/", mux)
```

---

## **Interceptors**

### **Logging Interceptor**

```go
// internal/ports/grpc/interceptors.go
package grpc

import (
    "context"
    "log/slog"
    "time"

    "google.golang.org/grpc"
    "google.golang.org/grpc/status"
)

func LoggingInterceptor() grpc.UnaryServerInterceptor {
    return func(
        ctx context.Context,
        req any,
        info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler,
    ) (any, error) {
        start := time.Now()
        resp, err := handler(ctx, req)
        duration := time.Since(start)

        st, _ := status.FromError(err)
        attrs := []any{
            "method", info.FullMethod,
            "duration_ms", duration.Milliseconds(),
            "code", st.Code().String(),
        }

        if err != nil {
            slog.ErrorContext(ctx, "gRPC request failed", attrs...)
        } else {
            slog.InfoContext(ctx, "gRPC request completed", attrs...)
        }

        return resp, err
    }
}
```

### **Recovery Interceptor**

```go
func RecoveryInterceptor() grpc.UnaryServerInterceptor {
    return func(
        ctx context.Context,
        req any,
        info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler,
    ) (resp any, err error) {
        defer func() {
            if r := recover(); r != nil {
                slog.ErrorContext(ctx, "gRPC panic recovered",
                    "panic", r,
                    "method", info.FullMethod,
                    "stack", string(debug.Stack()),
                )
                err = status.Errorf(codes.Internal, "internal error")
            }
        }()
        return handler(ctx, req)
    }
}
```

### **Authentication Interceptor**

```go
func AuthInterceptor(validator TokenValidator) grpc.UnaryServerInterceptor {
    return func(
        ctx context.Context,
        req any,
        info *grpc.UnaryServerInfo,
        handler grpc.UnaryHandler,
    ) (any, error) {
        // Skip auth for reflection and health
        if isPublicMethod(info.FullMethod) {
            return handler(ctx, req)
        }

        md, ok := metadata.FromIncomingContext(ctx)
        if !ok {
            return nil, status.Errorf(codes.Unauthenticated, "missing metadata")
        }

        tokens := md.Get("authorization")
        if len(tokens) == 0 {
            return nil, status.Errorf(codes.Unauthenticated, "missing token")
        }

        token := strings.TrimPrefix(tokens[0], "Bearer ")
        userID, role, err := validator.Validate(token)
        if err != nil {
            return nil, status.Errorf(codes.Unauthenticated, "invalid token")
        }

        ctx = context.WithValue(ctx, UserIDKey, userID)
        ctx = context.WithValue(ctx, UserRoleKey, role)
        return handler(ctx, req)
    }
}
```

### **Chaining Interceptors**

```go
srv := grpc.NewServer(
    grpc.ChainUnaryInterceptor(
        RecoveryInterceptor(),
        LoggingInterceptor(),
        AuthInterceptor(tokenValidator),
    ),
)
```

---

## **Testing gRPC Services**

### **Unit Testing with bufconn**

```go
package grpc_test

import (
    "context"
    "net"
    "testing"

    "myservice/internal/app"
    "myservice/internal/mocks"
    grpcport "myservice/internal/ports/grpc"
    userv1 "myservice/internal/ports/grpc/gen/user/v1"

    "github.com/stretchr/testify/require"
    "google.golang.org/grpc"
    "google.golang.org/grpc/credentials/insecure"
    "google.golang.org/grpc/test/bufconn"
)

func setupTestServer(t *testing.T) userv1.UserServiceClient {
    t.Helper()

    mockRepo := mocks.NewMockRepository(t)
    // ... setup expectations

    service := app.NewUserService(mockRepo)
    server := grpcport.NewUserServer(service)

    lis := bufconn.Listen(1024 * 1024)
    srv := grpc.NewServer()
    userv1.RegisterUserServiceServer(srv, server)

    go func() { _ = srv.Serve(lis) }()
    t.Cleanup(func() { srv.Stop() })

    conn, err := grpc.NewClient("passthrough:///bufconn",
        grpc.WithContextDialer(func(ctx context.Context, s string) (net.Conn, error) {
            return lis.DialContext(ctx)
        }),
        grpc.WithTransportCredentials(insecure.NewCredentials()),
    )
    require.NoError(t, err)
    t.Cleanup(func() { conn.Close() })

    return userv1.NewUserServiceClient(conn)
}

func TestCreateUser_gRPC(t *testing.T) {
    client := setupTestServer(t)

    resp, err := client.CreateUser(context.Background(), &userv1.CreateUserRequest{
        Email: "alice@example.com",
        Name:  "Alice",
    })
    require.NoError(t, err)
    require.NotEmpty(t, resp.User.Id)
}
```

---

## **Best Practices**

### **1. Keep Handlers Thin**

```go
// ✅ GOOD: Handler converts proto → DTO, calls service, converts DTO → proto
func (s *UserServer) CreateUser(ctx context.Context, req *userv1.CreateUserRequest) (*userv1.CreateUserResponse, error) {
    dto, err := s.service.CreateUser(ctx, app.CreateUserRequest{...})
    // ...
}

// ❌ BAD: Business logic in gRPC handler
func (s *UserServer) CreateUser(ctx context.Context, req *userv1.CreateUserRequest) (*userv1.CreateUserResponse, error) {
    // Validating, querying DB, sending emails directly in handler...
}
```

### **2. Same Service for HTTP and gRPC**

Both HTTP handlers and gRPC servers should use the same `app.UserService`. The only difference is the protocol adapter layer:

```
HTTP Handler  → app.UserService → domain → repository
gRPC Server   → app.UserService → domain → repository
```

### **3. Version Your Protos**

Always use versioned packages: `user.v1`, `order.v1`. When you need breaking changes, create `v2`.

### **4. Use buf lint and buf breaking**

```bash
# CI pipeline
go tool buf lint
go tool buf breaking --against '.git#branch=main'
go tool buf generate
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./api-layer.md` - HTTP handler patterns
- `./error-handling.md` - Error mapping (HTTP + gRPC)
- `./middleware-guide.md` - HTTP middleware (compare with interceptors)
- `./testing-guide.md` - Testing patterns
