console.log("AURA X Core v3.1 initializing...");

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const STORAGE_KEY = "aura_x_decision_v1";

function createInitialState() {
  return {
    version: "X-3.1-Decision",

    system: { online: true },

    user: {
      role: "owner",
      name: "",
      telegramId: null
    },

    preferences: {
      preferredBrightness: 45,
      preferredVolume: 25,
      nightMode: true
    },

    devices: {
      light: { power: false, brightness: 50, temp: "warm" },
      speaker: { playing: false, volume: 30, preset: "lofi" },
      climate: { power: false, temperature: 23, mode: "auto" }
    },

    history: [],          // последние планы/действия
    logs: [],             // строки логов
    lastPlan: null,       // текущий план
    executionLog: []      // выполненные планы
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const s = JSON.parse(raw);

    // дефолты / миграции
    const base = createInitialState();
    return {
      ...base,
      ...s,
      system: { ...base.system, ...(s.system || {}) },
      user: { ...base.user, ...(s.user || {}) },
      preferences: { ...base.preferences, ...(s.preferences || {}) },
      devices: { ...base.devices, ...(s.devices || {}) },
      history: Array.isArray(s.history) ? s.history : [],
      logs: Array.isArray(s.logs) ? s.logs : [],
      executionLog: Array.isArray(s.executionLog) ? s.executionLog : [],
      lastPlan: s.lastPlan || null
    };
  } catch {
    return createInitialState();
  }
}

let state = loadState();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function log(msg) {
  const t = new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  state.logs.unshift(`${t} — ${msg}`);
  if (state.logs.length > 80) state.logs.pop();
  persist();
}

function can(permission) {
  if (state.user.role === "owner") return true;

  // Гостю даём только “безопасные” штуки
  const guest = {
    CONTROL_LIGHT: true,
    CONTROL_SPEAKER: true,
    CONTROL_CLIMATE: false
  };
  return !!guest[permission];
}

function applyPlan(planObj) {
  if (!planObj || !Array.isArray(planObj.plan)) return;

  planObj.plan.forEach(step => {
    if (step.device === "light" && can("CONTROL_LIGHT")) {
      state.devices.light.power = true;
      if (typeof step.brightness === "number") state.devices.light.brightness = step.brightness;
      if (typeof step.temp === "string") state.devices.light.temp = step.temp;
    }

    if (step.device === "speaker" && can("CONTROL_SPEAKER")) {
      state.devices.speaker.playing = true;
      if (typeof step.volume === "number") state.devices.speaker.volume = step.volume;
      if (typeof step.preset === "string") state.devices.speaker.preset = step.preset;
    }

    if (step.device === "climate" && can("CONTROL_CLIMATE")) {
      state.devices.climate.power = true;
      if (typeof step.temperature === "number") state.devices.climate.temperature = step.temperature;
      if (typeof step.mode === "string") state.devices.climate.mode = step.mode;
    }
  });
}

function dispatch(action) {
  switch (action.type) {
    case "LOG":
      log(String(action.payload || ""));
      break;

    case "SET_ROLE":
      state.user.role = action.payload === "guest" ? "guest" : "owner";
      log(`Роль: ${state.user.role}`);
      persist();
      break;

    case "SET_PREF":
      state.preferences = { ...state.preferences, ...(action.payload || {}) };
      log("Предпочтения обновлены");
      persist();
      break;

    case "DEVICE_UPDATE": {
      const dev = action.device;
      const payload = action.payload || {};
      if (!state.devices[dev]) break;

      // permission guard
      if (dev === "light" && !can("CONTROL_LIGHT")) { log("Гостю нельзя управлять светом"); break; }
      if (dev === "speaker" && !can("CONTROL_SPEAKER")) { log("Гостю нельзя управлять музыкой"); break; }
      if (dev === "climate" && !can("CONTROL_CLIMATE")) { log("Гостю нельзя управлять климатом"); break; }

      state.devices[dev] = { ...state.devices[dev], ...payload };
      persist();
      break;
    }

    case "SET_PLAN":
      state.lastPlan = action.payload || null;
      // короткая запись в историю
      if (state.lastPlan) {
        state.history.unshift({
          type: "plan",
          at: Date.now(),
          intent: state.lastPlan.intent,
          confidence: state.lastPlan.confidence,
          steps: (state.lastPlan.plan || []).length
        });
        if (state.history.length > 60) state.history.pop();
      }
      persist();
      break;

    case "EXECUTE_PLAN":
      if (!state.lastPlan) { log("Нет плана для выполнения"); break; }
      state.executionLog.unshift({ plan: state.lastPlan, time: new Date().toISOString() });
      if (state.executionLog.length > 60) state.executionLog.pop();
      applyPlan(state.lastPlan);
      log("План выполнен ✅");
      persist();
      break;

    default:
      break;
  }

  if (window.UI && typeof window.UI.render === "function") {
    window.UI.render();
  }
}

// Telegram user hydrate
if (tg && tg.initDataUnsafe?.user) {
  state.user.name = tg.initDataUnsafe.user.first_name || "";
  state.user.telegramId = tg.initDataUnsafe.user.id || null;
  persist();
}

window.AURA = { state, dispatch, can };

console.log("AURA X Core v3.1 ready");