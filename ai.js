console.log("AURA X AI initializing...");

const AI = {
  detectIntent(text){
    const t = (text||"").toLowerCase();
    if(t.includes("кино") || t.includes("фильм") || t.includes("сериал")) return "cinema";
    if(t.includes("сон") || t.includes("спать") || t.includes("ноч")) return "sleep";
    if(t.includes("работ")) return "work";
    if(t.includes("гост")) return "guests";
    if(t.includes("уборк") || t.includes("пылесос")) return "cleaning";
    if(t.includes("свет") || t.includes("ярк")) return "light";
    if(t.includes("музык") || t.includes("лоф") || t.includes("джаз")) return "music";
    return "auto";
  },

  extractNumber(text){
    const m = String(text||"").match(/(\d{1,3})/);
    if(!m) return null;
    const n = parseInt(m[1],10);
    if(Number.isNaN(n)) return null;
    return Math.max(0, Math.min(100, n));
  },

  isNight(){
    const h = new Date().getHours();
    return (h >= 22 || h <= 6);
  },

  buildCommand(text){
    const intent = this.detectIntent(text);
    const n = this.extractNumber(text);
    const night = this.isNight();
    const d = AURA.state.devices;

    const parts = [];

    if(intent === "cinema"){
      parts.push("Алиса, включи режим кино:");
      parts.push(`приглуши свет до ${night ? 15 : 20}%.`);
      if(d.speaker.playing) parts.push("выключи музыку.");
      parts.push("подготовь атмосферу для просмотра.");
    } else if(intent === "sleep"){
      parts.push("Алиса, режим сон:");
      parts.push("сделай тёплый свет 20%.");
      parts.push("включи спокойную музыку тихо.");
      parts.push("поставь таймер 45 минут.");
    } else if(intent === "work"){
      parts.push("Алиса, режим работа:");
      parts.push("сделай холодный яркий свет 80%.");
      parts.push("включи фоновую музыку очень тихо.");
    } else if(intent === "guests"){
      parts.push("Алиса, режим гости:");
      parts.push("сделай тёплый свет 45%.");
      parts.push("включи музыку.");
    } else if(intent === "cleaning"){
      parts.push("Алиса, режим уборка:");
      parts.push("яркий свет 90%.");
      parts.push("запусти уборку.");
      parts.push("таймер 30 минут.");
    } else if(intent === "light"){
      const br = (n ?? 50);
      parts.push(`Алиса, установи яркость ${br}%.`);
    } else if(intent === "music"){
      parts.push("Алиса, включи фоновую музыку.");
    } else {
      parts.push("Алиса, создай комфортную атмосферу:");
      parts.push(`сделай тёплый свет ${night ? 25 : 45}%.`);
      parts.push(night ? "музыку тише." : "музыку комфортнее.");
    }

    let cmd = parts.join(" ").replace(/\s+/g," ").trim();
    if(!/[.!?]$/.test(cmd)) cmd += ".";
    return cmd;
  },

  generate(text){
    const cmd = this.buildCommand(text);

    // anti-repeat
    if((AURA.state.lastCommand || "") === cmd){
      const extra = this.isNight() ? " Сделай чуть тише." : " Сделай чуть ярче.";
      const fixed = cmd.replace(/\.\s*$/,"") + extra + ".";
      return this.commit(fixed);
    }

    return this.commit(cmd);
  },

  commit(command){
    AURA.dispatch({ type:"SET_LAST_COMMAND", payload: command });
    AURA.dispatch({ type:"ADD_HISTORY", payload: command });
    AURA.dispatch({ type:"LOG", payload: command });
    return command;
  }
};

window.AI = AI;

console.log("AURA X AI ready");