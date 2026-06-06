// Crypto Tracker — backend
// A thin caching proxy in front of the CoinGecko public API.
// CoinGecko's free tier needs NO API key and NO sign-up.
// We cache responses for a short window so we stay well under the
// free rate limit (~5-15 calls/min) even with many users refreshing.

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;
const COINGECKO = 'https://api.coingecko.com/api/v3';

app.use(cors());

// ---- tiny in-memory cache -------------------------------------------------
const cache = new Map(); // key -> { data, expires }
const TTL_MS = 60 * 1000; // 60 seconds

async function cachedGet(key, url, params) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) {
        return hit.data;
    }
    const { data } = await axios.get(url, {
        params,
        timeout: 10000,
        headers: { Accept: 'application/json' },
    });
    cache.set(key, { data, expires: Date.now() + TTL_MS });
    return data;
}

// ---- routes ---------------------------------------------------------------
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'crypto-tracker-backend' });
});

// Top coins by market cap, with 24h/7d change and a 7-day sparkline.
// GET /api/coins?vs=usd&per_page=50
app.get('/api/coins', async (req, res) => {
    const vs = (req.query.vs || 'usd').toLowerCase();
    const perPage = Math.min(Number(req.query.per_page) || 50, 100);
    try {
        const data = await cachedGet(`coins:${vs}:${perPage}`, `${COINGECKO}/coins/markets`, {
            vs_currency: vs,
            order: 'market_cap_desc',
            per_page: perPage,
            page: 1,
            sparkline: true,
            price_change_percentage: '24h,7d',
        });
        res.json(data);
    } catch (err) {
        handleError(res, err);
    }
});

// Single coin detail. GET /api/coins/bitcoin?vs=usd
app.get('/api/coins/:id', async (req, res) => {
    const vs = (req.query.vs || 'usd').toLowerCase();
    const id = req.params.id;
    try {
        const data = await cachedGet(`coin:${id}:${vs}`, `${COINGECKO}/coins/markets`, {
            vs_currency: vs,
            ids: id,
            sparkline: true,
            price_change_percentage: '24h,7d',
        });
        res.json(Array.isArray(data) ? data[0] || null : data);
    } catch (err) {
        handleError(res, err);
    }
});

// Search coins by name/symbol. GET /api/search?q=sol
app.get('/api/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    if (!q) return res.json({ coins: [] });
    try {
        const data = await cachedGet(`search:${q.toLowerCase()}`, `${COINGECKO}/search`, { query: q });
        res.json(data);
    } catch (err) {
        handleError(res, err);
    }
});

function handleError(res, err) {
    const status = err.response?.status;
    if (status === 429) {
        return res.status(429).json({ error: 'Rate limited by CoinGecko. Try again shortly.' });
    }
    console.error('Upstream error:', err.message);
    res.status(502).json({ error: 'Failed to fetch data from CoinGecko.' });
}

// ---- serve the built React app (production) -------------------------------
// After `npm run build`, the compiled frontend lives in ./build.
// In development you instead run the React dev server (port 3000), which
// proxies /api requests here — see "proxy" in package.json.
const BUILD_DIR = path.join(__dirname, 'build');
if (fs.existsSync(BUILD_DIR)) {
    app.use(express.static(BUILD_DIR));
    app.get('*', (req, res) => {
        res.sendFile(path.join(BUILD_DIR, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`Crypto Tracker running on http://localhost:${PORT}`);
});
