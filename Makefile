# ==============================================================================
# 🛠️ Motzklist - Root Project Makefile
# ==============================================================================

# Directory Variables
GATEWAY_DIR := api-gateway
BACKEND_DIR := backend
WEB_DIR     := web
DB_DIR      := database

.PHONY: all install test lint build clean dev help

# Default target: Help
help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies for all services"
	@echo "  make test     - Run tests for all services"
	@echo "  make lint     - Run linters for all services"
	@echo "  make build    - Build all services"
	@echo "  make dev      - Run the entire environment locally"
	@echo "  make db-up    - Start database container/service"

# ==============================================================================
# 📦 Installation
# ==============================================================================
install:
	@echo "--- Installing Dependencies ---"
	
	@echo "📦 [API Gateway] Installing..."
	# TODO: cd $(GATEWAY_DIR) && go mod tidy
	
	@echo "📦 [Backend] Installing..."
	# TODO: cd $(BACKEND_DIR) && go mod tidy
	
	@echo "📦 [Web] Installing..."
	# TODO: cd $(WEB_DIR) && npm install

# ==============================================================================
# 🧪 Quality Assurance (Lint & Test)
# ==============================================================================
lint:
	@echo "--- Linting Codebase ---"
	
	@echo "🔍 [API Gateway] Linting..."
	# TODO: cd $(GATEWAY_DIR) && ...
	
	@echo "🔍 [Backend] Linting..."
	# TODO: cd $(BACKEND_DIR) && ...
	
	@echo "🔍 [Web] Linting..."
	# TODO: cd $(WEB_DIR) && npm run lint

test:
	@echo "--- Running Tests ---"
	
	@echo "🧪 [API Gateway] Testing..."
	# TODO: cd $(GATEWAY_DIR) && go test ./...
	
	@echo "🧪 [Backend] Testing..."
	# TODO: cd $(BACKEND_DIR) && go test ./...
	
	@echo "🧪 [Web] Testing..."
	# TODO: cd $(WEB_DIR) && npm test

# ==============================================================================
# 🏗️ Build
# ==============================================================================
build:
	@echo "--- Building Services ---"
	
	@echo "🔨 [API Gateway] Building..."
	# TODO: cd $(GATEWAY_DIR) && go build -o bin/gateway main.go
	
	@echo "🔨 [Backend] Building..."
	# TODO: cd $(BACKEND_DIR) && go build -o bin/server main.go
	
	@echo "🔨 [Web] Building..."
	# TODO: cd $(WEB_DIR) && npm run build

# ==============================================================================
# 🗄️ Database Management
# ==============================================================================
db-up:
	@echo "--- Starting Database ---"
	# TODO: cd $(DB_DIR) && docker-compose up -d

db-migrate:
	@echo "--- Running Migrations ---"
	# TODO: Run migration scripts from $(DB_DIR) or $(BACKEND_DIR)

# ==============================================================================
# 🚀 Development (Run Everything)
# ==============================================================================
# Use -j4 to run 4 targets in parallel
dev:
	@echo "🚀 Starting Full Stack Environment..."
	$(MAKE) -j4 run-db run-gateway run-backend run-web

run-db:
	@echo "🐘 [Database] Running..."
	# TODO: Command to start DB (or keep it as dependency)

run-gateway:
	@echo "🌐 [API Gateway] Running..."
	# TODO: cd $(GATEWAY_DIR) && go run main.go

run-backend:
	@echo "⚙️ [Backend] Running..."
	# TODO: cd $(BACKEND_DIR) && go run main.go

run-web:
	@echo "💻 [Web] Running..."
	# TODO: cd $(WEB_DIR) && npm run dev
