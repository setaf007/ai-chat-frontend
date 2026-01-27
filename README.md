# AI Chat Frontend (Next.js 15)

Beautiful React frontend for local AI Chat API. Connects to FastAPI backend (http://127.0.0.1:8000).

## Features (Phase 3/6)
- JWT Auth: Login/Register (localStorage)
- Responsive UI: shadcn/ui + Tailwind + Slate theme
- API Integration: Your /chats/, /messages/ endpoints
- Next: Dashboard, Chat list, Streaming messages

**Portfolio Demo:** Vercel deploy → live chat with your backend.

## Tech Stack
- Next.js 15 (App Router, TypeScript, Turbopack)
- shadcn/ui (Button, Card, Input, Dialog, etc.)
- Tailwind CSS v4
- Axios-like fetch with auth headers
- React Context for global auth

## Quick Start (Windows)

1. Backend running: `uvicorn app.main:app --reload` (AI_chat_api/)
2. ```bash
   npm install
   npm run dev
   ```
3. http://localhost:3000/login → Register → Dashboard next.

## Backend Context
FastAPI + SQLAlchemy + LM Studio (local LLM):

- /register, /login (JWT)
- /chats/ (list/create)
- /chats/{id}/messages/ (user → AI reply)
- /chats/{id}/?include_messages=true (history)

Why: Clear for recruiters/you. Structure, setup, screenshots-ready. Highlights skills (Next.js, TypeScript, API integration).


