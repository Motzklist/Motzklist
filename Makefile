# ==============================================================================
# Motzklist — integration repo Makefile
# ==============================================================================
# This repo orchestrates the four sub-repositories (client, admin, backend,
# database) via docker-compose and runs the end-to-end tests against the running
# stack. Each sub-repo has its own build/lint/test pipeline; this Makefile only
# covers the integrated system.
# ==============================================================================

COMPOSE := docker compose

.PHONY: help up down restart logs ps build e2e install clean

help:
	@echo "Motzklist integration commands:"
	@echo "  make up       - Build and start the full stack (client, admin, backend, db)"
	@echo "  make down     - Stop the stack and remove containers"
	@echo "  make restart  - Recreate the stack from scratch"
	@echo "  make logs     - Follow logs from all services"
	@echo "  make ps       - Show running services"
	@echo "  make install  - Install the e2e test dependencies + Playwright browser"
	@echo "  make e2e      - Run the Playwright end-to-end tests (stack must be up)"
	@echo "  make clean    - Stop the stack and delete the database volume"

# ------------------------------------------------------------------------------
# Stack lifecycle
# ------------------------------------------------------------------------------
up:
	$(COMPOSE) up --build -d

down:
	$(COMPOSE) down

restart: down up

build:
	$(COMPOSE) build

logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

# ------------------------------------------------------------------------------
# End-to-end tests
# ------------------------------------------------------------------------------
install:
	npm ci
	npx playwright install --with-deps chromium

e2e:
	npm run test:e2e

# ------------------------------------------------------------------------------
# Cleanup (removes the seeded database volume too)
# ------------------------------------------------------------------------------
clean:
	$(COMPOSE) down -v
