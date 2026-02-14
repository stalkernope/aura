/* ai.js — AURA X AI (local intent parser + command builder, no API yet) */

(() => {
  const { qs } = window.UI;

  const input = qs("#aiInput");
  const btn = qs("#aiBtn");
  const log = qs("#aiLog");

  function norm(s){
    return (s || "")
      .toLowerCase()
      .replace(/[ё]/g, "е")
      .replace(/[^\p{L}\p{N}\s%.,-]/gu, "")
      .trim();
  }

  function pickRoom(text){
    const rooms = ["гостиная","спальня","кухня","ванная","коридор","детская","кабинет"];
    for (const r of rooms) if (text.includes(r)) return r;
    return "";
  }

  function parsePercent(text){
    // ищем "30%", "на 30", "до 30"
    const m1 = text.match(/(\d{1,3})\s*%/);
    if (m1) return clamp(+m1[1], 0, 100);

    const m2 = text.match(/(?:на|до|в)\s*(\d{1,3})\b/);
    if (m2) return clamp(+m2[1], 0, 100);

    return null;
  }

  function parseVolume(text){
    // громкость 0..10 или 0..100
    const m = text.match(/(?:громк|volume|звук)\S*\s*(\d{1,3})/);
    if (!m) return null;
    const n = +m[1];
    if (n <= 10) return n * 10; // нормализуем в %
    return clamp(n, 0, 100);
  }

  function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }

  function buildPlan(raw){
    const t = norm(raw);
    if (!t) return { ok:false, title:"Пусто", say:"Напиши что ты хочешь сделать 🙂", plan:[] };

    const room = pickRoom(t);

    // Device detection
    const wantsLight = /(свет|ламп|освещ)/.test(t);
    const wantsMusic = /(музык|колонк|плеер|песн|радио|моя волна)/.test(t);
    const wantsClimate = /(климат|температ|кондиц|обогрев|тепл|холод)/.test(t);

    // Actions
    const isOn = /(включ|запусти|поставь|сделай|начни)/.test(t);
    const isOff = /(выключ|останов|прекрат)/.test(t);

    const bright = parsePercent(t);
    const vol = parseVolume(t);

    // Time phrases (very light)
    const hasTime = /(\d{1,2})\s*[:.]\s*(\d{2})/.test(t) || /(утра|вечера|ночью|днем|по будням|каждый день)/.test(t);

    const plan = [];
    let say = "Алиса";

    if (wantsLight) {
      if (isOff) {
        plan.push({device:"light", action:"off", room});
        say += room ? `, выключи свет в ${room}` : `, выключи свет`;
      } else if (bright != null) {
        plan.push({device:"light", action:"brightness", value: bright, room});
        say += room ? `, сделай свет в ${room} на ${bright}%` : `, сделай свет на ${bright}%`;
      } else if (isOn) {
        plan.push({device:"light", action:"on", room});
        say += room ? `, включи свет в ${room}` : `, включи свет`;
      }
    }

    if (wantsMusic) {
      if (/моя волна/.test(t)) {
        plan.push({device:"speaker", action:"play", value:"Моя волна", room});
        say += `, включи Мою волну`;
      } else if (isOff) {
        plan.push({device:"speaker", action:"stop", room});
        say += `, останови музыку`;
      } else if (vol != null) {
        plan.push({device:"speaker", action:"volume", value: vol, room});
        say += `, сделай громкость ${Math.round(vol/10)} из 10`;
      } else if (isOn) {
        plan.push({device:"speaker", action:"play", room});
        say += `, включи музыку`;
      }
    }

    if (wantsClimate) {
      const tempMatch = t.match(/(\d{2})\s*(?:град|°|c)\b/);
      if (isOff) {
        plan.push({device:"climate", action:"off", room});
        say += `, выключи климат`;
      } else if (tempMatch) {
        const temp = clamp(+tempMatch[1], 16, 30);
        plan.push({device:"climate", action:"setTemp", value: temp, room});
        say += `, поставь температуру ${temp} градусов`;
      } else if (isOn) {
        plan.push({device:"climate", action:"on", room});
        say += `, включи климат`;
      }
    }

    // Alarm / reminders style
    if (/буди|будильник/.test(t) || hasTime) {
      // only produce voice phrase, no real scheduling yet
      if (plan.length === 0) {
        return {
          ok:true,
          title:"Будильник / напоминание",
          say: `Алиса, ${raw.trim()}`,
          plan: [{device:"assistant", action:"voice", value: raw.trim()}]
        };
      }
    }

    if (plan.length === 0) {
      // fallback “smart suggestion”
      const guess = [];
      guess.push({device:"light", action:"brightness", value: 30, room: room || "гостиная"});
      guess.push({device:"speaker", action:"play", value:"Ло-фай", room: room || ""});
      return {
        ok:true,
        title:"Уточнение",
        say:`Я не понял точно. Попробуй так: «Алиса, включи свет на 30% и включи музыку»`,
        plan: guess
      };
    }

    return { ok:true, title:"План готов", say, plan };
  }

  function formatPlan(res){
    const lines = [];
    lines.push(`• ${res.title}`);
    lines.push(`Команда: ${res.say}`);
    lines.push(``);
    lines.push(`План:`);
    res.plan.forEach((s, i) => {
      const room = s.room ? ` (${s.room})` : "";
      const val = (s.value !== undefined && s.value !== null) ? ` = ${s.value}` : "";
      lines.push(`${i+1}. ${s.device}.${s.action}${val}${room}`);
    });
    return lines.join("\n");
  }

  btn.addEventListener("click", () => {
    const raw = input.value || "";
    const res = buildPlan(raw);

    const text = res.ok ? formatPlan(res) : res.say;
    log.textContent = text;

    // store last
    try {
      const st = window.AURA?.state;
      if (st) { st.lastAI = raw; localStorage.setItem("AURA_X_STATE_V1", JSON.stringify(st)); }
    } catch {}

    // little UX: if user wants, open sheet “Будильники” for alarm-ish
    if (/буди|будильник/.test(norm(raw))) {
      // demo: open alarms sheet
      setTimeout(() => window.AURA?.openSheet?.("Будильники"), 150);
    }
  });

  // enter to submit
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") btn.click();
  });

})();