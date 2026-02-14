// =====================
// AURA UI BOOT DIAGNOSTIC + SELF-HEAL
// Replace WHOLE ui.js with this
// =====================

(function () {
  // --- tiny visual proof that ui.js executed ---
  function badge(text) {
    try {
      let b = document.getElementById("auraBootBadge");
      if (!b) {
        b = document.createElement("div");
        b.id = "auraBootBadge";
        b.style.cssText =
          "position:fixed;top:10px;right:10px;z-index:99999;" +
          "background:rgba(0,0,0,.65);border:1px solid rgba(255,255,255,.18);" +
          "color:#fff;padding:8px 10px;border-radius:12px;" +
          "font:12px/1.2 -apple-system,BlinkMacSystemFont,system-ui;" +
          "backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px)";
        document.body.appendChild(b);
      }
      b.textContent = text;
    } catch {}
  }

  function showErr(text) {
    try {
      let box = document.getElementById("auraErrBox");
      if (!box) {
        box = document.createElement("div");
        box.id = "auraErrBox";
        box.style.cssText =
          "position:fixed;inset:12px;z-index:99998;background:rgba(10,12,18,.92);" +
          "border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:14px;" +
          "color:#fff;font:13px/1.35 -apple-system,BlinkMacSystemFont,system-ui;white-space:pre-wrap;" +
          "overflow:auto;box-shadow:0 30px 80px rgba(0,0,0,.6)";
        document.body.appendChild(box);
      }
      box.textContent = "AURA UI ERROR:\n" + text;
    } catch {}
  }

  window.addEventListener("error", (e) => {
    const msg = (e?.message || "Unknown error");
    const src = (e?.filename || "");
    const line = (e?.lineno || "");
    showErr(`${msg}\n${src}:${line}`);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const msg = (e?.reason?.message || String(e?.reason || "Promise rejection"));
    showErr(msg);
  });

  function ensureBaseNodes() {
    // If your index.html already has these — we reuse them.
    // If not — we create them so UI can render.
    const body = document.body;

    let app = document.getElementById("app");
    let tabs = document.getElementById("tabs");
    let fab = document.getElementById("aiFab");

    if (!app) {
      app = document.createElement("div");
      app.id = "app";
      app.style.cssText = "padding:14px 14px 110px; min-height:60vh;";
      body.appendChild(app);
    }

    if (!tabs) {
      tabs = document.createElement("div");
      tabs.id = "tabs";
      tabs.style.cssText =
        "position:fixed;left:12px;right:12px;bottom:12px;z-index:40;" +
        "display:flex;gap:8px;padding:8px;border-radius:18px;" +
        "background:rgba(28,32,45,.72);border:1px solid rgba(255,255,255,.10);" +
        "backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);";
      body.appendChild(tabs);
    }

    if (!fab) {
      fab = document.createElement("button");
      fab.id = "aiFab";
      fab.textContent = "🧠";
      fab.style.cssText =
        "position:fixed;right:18px;bottom:88px;z-index:50;" +
        "width:54px;height:54px;border-radius:999px;border:none;" +
        "background:linear-gradient(90deg,#7B61FF,#5E8BFF);" +
        "color:#fff;font-size:22px;box-shadow:0 18px 40px rgba(94,139,255,.28);";
      body.appendChild(fab);
    }

    // minimal app background if page is empty
    body.style.background = "#0F1115";
    body.style.color = "#F2F4F8";
    body.style.fontFamily = "-apple-system,BlinkMacSystemFont,system-ui";
  }

  function ensureAURA() {
    if (!window.AURA) window.AURA = {};
    if (!window.AURA.state) window.AURA.state = {};
    if (!window.AURA.state.devices) {
      window.AURA.state.devices = {
        light: { power: false, brightness: 50, temp: "warm" },
        speaker: { playing: false, volume: 30, preset: "lofi" },
        climate: { power: false, temperature: 23, mode: "auto" }
      };
    }
    if (!window.AURA.state.user) window.AURA.state.user = { name: "Гость", telegramId: null, role: "owner" };
    if (!window.AURA.state.executionLog) window.AURA.state.executionLog = [];
    if (!window.AURA.dispatch) window.AURA.dispatch = () => {};
  }

  function renderSimpleUI() {
    const app = document.getElementById("app");
    const tabs = document.getElementById("tabs");
    const fab = document.getElementById("aiFab");
    if (!app || !tabs || !fab) return;

    const d = window.AURA.state.devices;

    tabs.innerHTML = `
      <div class="t active" data-t="home">Дом</div>
      <div class="t" data-t="scenes">Сценарии</div>
      <div class="t" data-t="history">История</div>
      <div class="t" data-t="profile">Профиль</div>
      <style>
        #tabs .t{flex:1;text-align:center;padding:12px 10px;border-radius:14px;
          color:rgba(255,255,255,.75);font-weight:700;font-size:13px;}
        #tabs .t.active{background:rgba(123,97,255,.25);color:#fff;border:1px solid rgba(123,97,255,.25)}
      </style>
    `;

    function home() {
      app.innerHTML = `
        <div style="opacity:.85;margin-bottom:10px">AURA X • BOOT OK</div>

        <div style="display:grid;gap:12px">
          ${card("Свет", d.light.power ? "ON" : "OFF", `Яркость: ${d.light.brightness}%`)}
          ${card("Колонка", d.speaker.playing ? "ON" : "OFF", `Громкость: ${d.speaker.volume}%`)}
          ${card("Климат", d.climate.power ? "ON" : "OFF", `Темп: ${d.climate.temperature}°`)}
        </div>
      `;
    }

    function card(title, st, meta) {
      const on = st === "ON";
      return `
        <div style="
          background:#1B1F2A;border:1px solid rgba(255,255,255,.08);
          border-radius:18px;padding:14px;box-shadow:0 20px 50px rgba(0,0,0,.35);
        ">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:800">${title}</div>
            <div style="font-weight:800;color:${on ? "#34C759" : "rgba(255,255,255,.45)"}">${st}</div>
          </div>
          <div style="margin-top:6px;color:rgba(255,255,255,.65);font-size:13px">${meta}</div>
        </div>
      `;
    }

    home();

    tabs.querySelectorAll("[data-t]").forEach(x => {
      x.onclick = () => {
        tabs.querySelectorAll(".t").forEach(t => t.classList.remove("active"));
        x.classList.add("active");
        const k = x.dataset.t;
        if (k === "home") home();
        if (k === "scenes") app.innerHTML = `<div style="opacity:.75">Сценарии скоро ✨</div>`;
        if (k === "history") app.innerHTML = `<div style="opacity:.75">История скоро ✨</div>`;
        if (k === "profile") app.innerHTML = `<div style="opacity:.75">Профиль скоро ✨</div>`;
      };
    });

    fab.onclick = () => {
      alert("AI sheet дальше подключим — сейчас проверяем, что ui.js реально запускается ✅");
    };
  }

  function boot() {
    ensureBaseNodes();
    ensureAURA();
    badge("UI LOADED ✅");

    // render minimal UI immediately
    renderSimpleUI();

    // if your real core loads later, we can refresh view
    let tries = 0;
    const timer = setInterval(() => {
      tries++;
      if (window.AURA?.state?.devices) {
        badge("UI LOADED ✅ core ok");
        renderSimpleUI();
        clearInterval(timer);
      }
      if (tries > 40) { // ~8 seconds
        badge("UI LOADED ✅ (core late)");
        clearInterval(timer);
      }
    }, 200);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();