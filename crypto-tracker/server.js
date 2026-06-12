// Crypto Tracker — backend v3
// No single point of failure:
//   1. Binance WebSocket  -> live prices, pushed, no key, no rate limit (primary feed)
//   2. CoinGecko          -> metadata only (names/logos/mcap/sparklines), heavily cached
//   3. Stale-while-error  -> upstream failure serves last good copy, never a 502
//   4. Disk-persisted cache -> survives restarts mid-outage
//   5. Binance REST       -> cold-start fallback if cache empty AND CoinGecko down
// API contract is unchanged — the React frontend needs no modifications.

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const WebSocket = require('ws');

const app = express();
const PORT = process.env.PORT || 5000;
const COINGECKO = 'https://api.coingecko.com/api/v3';
// .vision domains are Binance's public market-data hosts. The main exchange
// domains (api.binance.com / stream.binance.com) return HTTP 451 from US
// networks; the .vision data endpoints are not geo-blocked.
const BINANCE_REST = 'https://data-api.binance.vision/api/v3';
const BINANCE_WS = 'wss://data-stream.binance.vision/ws/!miniTicker@arr';

app.use(cors());

// ---- two-tier cache: short "fresh" TTL + never-expiring stale copy ---------
const CACHE_FILE = path.join(__dirname, '.cache.json');
const TTL_MS = 5 * 60 * 1000; // metadata refresh window (prices come from WS, so 5 min is plenty)
let cache = new Map();

try {
    if (fs.existsSync(CACHE_FILE)) {
        cache = new Map(Object.entries(JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))));
        console.log(`[cache] restored ${cache.size} entries from disk`);
    }
} catch {
    console.warn('[cache] disk cache unreadable, starting fresh');
}

let persistTimer = null;
function persistCache() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
        fs.writeFile(CACHE_FILE, JSON.stringify(Object.fromEntries(cache)), () => {});
    }, 2000);
}

// Fetch with caching. On upstream failure, serve the stale copy instead of erroring.
async function cachedGet(key, url, params, ttl = TTL_MS) {
    const hit = cache.get(key);
    if (hit && hit.expires > Date.now()) return hit.data;
    try {
        const { data } = await axios.get(url, {
            params,
            timeout: 10000,
            headers: { Accept: 'application/json' },
        });
        cache.set(key, { data, expires: Date.now() + ttl });
        persistCache();
        return data;
    } catch (err) {
        if (hit) {
            console.warn(`[stale] upstream failed for "${key}" — serving cached copy (${err.message})`);
            return hit.data;
        }
        throw err; // no cache at all -> caller decides on a fallback
    }
}

// Find a coin inside any cached top-coins list. Lets the detail endpoint
// degrade gracefully (price/logo/mcap/sparkline) instead of erroring when
// CoinGecko rate-limits a fresh detail request.
function detailFromListCache(id, vs) {
    for (const [key, hit] of cache) {
        if (!key.startsWith(`coins:${vs}:`)) continue;
        const coin = (Array.isArray(hit.data) ? hit.data : []).find((c) => c.id === id);
        if (coin) return coin;
    }
    return null;
}

// ---- live price feed: Binance WebSocket ------------------------------------
// One connection streams every market's price ~1x/sec. Free, keyless, no limits.
const livePrices = new Map(); // 'BTC' -> { price: 67000.1, ts: 169... }
let wsAlive = false;

function connectBinance() {
    const ws = new WebSocket(BINANCE_WS);

    ws.on('open', () => {
        wsAlive = true;
        console.log('[binance-ws] connected — live prices streaming');
    });

    ws.on('message', (buf) => {
        try {
            const tickers = JSON.parse(buf);
            const now = Date.now();
            for (const t of tickers) {
                // We only care about USDT pairs: BTCUSDT -> BTC
                if (t.s && t.s.endsWith('USDT')) {
                    livePrices.set(t.s.slice(0, -4), { price: Number(t.c), ts: now });
                }
            }
        } catch { /* ignore malformed frames */ }
    });

    ws.on('close', () => {
        wsAlive = false;
        console.warn('[binance-ws] disconnected — reconnecting in 5s');
        setTimeout(connectBinance, 5000);
    });

    ws.on('error', (err) => {
        console.warn(`[binance-ws] error: ${err.message}`);
        ws.terminate(); // triggers 'close' -> reconnect
    });
}
connectBinance();

// Overlay live Binance prices onto a CoinGecko-shaped coin list.
// Live stream quotes in USDT ≈ USD; other currencies keep cached values.
const LIVE_MAX_AGE_MS = 2 * 60 * 1000;
function overlayLive(coins, vs) {
    if (vs !== 'usd' || !Array.isArray(coins)) return coins;
    const now = Date.now();
    return coins.map((c) => {
        const live = livePrices.get((c.symbol || '').toUpperCase());
        if (live && now - live.ts < LIVE_MAX_AGE_MS) {
            return { ...c, current_price: live.price };
        }
        return c;
    });
}

// ---- cold-start fallback: Binance REST -------------------------------------
// Only used when we have NO cache and CoinGecko is down. No names/logos/mcap,
// but the table renders with real prices instead of a dead page.
async function binanceFallbackList(perPage) {
    const { data } = await axios.get(`${BINANCE_REST}/ticker/24hr`, { timeout: 10000 });
    const STABLES = new Set(['USDC', 'FDUSD', 'TUSD', 'DAI', 'BUSD', 'USDP', 'EUR', 'GBP']);
    return data
        .filter((t) => t.symbol.endsWith('USDT') && !STABLES.has(t.symbol.slice(0, -4)))
        .sort((a, b) => Number(b.quoteVolume) - Number(a.quoteVolume))
        .slice(0, perPage)
        .map((t, i) => {
            const sym = t.symbol.slice(0, -4);
            return {
                id: sym.toLowerCase(),
                symbol: sym.toLowerCase(),
                name: sym,
                image: null,
                current_price: Number(t.lastPrice),
                market_cap: null,
                market_cap_rank: i + 1,
                total_volume: Number(t.quoteVolume),
                price_change_percentage_24h: Number(t.priceChangePercent),
                price_change_percentage_24h_in_currency: Number(t.priceChangePercent),
                price_change_percentage_7d_in_currency: null,
                sparkline_in_7d: { price: [] },
            };
        });
}

// ---- routes (contract unchanged) -------------------------------------------
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'crypto-tracker-backend',
        liveFeed: wsAlive ? 'binance-ws connected' : 'binance-ws reconnecting',
        liveSymbols: livePrices.size,
        cacheEntries: cache.size,
    });
});

// Top coins by market cap. GET /api/coins?vs=usd&per_page=50
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
        res.json(overlayLive(data, vs));
    } catch (err) {
        // No cache AND CoinGecko down -> emergency list straight from Binance
        try {
            console.warn('[fallback] CoinGecko down with empty cache — using Binance REST');
            const data = await binanceFallbackList(perPage);
            res.json(overlayLive(data, 'usd'));
        } catch (err2) {
            handleError(res, err2);
        }
    }
});

// Single coin (list shape). GET /api/coins/bitcoin?vs=usd
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
        const coin = Array.isArray(data) ? data[0] || null : data;
        res.json(coin ? overlayLive([coin], vs)[0] : null);
    } catch (err) {
        handleError(res, err);
    }
});

// Rich detail for one coin. GET /api/coin/:id?vs=usd
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
        }, 10 * 60 * 1000); // details change slowly — 10 min TTL eases rate-limit pressure
        const m = data.market_data || {};
        const pick = (obj) => (obj && obj[vs] != null ? obj[vs] : null);

        const rawDesc = (data.description?.en || '').replace(/<[^>]*>/g, '').trim();
        const description = rawDesc ? rawDesc.split('. ').slice(0, 3).join('. ').trim() : '';

        // Overlay live price for USD views
        let price = pick(m.current_price);
        if (vs === 'usd') {
            const live = livePrices.get((data.symbol || '').toUpperCase());
            if (live && Date.now() - live.ts < LIVE_MAX_AGE_MS) price = live.price;
        }

        res.json({
            id: data.id,
            symbol: data.symbol,
            name: data.name,
            image: data.image?.large || data.image?.small || null,
            homepage: (data.links?.homepage || []).find(Boolean) || null,
            description: description && !description.endsWith('.') ? description + '.' : description,
            rank: data.market_cap_rank ?? null,
            price,
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
        // CoinGecko refused and we have no cached detail — rebuild a degraded
        // detail view from the cached top-coins list (price, logo, mcap,
        // sparkline are all in there). Only description/ATH are missing.
        const c = detailFromListCache(id, vs) || detailFromListCache(id, 'usd');
        if (c) {
            console.warn(`[degraded] detail for "${id}" served from list cache (${err.message})`);
            let price = c.current_price ?? null;
            const live = livePrices.get((c.symbol || '').toUpperCase());
            if (vs === 'usd' && live && Date.now() - live.ts < LIVE_MAX_AGE_MS) price = live.price;
            return res.json({
                id: c.id,
                symbol: c.symbol,
                name: c.name,
                image: c.image || null,
                homepage: null,
                description: '',
                rank: c.market_cap_rank ?? null,
                price,
                change24h: c.price_change_percentage_24h_in_currency ?? c.price_change_percentage_24h ?? null,
                change7d: c.price_change_percentage_7d_in_currency ?? null,
                change30d: null,
                marketCap: c.market_cap ?? null,
                volume: c.total_volume ?? null,
                high24h: c.high_24h ?? null,
                low24h: c.low_24h ?? null,
                ath: c.ath ?? null,
                athDate: c.ath_date ?? null,
                atl: c.atl ?? null,
                atlDate: c.atl_date ?? null,
                circulatingSupply: c.circulating_supply ?? null,
                totalSupply: c.total_supply ?? null,
                maxSupply: c.max_supply ?? null,
                sparkline: c.sparkline_in_7d?.price || [],
            });
        }
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
        return res.status(429).json({ error: 'Rate limited upstream. Try again shortly.' });
    }
    console.error('Upstream error:', err.message);
    res.status(502).json({ error: 'All data sources unavailable.' });
}

// ---- serve the built React app (production) --------------------------------
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
