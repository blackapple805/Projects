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

function formatNumber(value) {
  if (value == null) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function Sparkline({ points, positive, big }) {
  if (!points || points.length < 2) return <div className={big ? 'spark-empty big' : 'spark-empty'} />;
  const w = big ? 560 : 120;
  const h = big ? 160 : 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - ((p - min) / range) * h]);
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(2)},${c[1].toFixed(2)}`).join(' ');
  const stroke = positive ? 'var(--up)' : 'var(--down)';
  const area = big ? `${line} L${w},${h} L0,${h} Z` : null;
  return (
    <svg className={big ? 'spark big' : 'spark'} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      {big && <path d={area} fill={stroke} opacity="0.08" />}
      <path d={line} fill="none" stroke={stroke} strokeWidth={big ? 2 : 1.6} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function ChangeBadge({ value, large }) {
  if (value == null) return <span className={`change muted ${large ? 'lg' : ''}`}>—</span>;
  const positive = value >= 0;
  return (
    <span className={`change ${positive ? 'up' : 'down'} ${large ? 'lg' : ''}`}>
      {positive ? '▲' : '▼'} {Math.abs(value).toFixed(2)}%
    </span>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

function CoinModal({ id, vs, onClose }) {
  const cur = CURRENCIES[vs];
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    axios
      .get(`/api/coin/${id}?vs=${vs}`)
      .then((res) => active && setData(res.data))
      .catch(() => active && setError('Could not load details for this coin.'));
    return () => {
      active = false;
    };
  }, [id, vs]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const positive = (data?.change7d ?? data?.change24h ?? 0) >= 0;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        {error ? (
          <div className="modal-error">{error}</div>
        ) : !data ? (
          <div className="modal-loading">Loading details…</div>
        ) : (
          <>
            <div className="modal-head">
              <img src={data.image} alt="" width="44" height="44" />
              <div className="modal-title">
                <div className="modal-name">
                  {data.name} <span className="modal-sym">{data.symbol.toUpperCase()}</span>
                </div>
                {data.rank && <span className="modal-rank">Rank #{data.rank}</span>}
              </div>
              <div className="modal-price">
                <div className="big-price">{formatPrice(data.price, cur.symbol)}</div>
                <ChangeBadge value={data.change24h} large />
              </div>
            </div>

            <div className="modal-chart">
              <Sparkline points={data.sparkline} positive={positive} big />
              <span className="chart-caption">Last 7 days</span>
            </div>

            <div className="stats-grid">
              <Stat label="Market cap" value={formatCompact(data.marketCap, cur.symbol)} />
              <Stat label="24h volume" value={formatCompact(data.volume, cur.symbol)} />
              <Stat label="24h high" value={formatPrice(data.high24h, cur.symbol)} />
              <Stat label="24h low" value={formatPrice(data.low24h, cur.symbol)} />
              <Stat label="7d change" value={<ChangeBadge value={data.change7d} />} />
              <Stat label="30d change" value={<ChangeBadge value={data.change30d} />} />
              <Stat label="All-time high" value={
                <span>{formatPrice(data.ath, cur.symbol)} <span className="muted-date">{formatDate(data.athDate)}</span></span>
              } />
              <Stat label="All-time low" value={
                <span>{formatPrice(data.atl, cur.symbol)} <span className="muted-date">{formatDate(data.atlDate)}</span></span>
              } />
              <Stat label="Circulating supply" value={formatNumber(data.circulatingSupply)} />
              <Stat label="Total supply" value={formatNumber(data.totalSupply)} />
              <Stat label="Max supply" value={data.maxSupply ? formatNumber(data.maxSupply) : '∞'} />
              {data.homepage && (
                <Stat label="Website" value={
                  <a href={data.homepage} target="_blank" rel="noreferrer" className="modal-link">
                    {data.homepage.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                  </a>
                } />
              )}
            </div>

            {data.description && <p className="modal-desc">{data.description}</p>}
          </>
        )}
      </div>
    </div>
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
  const [selected, setSelected] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const { data } = await axios.get(`/api/coins?vs=${vs}&per_page=50`);
      if (!Array.isArray(data)) {
        throw new Error('unexpected');
      }
      setCoins(data);
      setUpdatedAt(new Date());
    } catch (e) {
      setError(
        e.response?.status === 429
          ? 'CoinGecko is rate-limiting us. Give it a few seconds and hit Retry.'
          : 'Could not load market data. Is the backend running on port 5000?'
      );
    } finally {
      setLoading(false);
    }
  }, [vs]);

  useEffect(() => {
    setLoading(true);
    fetchData();
    const id = setInterval(fetchData, 60000);
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
              <button key={key} className={vs === key ? 'active' : ''} onClick={() => setVs(key)}>
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

        {onlyFavorites && (
          <div className="banner filter">
            <span>Showing favorites only ({favorites.size} of {coins.length} coins)</span>
            <button onClick={() => setOnlyFavorites(false)}>Show all</button>
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
                  <div
                    className="row clickable"
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelected(c.id)}
                  >
                    <button
                      className={`star ${favorites.has(c.id) ? 'on' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(c.id);
                      }}
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
            ? `${filtered.length} coins · updated ${updatedAt.toLocaleTimeString()} · auto-refresh 60s`
            : 'Connecting…'}
        </span>
        <button className="refresh" onClick={fetchData}>↻ Refresh</button>
      </footer>

      {selected && <CoinModal id={selected} vs={vs} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default App;