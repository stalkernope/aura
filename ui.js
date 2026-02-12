console.log("AURA X UI (Plan View) initializing...");

const UI = {
  tab: "center",

  tabs: [
    { key: "center", icon: "🧠", title: "Центр", subtitle: "Intent → Plan → Execute" },
    { key: "panel", icon: "🎛", title: "Пульт", subtitle: "Состояния устройств" },
    { key: "history", icon: "🧾", title: "История", subtitle: "Планы и выполнения" },
    { key: "account", icon: "👤", title: "Аккаунт", subtitle: "Профиль и настройки" },
  ],

  init() {
    this.renderTabs();
    this.render();
    this.bindStatic();
  },

  setSubtitle(text) {
    const el = document.getElementById("subtitle");
    if (el) el.textContent = text || "AURA X";
  },

  renderTabs() {
    const wrap = document.getElementById("tabs");
    if (!wrap) return;

    wrap.innerHTML = this.tabs
      .map(
        (t) => `
      <div class="tab ${this.tab === t.key ? "active" : ""}" data-tab="${t.key}">
        ${t.icon}<strong>${t.title}</strong>
      </div>
    `
      )
      .join("");

    wrap.querySelectorAll("[data-tab]").forEach((el) => {
      el.onclick = () => {
        this.tab = el.dataset.tab;
        this.renderTabs();
        this.render();
      };
    });
  },

  render() {
    const view = document.getElementById("app");
    const tabMeta = this.tabs.find((t) => t.key === this.tab);
    this.setSubtitle(tabMeta?.subtitle);

    let html = "";
    if (this.tab === "center") html = this.renderCenter();
    if (this.tab === "panel") html = this.renderPanel();
    if (this.tab === "history") html = this.renderHistory();
    if (this.tab === "account") html = this.renderAccount();

    view.classList.remove("show");
    view.innerHTML = html;
    requestAnimationFrame(() => view.classList.add("show"));

    setTimeout(() => this.bind(), 0);
  },

  // -------------------- UI blocks --------------------

  renderMiniStatus() {
    const online = !!AURA.state.system?.online;
    const d = AURA.state.devices;

    const lightOn = !!d.light?.power;
    const musicOn = !!d.speaker?.playing;
    const climateOn = !!d.climate?.power;

    const dot = online ? "ok" : "";
    return `
      <div class="badge"><span class="dot ${dot}"></span>${online ? "Дом онлайн" : "Дом оффлайн"}</div>
      <div class="sp12"></div>
      <div class="grid2">
        <div class="chip">
          <div><b>💡 Свет</b><small>${lightOn ? `ON · ${d.light.brightness}% · ${d.light.temp}` : "OFF"}</small></div>
          <span class="pill">${lightOn ? "ON" : "OFF"}</span>
        </div>
        <div class="chip">
          <div><b>🔊 Музыка</b><small>${musicOn ? `ON · ${d.speaker.volume}% · ${d.speaker.preset}` : "OFF"}</small></div>
          <span class="pill">${musicOn ? "ON" : "OFF"}</span>
        </div>
        <div class="chip">
          <div><b>🌡 Климат</b><small>${climateOn ? `ON · ${d.climate.temperature}°` : "OFF"}</small></div>
          <span class="pill">${climateOn ? "ON" : "OFF"}</span>
        </div>
        <div class="chip">
          <div><b>⭐ Роль</b><small>${this.escape(AURA.state.user?.role || "")}</small></div>
          <span class="pill">X</span>
        </div>
      </div>
    `;
  },

  renderPlanCard(planObj) {
    if (!planObj) {
      return `
        <div class="muted">Сформируй намерение — и AURA построит план действий.</div>
      `;
    }

    const intentTitle = ({
      cinema: "🎬 Кино",
      sleep: "💤 Сон",
      work: "💻 Работа",
      guests: "🎉 Гости",
      cleaning: "🧹 Уборка",
      auto: "✨ Авто",
      light: "💡 Свет",
      music: "🔊 Музыка",
    })[planObj.intent] || `✨ ${this.escape(planObj.intent)}`;

    const confidence = Math.round((planObj.confidence || 0) * 100);
    const night = !!planObj.context?.night;

    const steps = (planObj.plan || []).map((s, idx) => {
      const meta = this.stepToText(s);
      return `
        <div class="chip" data-step="${idx}">
          <div>
            <b>${meta.title}</b>
            <small>${meta.subtitle}</small>
          </div>
          <span class="pill">${meta.tag}</span>
        </div>
      `;
    }).join("");

    const reasons = (planObj.reasoning || []).slice(0, 5).map(r => `• ${this.escape(r)}`).join("<br>");

    return `
      <div class="badge">Intent: <b style="color:var(--txt)">${intentTitle}</b></div>
      <span style="margin-left:8px" class="badge">${night ? "🌙 ночь" : "☀️ день"}</span>
      <span style="margin-left:8px" class="badge">Confidence: <b style="color:var(--txt)">${confidence}%</b></span>

      <div class="sp12"></div>

      <div class="muted"><b>План:</b> нажми на шаг, чтобы быстро изменить параметры.</div>
      <div class="sp12"></div>

      ${steps || `<div class="muted">План пуст. (Добавим больше девайсов позже.)</div>`}

      <div class="sp12"></div>

      <div class="muted"><b>Почему так:</b><br>${reasons || "• —"}</div>

      <div class="sp12"></div>

      <div class="actions">
        <button class="btn" id="executePlan">Выполнить</button>
        <button class="btn secondary" id="copyPlan">Скопировать как текст</button>
      </div>

      <div class="actions">
        <button class="btn secondary" id="tuneBrighter">Ярче</button>
        <button class="btn secondary" id="tuneQuieter">Тише</button>
      </div>
    `;
  },

  renderCenter() {
    const name = (AURA.state.user?.name || "").trim();
    const hello = name ? `Привет, ${this.escape(name)}.` : "Привет.";
    const planObj = AURA.state.lastPlan;

    return `
      <div class="card glowBorder">
        ${this.renderMiniStatus()}
        <div class="sp12"></div>
        <div class="muted">AURA X — оркестратор. Она строит <b>план</b>, а не просто текст.</div>
      </div>

      <div class="sp12"></div>

      <div class="card glowBorder">
        <div class="h1">${hello} Какое намерение?</div>
        <div class="muted">Примеры: “кино”, “сон”, “работа”, “гости”, “уборка”.</div>
        <div class="sp12"></div>

        <input class="input" id="intentInput" placeholder="Например: кино" />

        <div class="sp12"></div>
        <button class="btn" id="generatePlan">Сформировать план</button>

        <div class="kbar">
          <div class="kbtn" data-q="кино">🎬 Кино</div>
          <div class="kbtn" data-q="сон">💤 Сон</div>
          <div class="kbtn" data-q="работа">💻 Работа</div>
          <div class="kbtn" data-q="гости">🎉 Гости</div>
          <div class="kbtn" data-q="уборка">🧹 Уборка</div>
          <div class="kbtn" data-q="комфорт">✨ Авто</div>
        </div>

        <div class="sp12"></div>

        <div id="analysisBox" class="muted" style="display:none">
          <span class="badge"><span class="dot ok"></span>Анализ…</span>
          <div class="sp12"></div>
          <div class="muted">Собираю контекст, предпочтения и состояние устройств…</div>
        </div>

        <div class="sp12"></div>

        <div id="planBox">
          ${this.renderPlanCard(planObj)}
        </div>
      </div>
    `;
  },

  renderPanel() {
    const d = AURA.state.devices;

    return `
      <div class="card glowBorder">
        <div class="h1">Пульт (состояния)</div>
        <div class="muted">Пока локально. Позже подключим Transport/API.</div>
        <div class="sp12"></div>

        <div class="grid2">
          <div class="chip">
            <div><b>💡 Свет</b><small>${d.light.power ? `ON · ${d.light.brightness}% · ${d.light.temp}` : "OFF"}</small></div>
            <span class="pill">${d.light.power ? "ON" : "OFF"}</span>
          </div>

          <div class="chip">
            <div><b>🔊 Колонка</b><small>${d.speaker.playing ? `ON · ${d.speaker.volume}% · ${d.speaker.preset}` : "OFF"}</small></div>
            <span class="pill">${d.speaker.playing ? "ON" : "OFF"}</span>
          </div>

          <div class="chip">
            <div><b>🌡 Климат</b><small>${d.climate.power ? `ON · ${d.climate.temperature}°` : "OFF"}</small></div>
            <span class="pill">${d.climate.power ? "ON" : "OFF"}</span>
          </div>

          <div class="chip">
            <div><b>🧠 Последний план</b><small>${AURA.state.lastPlan ? this.escape(AURA.state.lastPlan.intent) : "—"}</small></div>
            <span class="pill">PLAN</span>
          </div>
        </div>

        <div class="sp12"></div>

        <div class="actions">
          <button class="btn secondary" id="toggleLight">${d.light.power ? "Выключить свет" : "Включить свет"}</button>
          <button class="btn secondary" id="toggleMusic">${d.speaker.playing ? "Pause" : "Play"}</button>
        </div>

        <div class="actions">
          <button class="btn secondary" id="brDown">Свет -10%</button>
          <button class="btn secondary" id="brUp">Свет +10%</button>
        </div>

        <div class="actions">
          <button class="btn secondary" id="volDown">Громк -10</button>
          <button class="btn secondary" id="volUp">Громк +10</button>
        </div>

        <div class="actions">
          <button class="btn secondary" id="tempDown">Темп -1°</button>
          <button class="btn secondary" id="tempUp">Темп +1°</button>
        </div>
      </div>
    `;
  },

  renderHistory() {
    const plans = AURA.state.executionLog || [];
    const logs = AURA.state.logs || [];
    const lastPlan = AURA.state.lastPlan;

    const planPreview = lastPlan
      ? `<div class="muted">Последний план: <b>${this.escape(lastPlan.intent)}</b> · шагов: ${(lastPlan.plan||[]).length}</div>`
      : `<div class="muted">Планов пока нет.</div>`;

    const execList = plans.length
      ? plans.slice(0, 15).map((x) => {
          const when = new Date(x.time).toLocaleString("ru-RU");
          const intent = x.plan?.intent || "—";
          const steps = (x.plan?.plan || []).length;
          return `<div class="muted">• ${this.escape(when)} — <b>${this.escape(intent)}</b> (${steps} шаг.)</div>`;
        }).join("")
      : `<div class="muted">Пока не было выполнений. Нажми “Выполнить” в плане.</div>`;

    const logList = logs.length
      ? logs.slice(0, 20).map((l) => `<div class="muted">• ${this.escape(String(l))}</div>`).join("")
      : `<div class="muted">Логи пустые.</div>`;

    return `
      <div class="card glowBorder">
        <div class="h1">История</div>
        ${planPreview}
        <div class="sp12"></div>
        <div class="muted"><b>Выполнения:</b></div>
        <div class="sp12"></div>
        ${execList}
        <div class="sp12"></div>
        <div class="muted"><b>Логи:</b></div>
        <div class="sp12"></div>
        ${logList}
      </div>
    `;
  },

  renderAccount() {
    const u = AURA.state.user || {};
    const p = AURA.state.preferences || {};

    return `
      <div class="card glowBorder">
        <div class="h1">Аккаунт</div>
        <div class="muted"><b>Имя:</b> ${this.escape(u.name || "Гость")}</div>
        <div class="muted"><b>Telegram ID:</b> ${this.escape(String(u.telegramId || "—"))}</div>
        <div class="muted"><b>Роль:</b> ${this.escape(u.role || "owner")}</div>

        <div class="sp12"></div>
        <div class="muted"><b>Предпочтения (Decision Engine):</b></div>
        <div class="sp12"></div>

        <div class="chip">
          <div><b>💡 Яркость по умолчанию</b><small>${this.escape(String(p.preferredBrightness ?? 45))}%</small></div>
          <span class="pill">PREF</span>
        </div>
        <div class="chip" style="margin-top:10px">
          <div><b>🔊 Громкость по умолчанию</b><small>${this.escape(String(p.preferredVolume ?? 25))}%</small></div>
          <span class="pill">PREF</span>
        </div>

        <div class="sp12"></div>

        <div class="actions">
          <button class="btn secondary" id="roleOwner">Owner</button>
          <button class="btn secondary" id="roleGuest">Guest</button>
        </div>

        <div class="actions">
          <button class="btn secondary" id="resetApp">Сбросить приложение</button>
        </div>
      </div>
    `;
  },

  // -------------------- Bindings --------------------

  bindStatic() {
    const help = document.getElementById("helpBtn");
    if (!help) return;

    help.onclick = () => {
      // мини-хелп через лог
      AURA.dispatch({ type: "LOG", payload: "Подсказка: напиши 'кино' → получишь план → нажми 'Выполнить'." });
      this.tab = "center";
      this.renderTabs();
      this.render();
    };
  },

  bind() {
    // Center: presets + generate + analysis animation
    const input = document.getElementById("intentInput");
    const gen = document.getElementById("generatePlan");
    const analysisBox = document.getElementById("analysisBox");

    document.querySelectorAll("[data-q]").forEach((b) => {
      b.onclick = () => {
        if (input) input.value = b.dataset.q;
        this.runGeneratePlan();
      };
    });

    if (gen) gen.onclick = () => this.runGeneratePlan();
    if (input) {
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.runGeneratePlan();
      });
    }

    // Plan actions
    const execBtn = document.getElementById("executePlan");
    if (execBtn) {
      execBtn.onclick = () => {
        if (!AURA.state.lastPlan) return;
        AURA.dispatch({ type: "LOG", payload: "Выполнение плана…" });
        AURA.dispatch({ type: "EXECUTE_PLAN" });
        AURA.dispatch({ type: "LOG", payload: "План выполнен ✅" });
      };
    }

    const copyBtn = document.getElementById("copyPlan");
    if (copyBtn) {
      copyBtn.onclick = async () => {
        const text = this.planToText(AURA.state.lastPlan);
        try { await navigator.clipboard.writeText(text); } catch {}
        AURA.dispatch({ type: "LOG", payload: "План скопирован" });
      };
    }

    const brighter = document.getElementById("tuneBrighter");
    if (brighter) brighter.onclick = () => this.tunePlan({ kind: "brighter" });

    const quieter = document.getElementById("tuneQuieter");
    if (quieter) quieter.onclick = () => this.tunePlan({ kind: "quieter" });

    // Click step to quick edit
    document.querySelectorAll("[data-step]").forEach((el) => {
      el.onclick = () => {
        const idx = parseInt(el.getAttribute("data-step"), 10);
        this.quickEditStep(idx);
      };
    });

    // Panel controls
    const d = AURA.state.devices;

    const toggleLight = document.getElementById("toggleLight");
    if (toggleLight) toggleLight.onclick = () => {
      AURA.dispatch({ type: "DEVICE_UPDATE", device: "light", payload: { power: !d.light.power } });
      AURA.dispatch({ type: "LOG", payload: `Свет: ${!d.light.power ? "ON" : "OFF"}` });
    };

    const toggleMusic = document.getElementById("toggleMusic");
    if (toggleMusic) toggleMusic.onclick = () => {
      AURA.dispatch({ type: "DEVICE_UPDATE", device: "speaker", payload: { playing: !d.speaker.playing } });
      AURA.dispatch({ type: "LOG", payload: `Музыка: ${!d.speaker.playing ? "ON" : "OFF"}` });
    };

    const brDown = document.getElementById("brDown");
    const brUp = document.getElementById("brUp");
    if (brDown) brDown.onclick = () => this.bump("light", "brightness", -10, 1, 100);
    if (brUp) brUp.onclick = () => this.bump("light", "brightness", +10, 1, 100);

    const volDown = document.getElementById("volDown");
    const volUp = document.getElementById("volUp");
    if (volDown) volDown.onclick = () => this.bump("speaker", "volume", -10, 0, 100);
    if (volUp) volUp.onclick = () => this.bump("speaker", "volume", +10, 0, 100);

    const tempDown = document.getElementById("tempDown");
    const tempUp = document.getElementById("tempUp");
    if (tempDown) tempDown.onclick = () => this.bump("climate", "temperature", -1, 16, 30, true);
    if (tempUp) tempUp.onclick = () => this.bump("climate", "temperature", +1, 16, 30, true);

    // Account controls
    const roleOwner = document.getElementById("roleOwner");
    const roleGuest = document.getElementById("roleGuest");
    if (roleOwner) roleOwner.onclick = () => {
      AURA.state.user.role = "owner";
      localStorage.setItem("aura_x_decision_v1", JSON.stringify(AURA.state));
      this.render();
    };
    if (roleGuest) roleGuest.onclick = () => {
      AURA.state.user.role = "guest";
      localStorage.setItem("aura_x_decision_v1", JSON.stringify(AURA.state));
      this.render();
    };

    const reset = document.getElementById("resetApp");
    if (reset) reset.onclick = () => {
      localStorage.removeItem("aura_x_decision_v1");
      location.reload();
    };

    // Analysis box initial state
    if (analysisBox) analysisBox.style.display = "none";
  },

  runGeneratePlan() {
    const input = document.getElementById("intentInput");
    const analysisBox = document.getElementById("analysisBox");
    const text = (input?.value || "").trim();

    if (!text) {
      AURA.dispatch({ type: "LOG", payload: "Введи намерение (например: кино)" });
      return;
    }

    if (analysisBox) analysisBox.style.display = "block";

    // небольшая “AI” задержка, чтобы ощущалось премиально
    setTimeout(() => {
      AI.generate(text);
      if (analysisBox) analysisBox.style.display = "none";
      AURA.dispatch({ type: "LOG", payload: `План построен: ${text}` });
      this.render();
    }, 420);
  },

  // -------------------- Plan tools --------------------

  tunePlan({ kind }) {
    const planObj = AURA.state.lastPlan;
    if (!planObj) return;

    const p = JSON.parse(JSON.stringify(planObj)); // clone
    const steps = p.plan || [];

    if (kind === "brighter") {
      steps.forEach(s => { if (s.device === "light" && typeof s.brightness === "number") s.brightness = Math.min(100, s.brightness + 10); });
      p.reasoning = (p.reasoning || []).concat(["Пользователь: ярче (+10%)"]);
      p.confidence = Math.min(0.99, (p.confidence || 0.87) + 0.02);
    }

    if (kind === "quieter") {
      steps.forEach(s => { if (s.device === "speaker" && typeof s.volume === "number") s.volume = Math.max(0, s.volume - 10); });
      p.reasoning = (p.reasoning || []).concat(["Пользователь: тише (-10)"]);
      p.confidence = Math.min(0.99, (p.confidence || 0.87) + 0.02);
    }

    AURA.dispatch({ type: "SET_PLAN", payload: p });
    AURA.dispatch({ type: "LOG", payload: "План уточнён" });
  },

  quickEditStep(idx) {
    const planObj = AURA.state.lastPlan;
    if (!planObj || !planObj.plan || !planObj.plan[idx]) return;

    const step = planObj.plan[idx];
    const p = JSON.parse(JSON.stringify(planObj));

    // простые быстрые циклы параметров
    if (step.device === "light") {
      const cur = step.brightness ?? 30;
      const next = cur >= 60 ? 20 : (cur >= 30 ? 60 : 30);
      p.plan[idx].brightness = next;
      p.reasoning = (p.reasoning || []).concat([`Изменено: свет → ${next}%`]);
    }

    if (step.device === "speaker") {
      const presets = ["lofi", "ambient", "jazz", "focus"];
      const cur = step.preset || "lofi";
      const i = Math.max(0, presets.indexOf(cur));
      const next = presets[(i + 1) % presets.length];
      p.plan[idx].preset = next;
      p.reasoning = (p.reasoning || []).concat([`Изменено: пресет музыки → ${next}`]);
    }

    if (step.device === "climate") {
      const cur = step.temperature ?? 23;
      const next = cur >= 24 ? 22 : cur + 1;
      p.plan[idx].temperature = next;
      p.reasoning = (p.reasoning || []).concat([`Изменено: климат → ${next}°`]);
    }

    AURA.dispatch({ type: "SET_PLAN", payload: p });
    AURA.dispatch({ type: "LOG", payload: "Шаг плана изменён" });
  },

  stepToText(step) {
    if (step.device === "light") {
      const b = step.brightness ?? 0;
      const t = step.temp || "warm";
      return { title: "💡 Свет", subtitle: `${b}% · ${t}`, tag: `${b}%` };
    }
    if (step.device === "speaker") {
      const v = step.volume ?? 0;
      const p = step.preset || "lofi";
      return { title: "🔊 Музыка", subtitle: `${p} · ${v}%`, tag: `${v}%` };
    }
    if (step.device === "climate") {
      const temp = step.temperature ?? 23;
      return { title: "🌡 Климат", subtitle: `${temp}°`, tag: `${temp}°` };
    }
    return { title: `⚙️ ${step.device}`, subtitle: "настройка", tag: "—" };
  },

  planToText(planObj) {
    if (!planObj) return "";
    const lines = [];
    lines.push(`AURA PLAN — intent: ${planObj.intent}`);
    if (planObj.context?.night) lines.push(`context: night`);
    (planObj.plan || []).forEach((s) => {
      const m = this.stepToText(s);
      lines.push(`- ${m.title}: ${m.subtitle}`);
    });
    const conf = Math.round((planObj.confidence || 0) * 100);
    lines.push(`confidence: ${conf}%`);
    return lines.join("\n");
  },

  bump(device, field, delta, min, max, turnOnIf = false) {
    const d = AURA.state.devices?.[device];
    if (!d) return;

    const cur = d[field];
    const base = (typeof cur === "number" ? cur : 0);
    const next = Math.max(min, Math.min(max, base + delta));

    const payload = { [field]: next };
    if (turnOnIf) payload.power = true;

    AURA.dispatch({ type: "DEVICE_UPDATE", device, payload });
    AURA.dispatch({ type: "LOG", payload: `Изменено: ${device}.${field} → ${next}` });
  },

  escape(s) {
    return String(s || "").replace(/[&<>"']/g, (m) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[m]));
  },
};

window.UI = UI;
UI.init();

console.log("AURA X UI (Plan View) ready");