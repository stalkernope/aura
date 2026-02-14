/* AURA X PRO — CORE (stable) */
(function(){
  const tg = window.Telegram?.WebApp || null;

  function safe(fn){ try { return fn(); } catch(e){ return null; } }
  function nowISO(){ return new Date().toISOString(); }

  const STORAGE_KEY = "aura_x_pro_state_v2";

  const DEFAULT_STATE = {
    app: { version: "2.0", theme: "dark" },
    user: {
      name: safe(()=>tg.initDataUnsafe.user.first_name) || "Гость",
      username: safe(()=>tg.initDataUnsafe.user.username) || "",
      telegramId: safe(()=>tg.initDataUnsafe.user.id) || 0,
      role: "owner"
    },

    home: {
      name: "Мой дом",
      rooms: [
        { id:"living", name:"Гостиная", devices:["light","speaker"] },
        { id:"bedroom", name:"Спальня", devices:["climate"] }
      ]
    },

    devices: {
      light:   { id:"light",   name:"Свет",    type:"light",   power:false, brightness:50 },
      speaker: { id:"speaker", name:"Колонка", type:"speaker", power:false, volume:30, playing:false },
      climate: { id:"climate", name:"Климат",  type:"climate", power:false, temperature:23 }
    },

    scenes: {
      my: [
        { id:"sc_sleep", name:"Сон",      icon:"💤", intent:"сон",   planHint:"приглушить свет, комфортная температура" },
        { id:"sc_movie", name:"Кино",     icon:"🎬", intent:"кино",  planHint:"свет 20%, тихая громкость" }
      ],
      recommended: [
        { id:"sc_guests", name:"Гости",   icon:"🎉", intent:"гости", planHint:"свет ярче, музыка громче" },
        { id:"sc_work",   name:"Работа",  icon:"💻", intent:"работа",planHint:"свет 70%, нейтральный климат" },
        { id:"sc_clean",  name:"Уборка",  icon:"🧹", intent:"уборка",planHint:"свет 100%, музыка бодрее" }
      ]
    },

    history: [] // {time, type, title, detail}
  };

  function loadState(){
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(DEFAULT_STATE);
    try{
      const parsed = JSON.parse(raw);
      // mild merge to avoid missing keys
      return {
        ...structuredClone(DEFAULT_STATE),
        ...parsed,
        user: { ...structuredClone(DEFAULT_STATE.user), ...(parsed.user||{}) },
        home: { ...structuredClone(DEFAULT_STATE.home), ...(parsed.home||{}) },
        devices: { ...structuredClone(DEFAULT_STATE.devices), ...(parsed.devices||{}) },
        scenes: { ...structuredClone(DEFAULT_STATE.scenes), ...(parsed.scenes||{}) },
        history: Array.isArray(parsed.history) ? parsed.history : []
      };
    }catch(e){
      return structuredClone(DEFAULT_STATE);
    }
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function log(type, title, detail){
    state.history.unshift({ time: nowISO(), type, title, detail: detail||"" });
    if(state.history.length > 120) state.history.length = 120;
  }

  // AI: rule-based (offline) but looks smart
  function generatePlan(intentText){
    const t = (intentText||"").toLowerCase().trim();

    const want = {
      light: { use: false, power: null, brightness: null },
      speaker:{ use:false, power:null, volume:null, playing:null },
      climate:{ use:false, power:null, temperature:null }
    };

    // helpers
    const has = (w)=> t.includes(w);

    // numbers parsing (simple)
    const num = (label)=>{
      // find digits after word or any digits
      const m = t.match(/(\d{1,3})/);
      return m ? parseInt(m[1],10) : null;
    };

    if(has("кино")){
      want.light.use=true;  want.light.power=true; want.light.brightness=20;
      want.speaker.use=true;want.speaker.power=true;want.speaker.playing=true;want.speaker.volume=25;
      want.climate.use=true;want.climate.power=true;want.climate.temperature=22;
    } else if(has("сон") || has("спать")){
      want.light.use=true;  want.light.power=true; want.light.brightness=5;
      want.speaker.use=true;want.speaker.power=false; want.speaker.playing=false;
      want.climate.use=true;want.climate.power=true; want.climate.temperature=21;
    } else if(has("гост")){
      want.light.use=true;  want.light.power=true; want.light.brightness=65;
      want.speaker.use=true;want.speaker.power=true; want.speaker.playing=true; want.speaker.volume=40;
      want.climate.use=true;want.climate.power=true; want.climate.temperature=22;
    } else if(has("работ")){
      want.light.use=true;  want.light.power=true; want.light.brightness=75;
      want.speaker.use=true;want.speaker.power=false; want.speaker.playing=false;
      want.climate.use=true;want.climate.power=true; want.climate.temperature=23;
    } else if(has("уборк") || has("чист")){
      want.light.use=true;  want.light.power=true; want.light.brightness=100;
      want.speaker.use=true;want.speaker.power=true; want.speaker.playing=true; want.speaker.volume=35;
    } else {
      // generic “comfort”
      want.light.use=true; want.light.power=true; want.light.brightness=45;
      want.climate.use=true; want.climate.power=true; want.climate.temperature=23;
    }

    // explicit overrides:
    if(has("свет")){
      want.light.use=true;
      if(has("выкл")) want.light.power=false;
      if(has("вкл")) want.light.power=true;
      const v = num("свет");
      if(v!==null) want.light.brightness = Math.max(0, Math.min(100, v));
    }
    if(has("громк") || has("музык") || has("колон")){
      want.speaker.use=true;
      if(has("выкл")) { want.speaker.power=false; want.speaker.playing=false; }
      if(has("вкл"))  { want.speaker.power=true; want.speaker.playing=true; }
      const v = num("громкость");
      if(v!==null) want.speaker.volume = Math.max(0, Math.min(100, v));
    }
    if(has("темп") || has("климат")){
      want.climate.use=true;
      if(has("выкл")) want.climate.power=false;
      if(has("вкл")) want.climate.power=true;
      const v = num("температура");
      if(v!==null) want.climate.temperature = Math.max(16, Math.min(30, v));
    }

    const steps = [];
    if(want.light.use){
      steps.push({ device:"light", ...want.light });
    }
    if(want.speaker.use){
      steps.push({ device:"speaker", ...want.speaker });
    }
    if(want.climate.use){
      steps.push({ device:"climate", ...want.climate });
    }

    return steps;
  }

  // reducer/dispatch
  let state = loadState();

  function setDevice(id, patch){
    state.devices[id] = { ...state.devices[id], ...patch };
    saveState();
  }

  function dispatch(action){
    try{
      switch(action.type){

        case "BOOT":
          // noop, for future
          break;

        case "SET_TAB":
          state.ui = state.ui || {};
          state.ui.tab = action.tab;
          saveState();
          break;

        case "TOGGLE_POWER": {
          const d = state.devices[action.id];
          if(!d) break;
          const next = !d.power;
          setDevice(action.id, { power: next, ...(d.type==="speaker" ? { playing: next } : {}) });
          log("device", `${d.name}: ${next ? "Вкл" : "Выкл"}`, "");
          break;
        }

        case "SET_RANGE": {
          const d = state.devices[action.id];
          if(!d) break;
          const value = action.value;
          if(d.type==="light")  setDevice(d.id, { brightness:value, power:true });
          if(d.type==="speaker")setDevice(d.id, { volume:value, power:true, playing:true });
          if(d.type==="climate")setDevice(d.id, { temperature:value, power:true });
          log("device", `${d.name}: параметр`, `${value}`);
          break;
        }

        case "RUN_AI": {
          const intent = action.intent || "";
          const plan = generatePlan(intent);

          log("ai", "Intent", intent);

          // Apply plan
          plan.forEach(step=>{
            if(step.device==="light"){
              const patch = {};
              if(step.power!==null) patch.power = step.power;
              if(step.brightness!==null) patch.brightness = step.brightness;
              if(patch.power===true || patch.brightness!==null) patch.power = patch.power ?? true;
              setDevice("light", patch);
            }
            if(step.device==="speaker"){
              const patch = {};
              if(step.power!==null) patch.power = step.power;
              if(step.volume!==null) patch.volume = step.volume;
              if(step.playing!==null) patch.playing = step.playing;
              if(patch.power===true) patch.playing = patch.playing ?? true;
              setDevice("speaker", patch);
            }
            if(step.device==="climate"){
              const patch = {};
              if(step.power!==null) patch.power = step.power;
              if(step.temperature!==null) patch.temperature = step.temperature;
              if(patch.power===true || patch.temperature!==null) patch.power = patch.power ?? true;
              setDevice("climate", patch);
            }
          });

          log("ai", "Execute", `Шагов: ${plan.length}`);
          break;
        }

        case "SET_ROLE":
          state.user.role = action.role;
          saveState();
          log("profile", "Роль", action.role);
          break;

        case "RESET":
          state = structuredClone(DEFAULT_STATE);
          saveState();
          log("system","Reset","ok");
          break;
      }

      window.UI && window.UI.render && window.UI.render();
    }catch(e){
      window.__AURA_FATAL__ = e;
      console.error(e);
      throw e;
    }
  }

  // Telegram init
  try{
    if(tg){
      tg.ready();
      tg.expand();
    }
  }catch(e){}

  window.AURA = {
    get state(){ return state; },
    dispatch,
    generatePlan
  };

  dispatch({type:"BOOT"});
})();