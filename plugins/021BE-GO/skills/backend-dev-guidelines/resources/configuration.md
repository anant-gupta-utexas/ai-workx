# **Configuration Management - koanf, Tooling, and Build**

Complete guide to configuration, dependency management, and build automation in Go Clean Architecture.

## **Table of Contents**

- [koanf Configuration](#koanf-configuration)
- [Go Modules and Tool Directive](#go-modules-and-tool-directive)
- [Makefile](#makefile)
- [golangci-lint v2](#golangci-lint-v2)
- [Best Practices](#best-practices)

---

## **koanf Configuration**

### **Why koanf Over Viper?**

- **Modular**: Install only the providers you need
- **Respects casing**: Viper forcibly lowercases keys
- **Smaller binary**: Viper produces ~3x larger binaries
- **Recommended by Three Dots Labs** for new Go projects

### **Setup**

```go
// internal/adapters/config/config.go
package config

import (
    "fmt"
    "log"
    "strings"

    "github.com/knadh/koanf/parsers/yaml"
    "github.com/knadh/koanf/providers/env"
    "github.com/knadh/koanf/providers/file"
    "github.com/knadh/koanf/v2"
)

type Config struct {
    Environment string         `koanf:"environment"`
    Server      ServerConfig   `koanf:"server"`
    Database    DatabaseConfig `koanf:"database"`
    Log         LogConfig      `koanf:"log"`
    Telemetry   TelemetryConfig `koanf:"telemetry"`
}

type ServerConfig struct {
    Port            string `koanf:"port"`
    ReadTimeout     int    `koanf:"read_timeout"`
    WriteTimeout    int    `koanf:"write_timeout"`
    ShutdownTimeout int    `koanf:"shutdown_timeout"`
}

type DatabaseConfig struct {
    URL      string `koanf:"url"`
    MaxConns int    `koanf:"max_conns"`
    MinConns int    `koanf:"min_conns"`
}

type LogConfig struct {
    Level string `koanf:"level"`
    Debug bool   `koanf:"debug"`
}

type TelemetryConfig struct {
    Enabled      bool   `koanf:"enabled"`
    OTLPEndpoint string `koanf:"otlp_endpoint"`
}
```

### **Loading Configuration**

```go
func Load() Config {
    k := koanf.New(".")

    // 1. Load YAML defaults
    if err := k.Load(file.Provider("configs/config.yaml"), yaml.Parser()); err != nil {
        log.Fatalf("loading default config: %v", err)
    }

    // 2. Load local overrides (gitignored)
    _ = k.Load(file.Provider("configs/config.local.yaml"), yaml.Parser())

    // 3. Load environment variables (highest priority)
    // APP_SERVER_PORT → server.port
    err := k.Load(env.Provider("APP_", ".", func(s string) string {
        return strings.Replace(
            strings.ToLower(strings.TrimPrefix(s, "APP_")),
            "_", ".", -1,
        )
    }), nil)
    if err != nil {
        log.Fatalf("loading env config: %v", err)
    }

    var cfg Config
    if err := k.Unmarshal("", &cfg); err != nil {
        log.Fatalf("unmarshalling config: %v", err)
    }

    if err := cfg.Validate(); err != nil {
        log.Fatalf("invalid config: %v", err)
    }

    return cfg
}
```

### **YAML Config File**

```yaml
# configs/config.yaml
environment: development

server:
  port: "8080"
  read_timeout: 15
  write_timeout: 15
  shutdown_timeout: 30

database:
  url: "postgres://user:pass@localhost:5432/myservice?sslmode=disable"
  max_conns: 25
  min_conns: 5

log:
  level: "info"
  debug: false

telemetry:
  enabled: false
  otlp_endpoint: "localhost:4317"
```

### **Config Validation**

Validate all configuration at startup and fail fast:

```go
func (c Config) Validate() error {
    if c.Server.Port == "" {
        return fmt.Errorf("server.port is required")
    }
    if c.Database.URL == "" {
        return fmt.Errorf("database.url is required")
    }
    if c.Database.MaxConns <= 0 {
        return fmt.Errorf("database.max_conns must be positive")
    }
    return nil
}
```

### **Config in Clean Architecture**

Configuration lives at the **outermost layer** — only `cmd/server/main.go` reads config. Domain and app layers **never import the config package**:

```go
// cmd/server/main.go
cfg := config.Load()

pool, _ := newPool(ctx, cfg.Database)           // Pass specific values
userRepo := postgres.NewUserRepo(pool)           // Not the whole config
```

### **Per-Environment Strategy**

| Environment | Config Source |
| --- | --- |
| Local dev | `config.yaml` + `config.local.yaml` (gitignored) + `.env` |
| CI/Testing | `config.yaml` + env vars |
| Staging/Prod | `config.yaml` + Kubernetes ConfigMaps/Secrets as env vars |

---

## **Go Modules and Tool Directive**

### **Go 1.24 Tool Directive**

Go 1.24 introduced the `tool` directive in `go.mod`, replacing the `tools.go` hack:

```bash
# Add tools
go get -tool github.com/sqlc-dev/sqlc/cmd/sqlc@latest
go get -tool github.com/golangci/golangci-lint/cmd/golangci-lint@latest
go get -tool github.com/vektra/mockery/v2@latest
go get -tool github.com/pressly/goose/v3/cmd/goose@latest
go get -tool github.com/air-verse/air@latest

# Run tools
go tool sqlc generate
go tool golangci-lint run
go tool mockery
```

### **go.mod Example**

```
module myservice

go 1.24

tool (
    github.com/sqlc-dev/sqlc/cmd/sqlc
    github.com/golangci/golangci-lint/cmd/golangci-lint
    github.com/vektra/mockery/v2
    github.com/pressly/goose/v3/cmd/goose
    github.com/air-verse/air
)

require (
    github.com/go-chi/chi/v5 v5.1.0
    github.com/jackc/pgx/v5 v5.7.0
    github.com/knadh/koanf/v2 v2.1.0
    github.com/google/uuid v1.6.0
    github.com/stretchr/testify v1.9.0
    // ...
)
```

### **go.work for Multi-Module Development**

If your project uses multiple modules locally, use `go.work` but **never commit it**:

```bash
echo "go.work" >> .gitignore
echo "go.work.sum" >> .gitignore
go work init
go work use ./services/api ./services/worker ./libs/shared
```

Test with `GOWORK=off` before releasing to verify published module versions work independently.

---

## **Makefile**

### **Standard Targets**

```makefile
.PHONY: build run test lint generate tidy audit docker-build migrate-up dev

# Build
build:
	CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o bin/server ./cmd/server

run:
	go run ./cmd/server

# Development
dev:
	go tool air -c .air.toml

# Testing
test:
	go test -v -race -count=1 ./...

test-cover:
	go test -coverprofile=coverage.out ./... && go tool cover -html=coverage.out -o coverage.html

test-integration:
	go test -v -race -count=1 -tags=integration ./...

# Code quality
lint:
	go tool golangci-lint run --timeout=5m

lint-fix:
	go tool golangci-lint run --fix

# Code generation
generate:
	go tool sqlc generate
	go tool mockery
	go generate ./...

# Dependencies
tidy:
	go mod tidy && go mod verify

audit:
	go vet ./...
	go tool golangci-lint run
	govulncheck ./...

# Database
migrate-up:
	go tool goose -dir internal/adapters/postgres/migrations postgres "$(DATABASE_URL)" up

migrate-down:
	go tool goose -dir internal/adapters/postgres/migrations postgres "$(DATABASE_URL)" down

migrate-create:
	go tool goose -dir internal/adapters/postgres/migrations create $(NAME) sql

# Docker
docker-build:
	docker build -t myservice:latest .

docker-up:
	docker compose up -d

docker-down:
	docker compose down
```

CI pipelines should call Makefile targets rather than duplicating commands — the Makefile is the **single source of truth** for build operations.

---

## **golangci-lint v2**

### **Configuration**

golangci-lint v2 uses a `version: "2"` config schema:

```yaml
# .golangci.yml
version: "2"

linters:
  enable:
    - errcheck
    - govet
    - staticcheck
    - revive
    - gosec
    - bodyclose
    - sqlclosecheck
    - errorlint
    - sloglint
    - exhaustive
    - noctx
    - unparam

linters-settings:
  revive:
    rules:
      - name: exported
      - name: var-naming
      - name: blank-imports
      - name: context-as-argument
      - name: error-return
      - name: error-strings
      - name: increment-decrement
      - name: range

  errorlint:
    errorf: true
    errorf-multi: true
    asserts: true
    comparison: true

  gosec:
    excludes:
      - G104  # unhandled errors on defers

  sloglint:
    kv-only: true
    context: all

formatters:
  enable:
    - goimports

issues:
  exclude-dirs:
    - internal/adapters/postgres/sqlcgen
```

### **Running**

```bash
# Full lint
go tool golangci-lint run

# Only new issues (for CI PRs)
go tool golangci-lint run --new-from-rev=main

# Auto-fix
go tool golangci-lint run --fix
```

### **Key Linters Explained**

| Linter | Purpose |
| --- | --- |
| `staticcheck` | Gold standard with 150+ checks |
| `errcheck` | Detect unchecked errors |
| `govet` | Report suspicious constructs |
| `revive` | Replacement for golint, configurable |
| `gosec` | Security-focused checks |
| `bodyclose` | Detect unclosed HTTP response bodies |
| `sqlclosecheck` | Detect unclosed SQL rows/statements |
| `errorlint` | Proper error wrapping and comparison |
| `sloglint` | Enforce consistent slog attribute style |
| `noctx` | Detect HTTP requests without context |

---

## **Best Practices**

### **1. Never Use os.Getenv Directly**

```go
// ✅ GOOD: Structured config via koanf
cfg := config.Load()
pool := newPool(cfg.Database.URL)

// ❌ BAD: Scattered os.Getenv calls
url := os.Getenv("DATABASE_URL")
```

### **2. Fail Fast on Invalid Config**

```go
// ✅ GOOD: Validate and panic at startup
func Load() Config {
    // ...
    if err := cfg.Validate(); err != nil {
        log.Fatalf("invalid config: %v", err)
    }
    return cfg
}

// ❌ BAD: Return error and hope caller handles it
```

### **3. Pass Values, Not Config**

```go
// ✅ GOOD: Pass specific values to constructors
repo := postgres.NewUserRepo(pool)

// ❌ BAD: Pass entire config struct
repo := postgres.NewUserRepo(cfg)
```

### **4. Use tool Directive for Dev Tools**

```bash
# ✅ GOOD: Go 1.24+ tool directive
go get -tool github.com/sqlc-dev/sqlc/cmd/sqlc@latest
go tool sqlc generate

# ❌ BAD: tools.go hack
//go:build tools
import _ "github.com/sqlc-dev/sqlc/cmd/sqlc"
```

---

**Related Files:**
- `../SKILL.md` - Main guide
- `./observability.md` - OpenTelemetry configuration
- `./repository-pattern.md` - sqlc configuration
- `./complete-examples.md` - Full project setup
