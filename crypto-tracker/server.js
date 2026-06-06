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

// Rich detail for one coin (description, supply, ATH, longer chart, etc.).
// GET /api/coin/:id?vs=usd
app.get('/api/coin/:id', async (req, res) => {
    const vs = (req.query.vs || 'usd').toLowerCase();
    const id = req.params.id;
    try {
        const data = await cachedGet(`detail:${id}:${vs}`, `${COINGECKO}/coins/${id}`, {
            localization: false,
            tickers: false,
            market_data: true,
            community_data: false,
            developer_data: false,
            sparkline: true,
        });
        const m = data.market_data || {};
        const pick = (obj) => (obj && obj[vs] != null ? obj[vs] : null);

        // Strip any HTML from the description and keep it short.
        const rawDesc = (data.description?.en || '').replace(/<[^>]*>/g, '').trim();
        const description = rawDesc ? rawDesc.split('. ').slice(0, 3).join('. ').trim() : '';

        res.json({
            id: data.id,
            symbol: data.symbol,
            name: data.name,
            image: data.image?.large || data.image?.small || null,
            homepage: (data.links?.homepage || []).find(Boolean) || null,
            description: description && !description.endsWith('.') ? description + '.' : description,
            rank: data.market_cap_rank ?? null,
            price: pick(m.current_price),
            change24h: pick(m.price_change_percentage_24h_in_currency) ?? m.price_change_percentage_24h ?? null,
            change7d: pick(m.price_change_percentage_7d_in_currency),
            change30d: pick(m.price_change_percentage_30d_in_currency),
            marketCap: pick(m.market_cap),
            volume: pick(m.total_volume),
            high24h: pick(m.high_24h),
            low24h: pick(m.low_24h),
            ath: pick(m.ath),
            athDate: pick(m.ath_date),
            atl: pick(m.atl),
            atlDate: pick(m.atl_date),
            circulatingSupply: m.circulating_supply ?? null,
            totalSupply: m.total_supply ?? null,
            maxSupply: m.max_supply ?? null,
            sparkline: m.sparkline_7d?.price || [],
        });
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
