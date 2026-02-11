/* =========================
   AURA X — CORE ENGINE
========================= */

console.log("AURA X Core initializing...");

/* =========================
   TELEGRAM INIT
========================= */
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
}

/* =========================
   FEATURE FLAGS
========================= */
const FEATURES = {
  AI: true,
  SCHEDULER: true,
  ANALYTICS: true,
  ROOMS: true,
  GUEST_MODE: true,
  VOICE: false,
  POWER_UI: false
};

/* =========================
   STORAGE
========================= */
const STORAGE_KEY = "aura_x_production";

const Storage = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return null;
    }
  },
  save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
};

/* =========================
   INITIAL STATE
========================= */
function createInitialState() {
  return {
    version: "X-1.0",
    system: {
      online: true,
      startedAt: Date.now()
    },
    user: {
      role: "owner",
      name: "",
      telegramId: null
    },
    home: {
      activeRoom: "main",
      rooms: {
        main: {
          name: "Главная",
          devices: {}
        }
      }
    },
    devices: {
      light: { power: false, brightness: 50 },
      speaker: { playing: false, volume: 30 },
      climate: { power: false, temperature: 23 }
    },
    scenes: [],
    logs: [],
    history: [],
    analytics: {
      commandCount: 0
    }
  };
}

let state = Storage.load() || createInitialState();

/* =========================
   SAVE HELPER
========================= */
function persist() {
  Storage.save(state);
}

/* =========================
   LOG SYSTEM
========================= */
function log(text) {
  state.logs.unshift({
    text,
    time: new Date().toLocaleTimeString()
  });

  if (state.logs.length > 30)
    state.logs.pop();

  persist();
}

/* =========================
   ANALYTICS
========================= */
function track(event) {
  if (!FEATURES.ANALYTICS) return;
  state.analytics.commandCount++;
  persist();
}

/* =========================
   ROLE SYSTEM
========================= */
function can(permission) {
  if (state.user.role === "owner") return true;

  const guestPermissions = {
    CONTROL_LIGHT: true,
    CONTROL_SPEAKER: true,
    CONTROL_CLIMATE: false
  };

  return guestPermissions[permission] || false;
}

/* =========================
   DISPATCH SYSTEM
========================= */
function dispatch(action) {

  switch (action.type) {

    case "LOG":
      log(action.payload);
      break;

    case "SET_ROLE":
      state.user.role = action.payload;
      break;

    case "ADD_SCENE":
      state.scenes.push(action.payload);
      break;

    case "SWITCH_ROOM":
      if (state.home.rooms[action.payload])
        state.home.activeRoom = action.payload;
      break;

    case "DEVICE_UPDATE":
      const { device, payload } = action;
      state.devices[device] = {
        ...state.devices[device],
        ...payload
      };
      break;

    case "ADD_HISTORY":
      state.history.unshift(action.payload);
      if (state.history.length > 30)
        state.history.pop();
      break;
  }

  track(action.type);
  persist();

  if (window.UI && typeof window.UI.render === "function") {
    window.UI.render();
  }
}

/* =========================
   SCHEDULER ENGINE
========================= */
function schedulerTick() {
  if (!FEATURES.SCHEDULER) return;

  const now = new Date();
  const currentTime = now.getHours() + ":" + now.getMinutes();

  state.scenes.forEach(scene => {
    if (scene.time === currentTime) {
      log("Сработала сцена: " + scene.name);
    }
  });
}

setInterval(schedulerTick, 60000);

/* =========================
   TELEGRAM USER LOAD
========================= */
if (tg && tg.initDataUnsafe?.user) {
  state.user.name = tg.initDataUnsafe.user.first_name;
  state.user.telegramId = tg.initDataUnsafe.user.id;
  persist();
}

/* =========================
   EXPORT TO WINDOW
========================= */
window.AURA = {
  state,
  dispatch,
  log,
  can,
  FEATURES
};

console.log("AURA X Core ready");