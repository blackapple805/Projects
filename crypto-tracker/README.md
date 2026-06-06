# Crypto Tracker

A live cryptocurrency dashboard in a **single folder**. The React frontend and
the Express backend share one `package.json`. The backend proxies the
**CoinGecko public API** — free, **no API key and no sign-up**.

```
crypto-tracker/
├── server.js        Express API + serves the built frontend
├── package.json     One set of dependencies for both halves
├── public/          React HTML shell
├── src/             React app (App.js, App.css, …)
└── build/           Created by `npm run build` (production frontend)
```

## Features

- Top 50 coins by market cap: live prices, 24h change, market cap, 7-day sparkline
- Search by name or ticker, USD / EUR / GBP toggle
- Favorites saved in your browser (localStorage — no account needed)
- Auto-refresh every 60s + manual refresh
- Backend caches responses for 60s to stay under CoinGecko's free rate limit

## Setup

```bash
npm install
```

## Development

Runs the API (port 5000) and the React dev server (port 3000) together. The dev
server proxies /api calls to the backend automatically.

```bash
npm run dev
```

Open http://localhost:3000.

(You can also run them separately: `npm run server` and `npm run client`.)

## Production

Build the frontend, then start the server — it serves the API and the built
app from a single port.

```bash
npm run build
npm start
```

Open http://localhost:5000.

## How it works

In development, two processes run: React on 3000 (with "proxy": "http://localhost:5000"
in package.json forwarding /api/* to Express). In production there's just one
process — after npm run build, server.js detects the build/ folder and serves
it as static files alongside the API routes.

## API endpoints

| Endpoint              | Description                            |
|-----------------------|----------------------------------------|
| GET /api/coins        | Top coins. ?vs=usd&per_page=50         |
| GET /api/coins/:id    | Single coin, e.g. /api/coins/bitcoin   |
| GET /api/search?q=    | Search coins by name/symbol            |

## Deploying

The Procfile works on Render/Railway/Heroku. Set the build command to
`npm install && npm run build` and the start command to `npm start`.
