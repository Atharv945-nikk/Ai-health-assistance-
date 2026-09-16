# Deployment & Operations Guide

## 1. System Requirements
- **Node.js**: >= 20.0.0 (Tested on Node v24.15.0)
- **Package Manager**: npm >= 9.x
- **Memory**: Minimum 2 GB RAM (4 GB recommended for vector operations and image processing)
- **Disk Space**: Minimum 1 GB free space for uploads and vector indices

---

## 2. Local Quickstart

### Step 1: Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### Step 3: Run Database Migrations & Seed Medical Knowledge
```bash
cd backend && npm run db:migrate && npm run db:seed
```

### Step 4: Run Locally (Development)
```bash
# Terminal 1: Start Backend API (Port 5000)
cd backend && npm run dev

# Terminal 2: Start Frontend Application (Port 5173)
cd frontend && npm run dev
```

---

## 3. Production Deployment
- **Containerization**: Dockerfile provided for backend and frontend.
- **Reverse Proxy**: NGINX with SSL/TLS termination, HTTP/2, and proxy buffering disabled for SSE streaming (`/api/v1/chat/conversations/:id/messages?stream=true`).
- **Persistence**: Mount persistent volume at `/app/data` (for SQLite database) and `/app/uploads` (for uploaded medical reports and scans).
