import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './App.css';

const CURRENCIES = {
  usd: { symbol: '$', label: 'USD' },
  eur: { symbol: '€', label: 'EUR' },
  gbp: { symbol: '£', label: 'GBP' },
};

const FAVORITES_KEY = 'ct.favorites';

function loadFavorites() {
  try {
    return new Set(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || []);
  } catch {
    return new Set();
  }
}

function formatPrice(value, symbol) {
  if (value == null) return '—';
  const decimals = value >= 1 ? 2 : value >= 0.01 ? 4 : 8;
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function formatCompact(value, symbol = '') {
  if (value == null) return '—';
  return `${symbol}${value.toLocaleString(undefined, {
    notation: 'compact',
    maximumFractionDigits: 2,
  })}`;
}

// Tiny inline SVG sparkline from the 7-day price array.
function Sparkline({ points, positive }) {
  if (!points || points.length < 2) return <div className="spark-empty" />;
  const w = 120;
  const h = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const d = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(2)},${(h - ((p - min) / range) * h).toFixed(2)}`)
    .join(' ');
  const stroke = positive ? 'var(--up)' : 'var(--down)';
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ChangeBadge({ value }) {
  if (value == null) return <span className="change muted">—</span>;
  const positive = value >= 0;
  return (
    <span className={`change ${positive ? 'up' : 'down'}`}>
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [vs, setVs] = useState('usd');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axios.get(`/api/coins?vs=${vs}&per_page=50`);
      setCoins(data);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(
        e.response?.status === 429
          ? 'CoinGecko is rate-limiting us. Give it a few seconds.'
          : 'Could not load market data. Is the backend running?'
      );
    } finally {
      setLoading(false);
    }
  }, [vs]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const id = setInterval(fetchData, 60000); // auto-refresh every 60s
    return () => clearInterval(id);
  }, [fetchData]);

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleFavorite = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coins.filter((c) => {
      if (onlyFavorites && !favorites.has(c.id)) return false;
      if (!q) return true;
      return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
    });
  }, [coins, query, onlyFavorites, favorites]);

  const cur = CURRENCIES[vs];

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <div>
            <h1>Crypto Tracker</h1>
            <p className="sub">Live market data · CoinGecko</p>
          </div>
        </div>

        <div className="controls">
          <div className="search">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Search coin or ticker…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="seg">
            {Object.entries(CURRENCIES).map(([key, c]) => (
              <button
                key={key}
                className={vs === key ? 'active' : ''}
                onClick={() => setVs(key)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <button
            className={`fav-toggle ${onlyFavorites ? 'active' : ''}`}
            onClick={() => setOnlyFavorites((v) => !v)}
            title="Show favorites only"
          >
            ★ {favorites.size}
          </button>
        </div>
      </header>

      <main className="content">
        {error && (
          <div className="banner error">
            <span>{error}</span>
            <button onClick={fetchData}>Retry</button>
          </div>
        )}

        <div className="table">
          <div className="row head">
            <span className="col-fav" />
            <span className="col-rank">#</span>
            <span className="col-name">Name</span>
            <span className="col-price">Price</span>
            <span className="col-change">24h</span>
            <span className="col-mcap">Market Cap</span>
            <span className="col-spark">7d</span>
          </div>

          {loading
            ? Array.from({ length: 10 }).map((_, i) => (
                <div className="row skeleton" key={i}>
                  <span className="sk sk-dot" />
                  <span className="sk sk-sm" />
                  <span className="sk sk-name" />
                  <span className="sk sk-md" />
                  <span className="sk sk-sm" />
                  <span className="sk sk-md" />
                  <span className="sk sk-spark" />
                </div>
              ))
            : filtered.map((c) => {
                const positive = (c.price_change_percentage_24h ?? 0) >= 0;
                return (
                  <div className="row" key={c.id}>
                    <button
                      className={`star ${favorites.has(c.id) ? 'on' : ''}`}
                      onClick={() => toggleFavorite(c.id)}
                      aria-label="Toggle favorite"
                    >
                      ★
                    </button>
                    <span className="col-rank rank">{c.market_cap_rank ?? '—'}</span>
                    <div className="col-name coin">
                      <img src={c.image} alt="" width="26" height="26" loading="lazy" />
                      <div>
                        <span className="coin-name">{c.name}</span>
                        <span className="coin-sym">{c.symbol.toUpperCase()}</span>
                      </div>
                    </div>
                    <span className="col-price price">{formatPrice(c.current_price, cur.symbol)}</span>
                    <span className="col-change">
                      <ChangeBadge value={c.price_change_percentage_24h} />
                    </span>
                    <span className="col-mcap mcap">{formatCompact(c.market_cap, cur.symbol)}</span>
                    <span className="col-spark">
                      <Sparkline points={c.sparkline_in_7d?.price} positive={positive} />
                    </span>
                  </div>
                );
              })}

          {!loading && filtered.length === 0 && (
            <div className="empty">
              {onlyFavorites ? 'No favorites yet — tap a ★ to add one.' : 'No coins match your search.'}
            </div>
          )}
        </div>
      </main>

      <footer className="footer">
        <span>
          {updatedAt
            ? `Updated ${updatedAt.toLocaleTimeString()} · auto-refresh 60s`
            : 'Connecting…'}
        </span>
        <button className="refresh" onClick={fetchData}>↻ Refresh</button>
      </footer>
    </div>
  );
}

export default App;
