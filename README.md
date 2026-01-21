# Quiz Builder

A full-stack quiz creation platform built with **NestJS**, **Next.js**, **Prisma**, and **PostgreSQL**. Users can create quizzes with multiple question types, view all quizzes, and see quiz details.

## Tech Stack

### Backend

- **NestJS 11** – Node.js framework
- **TypeScript**
- **PostgreSQL 16** – Database
- **Prisma 7** – ORM

### Frontend

- **Next.js 16** – React framework
- **React 19**
- **TanStack Query** – Server state management
- **React Hook Form** – Form handling
- **Zod** – Schema validation
- **Tailwind CSS 4** – Styling
- **shadcn/ui** – UI components
- **Lucide React** – Icons

### DevOps

- **Docker** – Containerization
- **Docker Compose** – Multi-container orchestration
- **GitHub Actions** – CI/CD

## Project Structure

```
quiz-builder/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── prisma/             # Prisma module
│   │   ├── quiz/               # Quiz module (controller, service, DTOs)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/                 # Prisma schema and migrations
│   ├── test/                   # E2E tests
│   └── Dockerfile
├── frontend/                   # Next.js application
│   ├── app/
│   │   ├── create/             # Quiz creation page
│   │   ├── quizzes/            # Quiz list and detail pages
│   │   └── page.tsx            # Home page
│   ├── components/ui/          # shadcn/ui components
│   ├── lib/                    # Types, API service, hooks
│   ├── __tests__/              # Unit tests
│   └── Dockerfile
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development database
└── .github/workflows/          # CI/CD pipelines
```

## Getting Started

### Prerequisites

- **Node.js 20+**
- **npm** or **yarn**
- **Docker & Docker Compose** (optional)
- **PostgreSQL** (if not using Docker)

### Option 1: Using Docker (Recommended)

1. Clone the repository:

```bash
git clone <repository-url>
cd quiz-builder
```

2. Start all services:

```bash
docker-compose up -d
```

3. Access the application:

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:3002/api](http://localhost:3002/api)

````

4. Stop the application:

```bash
docker compose down
# To remove volumes (database data)
docker compose down -v
````

### Option 2: Local Development

1. Start the database:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

2. Setup Backend:

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

3. Setup Frontend (in a new terminal):

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

4. Access the application:

- Frontend: [http://localhost:3001](http://localhost:3001)
- Backend API: [http://localhost:3002/api](http://localhost:3002/api)

## Testing

### Backend

```bash
cd backend
npm test          # Unit tests
npm run test:cov  # Tests with coverage
npm run test:e2e  # E2E tests (requires running database)
```

### Frontend

```bash
cd frontend
npm test          # Unit tests
```

## API Endpoints

| Method | Endpoint         | Description                           |
| ------ | ---------------- | ------------------------------------- |
| POST   | /api/quizzes     | Create a new quiz                     |
| GET    | /api/quizzes     | Get all quizzes (with question count) |
| GET    | /api/quizzes/:id | Get quiz details with all questions   |
| DELETE | /api/quizzes/:id | Delete a quiz                         |

### Create Quiz Example

```bash
curl -X POST http://localhost:3002/api/quizzes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "JavaScript Basics",
    "questions": [
      {
        "text": "Is JavaScript a dynamically typed language?",
        "type": "BOOLEAN",
        "options": ["True", "False"],
        "correctAnswers": ["True"]
      },
      {
        "text": "What keyword is used to declare a constant?",
        "type": "INPUT",
        "correctAnswers": ["const"]
      },
      {
        "text": "Which are JavaScript data types?",
        "type": "CHECKBOX",
        "options": ["String", "Integer", "Boolean", "Float"],
        "correctAnswers": ["String", "Boolean"]
      }
    ]
  }'
```

## Database Schema

### Quiz

| Field     | Type     | Description      |
| --------- | -------- | ---------------- |
| id        | UUID     | Primary key      |
| title     | String   | Quiz title       |
| createdAt | DateTime | Creation date    |
| updatedAt | DateTime | Last update date |

### Question

| Field          | Type         | Description            |
| -------------- | ------------ | ---------------------- |
| id             | UUID         | Primary key            |
| text           | String       | Question text          |
| type           | QuestionType | BOOLEAN/INPUT/CHECKBOX |
| options        | String[]     | Answer options         |
| correctAnswers | String[]     | Correct answers        |
| order          | Int          | Display order          |
| quizId         | UUID         | Foreign key to Quiz    |

## Environment Variables

### Backend (`backend/.env`)

| Variable     | Description                  | Default                                                    |
| ------------ | ---------------------------- | ---------------------------------------------------------- |
| DATABASE_URL | PostgreSQL connection string | postgresql://postgres:postgres@localhost:5433/quiz_builder |
| FRONTEND_URL | Frontend URL for CORS        | [http://localhost:3001](http://localhost:3001)             |
| PORT         | Backend server port          | 3002                                                       |

### Frontend (`frontend/.env.local`)

| Variable            | Description                          | Default                                                |
| ------------------- | ------------------------------------ | ------------------------------------------------------ |
| NEXT_PUBLIC_API_URL | Public API URL (for browser)         | [http://localhost:3002/api](http://localhost:3002/api) |
| INTERNAL_API_URL    | Internal API URL (for SSR in Docker) | [http://backend:3002/api](http://backend:3002/api)     |
