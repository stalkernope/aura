console.log("AURA X PRO Core loaded");

const tg = window.Telegram?.WebApp;
if (tg) { tg.ready(); tg.expand(); }

const STORAGE_KEY = "aura_x_pro_v1";

function defaultState() {
  return {
    user: {
      name: tg?.initDataUnsafe?.user?.first_name || "Гость",
      role: "owner"
    },

    devices: {
      light: { power: false, brightness: 50 },
      speaker: { playing: false, volume: 30 },
      climate: { power: false, temperature: 23 }
    },

    executionLog: []
  };
}

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultState();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function dispatch(action) {

  switch(action.type) {

    case "TOGGLE":
      if(action.device === "light") {
        state.devices.light.power = !state.devices.light.power;
      }
      if(action.device === "speaker") {
        state.devices.speaker.playing = !state.devices.speaker.playing;
      }
      if(action.device === "climate") {
        state.devices.climate.power = !state.devices.climate.power;
      }
      break;

    case "UPDATE":
      state.devices[action.device] = {
        ...state.devices[action.device],
        ...action.payload
      };
      break;

    case "EXECUTE_PLAN":
      action.plan.forEach(step=>{
        if(step.device==="light") {
          state.devices.light.power = true;
          state.devices.light.brightness = step.brightness || 40;
        }
        if(step.device==="speaker") {
          state.devices.speaker.playing = true;
          state.devices.speaker.volume = step.volume || 25;
        }
        if(step.device==="climate") {
          state.devices.climate.power = true;
          state.devices.climate.temperature = step.temperature || 22;
        }
      });

      state.executionLog.unshift({
        time: new Date().toISOString(),
        intent: action.intent
      });

      break;
  }

  persist();
  if(window.UI) UI.render();
}

window.AURA = { state, dispatch };

console.log("AURA X PRO Core ready");