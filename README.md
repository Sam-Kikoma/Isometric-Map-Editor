# Isometric Map Editor

A full-stack isometric map editor web application. This project consists of a React/Vite client and a Node.js/Express/Prisma server.

## Features

- Isometric map editing with 3D models and textures
- User authentication and community features
- Collaborative editing (WIP)
- Map rating and sharing
- Persistent storage with PostgreSQL via Prisma ORM

## Project Structure

```
Isometric-Map-Editor/
├── client/   # Frontend (React, Vite)
│   ├── src/
│   │   ├── components/      # UI and editor components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── index.css        # Global styles
│   │   └── App.tsx, main.tsx
│   ├── public/              # Static assets (models, textures)
│   ├── package.json         # Frontend dependencies
│   └── vite.config.ts       # Vite configuration
├── server/   # Backend (Node.js, Express, Prisma)
│   ├── src/
│   │   ├── handlers/        # API route handlers
│   │   ├── modules/         # Business logic modules
│   │   ├── db.ts            # Prisma client setup
│   │   └── server.ts        # Express server entry
│   ├── prisma/              # Prisma schema & migrations
│   ├── package.json         # Backend dependencies
│   └── tsconfig.json        # TypeScript config
```

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL database

### Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sam-Kikoma/Isometric-Map-Editor.git
   cd Isometric-Map-Editor
   ```
2. **Install dependencies:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
3. **Configure environment variables:**
   - Copy `server/.env.example` to `server/.env` and set your database connection string.
4. **Run database migrations:**
   ```bash
   cd server
   npx prisma migrate deploy
   ```
5. **Start the backend server:**
   ```bash
   npm run dev
   ```
6. **Start the frontend client:**
   ```bash
   cd ../client
   npm run dev
   ```
7. **Open the app:**
   Visit [http://localhost:5173](http://localhost:5173) in your browser.

## Scripts

### Client

- `npm run dev` — Start Vite development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build

### Server

- `npm run dev` — Start backend in development mode
- `npm run start` — Start backend in production mode
- `npx prisma migrate dev` — Run migrations and generate Prisma client

## Technologies Used

- **Frontend:** React, TypeScript, Vite, Three.js
- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL
