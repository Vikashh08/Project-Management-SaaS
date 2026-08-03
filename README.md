# TaskFlow AI - Production Ready Project Management SaaS

TaskFlow AI is a modern, scalable, and highly aesthetic Project Management platform inspired by industry leaders like Jira, ClickUp, Asana, Trello, and Monday.com.

## Architecture & Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS v4
- React Router
- Lucide React (Icons)
- Vercel Ready (`vercel.json` included)

**Backend:**
- Node.js & Express.js
- PostgreSQL with Prisma ORM
- Socket.io for Real-time capabilities
- JWT Authentication & Role Based Access Control
- Cloudinary & Multer for File Uploads
- Nodemailer for Email Notifications
- Railway/Render Ready (`railway.json` included)

---

## Local Setup

### 1. Database Setup
1. Create a PostgreSQL database (locally or using [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com)).
2. Get your connection string.

### 2. Backend Initialization
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
JWT_SECRET="your_super_secret_jwt_key"
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
EMAIL_HOST="smtp.ethereal.email"
EMAIL_PORT=587
EMAIL_USER="your_email_user"
EMAIL_PASS="your_email_pass"
FROM_EMAIL="noreply@taskflow.ai"
FROM_NAME="TaskFlow AI"
```
Run Database Migrations and start the server:
```bash
npx prisma db push
npm run dev
```

### 3. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` in your browser.

---

## Deployment Guide

### Frontend Deployment (Vercel)
1. Push your code to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Set the **Root Directory** to `frontend`.
4. Vercel will automatically detect Vite and use `npm run build`. 
5. The included `vercel.json` ensures that React Router SPA fallbacks work perfectly.

### Backend Deployment (Railway)
1. Go to [Railway.app](https://railway.app) and connect your GitHub repository.
2. Select the `backend` folder as the root for your service.
3. Add all the Environment Variables (`DATABASE_URL`, `JWT_SECRET`, `CLOUDINARY_*`, etc.).
4. The included `railway.json` ensures the correct build and start commands (`npm run start`).

### PostgreSQL Deployment
Use **Neon** or **Supabase** for a scalable, serverless PostgreSQL instance and plug the connection URL into your backend environment variables.

---

*Built with passion, robust architecture, and beautiful UI.*
