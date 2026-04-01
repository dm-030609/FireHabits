# FIREHABITS - PROJECT GUIDELINES & SKILL

## 1. Project Overview
FireHabits is a "Personal CRM" and advanced habit tracker. It is NOT just a generic todo list. It tracks streaks, requires "Brutal Honesty" via an Evolution Diary, and uses a dark "Vibe Coding / Solo Levelling" aesthetic. 

## 2. Architecture Rules (DO NOT BREAK)
- **Frontend:** React + Bootstrap.
- **Mobile-First PWA:** The application strictly follows a **Mobile-First** design pattern and is a fully functional Progressive Web App (PWA). All UI layouts, forms, and components must be touch-friendly, fluid, and optimized for mobile screens first.
- **Offline-First:** The frontend uses `IndexedDB` (`src/utils/indexedDB.js`) to cache data and queue actions (`src/utils/syncDB.js`) when offline. **NEVER rip out the IndexedDB logic.** All new API calls must support this offline fallback pattern.
- **Backend:** Node.js + Express + MongoDB Atlas (Mongoose).
- **Communication:** Axios is configured globally in the frontend to hit the local backend (`localhost:3000`). NEVER hardcode URLs like `onrender.com`.

## 3. Aesthetic & UI (Vibe Coding)
- Dark mode only (backgrounds: `#111`, `#1a1a1a`).
- Primary accent color: Fire Red (`#e60000` / `text-danger` / `btn-danger`).
- No joyful, rounded, bubbly UI. Keep it sharp, developer-focused, and almost game-like (Solo Levelling inspiration).

## 4. Execution Protocol
- You (Claude Code) are the Hands-on Executor.
- Always read `FIREHABITS_PLAN.md` in this root directory to know your current mission before making changes.
- Do not refactor code outside the scope of the current task.
- If a route or database model is missing, create it adhering to the existing Mongoose schema patterns.
