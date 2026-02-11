/* =========================
   AURA X — AI ENGINE PRO
========================= */

console.log("AURA X AI initializing...");

const AI = {

  /* =========================
     INTENT DETECTION
  ========================= */
  detectIntent(text) {
    const t = text.toLowerCase();

    if (t.includes("кино") || t.includes("фильм"))
      return "cinema";

    if (t.includes("сон") || t.includes("спать"))
      return "sleep";

    if (t.includes("работ"))
      return "work";

    if (t.includes("гост"))
      return "guests";

    if (t.includes("уборк") || t.includes("пылесос"))
      return "cleaning";

    if (t.includes("свет"))
      return "light";

    if (t.includes("музык"))
      return "music";

    return "auto";
  },

  /* =========================
     NUMBER PARSER
  ========================= */
  extractNumbers(text) {
    const numbers = text.match(/\d+/g);
    return numbers ? numbers.map(n => parseInt(n)) : [];
  },

  /* =========================
     CONTEXT ENGINE
  ========================= */
  getContext() {
    const hour = new Date().getHours();
    const night = (hour >= 22 || hour <= 6);

    return {
      night,
      devices: AURA.state.devices
    };
  },

  /* =========================
     BUILD COMMAND
  ========================= */
  buildCommand(text) {

    const intent = this.detectIntent(text);
    const numbers = this.extractNumbers(text);
    const context = this.getContext();
    const d = context.devices;

    let parts = [];

    if (intent === "cinema") {
      parts.push("Алиса, включи режим кино:");
      parts.push("приглуши свет до 20%.");
      if (d.speaker.playing)
        parts.push("выключи музыку.");
    }

    else if (intent === "sleep") {
      parts.push("Алиса, режим сон:");
      parts.push("сделай тёплый свет 20%.");
      parts.push("поставь таймер 45 минут.");
    }

    else if (intent === "work") {
      parts.push("Алиса, режим работа:");
      parts.push("включи яркий свет 80%.");
      parts.push("включи фоновую музыку тихо.");
    }

    else if (intent === "guests") {
      parts.push("Алиса, режим гости:");
      parts.push("сделай тёплый свет 40%.");
      parts.push("включи музыку.");
    }

    else if (intent === "cleaning") {
      parts.push("Алиса, режим уборка:");
      parts.push("включи яркий свет 100%.");
      parts.push("запусти пылесос.");
    }

    else if (intent === "light") {
      let brightness = numbers[0] || 50;
      parts.push(`Алиса, установи яркость ${brightness}%.`);
    }

    else if (intent === "music") {
      parts.push("Алиса, включи музыку.");
    }

    else {
      parts.push("Алиса, создай комфортную атмосферу.");
    }

    let command = parts.join(" ");

    /* =========================
       ANTI-REPEAT
    ========================= */
    if (AURA.state.lastCommand === command)
      command += " Немного измени атмосферу.";

    return command;
  },

  /* =========================
     GENERATE ENTRY POINT
  ========================= */
  generate(text) {

    const command = this.buildCommand(text);

    AURA.state.lastCommand = command;

    AURA.dispatch({
      type: "ADD_HISTORY",
      payload: command
    });

    AURA.dispatch({
      type: "LOG",
      payload: command
    });

    return command;
  }
};

window.AI = AI;

console.log("AURA X AI ready");