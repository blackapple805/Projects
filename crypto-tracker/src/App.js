import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import './App.css';

const CURRENCIES = {
  usd: { symbol: '$', label: 'USD' },
  eur: { symbol: '€', label: 'EUR' },
  gbp: { symbol: '£', label: 'GBP' },
};

const FAVORITES_KEY = 'ct.favorites';
const POLL_MS = 10000; // backend serves from its live WS overlay — polling is free

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

function formatScrubTime(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Coin logo with graceful fallback: if the image URL is missing or fails to
// load, render a letter badge tinted deterministically from the ticker.
function CoinIcon({ src, symbol, size = 26 }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  if (!src || failed) {
    const letter = (symbol || '?').charAt(0).toUpperCase();
    let hash = 0;
    for (const ch of symbol || '') hash = (hash * 31 + ch.charCodeAt(0)) % 360;
    return (
      <span
        className="coin-fallback"
        style={{ width: size, height: size, fontSize: size * 0.46, '--coin-hue': hash }}
        aria-hidden="true"
      >
        {letter}
      </span>
    );
  }
  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

// Small inline sparkline for table rows.
function Sparkline({ points, positive }) {
  if (!points || points.length < 2) {
    return <div className="spark-empty"><span className="spark-dash" /></div>;
  }
  const w = 120;
  const h = 36;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => [i * step, h - ((p - min) / range) * h]);
  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(2)},${c[1].toFixed(2)}`).join(' ');
  const stroke = positive ? 'var(--up)' : 'var(--down)';
  return (
    <svg className="spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// Interactive 7-day chart for the detail modal. Hover or drag to scrub:
// crosshair + dot follow the nearest hourly point, the segment behind the
// cursor stays lit while the segment ahead dims, and onScrub reports the
// hovered price/time so the modal header can live-update (Robinhood-style).
// Reference lines: dashed baseline at the 7-day open price, dashed gridlines
// at the period high/low with mono price labels — reading like a trading
// terminal, not a sparkline. CoinGecko sparklines are hourly ending now, so
// timestamps are reconstructed as "now minus N hours".
const CHART_W = 560;
const CHART_H = 160;
const CHART_PAD = 12; // vertical inset so gridlines and peaks aren't clipped

function formatChartLabel(v, symbol) {
  if (v == null) return '';
  const decimals = v >= 1000 ? 0 : v >= 1 ? 2 : 4;
  return `${symbol}${v.toLocaleString(undefined, {
    minimumFractionDigits: v >= 1000 ? 0 : decimals,
    maximumFractionDigits: decimals,
  })}`;
}

function InteractiveChart({ points, positive, currency, onScrub }) {
  const wrapRef = useRef(null);
  const [hover, setHover] = useState(null); // { i, xPct, yPct, tipPct }

  const geom = useMemo(() => {
    if (!points || points.length < 2) return null;
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;
    const innerH = CHART_H - CHART_PAD * 2;
    const yOf = (p) => CHART_PAD + (1 - (p - min) / range) * innerH;
    const step = CHART_W / (points.length - 1);
    const coords = points.map((p, i) => [i * step, yOf(p)]);
    const line = coords
      .map((c, i) => `${i === 0 ? 'M' : 'L'}${c[0].toFixed(2)},${c[1].toFixed(2)}`)
      .join(' ');
    return { coords, line, min, max, yMax: yOf(max), yMin: yOf(min), yOpen: yOf(points[0]) };
  }, [points]);

  const clearScrub = useCallback(() => {
    setHover(null);
    onScrub(null);
  }, [onScrub]);

  if (!geom) {
    return <div className="spark-empty big"><span>Chart temporarily unavailable</span></div>;
  }

  const handleMove = (e) => {
    const rect = wrapRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const frac = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const i = Math.round(frac * (points.length - 1));
    const [cx, cy] = geom.coords[i];
    setHover({
      i,
      xPct: (cx / CHART_W) * 100,
      yPct: (cy / CHART_H) * 100,
      tipPct: Math.min(Math.max((cx / CHART_W) * 100, 11), 89), // keep tooltip inside
    });
    const ts = Date.now() - (points.length - 1 - i) * 3600 * 1000;
    const fromStart = points[0] ? ((points[i] - points[0]) / points[0]) * 100 : null;
    onScrub({ price: points[i], ts, fromStart });
  };

  const stroke = positive ? 'var(--up)' : 'var(--down)';
  const litWidth = hover ? geom.coords[hover.i][0] : CHART_W;
  const ts = hover ? Date.now() - (points.length - 1 - hover.i) * 3600 * 1000 : null;
  // Hide the "7d open" tag if the baseline sits on top of the high/low lines.
  const showOpenTag =
    Math.abs(geom.yOpen - geom.yMax) > 14 && Math.abs(geom.yOpen - geom.yMin) > 14;

  return (
    <div
      className="ichart"
      ref={wrapRef}
      onPointerMove={handleMove}
      onPointerDown={handleMove}
      onPointerLeave={clearScrub}
      onPointerCancel={clearScrub}
    >
      <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" style={{ stopColor: positive ? 'var(--up)' : 'var(--down)' }} stopOpacity="0.22" />
            <stop offset="100%" style={{ stopColor: positive ? 'var(--up)' : 'var(--down)' }} stopOpacity="0" />
          </linearGradient>
          <clipPath id="scrub-clip">
            <rect x="0" y="0" width={litWidth} height={CHART_H} />
          </clipPath>
        </defs>

        {/* dashed reference lines: period high, period low, 7d open baseline */}
        <line className="grid-line" x1="0" x2={CHART_W} y1={geom.yMax} y2={geom.yMax} />
        <line className="grid-line" x1="0" x2={CHART_W} y1={geom.yMin} y2={geom.yMin} />
        <line className="grid-line open" x1="0" x2={CHART_W} y1={geom.yOpen} y2={geom.yOpen} />

        {/* gradient fade under the line */}
        <path d={`${geom.line} L${CHART_W},${CHART_H} L0,${CHART_H} Z`} fill="url(#chart-fill)" />

        {/* full line, dimmed while scrubbing */}
        <path
          d={geom.line}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={hover ? 0.28 : 1}
        />
        {/* lit segment up to the cursor */}
        {hover && (
          <path
            d={geom.line}
            fill="none"
            stroke={stroke}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            clipPath="url(#scrub-clip)"
          />
        )}
      </svg>

      {/* reference-line labels (HTML so they don't stretch with the SVG) */}
      <span className="chart-label" style={{ top: `${(geom.yMax / CHART_H) * 100}%` }}>
        {formatChartLabel(geom.max, currency)}
      </span>
      <span className="chart-label" style={{ top: `${(geom.yMin / CHART_H) * 100}%` }}>
        {formatChartLabel(geom.min, currency)}
      </span>
      {showOpenTag && (
        <span className="chart-label open-tag" style={{ top: `${(geom.yOpen / CHART_H) * 100}%` }}>
          7d open
        </span>
      )}

      {hover && (
        <>
          <div className="ichart-line" style={{ left: `${hover.xPct}%` }} />
          <div
            className="ichart-dot"
            style={{ left: `${hover.xPct}%`, top: `${hover.yPct}%`, '--dot-color': stroke }}
          />
          <div className="ichart-tip" style={{ left: `${hover.tipPct}%` }}>
            {formatScrubTime(ts)}
          </div>
        </>
      )}
    </div>
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
  const [scrub, setScrub] = useState(null); // { price, ts, fromStart } while hovering the chart

  useEffect(() => {
    let active = true;
    setData(null);
    setError(null);
    setScrub(null);
    axios
      .get(`/api/coin/${id}?vs=${vs}`)
      .then((res) => active && setData(res.data))
      .catch(() => active && setError('Details are unavailable right now. Prices in the table are still live.'));
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
  // Degraded mode: served from list cache while CoinGecko cools down.
  const degraded = data && !data.description && data.ath == null && data.homepage == null;

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
              <CoinIcon src={data.image} symbol={data.symbol} size={44} />
              <div className="modal-title">
                <div className="modal-name">
                  {data.name} <span className="modal-sym">{data.symbol.toUpperCase()}</span>
                </div>
                {data.rank && <span className="modal-rank">Rank #{data.rank}</span>}
              </div>
              <div className="modal-price">
                <div className="big-price">{formatPrice(scrub ? scrub.price : data.price, cur.symbol)}</div>
                {scrub ? (
                  <span className="scrub-badge">
                    <ChangeBadge value={scrub.fromStart} large />
                  </span>
                ) : (
                  <ChangeBadge value={data.change24h} large />
                )}
              </div>
            </div>

            <div className="modal-chart">
              <InteractiveChart points={data.sparkline} positive={positive} currency={cur.symbol} onScrub={setScrub} />
              <span className="chart-caption">
                {scrub ? `${formatScrubTime(scrub.ts)} · change since 7d ago` : 'Last 7 days · hover to explore'}
              </span>
            </div>

            <div className="stats-grid">
              <Stat label="Market cap" value={formatCompact(data.marketCap, cur.symbol)} />
              <Stat label="24h volume" value={formatCompact(data.volume, cur.symbol)} />
              {data.high24h != null && data.low24h != null && data.high24h > data.low24h ? (
                <div className="stat range-stat">
                  <span className="stat-label">24h range</span>
                  <div className="range-bar">
                    <span className="range-val">{formatPrice(data.low24h, cur.symbol)}</span>
                    <div className="range-track">
                      <span
                        className="range-dot"
                        style={{
                          left: `${Math.min(Math.max(((data.price - data.low24h) / (data.high24h - data.low24h)) * 100, 0), 100)}%`,
                        }}
                      />
                    </div>
                    <span className="range-val">{formatPrice(data.high24h, cur.symbol)}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Stat label="24h high" value={formatPrice(data.high24h, cur.symbol)} />
                  <Stat label="24h low" value={formatPrice(data.low24h, cur.symbol)} />
                </>
              )}
              <Stat label="7d change" value={<ChangeBadge value={data.change7d} />} />
              <Stat label="30d change" value={<ChangeBadge value={data.change30d} />} />
              {data.ath != null && (
                <Stat label="All-time high" value={
                  <span>{formatPrice(data.ath, cur.symbol)} <span className="muted-date">{formatDate(data.athDate)}</span></span>
                } />
              )}
              {data.atl != null && (
                <Stat label="All-time low" value={
                  <span>{formatPrice(data.atl, cur.symbol)} <span className="muted-date">{formatDate(data.atlDate)}</span></span>
                } />
              )}
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
            {degraded && (
              <p className="modal-note">Showing live essentials — full profile loads once the data provider cools down.</p>
            )}
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

  // Remember each coin's previous price so we can flash on change.
  const prevPricesRef = useRef(new Map());

  const fetchData = useCallback(async () => {
    try {
      const { data } = await axios.get(`/api/coins?vs=${vs}&per_page=50`);
      if (!Array.isArray(data)) {
        throw new Error('unexpected');
      }
      setCoins(data);
      setUpdatedAt(new Date());
      setError(null);
    } catch (e) {
      // The backend fails over between sources on its own — a hard error here
      // means it's unreachable or every source is down at once.
      setError(
        e.response
          ? 'All market data sources are unavailable right now — retrying automatically.'
          : 'Could not reach the backend. Is the server running on port 5000?'
      );
    } finally {
      setLoading(false);
    }
  }, [vs]);

  useEffect(() => {
    setLoading(true);
    prevPricesRef.current = new Map(); // currency switch shouldn't flash everything
    fetchData();
    const id = setInterval(fetchData, POLL_MS);
    return () => clearInterval(id);
  }, [fetchData]);

  // Compare incoming prices to the previous snapshot -> flash direction per coin.
  const flashes = useMemo(() => {
    const m = new Map();
    for (const c of coins) {
      const prev = prevPricesRef.current.get(c.id);
      if (prev != null && c.current_price != null && c.current_price !== prev) {
        m.set(c.id, c.current_price > prev ? 'up' : 'down');
      }
    }
    return m;
  }, [coins]);

  useEffect(() => {
    const snap = new Map();
    coins.forEach((c) => snap.set(c.id, c.current_price));
    prevPricesRef.current = snap;
  }, [coins]);

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
  const live = !error && updatedAt;

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow" aria-hidden="true" />

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">◆</span>
          <div>
            <h1>Crypto Tracker</h1>
            <p className="sub">
              <span className={`live-dot ${live ? 'on' : ''}`} aria-hidden="true" />
              {live ? 'Live market data' : 'Connecting…'}
            </p>
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
            <button onClick={fetchData}>Retry now</button>
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
                const flash = flashes.get(c.id);
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
                      <CoinIcon src={c.image} symbol={c.symbol} size={26} />
                      <div>
                        <span className="coin-name">{c.name}</span>
                        <span className="coin-sym">{c.symbol.toUpperCase()}</span>
                      </div>
                    </div>
                    <span
                      key={`${c.id}:${c.current_price}`}
                      className={`col-price price ${flash ? `flash-${flash}` : ''}`}
                    >
                      {formatPrice(c.current_price, cur.symbol)}
                    </span>
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
            ? `${filtered.length} coins · updated ${updatedAt.toLocaleTimeString()} · live`
            : 'Connecting…'}
        </span>
        <button className="refresh" onClick={fetchData}>↻ Refresh</button>
      </footer>

      {selected && <CoinModal id={selected} vs={vs} onClose={() => setSelected(null)} />}
    </div>
  );
}

export default App;