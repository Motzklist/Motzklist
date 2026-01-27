# 📚 Motzklist

> **A management and accessibility system for school textbook lists in Kiryat Motzkin.**

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange)
![Go](https://img.shields.io/badge/Go-1.21+-00ADD8?logo=go&logoColor=white)
![Gin](https://img.shields.io/badge/Gin-Framework-00ADD8?logo=go&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?logo=next.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?logo=postgresql&logoColor=white)

---

## 📖 About the Project

**Motzklist** is a community-tech initiative developed in collaboration with the **Kiryat Motzkin Municipality**.
The project's primary goal is to establish a centralized, digital, and accessible platform that allows parents and students to easily view updated textbook lists for all schools in the city.

### Key Objectives:
* **Centralized Information:** Creating a unified database for all schools in the city.
* **Accessibility:** A user-friendly interface to find book lists by school and grade.
* **Efficiency:** Streamlining the preparation for the school year and preventing confusion during textbook purchasing.

---

## 🛠️ Tech Stack

The project is built using modern open-source technologies:

* **Language:** Go, Next.js
* **Database:** PostgreSQL (Managing schools, grades, and book data)
* **Backend:** (To be determined/added, e.g., Flask/Django)
* **Frontend:** (To be determined/added)

---

## 🚀 Getting Started

This section is intended for developers who wish to run the project locally.

## 🏗️ 1. Prerequisites

Before starting, ensure you have the following tools installed and running:

* **Git**
* **Go** (Recommended for API development)
* **Docker Desktop** (Required to run containers)

## 🗃️ 2. Repository Setup

The system requires a specific file structure for Docker Compose to orchestrate the services (`web` and `api-gateway-avner`). All repositories must be cloned as sibling folders inside your root project directory (e.g., `Motzklist_integrated`).

### Directory Structure Goal
### Cloning Instructions

1.  **Create and enter your root integrated folder:**
    ```bash
    mkdir Motzklist_integrated
    cd Motzklist_integrated
    ```
2.  **Clone the central configuration repo (Motzklist):**
    ```bash
    git clone https://github.com/Motzklist/Motzklist.git Motzklist
    ```
3.  **Clone the Web repo (Next.js):**
    ```bash
    git clone https://github.com/Motzklist/web.git web
    # Ensure you are on the development branch for the latest code/Dockerfile
    cd web
    git checkout DEVELOP 
    cd ..
    ```
4.  **Clone the API Gateway repo (Go):**
    ```bash
    git clone https://github.com/Avnermond12344/api-gateway-avner.git api-gateway-avner
    ```

## 🛠️ 3. Preparation: Go API Dependencies

Navigate to the Go service directory to ensure the module dependencies (`go.sum`) are properly configured before the Docker build attempts to copy them.

```bash
cd api-gateway-avner
# Initialize module if needed and clean dependencies
go mod init motzklist/api-gateway
go mod tidy
cd ..
```
---
## 4. Run the System on Google Cloud
The system was deployed onto Google's server. In order to run it, one can simply copy the next link:
```
https://motzklist-web-700891140984.me-west1.run.app/
```
And paste it in the web browser.

## 5. 🐳 Build and Run the System Locally

The `docker-compose.yml` file orchestrates the entire application. Navigate to the directory containing this file and execute the build command to start the entire stack.

1.  **Navigate to the orchestration folder:**
    ```bash
    cd Motzklist
    ```

2.  **Execute the integrated build and run command:**
    ```bash
    # This command builds all service images, pulls the Postgres image, and starts the system.
    # 'sudo' is necessary if running in a WSL/Linux terminal due to Docker socket permissions.
    sudo docker compose up --build
    ```
3. **Run the integrated system later (after the initial building):**
   ```bash
   # This command will run the built system.
   sudo docker compose up
   ```


### 5.1 🌐 Verification and Access

Once the terminal logs indicate that the services are listening (PostgreSQL is ready, Next.js server has started), the system is fully active.

* **Frontend (Web):** Access your application interface at:
  **`http://localhost:3000`**

* **API Gateway (Backend):** Test the API connectivity directly by querying the schools endpoint:
  **`http://localhost:8080/api/schools`**


### 5.2 🛑 Shutdown

To gracefully stop all running containers and free up the port resources, return to the terminal window running `docker compose up` and press:
```
CTRL+C
```

---
## 6. Deployment
### 🛠️ Phase 1: Preparation
Before running commands, ensure your local environment is authenticated to your Google Cloud account.
1. **open your terminal** (WSL or PowerShell).
2. **Login to Google Cloud:**
```Bash
gcloud auth login
```
3. **Set your Project ID:**
```Bash
gcloud config set project [YOUR_PROJECT_ID]
```
4. **Configure Docker to push to Google**
```Bash
gcloud auth configure-docker
```
### 🏗️ Phase 2: Building and Pushing Images
Since the project is split into different containers, you must deploy them separately.
1. **The Backend**
   Navigate to the backend directory and build the image directly in the cloud using Google Build:
```Bash
cd Backend
gcloud builds submit --tag gcr.io/[PROJECT_ID]/motzklist-api
```
2. **The Frontend**
   Navigate to the web directory and repeat the process:
```Bash
cd ../web
gcloud builds submit --tag gcr.io/[PROJECT_ID]/motzklist-web
```
### 🚀 Phase 3: Deploying to Cloud Run
Once the images are in the registry, you tell Cloud Run to start them as services.
1. **Deploy the API**
```Bash
gcloud run deploy motzklist-api \
  --image gcr.io/[PROJECT_ID]/motzklist-api \
  --platform managed \
  --region me-west1 \
  --allow-unauthenticated
```
2. **Deploy the Web Frontend**
```Bash
gcloud run deploy motzklist-web \
  --image gcr.io/[PROJECT_ID]/motzklist-web \
  --platform managed \
  --region me-west1 \
  --allow-unauthenticated
  ```
* **Region:** note that the region should be me-west1 (Israel's region)
* **Environment Variables:** When deploying the Web service, you might need to provide the new URL of the API service so they can talk to each other.
### 📊 Summary Table
| Service  | Directory             | Cloud Run Name | Live URL 
|----------|-----------------------|-----------|-----------|
| Backend  | Backend / api-gateway | motzklist-api | https://motzklist-api-5f3nhomivq-zf.a.run.app
| Frontend | Frontend / Web        | motzklist-web | https://motzklist-web-700891140984.me-west1.run.app/



**Developed with ❤️ for the residents of Kiryat Motzkin.**
