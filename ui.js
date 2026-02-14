console.log("AURA X Premium UI v2 loaded");

const tg = window.Telegram?.WebApp;

function haptic(type = "impact", style = "light") {
  try {
    if (!tg?.HapticFeedback) return;
    if (type === "impact") tg.HapticFeedback.impactOccurred(style);
    if (type === "selection") tg.HapticFeedback.selectionChanged();
    if (type === "notification") tg.HapticFeedback.notificationOccurred(style); // "success"|"warning"|"error"
  } catch {}
}

function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function nowHHMM() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function ensureStyles() {
  if (document.getElementById("aura-premium-styles")) return;
  const style = document.createElement("style");
  style.id = "aura-premium-styles";
  style.textContent = `
    :root{
      --bg:#0F1115;
      --bg2:#121620;
      --card:#1B1F2A;
      --card2:#202535;
      --line:rgba(255,255,255,.07);
      --txt:#F2F4F8;
      --muted:#9AA3B2;
      --accent:#5E8BFF;
      --accent2:#7B61FF;
      --ok:#34C759;
      --warn:#FF9F0A;
      --danger:#FF453A;
      --shadow:0 20px 50px rgba(0,0,0,.45);
      --r:18px;
    }

    /* subtle entrance */
    .aura-fade-in{ animation: auraFadeIn .28s ease-out both; }
    @keyframes auraFadeIn{ from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)}}

    /* device cards */
    .aura-devGrid{ display:grid; grid-template-columns:1fr; gap:12px; }
    .aura-devCard{
      background: var(--card);
      border:1px solid var(--line);
      border-radius: var(--r);
      padding:14px;
      box-shadow: var(--shadow);
      position:relative;
      overflow:hidden;
      transition: transform .15s ease;
    }
    .aura-devCard:active{ transform: scale(.99); }
    .aura-devTop{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .aura-devTitle{ font-weight:700; letter-spacing:.01em; }
    .aura-devMeta{ margin-top:3px; font-size:12px; color:var(--muted); }
    .aura-devGlow{
      position:absolute; inset:-40px -40px auto auto;
      width:180px; height:180px; border-radius:50%;
      filter: blur(25px); opacity:0; transition: opacity .25s ease;
      background: radial-gradient(circle at 30% 30%, rgba(94,139,255,.55), rgba(123,97,255,0));
      pointer-events:none;
    }
    .aura-on .aura-devGlow{ opacity:1; }
    .aura-row{ display:flex; align-items:center; justify-content:space-between; gap:10px; margin-top:10px; }
    .aura-chip{
      font-size:12px; color:var(--muted);
      padding:6px 10px; border-radius:999px;
      background: var(--card2); border:1px solid var(--line);
    }

    /* iOS-ish switch */
    .aura-switch{ position:relative; width:46px; height:28px; flex:0 0 auto; }
    .aura-switch input{ display:none; }
    .aura-track{
      position:absolute; inset:0; border-radius:999px;
      background: rgba(255,255,255,.12);
      border:1px solid var(--line);
      transition:.2s;
    }
    .aura-thumb{
      position:absolute; top:3px; left:3px;
      width:22px; height:22px; border-radius:50%;
      background: rgba(255,255,255,.92);
      box-shadow: 0 6px 16px rgba(0,0,0,.35);
      transition:.2s;
    }
    .aura-switch input:checked ~ .aura-track{
      background: rgba(94,139,255,.85);
      border-color: rgba(94,139,255,.6);
    }
    .aura-switch input:checked ~ .aura-thumb{ transform: translateX(18px); }

    /* mini control buttons */
    .aura-miniBtn{
      border:none; color:var(--txt);
      background: var(--card2);
      border:1px solid var(--line);
      border-radius: 14px;
      padding:10px 12px;
      font-weight:600;
      cursor:pointer;
    }

    /* overlay + bottom sheet */
    .aura-overlay{
      position:fixed; inset:0;
      background: rgba(0,0,0,.42);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      opacity:0; pointer-events:none;
      transition:.25s;
      z-index:60;
    }
    .aura-overlay.open{ opacity:1; pointer-events:auto; }

    .aura-sheet{
      position:fixed; left:0; right:0; bottom:0;
      background: var(--card);
      border-top-left-radius: 24px;
      border-top-right-radius: 24px;
      border-top: 1px solid var(--line);
      box-shadow: 0 -18px 60px rgba(0,0,0,.65);
      transform: translateY(105%);
      transition:.28s ease;
      z-index:70;
      padding: 16px 16px calc(18px + env(safe-area-inset-bottom));
    }
    .aura-sheet.open{ transform: translateY(0); }

    .aura-sheetHead{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
    .aura-sheetTitle{ font-size:16px; font-weight:800; }
    .aura-x{
      width:34px; height:34px; border-radius:10px;
      background: var(--card2); border:1px solid var(--line);
      display:flex; align-items:center; justify-content:center;
      cursor:pointer;
    }

    .aura-input{
      margin-top:12px;
      width:100%;
      background: var(--card2);
      border:1px solid var(--line);
      border-radius: 14px;
      padding: 14px;
      color: var(--txt);
      font-size: 14px;
      outline:none;
    }

    .aura-primary{
      margin-top:10px; width:100%;
      border:none; border-radius: 14px;
      padding: 12px 14px;
      color: white; font-weight:800;
      background: linear-gradient(90deg, var(--accent2), var(--accent));
      box-shadow: 0 14px 30px rgba(94,139,255,.28);
      cursor:pointer;
    }
    .aura-secondary{
      margin-top:10px; width:100%;
      border:none; border-radius: 14px;
      padding: 12px 14px;
      color: var(--txt); font-weight:700;
      background: var(--card2);
      border: 1px solid var(--line);
      cursor:pointer;
    }

    /* slider */
    .aura-sliderWrap{ margin-top:14px; }
    .aura-sliderLabel{ font-size:12px; color:var(--muted); display:flex; justify-content:space-between; }
    .aura-range{ width:100%; margin-top:10px; }

    /* toast */
    .aura-toast{
      position:fixed; left:50%; bottom: 96px;
      transform: translateX(-50%) translateY(10px);
      background: rgba(28,32,45,.9);
      border:1px solid var(--line);
      color: var(--txt);
      padding: 10px 12px;
      border-radius: 14px;
      box-shadow: 0 20px 60px rgba(0,0,0,.55);
      opacity:0;
      transition:.25s;
      z-index:90;
      font-size:13px;
      max-width: calc(100% - 28px);
      text-align:center;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
    }
    .aura-toast.show{
      opacity:1;
      transform: translateX(-50%) translateY(0);
    }

    /* typing */
    .aura-typing{
      display:inline-block;
      border-right: 2px solid rgba(255,255,255,.35);
      padding-right:3px;
      animation: auraBlink 1s infinite;
    }
    @keyframes auraBlink{ 0%,49%{border-color:rgba(255,255,255,.35)} 50%,100%{border-color:transparent} }

    /* recommendation card */
    .aura-rec{
      background: linear-gradient(180deg, rgba(94,139,255,.12), rgba(123,97,255,.06));
      border:1px solid rgba(94,139,255,.22);
    }
    .aura-recTitle{ font-weight:800; }
    .aura-recText{ margin-top:6px; color: var(--muted); font-size:13px; line-height:1.35; }
    .aura-recActions{ margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; }
  `;
  document.head.appendChild(style);
}

function toast(msg) {
  let el = document.getElementById("auraToast");
  if (!el) {
    el = document.createElement("div");
    el.id = "auraToast";
    el.className = "aura-toast";
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 1600);
}

function getSubtitleEl() { return document.getElementById("subtitle"); }
function setSubtitle(text) { const el = getSubtitleEl(); if (el) el.textContent = text; }

/* ---------------- AI helpers ---------------- */

function fallbackPlanFromText(text) {
  const t = (text || "").toLowerCase();

  // very simple “AI” offline
  const plan = [];
  let intent = "Пользовательский режим";
  let confidence = 0.62;

  const has = (w) => t.includes(w);

  if (has("кино") || has("фильм")) {
    intent = "Кино";
    confidence = 0.86;
    plan.push({ device:"light", brightness: 20, temp:"warm" });
    plan.push({ device:"speaker", volume: 25, preset:"cinema" });
  } else if (has("сон") || has("спать") || has("ноч")) {
    intent = "Сон";
    confidence = 0.86;
    plan.push({ device:"light", brightness: 5, temp:"warm" });
    plan.push({ device:"speaker", volume: 10, preset:"sleep" });
    plan.push({ device:"climate", temperature: 21, mode:"auto" });
  } else if (has("работ") || has("фокус")) {
    intent = "Работа";
    confidence = 0.82;
    plan.push({ device:"light", brightness: 60, temp:"neutral" });
    plan.push({ device:"speaker", volume: 18, preset:"focus" });
  } else if (has("гост") || has("вечерин")) {
    intent = "Гости";
    confidence = 0.80;
    plan.push({ device:"light", brightness: 55, temp:"warm" });
    plan.push({ device:"speaker", volume: 40, preset:"party" });
  } else if (has("релакс") || has("устал") || has("спокой")) {
    intent = "Релакс";
    confidence = 0.80;
    plan.push({ device:"light", brightness: 30, temp:"warm" });
    plan.push({ device:"speaker", volume: 20, preset:"lofi" });
    plan.push({ device:"climate", temperature: 22, mode:"auto" });
  } else {
    // heuristic based on time
    const hh = new Date().getHours();
    if (hh >= 22 || hh <= 6) {
      intent = "Ночь";
      confidence = 0.72;
      plan.push({ device:"light", brightness: 8, temp:"warm" });
      plan.push({ device:"speaker", volume: 10, preset:"sleep" });
    } else {
      intent = "Комфорт";
      confidence = 0.70;
      plan.push({ device:"light", brightness: 45, temp:"warm" });
      plan.push({ device:"speaker", volume: 22, preset:"lofi" });
    }
  }

  return { intent, confidence, plan };
}

function generatePlan(text) {
  // If user has ai.js with AI.generate(text) we use it.
  try {
    if (window.AI && typeof window.AI.generate === "function") {
      const p = window.AI.generate(text);
      if (p && Array.isArray(p.plan)) return p;
    }
  } catch {}
  return fallbackPlanFromText(text);
}

/* ---------------- Smart recommendations (local) ---------------- */

function computeRecommendations() {
  const recs = [];

  // Use executionLog if exists (core v3.1 has it)
  const log = AURA?.state?.executionLog || [];
  const hour = new Date().getHours();

  // Simple pattern: if user executed "Кино" >= 2 times, recommend auto-scene
  const countByIntent = log.reduce((acc, x) => {
    const k = x?.plan?.intent || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  if ((countByIntent["Кино"] || 0) >= 2) {
    recs.push({
      title: "Авто-сценарий «Кино»",
      text: "Похоже, ты часто включаешь кино-режим. Могу предложить авто-сценарий по времени или по кнопке.",
      actions: [
        { label:"Создать как сцену", type:"SAVE_SCENE", payload:{ intent:"Кино" } },
        { label:"Не сейчас", type:"DISMISS" }
      ]
    });
  }

  // Evening suggestion
  if (hour >= 19 && hour <= 23) {
    recs.push({
      title: "Вечерний комфорт",
      text: "Могу подготовить мягкий свет и спокойный плейлист. Одним тапом.",
      actions: [
        { label:"Сформировать", type:"AI_QUICK", payload:"уютный вечер" },
        { label:"Скрыть", type:"DISMISS" }
      ]
    });
  }

  // If devices are all off, suggest quick start
  const d = AURA?.state?.devices;
  if (d && !d.light.power && !d.speaker.playing && !d.climate.power) {
    recs.push({
      title: "Дом сейчас «тихий»",
      text: "Хочешь быстро включить базовый комфорт? Свет 40%, музыка тихо, климат авто.",
      actions: [
        { label:"Применить", type:"AI_QUICK", payload:"комфорт" }
      ]
    });
  }

  return recs.slice(0, 2);
}

/* ---------------- UI ---------------- */

const UI = {
  tab: "home",
  overlay: null,
  sheet: null,
  sheetMode: null, // "ai" | "control"
  typingTimer: null,

  init() {
    ensureStyles();

    this.renderTabs();
    this.bindFab();
    this.render();
  },

  tabs: [
    { key: "home", title: "Дом" },
    { key: "scenes", title: "Сценарии" },
    { key: "history", title: "История" },
    { key: "profile", title: "Профиль" }
  ],

  renderTabs() {
    const wrap = document.getElementById("tabs");
    if (!wrap) return;

    wrap.innerHTML = this.tabs
      .map(t => `<div class="tab ${this.tab === t.key ? "active" : ""}" data-tab="${t.key}">${t.title}</div>`)
      .join("");

    wrap.querySelectorAll("[data-tab]").forEach(el => {
      el.onclick = () => {
        haptic("selection");
        this.tab = el.dataset.tab;
        this.renderTabs();
        this.render();
      };
    });
  },

  render() {
    const root = document.getElementById("app");
    if (!root) return;

    if (this.tab === "home") {
      setSubtitle("Мой дом");
      root.innerHTML = this.renderHome();
      this.bindHome();
    }
    if (this.tab === "scenes") {
      setSubtitle("Сценарии");
      root.innerHTML = this.renderScenes();
      this.bindScenes();
    }
    if (this.tab === "history") {
      setSubtitle("История");
      root.innerHTML = this.renderHistory();
    }
    if (this.tab === "profile") {
      setSubtitle("Профиль");
      root.innerHTML = this.renderProfile();
      this.bindProfile();
    }
  },

  renderHome() {
    const d = AURA.state.devices;
    const recs = computeRecommendations();

    const recHtml = recs.length ? `
      <div class="section aura-fade-in">
        <h3>Рекомендации</h3>
        ${recs.map((r, idx) => `
          <div class="card aura-rec" data-rec="${idx}">
            <div class="aura-recTitle">${r.title}</div>
            <div class="aura-recText">${r.text}</div>
            <div class="aura-recActions">
              ${(r.actions||[]).map((a, i) => `
                <button class="aura-miniBtn" data-rec-act="${idx}:${i}">${a.label}</button>
              `).join("")}
            </div>
          </div>
        `).join("")}
      </div>
    ` : "";

    return `
      ${recHtml}

      <div class="section aura-fade-in">
        <h3>Комнаты</h3>
        <div class="grid-rooms">
          <div class="room-card">
            <div class="room-title">Гостиная</div>
            <div class="room-meta">${(d.light.power || d.speaker.playing) ? "2 устройства доступны" : "Готово к запуску"}</div>
            <div class="device-row">
              <span>Свет</span>
              <span class="${d.light.power ? "device-on" : "device-off"}">${d.light.power ? "Вкл" : "Выкл"}</span>
            </div>
            <div class="device-row">
              <span>Музыка</span>
              <span class="${d.speaker.playing ? "device-on" : "device-off"}">${d.speaker.playing ? "Играет" : "Остановлена"}</span>
            </div>
          </div>

          <div class="room-card">
            <div class="room-title">Спальня</div>
            <div class="room-meta">Климат</div>
            <div class="device-row">
              <span>Температура</span>
              <span>${d.climate.temperature}°</span>
            </div>
          </div>
        </div>
      </div>

      <div class="section aura-fade-in">
        <h3>Устройства</h3>
        <div class="aura-devGrid">
          ${this.deviceCard("light")}
          ${this.deviceCard("speaker")}
          ${this.deviceCard("climate")}
        </div>
      </div>
    `;
  },

  deviceCard(type) {
    const d = AURA.state.devices[type];
    const isOn = (type === "light") ? d.power : (type === "speaker") ? d.playing : d.power;

    const title = (type === "light") ? "Свет" : (type === "speaker") ? "Колонка" : "Климат";
    const meta = (type === "light")
      ? `Яркость ${d.brightness}% • ${d.temp}`
      : (type === "speaker")
        ? `Громкость ${d.volume}% • ${d.preset}`
        : `Темп. ${d.temperature}° • ${d.mode}`;

    const chip = (type === "light")
      ? `${d.brightness}%`
      : (type === "speaker")
        ? `${d.volume}%`
        : `${d.temperature}°`;

    return `
      <div class="aura-devCard ${isOn ? "aura-on" : ""}" data-dev="${type}">
        <div class="aura-devGlow"></div>

        <div class="aura-devTop">
          <div>
            <div class="aura-devTitle">${title}</div>
            <div class="aura-devMeta">${meta}</div>
          </div>

          <label class="aura-switch">
            <input type="checkbox" ${isOn ? "checked" : ""} data-dev-toggle="${type}">
            <span class="aura-track"></span>
            <span class="aura-thumb"></span>
          </label>
        </div>

        <div class="aura-row">
          <span class="aura-chip">${chip}</span>
          <button class="aura-miniBtn" data-dev-control="${type}">Настроить</button>
        </div>
      </div>
    `;
  },

  bindHome() {
    // recommendation actions
    document.querySelectorAll("[data-rec-act]").forEach(btn => {
      btn.onclick = () => {
        haptic("selection");
        const [ri, ai] = btn.dataset.recAct.split(":").map(Number);
        const recs = computeRecommendations();
        const act = recs[ri]?.actions?.[ai];
        if (!act) return;

        if (act.type === "AI_QUICK") {
          this.openAI(act.payload);
        } else if (act.type === "SAVE_SCENE") {
          toast("Сцены скоро: сохранили как «идею» ✅");
          AURA.dispatch({ type:"LOG", payload:`Идея сцены: ${act.payload.intent}` });
        } else {
          toast("Ок");
        }
      };
    });

    // toggles
    document.querySelectorAll("[data-dev-toggle]").forEach(inp => {
      inp.onchange = () => {
        const dev = inp.dataset.devToggle;
        haptic("impact", "light");

        if (dev === "light") {
          AURA.dispatch({ type:"DEVICE_UPDATE", device:"light", payload:{ power: inp.checked } });
          toast(inp.checked ? "Свет включён" : "Свет выключен");
        }
        if (dev === "speaker") {
          AURA.dispatch({ type:"DEVICE_UPDATE", device:"speaker", payload:{ playing: inp.checked } });
          toast(inp.checked ? "Музыка играет" : "Музыка остановлена");
        }
        if (dev === "climate") {
          AURA.dispatch({ type:"DEVICE_UPDATE", device:"climate", payload:{ power: inp.checked } });
          toast(inp.checked ? "Климат включён" : "Климат выключен");
        }

        this.render(); // re-render to update glows/metas
      };
    });

    // controls
    document.querySelectorAll("[data-dev-control]").forEach(btn => {
      btn.onclick = () => {
        const dev = btn.dataset.devControl;
        haptic("impact", "light");
        this.openControl(dev);
      };
    });
  },

  renderScenes() {
    return `
      <div class="section aura-fade-in">
        <h3>Мои</h3>
        <div class="card">Пока пусто. Создавай сцены из AI-плана.</div>
      </div>

      <div class="section aura-fade-in">
        <h3>Рекомендованные</h3>
        <div class="card aura-rec">
          <div class="aura-recTitle">«Кино» одним тапом</div>
          <div class="aura-recText">Мягкий свет и звук — готово для фильма.</div>
          <div class="aura-recActions">
            <button class="aura-miniBtn" id="sceneQuickCinema">Сформировать</button>
          </div>
        </div>

        <div class="card aura-rec" style="margin-top:12px">
          <div class="aura-recTitle">«Сон»</div>
          <div class="aura-recText">Приглушить свет, тише музыку, комфортная температура.</div>
          <div class="aura-recActions">
            <button class="aura-miniBtn" id="sceneQuickSleep">Сформировать</button>
          </div>
        </div>
      </div>
    `;
  },

  bindScenes() {
    const a = document.getElementById("sceneQuickCinema");
    const b = document.getElementById("sceneQuickSleep");
    if (a) a.onclick = () => this.openAI("кино");
    if (b) b.onclick = () => this.openAI("сон");
  },

  renderHistory() {
    const exec = AURA.state.executionLog || [];
    const items = exec.slice(0, 20).map(x => {
      const t = new Date(x.time).toLocaleTimeString("ru-RU", { hour:"2-digit", minute:"2-digit" });
      const conf = Math.round((x.plan.confidence || 0) * 100);
      return `<div class="card aura-fade-in">${t} — ${x.plan.intent} • ${conf}%</div>`;
    }).join("");

    return `
      <div class="section aura-fade-in">
        <h3>События</h3>
        ${items || `<div class="card">Пока событий нет. Сформируй план в AI и нажми “Применить”.</div>`}
      </div>
    `;
  },

  renderProfile() {
    const u = AURA.state.user || {};
    const role = u.role || "owner";
    return `
      <div class="section aura-fade-in">
        <h3>Аккаунт</h3>
        <div class="card">
          <div style="font-weight:800; font-size:16px;">${u.name || "Гость"}</div>
          <div style="color:var(--muted); margin-top:6px;">ID: ${u.telegramId ?? "—"}</div>
          <div style="color:var(--muted); margin-top:6px;">Роль: <b style="color:var(--txt)">${role}</b></div>

          <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
            <button class="aura-miniBtn" id="roleOwner">Owner</button>
            <button class="aura-miniBtn" id="roleGuest">Guest</button>
          </div>

          <div style="margin-top:12px; color:var(--muted); font-size:13px;">
            Советы: гостю можно управлять светом и музыкой (без климата).
          </div>
        </div>
      </div>

      <div class="section aura-fade-in">
        <h3>Система</h3>
        <div class="card">
          <div style="color:var(--muted); font-size:13px;">Версия UI</div>
          <div style="font-weight:800;">Premium v2 • ${nowHHMM()}</div>
        </div>
      </div>
    `;
  },

  bindProfile() {
    const o = document.getElementById("roleOwner");
    const g = document.getElementById("roleGuest");
    if (o) o.onclick = () => { haptic("selection"); AURA.dispatch({ type:"SET_ROLE", payload:"owner" }); toast("Роль: owner"); this.render(); };
    if (g) g.onclick = () => { haptic("selection"); AURA.dispatch({ type:"SET_ROLE", payload:"guest" }); toast("Роль: guest"); this.render(); };
  },

  /* ---------- Overlay & Sheets ---------- */

  ensureOverlayAndSheet() {
    if (!this.overlay) {
      this.overlay = document.createElement("div");
      this.overlay.className = "aura-overlay";
      this.overlay.onclick = () => this.closeSheet();
      document.body.appendChild(this.overlay);
    }
    if (!this.sheet) {
      this.sheet = document.createElement("div");
      this.sheet.className = "aura-sheet";
      document.body.appendChild(this.sheet);
    }
  },

  openSheet(html) {
    this.ensureOverlayAndSheet();
    this.sheet.innerHTML = html;
    this.overlay.classList.add("open");
    this.sheet.classList.add("open");
    haptic("impact", "light");
  },

  closeSheet() {
    if (!this.overlay || !this.sheet) return;
    this.overlay.classList.remove("open");
    this.sheet.classList.remove("open");
    haptic("selection");
    if (this.typingTimer) { clearInterval(this.typingTimer); this.typingTimer = null; }
  },

  /* ---------- AI Sheet ---------- */

  bindFab() {
    const fab = document.getElementById("aiFab");
    if (!fab) return;
    fab.onclick = () => this.openAI("");
  },

  openAI(prefill = "") {
    this.openSheet(`
      <div class="aura-sheetHead">
        <div class="aura-sheetTitle">AI Центр</div>
        <div class="aura-x" id="sheetClose">✕</div>
      </div>

      <input class="aura-input" id="aiText" placeholder="Например: уютный вечер / кино / сон" value="${String(prefill).replace(/"/g,'&quot;')}" />
      <button class="aura-primary" id="aiGo">Сформировать план</button>

      <div class="card" style="margin-top:12px; background:var(--card2); border:1px solid var(--line); box-shadow:none;">
        <div style="font-size:12px; color:var(--muted);">Ответ AI</div>
        <div id="aiAnswer" style="margin-top:8px; font-weight:700;">Введите запрос — и я предложу план.</div>
      </div>

      <div id="aiPlanWrap"></div>
    `);

    const close = document.getElementById("sheetClose");
    const aiText = document.getElementById("aiText");
    const aiGo = document.getElementById("aiGo");

    close.onclick = () => this.closeSheet();

    aiGo.onclick = () => {
      const text = (aiText.value || "").trim();
      if (!text) { toast("Напиши запрос 🙂"); haptic("notification","warning"); return; }
      this.runAI(text);
    };

    // enter key
    aiText.onkeydown = (e) => {
      if (e.key === "Enter") aiGo.click();
    };

    if (prefill) {
      setTimeout(() => aiGo.click(), 120);
    }
  },

  typeText(el, fullText, done) {
    if (!el) return;
    if (this.typingTimer) clearInterval(this.typingTimer);

    const text = String(fullText || "");
    let i = 0;
    el.innerHTML = `<span class="aura-typing"></span>`;
    const cursor = el.querySelector(".aura-typing");

    this.typingTimer = setInterval(() => {
      i++;
      cursor.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(this.typingTimer);
        this.typingTimer = null;
        // remove cursor effect after done
        el.innerHTML = text;
        done && done();
      }
    }, 12);
  },

  runAI(text) {
    const ans = document.getElementById("aiAnswer");
    const wrap = document.getElementById("aiPlanWrap");

    haptic("impact", "medium");

    // generate plan
    const plan = generatePlan(text);
    try { AURA.dispatch({ type:"SET_PLAN", payload: plan }); } catch {}

    // nice answer text
    const confidence = Math.round((plan.confidence || 0.7) * 100);
    const responseText =
      `Понял: «${plan.intent}». Уверенность ${confidence}%. ` +
      `Собрал план из ${plan.plan.length} шаг(ов). Можешь применить или отредактировать.`;

    this.typeText(ans, responseText, () => haptic("notification","success"));

    // build editable plan cards
    wrap.innerHTML = `
      <div class="section aura-fade-in" style="margin-top:14px;">
        <h3>План</h3>
        ${plan.plan.map((s, idx) => this.planStepCard(s, idx)).join("")}
        <button class="aura-primary" id="applyPlan">Применить</button>
        <button class="aura-secondary" id="saveIdea">Сохранить как сценарий (идея)</button>
      </div>
    `;

    // bind step toggles (soft edit)
    wrap.querySelectorAll("[data-step-toggle]").forEach(inp => {
      inp.onchange = () => {
        haptic("selection");
        const i = Number(inp.dataset.stepToggle);
        const newPlan = structuredClone(AURA.state.lastPlan);
        if (!newPlan || !Array.isArray(newPlan.plan)) return;
        newPlan.plan[i].disabled = !inp.checked;
        AURA.dispatch({ type:"SET_PLAN", payload: newPlan });
        toast(inp.checked ? "Шаг включён" : "Шаг выключен");
      };
    });

    // bind sliders
    wrap.querySelectorAll("[data-step-slider]").forEach(r => {
      r.oninput = () => {
        const i = Number(r.dataset.stepSlider);
        const key = r.dataset.stepKey;
        const val = Number(r.value);
        const newPlan = structuredClone(AURA.state.lastPlan);
        if (!newPlan || !Array.isArray(newPlan.plan)) return;
        newPlan.plan[i][key] = val;
        AURA.dispatch({ type:"SET_PLAN", payload: newPlan });
      };
      r.onchange = () => haptic("impact","light");
    });

    document.getElementById("applyPlan").onclick = () => {
      haptic("impact","heavy");
      AURA.dispatch({ type:"EXECUTE_PLAN" });
      toast("План выполнен ✅");
      this.closeSheet();
      this.render(); // refresh home cards
    };

    document.getElementById("saveIdea").onclick = () => {
      toast("Сцены скоро: сохранили как идею ✅");
      AURA.dispatch({ type:"LOG", payload:`Идея сценария: ${plan.intent}` });
    };
  },

  planStepCard(step, idx) {
    const dev = step.device;
    const title = (dev === "light") ? "Свет" : (dev === "speaker") ? "Колонка" : "Климат";

    const isDisabled = !!step.disabled;

    const controls = [];
    if (dev === "light" && typeof step.brightness === "number") {
      controls.push(this.slider("Яркость", idx, "brightness", step.brightness, 1, 100));
    }
    if (dev === "speaker" && typeof step.volume === "number") {
      controls.push(this.slider("Громкость", idx, "volume", step.volume, 0, 100));
    }
    if (dev === "climate" && typeof step.temperature === "number") {
      controls.push(this.slider("Температура", idx, "temperature", step.temperature, 16, 30));
    }

    const meta =
      (dev === "light")
        ? `Яркость ${step.brightness ?? "—"}%`
        : (dev === "speaker")
          ? `Громкость ${step.volume ?? "—"}%`
          : `Темп. ${step.temperature ?? "—"}°`;

    return `
      <div class="aura-devCard aura-fade-in ${!isDisabled ? "aura-on" : ""}" style="box-shadow:none; margin-top:12px;">
        <div class="aura-devGlow"></div>

        <div class="aura-devTop">
          <div>
            <div class="aura-devTitle">${title}</div>
            <div class="aura-devMeta">${meta}</div>
          </div>

          <label class="aura-switch">
            <input type="checkbox" ${!isDisabled ? "checked" : ""} data-step-toggle="${idx}">
            <span class="aura-track"></span>
            <span class="aura-thumb"></span>
          </label>
        </div>

        ${controls.join("")}
      </div>
    `;
  },

  slider(label, idx, key, value, min, max) {
    const v = clamp(Number(value), min, max);
    return `
      <div class="aura-sliderWrap">
        <div class="aura-sliderLabel">
          <span>${label}</span><span>${v}${key==="temperature"?"°":"%"}</span>
        </div>
        <input class="aura-range" type="range" min="${min}" max="${max}" value="${v}"
          data-step-slider="${idx}" data-step-key="${key}">
      </div>
    `;
  },

  /* ---------- Device control sheet ---------- */

  openControl(dev) {
    const d = AURA.state.devices[dev];
    const title = (dev === "light") ? "Свет" : (dev === "speaker") ? "Колонка" : "Климат";

    let body = "";
    if (dev === "light") {
      body = `
        <div class="aura-sliderWrap">
          <div class="aura-sliderLabel"><span>Яркость</span><span id="val">${d.brightness}%</span></div>
          <input class="aura-range" id="range" type="range" min="1" max="100" value="${d.brightness}">
        </div>
        <button class="aura-secondary" id="tempWarm">Тёплый</button>
        <button class="aura-secondary" id="tempNeutral">Нейтральный</button>
      `;
    }
    if (dev === "speaker") {
      body = `
        <div class="aura-sliderWrap">
          <div class="aura-sliderLabel"><span>Громкость</span><span id="val">${d.volume}%</span></div>
          <input class="aura-range" id="range" type="range" min="0" max="100" value="${d.volume}">
        </div>
        <button class="aura-secondary" id="presetLofi">Lo-Fi</button>
        <button class="aura-secondary" id="presetFocus">Focus</button>
        <button class="aura-secondary" id="presetCinema">Cinema</button>
      `;
    }
    if (dev === "climate") {
      body = `
        <div class="aura-sliderWrap">
          <div class="aura-sliderLabel"><span>Температура</span><span id="val">${d.temperature}°</span></div>
          <input class="aura-range" id="range" type="range" min="16" max="30" value="${d.temperature}">
        </div>
        <button class="aura-secondary" id="modeAuto">Auto</button>
        <button class="aura-secondary" id="modeCool">Cool</button>
        <button class="aura-secondary" id="modeHeat">Heat</button>
      `;
    }

    this.openSheet(`
      <div class="aura-sheetHead">
        <div class="aura-sheetTitle">${title}</div>
        <div class="aura-x" id="sheetClose">✕</div>
      </div>

      ${body}

      <button class="aura-primary" id="done">Готово</button>
    `);

    document.getElementById("sheetClose").onclick = () => this.closeSheet();
    document.getElementById("done").onclick = () => { this.closeSheet(); this.render(); };

    const range = document.getElementById("range");
    const val = document.getElementById("val");

    if (range && val) {
      range.oninput = () => {
        const v = Number(range.value);
        val.textContent = `${v}${dev === "climate" ? "°" : "%"}`;
        if (dev === "light") AURA.dispatch({ type:"DEVICE_UPDATE", device:"light", payload:{ brightness:v } });
        if (dev === "speaker") AURA.dispatch({ type:"DEVICE_UPDATE", device:"speaker", payload:{ volume:v } });
        if (dev === "climate") AURA.dispatch({ type:"DEVICE_UPDATE", device:"climate", payload:{ temperature:v } });
      };
      range.onchange = () => haptic("impact","light");
    }

    // buttons
    if (dev === "light") {
      const w = document.getElementById("tempWarm");
      const n = document.getElementById("tempNeutral");
      if (w) w.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"light", payload:{ temp:"warm" } }); toast("Тёплый свет"); };
      if (n) n.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"light", payload:{ temp:"neutral" } }); toast("Нейтральный свет"); };
    }

    if (dev === "speaker") {
      const l = document.getElementById("presetLofi");
      const f = document.getElementById("presetFocus");
      const c = document.getElementById("presetCinema");
      if (l) l.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"speaker", payload:{ preset:"lofi" } }); toast("Preset: Lo-Fi"); };
      if (f) f.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"speaker", payload:{ preset:"focus" } }); toast("Preset: Focus"); };
      if (c) c.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"speaker", payload:{ preset:"cinema" } }); toast("Preset: Cinema"); };
    }

    if (dev === "climate") {
      const a = document.getElementById("modeAuto");
      const co = document.getElementById("modeCool");
      const h = document.getElementById("modeHeat");
      if (a) a.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"climate", payload:{ mode:"auto" } }); toast("Режим: Auto"); };
      if (co) co.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"climate", payload:{ mode:"cool" } }); toast("Режим: Cool"); };
      if (h) h.onclick = () => { haptic("selection"); AURA.dispatch({ type:"DEVICE_UPDATE", device:"climate", payload:{ mode:"heat" } }); toast("Режим: Heat"); };
    }
  }
};

window.UI = UI;

// Re-render hook (core calls UI.render())
if (!window.UI.render) window.UI.render = () => UI.render();

UI.init();
toast("Premium UI v2 ✅");