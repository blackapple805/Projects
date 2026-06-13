import React from 'react';

/* ============================================================
   BreadArt — MIGA etchings. Thin single-stroke line art in
   currentColor, matched by keywords in the bread's name.
   No image files, no external requests, nothing to break.
   If a bread row has an `image` URL, BreadList shows that
   instead (rendered grayscale to stay on-palette).
   ============================================================ */

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const Frame = ({ label, children }) => (
  <svg viewBox="0 0 200 140" role="img" aria-label={label} {...S}>
    {children}
  </svg>
);

const Boule = () => (
  <Frame label="Round sourdough loaf">
    <ellipse cx="100" cy="80" rx="56" ry="40" />
    <path d="M64 72 Q100 44 136 72" />
    <path d="M76 90 Q100 70 124 90" />
  </Frame>
);

const Baguette = () => (
  <Frame label="Baguette">
    <g transform="rotate(-8 100 78)">
      <rect x="28" y="60" width="144" height="36" rx="18" />
      <path d="M62 64 L76 90" />
      <path d="M92 62 L106 88" />
      <path d="M122 62 L136 88" />
    </g>
  </Frame>
);

const Rye = () => (
  <Frame label="Rye loaf">
    <ellipse cx="100" cy="82" rx="60" ry="36" />
    <path d="M58 76 Q100 50 142 76" />
    <path d="M82 64 L88 60" />
    <path d="M104 58 L110 56" />
    <path d="M122 68 L128 64" />
    <path d="M94 76 L100 72" />
  </Frame>
);

const Ciabatta = () => (
  <Frame label="Ciabatta">
    <rect x="42" y="58" width="116" height="52" rx="24" />
    <circle cx="74" cy="82" r="2" />
    <circle cx="98" cy="92" r="2" />
    <circle cx="114" cy="76" r="2" />
    <circle cx="132" cy="90" r="2" />
  </Frame>
);

const Croissant = () => (
  <Frame label="Croissant">
    <ellipse cx="100" cy="80" rx="29" ry="26" />
    <path d="M82 62 Q46 56 32 80 Q44 100 78 100" />
    <path d="M118 62 Q154 56 168 80 Q156 100 122 100" />
    <path d="M82 60 Q76 80 84 102" />
    <path d="M118 60 Q124 80 116 102" />
  </Frame>
);

const Tin = () => (
  <Frame label="Tin loaf">
    <rect x="52" y="72" width="96" height="42" />
    <path d="M52 78 Q60 44 84 50 Q100 38 116 50 Q140 44 148 78" />
    <path d="M100 84 L100 104" />
    <path d="M100 90 L92 84" />
    <path d="M100 90 L108 84" />
  </Frame>
);

// Keyword → etching. First match wins.
const ART = [
  ['baguette', Baguette],
  ['croissant', Croissant],
  ['ciabatta', Ciabatta],
  ['focaccia', Ciabatta],
  ['rye', Rye],
  ['pumpernickel', Rye],
  ['sourdough', Boule],
  ['boule', Boule],
  ['wheat', Tin],
  ['white', Tin],
  ['sandwich', Tin],
];

const BreadArt = ({ name = '' }) => {
  const key = name.toLowerCase();
  const match = ART.find(([word]) => key.includes(word));
  const Art = match ? match[1] : Boule;
  return <Art />;
};

export default BreadArt;
