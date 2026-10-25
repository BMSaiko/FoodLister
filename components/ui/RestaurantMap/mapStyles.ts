/** CSS partilhado do Leaflet (tema escuro, zoom, popups): /map e detalhe do restaurante. */
export const MAP_CSS = `
  .leaflet-container { background: #0d0d0d !important; }
  .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.72) contrast(0.9) saturate(0.55); }
  .fl-popup { width: 240px; }
  .fl-popup-img { width: 100%; height: 108px; object-fit: cover; display: block; border-radius: 0.75rem 0.75rem 0 0; background: rgba(255,255,255,0.04); }
  .fl-popup-body { padding: 10px 12px 12px; }
  .fl-popup-title { font-size: 15px; font-weight: 700; line-height: 1.2; margin: 0; }
  .fl-popup-rating { margin: 4px 0 0; font-size: 12px; color: #fbbf24; }
  .fl-popup-rating i { font-style: normal; opacity: 0.25; }
  .fl-popup-muted { margin: 3px 0 0; font-size: 12px; color: rgba(255,255,255,0.55); }
  .leaflet-popup-content a.fl-popup-cta { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 10px; min-height: 40px; border-radius: 9999px; background: rgba(245,158,11,0.15); border: 1px solid rgba(245,158,11,0.5); font-size: 13px; font-weight: 600; text-decoration: none; }
  .leaflet-popup-content a.fl-popup-cta:hover { background: rgba(245,158,11,0.28); gap: 10px; }
  .leaflet-popup-content-wrapper {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-radius: 1rem !important;
    padding: 0 !important;
    overflow: hidden;
    box-shadow: var(--card-shadow) !important;
    color: var(--foreground) !important;
  }
  .leaflet-popup-content {
    margin: 0 !important;
    color: var(--foreground) !important;
  }
  .leaflet-popup-tip {
    background: var(--card-bg) !important;
    border: 1px solid var(--card-border) !important;
    border-top: none !important;
    border-radius: 0 0 1rem 1rem !important;
  }
  .leaflet-bar { border: 1px solid rgba(255,255,255,0.08) !important; border-radius: 0.75rem !important; box-shadow: 0 4px 14px rgba(0,0,0,0.5) !important; overflow: hidden; }
  .leaflet-control-zoom a {
    width: 44px !important;
    height: 44px !important;
    line-height: 42px !important;
    background: rgba(13,13,13,0.95) !important;
    color: rgba(255,255,255,0.8) !important;
    border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    font-size: 20px !important;
    transition: color 0.2s ease, background 0.2s ease;
  }
  .leaflet-control-zoom a:last-child { border-bottom: none !important; }
  .leaflet-control-zoom a:hover { background: rgba(245,158,11,0.15) !important; color: #fbbf24 !important; }
  .leaflet-control-zoom a:focus-visible { outline: 2px solid #fcd34d; outline-offset: -2px; }
  .leaflet-popup-close-button {
    color: var(--foreground-muted) !important;
    font-size: 1.1rem !important;
    top: 4px !important;
    right: 6px !important;
  }
  .leaflet-popup-close-button:hover {
    color: var(--foreground) !important;
  }
  .leaflet-popup-content a {
    transition: color 0.2s ease, gap 0.2s ease;
    color: #fbbf24 !important;
  }
  .leaflet-popup-content a:hover {
    color: #f59e0b !important;
    gap: 8px;
  }
  .leaflet-popup-content a svg {
    transition: transform 0.2s ease;
  }
  .leaflet-popup-content a:hover svg {
    transform: translateX(3px);
  }
`;
