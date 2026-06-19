# JobFinder — Job Recommendation System

A React + Express app that recommends jobs based on your saved preferences and
your uploaded resume. **No database required** — user data is stored in a JSON
file on disk, so there is nothing to install or configure beyond Node.


## Login is disabled

This build skips login — opening the app goes straight to the dashboard. All
profile, preferences, and resume data is saved under a single shared "Guest"
account (`guest@local` in `data/users.json`).

To turn real login back on later:
1. In `frontend/src/App.js`, restore the `/login` and `/signup` routes and the
   `isLoggedIn` guard (the original logic, the `Login`/`Signup` pages are still
   in `src/pages/`).
2. In `backend/server.js`, restore the 401 responses in `verifyToken` so a
   missing/invalid token is rejected instead of falling back to the guest user.

## What's inside

```
package.json         root — runs backend + frontend together (npm start)

backend/
  server.js          API (auth, profile, recommendations, resume upload)
  store.js           File-based datastore — replaces MySQL
  data/              user records live here (data/users.json, auto-created)
  uploads/           resumes + profile pictures
  package.json

frontend/
  src/
    index.js, App.js
    pages/           one file per screen (Login, Dashboard, Resume, etc.)
    components/      reusable pieces (SideCard, Chatbot, Chatbox, ThreeDChart)
    services/
      api.js         single place that talks to the backend
    styles/
      styles.css     ALL styles merged into one file
  package.json
```

## Running it (one command)

From the project root, install everything once:
```
npm run install:all
```
Then start the backend and frontend together:
```
npm start
```
That's it. The backend runs on http://localhost:5000 and the frontend on
http://localhost:3000, both in the same terminal. Output is labelled
`[BACKEND]` (magenta) and `[FRONTEND]` (cyan). Press Ctrl+C once to stop both.

On first run the backend creates `data/users.json` automatically. That file
*is* your database — back it up if you want to keep accounts. The frontend
proxies API calls to the backend (see `proxy` in `frontend/package.json`).

### Running them separately (optional)
If you ever want just one side:
```
npm run start:backend     # backend only
npm run start:frontend    # frontend only
```

### Note on PowerShell
You no longer need to chain commands, so the `&&` error from before won't come
up. If you ever do chain commands in older PowerShell, use `;` instead of `&&`.

## Features
- **Personalized jobs** — recommendations use your saved desired position and
  preferred location instead of a fixed search.
- **Resume upload** — drag-and-drop a PDF/DOC/DOCX. It's stored and lightly
  parsed to seed your job search (it never overwrites preferences you set).
- **Purple glass UI** — a single theme (aurora background, frosted glass cards,
  glow buttons, 3D hover) defined at the top of `styles/styles.css`.

## Notes on the data store
`store.js` reads and writes the whole `users.json` on each operation. That's
simple and dependency-free, and fine for development or a small number of users.
If you later outgrow it, every data call goes through `store.js`, so you can swap
in a real database by changing that one file — the rest of the app won't need to
change.

## Security
JWT secret and the RapidAPI key are read from environment variables if set
(`JWT_SECRET`, `RAPIDAPI_KEY`), otherwise fall back to the values in `server.js`.
For anything public, move them into a `.env` file and rotate the RapidAPI key,
since it was committed to the repo.
