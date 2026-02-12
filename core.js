console.log("AURA X Core initializing...");

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const FEATURES = {
  AI: true,
  SCHEDULER: true,
  ANALYTICS: true,
  ROOMS: true,
  GUEST_MODE: true
};

const STORAGE_KEY = "aura_x_production_v2";

const Storage = {
  load() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)); } catch { return null; } },
  save(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); },
  reset() { localStorage.removeItem(STORAGE_KEY); }
};

function createInitialState() {
  return {
    version: "X-2.0",
    system: { online: true, startedAt: Date.now() },
    user: { role: "owner", name: "", telegramId: null },
    devices: {
      light: { power: false, brightness: 50, temp: "warm" },
      speaker: { playing: false, volume: 30, preset: "lofi" },
      climate: { power: false, temperature: 23, mode: "auto" }
    },
    scenes: [],
    logs: [],
    history: [],
    analytics: { commandCount: 0 },
    lastCommand: ""
  };
}

let state = Storage.load() || createInitialState();

function persist(){ Storage.save(state); }

function log(text){
  state.logs.unshift({ text, time: new Date().toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}) });
  if(state.logs.length > 30) state.logs.pop();
  persist();
}

function track(){
  if(!FEATURES.ANALYTICS) return;
  state.analytics.commandCount = (state.analytics.commandCount || 0) + 1;
  persist();
}

function dispatch(action){
  switch(action.type){
    case "LOG":
      log(action.payload);
      break;

    case "SET_ROLE":
      state.user.role = action.payload;
      persist();
      break;

    case "SET_LAST_COMMAND":
      state.lastCommand = action.payload || "";
      persist();
      break;

    case "ADD_HISTORY":
      state.history.unshift(action.payload);
      if(state.history.length > 30) state.history.pop();
      persist();
      break;

    case "ADD_SCENE":
      state.scenes.unshift(action.payload);
      persist();
      break;

    case "DELETE_SCENE":
      state.scenes = state.scenes.filter(s => s.id !== action.payload);
      persist();
      break;
  }

  track();

  if(window.UI && typeof window.UI.render === "function"){
    window.UI.render();
  }
}

function schedulerTick(){
  if(!FEATURES.SCHEDULER) return;

  const now = new Date();
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const current = `${hh}:${mm}`;

  // сцену запускаем один раз в минуту
  state.scenes.forEach(scene=>{
    if(scene.time === current){
      log(`Сработала сцена: ${scene.name}`);
      // тут позже будет Transport.send(...)
    }
  });

  persist();
}

setInterval(schedulerTick, 60000);

if(tg && tg.initDataUnsafe?.user){
  state.user.name = tg.initDataUnsafe.user.first_name || "";
  state.user.telegramId = tg.initDataUnsafe.user.id || null;
  persist();
}

window.AURA = { state, dispatch, FEATURES };

console.log("AURA X Core ready");