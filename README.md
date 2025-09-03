
---

# AI-Powered Workspace

An **AI-powered workspace** that stores user information and resumes in a **vector database** and provides **AI-based scoring** against roles or job descriptions.

> Built for my **Web Technology Lab** to demonstrate end-to-end design: cloud storage, scalable APIs, a separate AI microservice, vector search, and a modern web frontend.

---

## ✨ What it does

* **Upload resumes** → stored in **AWS S3**, metadata tracked in the backend.
* **AI embedding & scoring** → a **separate FastAPI microservice** (outside this repo) generates **Google embeddings** and writes vectors to **Pinecone**.
* **Rank & match** → resumes scored against a job description using semantic similarity.
* **Frontend UI** → built with **Next.js** to handle uploads, scoring requests, and results.

---

## 🧱 Architecture

```
                ┌─────────────┐
                │   Frontend  │
                │   Next.js   │
                └──────┬──────┘
                       │
             ┌─────────▼─────────┐
             │   Backend API     │
             │   Go + Gin        │
             │ User/Auth/Resume  │
             └─────────┬─────────┘
                       │
     ┌─────────────────▼──────────────────┐
     │        AI Microservice             │
     │ FastAPI + Google Embeddings + DB   │
     │ 1. Generate embeddings             │
     │ 2. Store in Pinecone               │
     │ 3. Score resumes                   │
     └─────────────────┬──────────────────┘
                       │
         ┌─────────────▼─────────────┐
         │   AWS S3 (File Storage)   │
         │   Pinecone (Vector DB)    │
         └───────────────────────────┘
```

---

## 🛠️ Tech Stack

* **Backend (Core API)**: Go (Golang) + **Gin**

  * REST API for resume handling, user management, orchestration
* **AI Microservice (External)**: **FastAPI**

  * Generates embeddings with **Google Embeddings API**
  * Stores/query vectors in **Pinecone DB**
* **Frontend**: **Next.js**

  * Clean UI for uploads and scoring
* **Storage**: **AWS S3** for resumes

---

## 📂 Repository Structure

### Backend (Go + Gin)

```
backend/
│── cmd/
│   └── server/
│       └── main.go        # Application entry point
│
│── internal/
│   ├── database/          # DB connection and queries
│   ├── models/            # Data models and structs
│   └── server/            # HTTP server setup, routes, middleware
│
│── pkg/
│   ├── auth/              # Authentication helpers
│   ├── bucket/            # S3 integration
│   └── orm/               # ORM utilities
│
│── go.mod
│── go.sum
```

### Frontend (Next.js)

```
frontend/
│── pages/
│── public/
│── styles/
│── components/
│── package.json
```

### External AI Microservice (not in this repo)

* FastAPI app with endpoints for embeddings, Pinecone upserts, and queries.

---

## ▶️ Running Locally

### 1) External AI Microservice

* Ensure it’s running and reachable at `AI_SERVICE_BASE_URL`.
* Exposes `/embed`, `/vectors/upsert`, `/search`.

### 2) Backend (Go + Gin)

```bash
cd backend
go mod tidy
go run cmd/server/main.go
```

### 3) Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

---

## 📈 Learnings & Impact

* Designed **clean Go backend** with a **standard structure**, improving maintainability.
* Learned to orchestrate **multi-service architecture** (Go API + FastAPI microservice).
* Implemented **cloud-native resume storage** with S3 and presigned URLs.
* Integrated **semantic search** with Pinecone and embeddings, gaining experience in AI-powered retrieval.
* Improved dev workflow by structuring frontend, backend, and AI microservice as **loosely coupled components**, making scaling and future replacement easier.

---

## 🚧 Future Improvements

* Resume parsing (skills, experience extraction).
* Richer scoring logic beyond cosine similarity.
* Role-based authentication and OAuth support.
* Feedback loop to improve ranking.

---

## 📜 License

Academic project (Web Technology Lab). Free to use and modify for learning.

---
