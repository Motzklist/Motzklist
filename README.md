# Motzklist

A management and accessibility platform for school textbook and equipment lists in Kiryat Motzkin.

![Status](https://img.shields.io/badge/status-in%20development-orange)
![Backend](https://img.shields.io/badge/backend-Go-00ADD8?logo=go&logoColor=white)
![Frontend](https://img.shields.io/badge/frontend-Next.js-black?logo=next.js&logoColor=white)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791?logo=postgresql&logoColor=white)
![E2E](https://img.shields.io/badge/e2e-Playwright-2EAD33?logo=playwright&logoColor=white)
![License](https://img.shields.io/badge/license-Apache%202.0-blue)

## Overview

Motzklist is a community-technology initiative developed in collaboration with the
**Kiryat Motzkin Municipality**. It provides a centralized, digital, and accessible
platform where parents and students can view up-to-date equipment lists for every
school in the city and order them in a single payment.

**Objectives**

- **Centralized information** — one database for all schools, grades, and equipment.
- **Accessibility** — a friendly, bilingual (English / Hebrew) interface for finding
  lists by school and grade.
- **Efficiency** — streamline preparation for the school year and remove confusion
  during equipment purchasing.

## About This Repository

This is the **integration repository**. It contains no application code; instead it
ties the sub-repositories together and provides:

- [`docker-compose.yml`](docker-compose.yml) — builds and runs the full stack locally.
- [`docker-compose.prod.yml`](docker-compose.prod.yml) — runs pre-built images for a self-hosted deployment.
- [`e2e/`](e2e/) and [`playwright.config.ts`](playwright.config.ts) — end-to-end tests across the running system.
- [`.github/workflows/CI.yml`](.github/workflows/CI.yml) — CI that builds the stack and runs the E2E tests.
- [`docs/`](docs/) — the High-Level Design document.

The database schema and seed data live in the **Database** repository and are the
single source of truth. They are mounted into the PostgreSQL container at startup,
so no SQL is kept here.

## Architecture

| Component        | Technology                  | Repository                  | Port |
|------------------|-----------------------------|-----------------------------|------|
| Client front-end | Next.js (React, TypeScript) | `Motzklist/Front-End`       | 3000 |
| Admin front-end  | Next.js (React, TypeScript) | `Motzklist/Admin-Front-End` | 3001 |
| API gateway      | Go (`net/http`)             | `Motzklist/Back-End`        | 8080 |
| Database         | PostgreSQL 15               | `Motzklist/Database`        | 5432 |

```
Browser ──> Client (3000) ─┐
                           ├─> API Gateway (8080) ──> PostgreSQL (5432)
Browser ──> Admin  (3001) ─┘
```

Both front-ends communicate with the same Go API gateway, which is the only service
that accesses the database.

## Getting Started (Local)

### Prerequisites

- **Git**
- **Docker Desktop** (with the `docker compose` plugin)
- **Node.js 20+** (required only to run the end-to-end tests)

### 1. Repository Setup

`docker-compose.yml` builds each service from a sibling directory, so all repositories
must be cloned **next to each other** inside a single root folder, using these exact
folder names:

```
motzklist/
├── Motzklist/          <- this repository
├── Front-End/          <- client
├── Admin-Front-End/    <- admin panel
├── Back-End/           <- API gateway
└── Database/           <- schema + seed
```

```bash
mkdir motzklist && cd motzklist

git clone https://github.com/Motzklist/Motzklist.git        Motzklist
git clone https://github.com/Motzklist/Front-End.git        Front-End
git clone https://github.com/Motzklist/Admin-Front-End.git  Admin-Front-End
git clone https://github.com/Motzklist/Back-End.git         Back-End
git clone https://github.com/Motzklist/Database.git         Database
```

> The sibling folders are git-ignored inside `Motzklist/`, so you may also clone them
> directly into this repository if you prefer a single working directory.

### 2. Build and Run

From the `Motzklist/` folder:

```bash
docker compose up --build
```

This builds all images, starts PostgreSQL (loading the schema and mock data from the
Database repository), and starts the backend and both front-ends. The first build
takes a few minutes.

Convenience targets are available via `make` — `make up`, `make down`, `make logs`,
and `make clean`. Run `make help` for the full list.

### 3. Access the System

| Service           | URL                                    |
|-------------------|----------------------------------------|
| Client front-end  | http://localhost:3000                  |
| Admin front-end   | http://localhost:3001                  |
| API (sanity check)| http://localhost:8080/api/schools      |

**Demo logins** (from the seed data): parents `user1` / `user2`, admin `admin` —
all with password `1234`.

### 4. Shut Down

```bash
docker compose down      # stop containers, keep the database volume
docker compose down -v   # stop and wipe the database volume (fresh seed next run)
```

## End-to-End Tests

The Playwright tests in [`e2e/tests/motzklist.spec.ts`](e2e/tests/motzklist.spec.ts)
drive a real browser against the running stack: login, browsing a list, saving to the
cart, reaching checkout, viewing order history, and loading the admin sign-in page.

```bash
# 1. Start the stack in a separate terminal (from Motzklist/)
docker compose up --build

# 2. Install test dependencies and the browser, then run the tests
npm ci
npx playwright install --with-deps chromium
npm run test:e2e
```

CI runs this exact flow on every push and pull request to `main`. See
[`.github/workflows/CI.yml`](.github/workflows/CI.yml).

## Deployment

The system is deployed to **Google Cloud Run** (region `me-west1`, Israel). Each
service runs as a separate Cloud Run service, backed by a managed PostgreSQL instance.

### 1. Authenticate

```bash
gcloud auth login
gcloud config set project [PROJECT_ID]
gcloud auth configure-docker
```

### 2. Build and Push Images

```bash
cd Back-End
gcloud builds submit --tag gcr.io/[PROJECT_ID]/motzklist-api

cd ../Front-End
gcloud builds submit --tag gcr.io/[PROJECT_ID]/motzklist-web

cd ../Admin-Front-End
gcloud builds submit --tag gcr.io/[PROJECT_ID]/motzklist-admin
```

### 3. Deploy to Cloud Run

```bash
gcloud run deploy motzklist-api   --image gcr.io/[PROJECT_ID]/motzklist-api   --platform managed --region me-west1 --allow-unauthenticated
gcloud run deploy motzklist-web   --image gcr.io/[PROJECT_ID]/motzklist-web   --platform managed --region me-west1 --allow-unauthenticated
gcloud run deploy motzklist-admin --image gcr.io/[PROJECT_ID]/motzklist-admin --platform managed --region me-west1 --allow-unauthenticated
```

- **Region:** use `me-west1` (Israel).
- **Environment variables:** when deploying the front-ends, set `NEXT_PUBLIC_API_URL`
  (client) and `API_URL` (admin) to the deployed API URL so the services can reach
  each other.

### Live URLs

| Service  | Cloud Run name  | URL                                                   |
|----------|-----------------|-------------------------------------------------------|
| Backend  | `motzklist-api` | https://motzklist-api-5f3nhomivq-zf.a.run.app         |
| Frontend | `motzklist-web` | https://motzklist-web-700891140984.me-west1.run.app/  |

## License

Licensed under the [Apache License 2.0](LICENSE).
