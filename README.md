# ProjectDock - Project Management SaaS Platform

ProjectDock is a full-stack, production-ready project management platform built for software teams. It is designed to cover the entire software development lifecycle from task creation and sprint planning to team collaboration, time tracking, and reporting. The platform draws inspiration from tools like Jira, ClickUp, Asana, and Linear, and delivers a modern, responsive interface with real-time capabilities.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Overview](#api-overview)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Role-Based Access Control](#role-based-access-control)
- [Contributing](#contributing)

---

## Overview

ProjectDock is built as a monorepo containing a separate `backend` and `frontend` application. The backend is a Node.js REST API backed by a PostgreSQL database managed through Prisma ORM. The frontend is a React single-page application built with Vite. The two services communicate over HTTP REST and a persistent WebSocket connection powered by Socket.io for real-time updates across all connected clients.

---

## Features

### Project Management
- Full project lifecycle management with statuses: Active, On Hold, Completed, and Archived.
- Project-level details including name, key, description, logo, banner, color theme, priority, visibility, tags, and estimated budget.
- Project dashboard with at-a-glance cards showing total tasks, completed tasks, pending tasks, members, and overall progress.
- Favorite and bookmark projects for quick access.

### Task Management
- Create, update, and delete tasks with rich metadata: title, description, priority (Low, Medium, High, Critical), status, assignees, labels, due dates, and estimated hours.
- Drag-and-drop Kanban board with fully customizable columns and swimlanes.
- Task detail view with comment threads, file attachments, and activity history.
- Filter and sort tasks by assignee, priority, status, label, and due date.
- Global task list across all projects with advanced filtering.

### Sprint Planning
- Create and manage sprints with defined start and end dates.
- Assign tasks to sprints and track sprint velocity.
- Sprint board view with column-based task progression.
- Sprint completion workflow that automatically carries over unfinished tasks.

### Timeline (Gantt)
- Visual Gantt-style timeline view for project tasks.
- Displays task durations, dependencies, and progress directly on a horizontal calendar.

### Team Management
- Create and manage teams within an organization.
- Assign a team lead and add individual members with specific roles.
- Team detail page with member directory, activity feed, team chat, and file storage.
- Real-time team messaging powered by Socket.io.

### Project Members and Access Control
- Assign individual users directly to a project with a specific role.
- Assign an entire team to a project in a single action.
- Role-based permission checks at both the API and UI level ensure users only see and interact with what they are permitted to.

### Analytics and Reporting
- Org-level analytics dashboard with charts for task completion rates, sprint performance, team workload, and project health.
- Data visualized using Chart.js with interactive line, bar, and donut charts.
- Time-logged-per-user breakdown and overdue task reporting.

### Timesheet and Time Logging
- Start and stop a live timer against any task directly from the Timesheet page.
- Manual time entry for logging hours after the fact.
- Daily and weekly time log summaries per project.

### Collaboration Tools
- Project-scoped Wiki for documenting decisions, guides, and architecture notes using a rich text editor.
- Project Discussions (forum-style threads) for async team communication with nested replies.
- Project Files for uploading and managing attachments scoped to a project.

### Notifications
- Real-time in-app notifications for key events: task assignments, team additions, project invitations, and comment mentions.
- Notification badge in the topbar with a dropdown to review and clear notifications.

### Invitations
- Invite users to join your organization or project via a secure tokenized email link.
- Accept invite flow handles both new and existing user accounts.

### User Settings and Profile
- Update profile information, avatar, and password from the Settings page.
- Light and dark mode toggle with preference persistence in local storage.

### Authentication
- Native email and password authentication with bcrypt password hashing.
- Google OAuth 2.0 sign-in integration via the official Google Identity Services library.
- JWT-based session management with tokens stored securely in local storage.

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI component framework |
| Vite 8 | Build tooling and local dev server |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Page transitions and micro-animations |
| TanStack React Query v5 | Server state management and caching |
| React Router v7 | Client-side routing |
| Socket.io Client | Real-time WebSocket connection |
| Axios | HTTP client for API calls |
| Chart.js + react-chartjs-2 | Data visualization |
| React Quill | Rich text editor for Wiki |
| React Hook Form | Form state management |
| Lucide React | Icon library |
| React Hot Toast | Toast notifications |

### Backend

| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| Prisma ORM | Database access and migrations |
| PostgreSQL | Relational database |
| Socket.io | Real-time bidirectional communication |
| JSON Web Tokens (JWT) | Stateless authentication |
| bcrypt | Password hashing |
| Google Auth Library | Google OAuth token verification |
| Cloudinary + Multer | File upload and cloud storage |
| Nodemailer | Transactional email delivery |
| Helmet | HTTP security headers |
| Morgan | HTTP request logging |
| Compression | Response compression middleware |

---

## Project Structure

```
Project Management SaaS/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma          # Full database schema
│   ├── src/
│   │   ├── controllers/           # Route handler logic
│   │   ├── middleware/            # Auth, role guards, error handler
│   │   ├── routes/                # Express router definitions
│   │   └── utils/                 # DB client, socket, mailer, activity logger
│   ├── server.js                  # App entry point
│   ├── Dockerfile
│   └── .env                       # Environment variables (not committed)
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── context/               # Auth and Socket React contexts
│   │   ├── layouts/               # DashboardLayout with Sidebar and Topbar
│   │   ├── pages/                 # Full page views (Dashboard, Projects, etc.)
│   │   └── utils/                 # Axios instance, helper functions
│   ├── public/
│   ├── index.html
│   ├── Dockerfile
│   └── nginx.conf                 # SPA routing and reverse proxy config
│
└── docker-compose.yml             # Orchestrates frontend and backend containers
```

---

## Local Development Setup

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- A PostgreSQL database (local or cloud-hosted via Neon or Supabase)
- A Cloudinary account for file uploads (free tier is sufficient)

### Step 1: Clone the repository

```bash
git clone https://github.com/Vikashh08/Project-Management-SaaS.git
cd "Project Management SaaS"
```

### Step 2: Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory. See the [Environment Variables](#environment-variables) section for the full list of required values.

Run the database migrations to set up all tables:

```bash
npx prisma db push
```

Start the backend development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5001`.

### Step 3: Set up the frontend

In a new terminal window:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Environment Variables

Create a file named `.env` inside the `backend` directory with the following variables:

```env
# Server
PORT=5001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"

# Authentication
JWT_SECRET="a_long_random_secret_string_at_least_32_characters"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Email (for invitation and notification emails)
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT=587
EMAIL_USER="your_email_user"
EMAIL_PASS="your_email_password"
FROM_EMAIL="noreply@projectdock.app"
FROM_NAME="ProjectDock"

# Frontend URL (used in invitation links)
FRONTEND_URL="http://localhost:5173"
```

---

## Database Schema

The Prisma schema defines the following core models and their relationships:

| Model | Description |
|---|---|
| User | Platform user with profile, role, and OAuth credentials |
| Organization | Top-level workspace that owns teams and projects |
| OrganizationMember | Join table linking users to organizations with a role |
| Team | A named group of users within an organization |
| TeamMember | Join table linking users to teams with a role and designation |
| Project | A work container with settings, budget, and status |
| ProjectMember | Join table linking users to projects with a role |
| Task | Atomic unit of work with priority, status, assignees, and metadata |
| TaskAssignee | Join table for multi-user task assignment |
| Sprint | A time-boxed iteration of tasks within a project |
| BoardColumn | Customizable Kanban columns per project |
| Swimlane | Horizontal grouping rows on the Kanban board |
| WikiPage | Rich text documentation page scoped to a project |
| Discussion | A threaded forum post within a project |
| DiscussionReply | A reply to a discussion thread |
| Comment | Inline comment on a task |
| Attachment | File metadata linked to a task, project, or team |
| TimeLog | A work log entry linking a user, task, and duration |
| Notification | In-app notification record per user |
| ActivityLog | Immutable audit trail of user actions |
| Invitation | Tokenized invite record with expiry |
| TeamMessage | Real-time chat message within a team |

### Role Enum

The platform uses a single `Role` enum applied across all membership scopes (organization, team, and project):

- `SUPER_ADMIN`
- `ORG_ADMIN`
- `PROJECT_MANAGER`
- `TEAM_LEAD`
- `DEVELOPER`
- `QA_TESTER`
- `CLIENT`
- `VIEWER`

---

## API Overview

The backend exposes the following route groups, all prefixed with `/api` and protected by JWT authentication middleware unless otherwise noted.

| Route Prefix | Description |
|---|---|
| `/api/auth` | Register, login, Google OAuth, get current user |
| `/api/users` | User profile management |
| `/api/projects` | Project CRUD, member management, team assignment |
| `/api/tasks` | Task CRUD, assignments, comments, attachments |
| `/api/teams` | Team CRUD, member management, messaging, files |
| `/api/sprints` | Sprint management and task assignment |
| `/api/time-logs` | Time entry creation and retrieval |
| `/api/analytics` | Aggregated stats and chart data |
| `/api/notifications` | Fetch and mark notifications as read |
| `/api/activity` | Activity log retrieval |
| `/api/wiki` | Wiki page CRUD per project |
| `/api/discussions` | Discussion and reply management per project |
| `/api/search` | Global search across projects, tasks, and users |
| `/api/invites` | Invite generation and token acceptance |
| `/api/upload` | File upload endpoint (Cloudinary) |

---

## Docker Deployment

The application is fully containerized and can be run with a single command using Docker Compose.

### Prerequisites

- Docker Desktop installed and running

### Run with Docker Compose

From the project root directory:

```bash
docker compose up -d --build
```

This command will:
1. Build the backend Node.js image and generate the Prisma client inside the container.
2. Build the frontend React app using Vite and package it into a minimal Nginx alpine image.
3. Start both containers on a shared internal network.

| Service | Exposed Port | Description |
|---|---|---|
| frontend | 80 | Nginx serves the React app and reverse-proxies API/socket traffic |
| backend | 5001 | Express REST API and Socket.io server |

The Nginx configuration in `frontend/nginx.conf` handles SPA fallback routing and transparently proxies all requests to `/api/` and `/socket.io/` through to the backend container.

To stop all services:

```bash
docker compose down
```

---

## Cloud Deployment

### Frontend on Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com](https://vercel.com) and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Vercel auto-detects Vite and runs `npm run build`. The included `vercel.json` ensures React Router SPA fallback routes work correctly.

### Backend on Railway or Render

1. Go to [railway.app](https://railway.app) or [render.com](https://render.com) and connect your GitHub repository.
2. Set the root directory of the service to `backend`.
3. Set the start command to `node server.js`.
4. Add all environment variables from the [Environment Variables](#environment-variables) section.
5. The included `railway.json` preconfigures the correct build and start commands.

### Database

Use [Neon](https://neon.tech) or [Supabase](https://supabase.com) for a serverless PostgreSQL database. After creating a database, copy the connection string and set it as the `DATABASE_URL` environment variable on your backend deployment. Then run:

```bash
npx prisma db push
```

---

## Role-Based Access Control

Every protected API route runs through two middleware layers:

1. `protect` verifies the JWT token and attaches the authenticated user to the request.
2. `authorizeRoles(...roles)` checks that the user's role is in the list of permitted roles for that operation.

For example, only users with the `SUPER_ADMIN`, `ORG_ADMIN`, or `PROJECT_MANAGER` role can delete a project. A `VIEWER` can read project data but cannot create tasks or modify members.

On the frontend, the `PermissionGate` component conditionally renders UI elements based on the current user's role, ensuring that destructive or administrative actions are not visible to users who do not have permission to perform them.

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch from `main` for your feature or fix.
3. Write clear, focused commits that address a single concern.
4. Open a pull request with a description of what you changed and why.

Please do not commit the `.env` file or any secrets to the repository.

---

Built by Vikash Kumar, Sunny Kumar, Rohit Gussain and Ajay Razz
