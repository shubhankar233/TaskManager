# 📋 Task Manager API

A **Scalable REST API** with **JWT Authentication** & **Role-Based Access Control (RBAC)** — Backend Intern Assignment.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js |
| Database | PostgreSQL (via Sequelize ORM) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |
| Frontend | Vanilla HTML + React 18 (CDN) |

---

## 📁 Project Structure

```
project/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js       # Sequelize + PostgreSQL setup
│   │   │   └── swagger.js        # OpenAPI 3.0 config
│   │   ├── controllers/
│   │   │   ├── authController.js # Register, Login, Profile
│   │   │   ├── taskController.js # Full CRUD for tasks
│   │   │   └── adminController.js# Admin-only operations
│   │   ├── middleware/
│   │   │   ├── auth.js           # JWT verify + RBAC authorize()
│   │   │   ├── validate.js       # express-validator error handler
│   │   │   └── errorHandler.js   # Global error + 404 handler
│   │   ├── models/
│   │   │   ├── User.js           # User model (UUID, role, bcrypt hooks)
│   │   │   ├── Task.js           # Task model (status, priority, dueDate)
│   │   │   └── index.js          # Model associations
│   │   ├── routes/
│   │   │   ├── auth.js           # /api/v1/auth/*
│   │   │   ├── tasks.js          # /api/v1/tasks/*
│   │   │   └── admin.js          # /api/v1/admin/*
│   │   ├── utils/
│   │   │   ├── jwt.js            # generateToken / verifyToken helpers
│   │   │   └── response.js       # sendSuccess / sendError helpers
│   │   ├── app.js                # Express app setup
│   │   └── server.js             # Entry point (DB connect + listen)
│   ├── .env.example
│   └── package.json
└── frontend/
    └── index.html                # React SPA (CDN, no build step)
```

---

## ⚙️ Setup Instructions

### Prerequisites

- **Node.js** v18 or higher
- **PostgreSQL** v14 or higher
- **npm** v9 or higher

---

### Step 1 — Clone the Repository

```bash
git clone <your-repo-url>
cd project
```

---

### Step 2 — Setup PostgreSQL Database

Log into PostgreSQL and create the database:

```sql
-- Connect as superuser
psql -U postgres

-- Create DB
CREATE DATABASE taskmanager_db;

-- Create a dedicated user (optional but recommended)
CREATE USER taskmanager_user WITH PASSWORD 'strongpassword';
GRANT ALL PRIVILEGES ON DATABASE taskmanager_db TO taskmanager_user;

\q
```

> **Note:** Sequelize will automatically create and sync tables (`users` and `tasks`) when the server starts. You do **not** need to run any migration scripts manually.

---

### Step 3 — Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in your values:

```env
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=change_this_to_a_long_random_string_in_production
JWT_EXPIRES_IN=7d

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskmanager_db
DB_USER=postgres
DB_PASSWORD=your_db_password
```

> **Security:** Never commit `.env` to Git. It is already listed in `.gitignore`.

---

### Step 4 — Install Backend Dependencies

```bash
cd backend
npm install
```

---

### Step 5 — Start the Backend Server

**Development mode (auto-restart on file changes):**

```bash
npm run dev
```

**Production mode:**

```bash
npm start
```

You should see:

```
✅ Database connected successfully.
✅ Database synced (tables created/updated).
🚀 Server running on http://localhost:5000
📚 API Docs: http://localhost:5000/api-docs
```

---

### Step 6 — Open the Frontend

No build step needed. Simply open the frontend in your browser:

```bash
# Option A: Open directly
open frontend/index.html

# Option B: Serve with any static server
npx serve frontend
# Then visit http://localhost:3000
```

> The frontend connects to the backend at `http://localhost:5000` by default.

---

### Step 7 — Explore the API Documentation

Open your browser and visit:

```
http://localhost:5000/api-docs
```

This provides the full interactive Swagger UI where you can test every endpoint.

---

## 🔐 API Endpoints

### Authentication — `/api/v1/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | User/Admin | Get own profile |

### Tasks — `/api/v1/tasks`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | User/Admin | List tasks (own; admin sees all). Supports `?status=`, `?priority=`, `?page=`, `?limit=` |
| GET | `/:id` | User/Admin | Get single task |
| POST | `/` | User/Admin | Create task |
| PUT | `/:id` | User/Admin | Update task (own only for users) |
| DELETE | `/:id` | User/Admin | Delete task |

### Admin — `/api/v1/admin` *(Admin role required)*

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/stats` | Admin | Platform stats (users, tasks count) |
| GET | `/users` | Admin | List all users |
| PATCH | `/users/:id/role` | Admin | Change user role |
| PATCH | `/users/:id/deactivate` | Admin | Deactivate user account |

---

## 🔑 Authentication Flow

```
1. POST /api/v1/auth/register  →  { token, user }
2. Use token in header:        →  Authorization: Bearer <token>
3. Token expires in 7 days     →  Re-login to get new token
```

---

## 🛡️ Role-Based Access Control (RBAC)

| Feature | User | Admin |
|---------|------|-------|
| Register / Login | ✅ | ✅ |
| Create tasks | ✅ | ✅ |
| View own tasks | ✅ | ✅ |
| View all tasks | ❌ | ✅ |
| Edit / Delete own tasks | ✅ | ✅ |
| Edit / Delete any task | ❌ | ✅ |
| Admin panel | ❌ | ✅ |
| Manage users | ❌ | ✅ |

To promote a user to admin, use the admin panel endpoint or directly update in the DB:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 🗄️ Database Schema

### `users` table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| username | VARCHAR(50) | Unique |
| email | VARCHAR(100) | Unique |
| password | VARCHAR | bcrypt hashed (12 rounds) |
| role | ENUM | `user` \| `admin` (default: `user`) |
| isActive | BOOLEAN | Default: true |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

### `tasks` table

| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | Auto-generated |
| title | VARCHAR(100) | Required |
| description | TEXT | Optional |
| status | ENUM | `todo` \| `in_progress` \| `done` |
| priority | ENUM | `low` \| `medium` \| `high` |
| dueDate | DATEONLY | Optional |
| userId | UUID (FK) | References `users.id`, CASCADE delete |
| createdAt | TIMESTAMP | Auto |
| updatedAt | TIMESTAMP | Auto |

---

## 🧪 Testing the API (curl examples)

**Register:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"Pass1234"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"Pass1234"}'
```

**Create Task (replace TOKEN):**
```bash
curl -X POST http://localhost:5000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"title":"My first task","priority":"high","status":"todo"}'
```

**List Tasks:**
```bash
curl http://localhost:5000/api/v1/tasks \
  -H "Authorization: Bearer TOKEN"
```

---

## 📐 API Response Format

All responses follow a consistent envelope:

```json
{
  "success": true | false,
  "message": "Human readable message",
  "data": { ... } | null,
  "errors": [ { "field": "email", "message": "Valid email required." } ]
}
```

---

## 📊 Scalability Notes

This project is designed with horizontal scalability in mind:

- **Stateless JWT Auth:** No server-side session storage. Any instance can verify any token using the shared `JWT_SECRET`.
- **Connection Pooling:** Sequelize is configured with a pool (max 10 connections) — safe under load and ready for a managed DB like RDS or PlanetScale.
- **Modular Structure:** Each domain (auth, tasks, admin) lives in its own controller/route file. Adding a new module requires only creating a new controller + route file and registering it in `app.js`.
- **API Versioning (`/api/v1/`):** Breaking changes ship as `/api/v2/`, keeping backward compatibility.
- **Ready for Redis Caching:** The architecture allows inserting a caching layer (e.g., Redis + `ioredis`) in any controller's read path without refactoring the rest.
- **Ready for Microservices:** Auth, Tasks, and Admin can be split into separate services that share the same DB schema or communicate via message queues (e.g., RabbitMQ / Kafka).
- **Load Balancing:** Stateless design means multiple Node.js instances can sit behind an Nginx or AWS ALB load balancer with zero shared state issues.
- **Docker-Ready:** Add a `Dockerfile` + `docker-compose.yml` to containerize the Node.js app and PostgreSQL for easy deployment to any cloud provider.

---

## 🚀 Optional Enhancements (not yet implemented)

| Enhancement | How |
|-------------|-----|
| Caching | Redis + ioredis for GET /tasks responses |
| Logging | Winston + Morgan for structured logs |
| Rate Limiting | express-rate-limit to prevent brute force |
| Docker | `Dockerfile` + `docker-compose.yml` |
| CI/CD | GitHub Actions → deploy to Render/Railway |

---

## 📬 Postman Collection

Import the included `postman_collection.json` into Postman to test all endpoints with pre-configured environments.

Or visit the live Swagger UI at `http://localhost:5000/api-docs`.

---

## 👤 Author

Built as part of the **Primetrade.ai Backend Developer Intern** assignment.
