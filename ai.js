console.log("AURA X Decision Engine v1 initializing...");

const AI = {

  /* ========================
     INTENT DETECTION
  ======================== */
  detectIntent(text) {
    const t = (text || "").toLowerCase();

    if (t.includes("кино") || t.includes("фильм")) return "cinema";
    if (t.includes("сон") || t.includes("ноч")) return "sleep";
    if (t.includes("работ")) return "work";
    if (t.includes("гост")) return "guests";
    if (t.includes("уборк")) return "cleaning";
    if (t.includes("свет")) return "light";
    if (t.includes("музык")) return "music";

    return "auto";
  },

  /* ========================
     CONTEXT ANALYSIS
  ======================== */
  getContext() {
    const hour = new Date().getHours();
    const night = hour >= 22 || hour <= 6;

    return {
      night,
      devices: AURA.state.devices,
      preferences: AURA.state.preferences
    };
  },

  /* ========================
     DECISION ENGINE
  ======================== */
  buildPlan(text) {

    const intent = this.detectIntent(text);
    const context = this.getContext();
    const plan = [];
    const reasoning = [];

    const pref = context.preferences;

    // CINEMA
    if (intent === "cinema") {

      const brightness = context.night ? 15 : 25;

      plan.push({
        device: "light",
        brightness,
        temp: "warm"
      });

      plan.push({
        device: "speaker",
        volume: context.night ? 15 : pref.preferredVolume,
        preset: "lofi"
      });

      plan.push({
        device: "climate",
        temperature: 22
      });

      reasoning.push("Режим кино выбран");
      if (context.night) reasoning.push("Ночь → снижена яркость");

    }

    // SLEEP
    else if (intent === "sleep") {

      plan.push({
        device: "light",
        brightness: 20,
        temp: "warm"
      });

      plan.push({
        device: "speaker",
        volume: 10,
        preset: "calm"
      });

      plan.push({
        device: "climate",
        temperature: 21
      });

      reasoning.push("Подготовка ко сну");
    }

    // WORK
    else if (intent === "work") {

      plan.push({
        device: "light",
        brightness: 80,
        temp: "cold"
      });

      plan.push({
        device: "speaker",
        volume: 15,
        preset: "focus"
      });

      reasoning.push("Рабочий режим");
    }

    // AUTO
    else {

      plan.push({
        device: "light",
        brightness: pref.preferredBrightness,
        temp: context.night ? "warm" : "neutral"
      });

      reasoning.push("Автоматический комфортный режим");
    }

    return {
      intent,
      context: {
        night: context.night
      },
      plan,
      reasoning,
      confidence: 0.87
    };
  },

  /* ========================
     GENERATE ENTRY
  ======================== */
  generate(text) {

    const decision = this.buildPlan(text);

    AURA.dispatch({
      type: "SET_PLAN",
      payload: decision
    });

    return decision;
  }

};

window.AI = AI;

console.log("AURA X Decision Engine ready");