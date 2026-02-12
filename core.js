console.log("AURA X Core v3 initializing...");

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const STORAGE_KEY = "aura_x_decision_v1";

function createInitialState() {
  return {
    version: "X-3.0-Decision",

    system: {
      online: true
    },

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
      climate: { power: false, temperature: 23 }
    },

    history: [],
    logs: [],

    lastPlan: null,
    executionLog: []
  };
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || createInitialState();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function dispatch(action) {

  switch(action.type) {

    case "SET_PLAN":
      state.lastPlan = action.payload;
      persist();
      break;

    case "EXECUTE_PLAN":
      state.executionLog.unshift({
        plan: state.lastPlan,
        time: new Date().toISOString()
      });

      applyPlan(state.lastPlan);
      persist();
      break;

    case "LOG":
      state.logs.unshift(action.payload);
      if (state.logs.length > 50) state.logs.pop();
      persist();
      break;
  }

  if (window.UI) UI.render();
}

function applyPlan(plan) {
  if (!plan || !plan.plan) return;

  plan.plan.forEach(step => {
    if (step.device === "light") {
      state.devices.light.power = true;
      state.devices.light.brightness = step.brightness;
      state.devices.light.temp = step.temp;
    }

    if (step.device === "speaker") {
      state.devices.speaker.playing = true;
      state.devices.speaker.volume = step.volume;
      state.devices.speaker.preset = step.preset;
    }

    if (step.device === "climate") {
      state.devices.climate.power = true;
      state.devices.climate.temperature = step.temperature;
    }
  });
}

if (tg && tg.initDataUnsafe?.user) {
  state.user.name = tg.initDataUnsafe.user.first_name;
  state.user.telegramId = tg.initDataUnsafe.user.id;
  persist();
}

window.AURA = { state, dispatch };

console.log("AURA X Core v3 ready");