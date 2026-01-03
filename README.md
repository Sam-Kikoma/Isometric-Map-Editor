# Isometric Map Editor

A browser-based isometric map editor built with Three.js and React. Create, share, and collaborate on isometric maps in real-time.

![Isometric Map Editor](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Overview

IsoEdit is a web application that lets users build isometric maps using cubes, textures, and 3D models. Maps can be saved, shared with the community, and edited collaboratively in real-time.

### Key Features

- **Isometric Editor** — Place cubes and 3D models on a customizable grid with an intuitive point-and-click interface
- **Textures & Colors** — Apply various textures (brick, fabric, metal, wood) or solid colors to blocks
- **3D Model Support** — Add pre-built models (buildings, vehicles, nature) to your maps
- **Real-time Collaboration** — Work on maps together with others via WebSocket-powered room sharing
- **Community Gallery** — Browse, rate, and remix public maps created by other users
- **Undo/Redo** — Full history support for your editing session
- **Export** — Download your creation as a PNG image

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, TypeScript, Vite, Three.js, React Three Fiber, TailwindCSS, DaisyUI |
| Backend | Node.js, Express, TypeScript, Prisma ORM, JWT, bcrypt |
| Database | PostgreSQL |
| Real-time | Yjs, y-websocket (CRDT-based collaboration) |

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components (Login, Signup, Community, Editor)
│   │   ├── hooks/          # Custom hooks (useCollaboration)
│   │   └── config/         # API configuration
│   └── public/             # Static assets (3D models, textures)
│
└── server/                 # Express backend
    ├── src/
    │   ├── handlers/       # Route handlers (user, map, rating)
    │   └── modules/        # Business logic (auth)
    └── prisma/             # Database schema & migrations
```

## Getting Started

### Prerequisites

- Node.js v18+
- PostgreSQL database
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Sam-Kikoma/Isometric-Map-Editor.git
cd Isometric-Map-Editor

# Install client dependencies
cd client && npm install

# Install server dependencies
cd ../server && npm install
```

### Configuration

1. Create `server/.env` with your database connection:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/isoedit"
   JWT_SECRET="your-secret-key"
   ```

2. Create `client/.env.development`:
   ```env
   VITE_REACT_APP_API_URL=http://localhost:3001
   ```

### Database Setup

```bash
cd server
npx prisma migrate deploy
npx prisma generate
```

### Running Locally

```bash
# Terminal 1 — Start the backend
cd server && npm run dev

# Terminal 2 — Start the frontend
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**Test Credentials:** `wasabi@email.com` / `wasabi`

## Deployment

### Frontend (Vercel/Netlify)
- Set root directory to `client`
- Build command: `npm run build`
- Output directory: `dist`
- Set `VITE_REACT_APP_API_URL` to your backend URL

### Backend (Railway/Render)
- Set root directory to `server`
- Build command: `npm install && npx prisma generate`
- Start command: `npm run start`
- Set `DATABASE_URL` and `JWT_SECRET` environment variables

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/signin` | User login |
| POST | `/signup` | User registration |
| GET | `/api/maps` | List user's maps |
| POST | `/api/maps` | Create a new map |
| GET | `/api/maps/:id` | Get map by ID |
| DELETE | `/api/maps/:id` | Delete a map |
| GET | `/public/maps` | List public maps |
| POST | `/api/ratings` | Rate a map |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
