/* ui.js — AURA X icons (clean, consistent, “like photos”) */

const UI = (() => {
  const svg = (paths, viewBox="0 0 24 24") =>
    `<svg viewBox="${viewBox}" aria-hidden="true" focusable="false" style="width:22px;height:22px;display:block;color:rgba(255,255,255,.92)">${paths}</svg>`;

  const icons = {
    gear: svg(`
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M19.3 12a7.6 7.6 0 0 0-.1-1l2-1.4-2-3.4-2.3.8a7.7 7.7 0 0 0-1.7-1l-.3-2.4H9.1L8.8 6a7.7 7.7 0 0 0-1.7 1L4.8 6.2l-2 3.4 2 1.4a7.6 7.6 0 0 0 0 2l-2 1.4 2 3.4 2.3-.8c.5.4 1.1.7 1.7 1l.3 2.4h5.8l.3-2.4c.6-.3 1.2-.6 1.7-1l2.3.8 2-3.4-2-1.4c.1-.3.1-.7.1-1z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round" opacity=".95"/>
    `),

    plus: svg(`<path d="M12 5.5v13M5.5 12h13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>`),

    bell: svg(`
      <path d="M12 20.5a2.2 2.2 0 0 0 2.2-2.2H9.8A2.2 2.2 0 0 0 12 20.5z" fill="currentColor" opacity=".9"/>
      <path d="M18.2 17.2H5.8c1.2-1.2 1.6-2.3 1.6-4.2v-2.3a4.6 4.6 0 0 1 9.2 0V13c0 1.9.4 3 1.6 4.2z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    `),

    alarm: svg(`
      <path d="M12 20.2a7.1 7.1 0 1 0 0-14.2 7.1 7.1 0 0 0 0 14.2z" fill="none" stroke="currentColor" stroke-width="1.8"/>
      <path d="M12 10v3.6l2.2 1.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6.2 4.8 4.8 3.4M17.8 4.8l1.4-1.4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    `),

    home: svg(`
      <path d="M4 10.8 12 4l8 6.8v8.7a1.7 1.7 0 0 1-1.7 1.7H5.7A1.7 1.7 0 0 1 4 19.5z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9.2 21v-6.2c0-.6.5-1.1 1.1-1.1h3.4c.6 0 1.1.5 1.1 1.1V21" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    `),

    scenes: svg(`
      <path d="M7 6.2h10M7 12h10M7 17.8h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M5.2 6.2h.01M5.2 12h.01M5.2 17.8h.01" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    `),

    catalog: svg(`
      <path d="M7.2 9.2V8.4A4.8 4.8 0 0 1 12 3.6a4.8 4.8 0 0 1 4.8 4.8v.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M6 9.2h12.5c.9 0 1.6.7 1.6 1.6l-1 8.2a1.9 1.9 0 0 1-1.9 1.7H7.8A1.9 1.9 0 0 1 5.9 19l-1-8.2c0-.9.7-1.6 1.6-1.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
    `),

    tips: svg(`
      <path d="M12 3.8c-3.5 0-6.2 2.7-6.2 6.1 0 2.2 1.1 3.6 2.4 4.7.8.6 1.3 1.4 1.5 2.4h4.6c.2-1 .7-1.8 1.5-2.4 1.3-1.1 2.4-2.5 2.4-4.7 0-3.4-2.7-6.1-6.2-6.1z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9.2 20.2h5.6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    `),

    aura: svg(`
      <path d="M12 3.5c3.9 0 7 3.1 7 7 0 4.6-3.7 10-7 10S5 15.1 5 10.5c0-3.9 3.1-7 7-7z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
      <path d="M9.5 11.2c1.8-1.2 3.2-1.2 5 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" opacity=".9"/>
    `),

    devicePack: (kind) => {
      // маленькие “картинки” для плиток (не 1 в 1, но по стилю)
      if (kind === "alice") return `
        <svg viewBox="0 0 96 72" aria-hidden="true" style="width:78px;height:56px;display:block">
          <defs>
            <linearGradient id="g1" x1="0" x2="1">
              <stop offset="0" stop-color="rgba(122,92,255,.65)"/>
              <stop offset="1" stop-color="rgba(186,146,255,.35)"/>
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="52" height="36" rx="10" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.10)"/>
          <rect x="16" y="18" width="32" height="20" rx="8" fill="url(#g1)" opacity=".85"/>
          <circle cx="72" cy="40" r="14" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.10)"/>
          <circle cx="72" cy="40" r="5" fill="rgba(255,255,255,.35)"/>
        </svg>`;
      return `
        <svg viewBox="0 0 96 72" aria-hidden="true" style="width:78px;height:56px;display:block">
          <defs>
            <linearGradient id="g2" x1="0" x2="1">
              <stop offset="0" stop-color="rgba(186,146,255,.45)"/>
              <stop offset="1" stop-color="rgba(122,92,255,.75)"/>
            </linearGradient>
          </defs>
          <circle cx="28" cy="36" r="16" fill="rgba(255,255,255,.06)" stroke="rgba(255,255,255,.10)"/>
          <path d="M28 24c6 5 6 19 0 24" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="3" stroke-linecap="round"/>
          <rect x="52" y="22" width="28" height="28" rx="10" fill="url(#g2)" opacity=".85"/>
          <rect x="58" y="28" width="16" height="16" rx="6" fill="rgba(255,255,255,.20)"/>
        </svg>`;
    }
  };

  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));
  const setHTML = (node, html) => { node.innerHTML = html; };

  return { icons, qs, qsa, setHTML };
})();

window.UI = UI;