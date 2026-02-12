console.log("AURA X UI initializing...");

const UI = {
  tab: "center",

  tabs: [
    { key:"center",  icon:"🧠", title:"Центр",   subtitle:"Smart Home Center" },
    { key:"panel",   icon:"🎛", title:"Пульт",   subtitle:"Устройства" },
    { key:"scenes",  icon:"✨", title:"Сцены",   subtitle:"Сценарии" },
    { key:"account", icon:"👤", title:"Аккаунт", subtitle:"Профиль" }
  ],

  init(){
    this.renderTabs();
    this.render();
  },

  setSubtitle(text){
    const el = document.getElementById("subtitle");
    if(el) el.textContent = text;
  },

  renderTabs(){
    const wrap = document.getElementById("tabs");
    wrap.innerHTML = this.tabs.map(t => `
      <div class="tab ${this.tab===t.key ? "active":""}" data-tab="${t.key}">
        ${t.icon}<strong>${t.title}</strong>
      </div>
    `).join("");

    wrap.querySelectorAll("[data-tab]").forEach(el=>{
      el.onclick = ()=>{
        this.tab = el.dataset.tab;
        this.renderTabs();
        this.render();
      };
    });
  },

  render(){
    const view = document.getElementById("app");
    const tabMeta = this.tabs.find(t=>t.key===this.tab);
    this.setSubtitle(tabMeta?.subtitle || "AURA X");

    let html = "";
    if(this.tab==="center") html = this.renderCenter();
    if(this.tab==="panel") html = this.renderPanel();
    if(this.tab==="scenes") html = this.renderScenes();
    if(this.tab==="account") html = this.renderAccount();

    view.classList.remove("show");
    view.innerHTML = html;
    requestAnimationFrame(()=> view.classList.add("show"));

    setTimeout(()=> this.bind(), 0);
  },

  // ---------- Center ----------
  renderCenter(){
    const d = AURA.state.devices;
    const online = AURA.state.system?.online;
    const dotClass = online ? "ok" : "";

    return `
      <div class="card glowBorder">
        <div class="badge"><span class="dot ${dotClass}"></span>${online ? "Дом онлайн" : "Дом оффлайн"}</div>
        <div class="sp12"></div>
        <div class="grid2">
          <div class="chip">
            <div><b>💡 Свет</b><small>${d.light.power ? `вкл · ${d.light.brightness}%` : "выкл"}</small></div>
            <span class="pill">${d.light.power ? "ON" : "OFF"}</span>
          </div>
          <div class="chip">
            <div><b>🔊 Музыка</b><small>${d.speaker.playing ? `играет · ${d.speaker.volume}%` : "не играет"}</small></div>
            <span class="pill">${d.speaker.playing ? "ON" : "OFF"}</span>
          </div>
          <div class="chip">
            <div><b>🌡 Климат</b><small>${d.climate.power ? `${d.climate.temperature}°` : "выкл"}</small></div>
            <span class="pill">${d.climate.power ? "ON" : "OFF"}</span>
          </div>
          <div class="chip">
            <div><b>⭐ Роль</b><small>${AURA.state.user.role}</small></div>
            <span class="pill">PRO</span>
          </div>
        </div>
        <div class="sp12"></div>
        <div class="muted">Сформируй команду — AURA подстроит её под контекст.</div>
      </div>

      <div class="sp12"></div>

      <div class="card glowBorder">
        <div class="h1">Привет. Что создаём?</div>
        <div class="muted">Например: кино / сон / гости / свет 30 / музыка</div>
        <div class="sp12"></div>

        <input class="input" id="q" placeholder="Опиши атмосферу или действие..." />

        <div class="sp12"></div>
        <button class="btn" id="gen">Сформировать атмосферу</button>

        <div class="kbar">
          <div class="kbtn" data-p="кино">🎬 Кино</div>
          <div class="kbtn" data-p="сон">💤 Сон</div>
          <div class="kbtn" data-p="работа">💻 Работа</div>
          <div class="kbtn" data-p="гости">🎉 Гости</div>
          <div class="kbtn" data-p="уборка">🧹 Уборка</div>
          <div class="kbtn" data-p="свет 30">💡 Свет 30</div>
        </div>

        ${AURA.state.lastCommand ? `
          <div class="resultBox" id="result">${this.escape(AURA.state.lastCommand)}</div>
          <div class="actions">
            <button class="btn secondary" id="copy">Скопировать</button>
            <button class="btn secondary" id="save">Сохранить</button>
          </div>
        ` : ``}
      </div>

      <div class="sp12"></div>

      <div class="card">
        <div class="h1">История</div>
        <div class="muted">
          ${AURA.state.history.length ? AURA.state.history.slice(0,8).map(x=>`• ${this.escape(x)}`).join("<br>") : "Пока пусто."}
        </div>
      </div>
    `;
  },

  // ---------- Panel ----------
  renderPanel(){
    const d = AURA.state.devices;

    return `
      <div class="card glowBorder">
        <div class="h1">Пульт</div>
        <div class="muted">Пока это “виртуальные” состояния. Позже подключим API.</div>

        <div class="sp12"></div>

        <div class="grid2">
          <div class="chip">
            <div><b>💡 Свет</b><small>${d.light.power ? "включен" : "выключен"}</small></div>
            <span class="pill">${d.light.brightness}%</span>
          </div>
          <div class="chip">
            <div><b>🔊 Колонка</b><small>${d.speaker.playing ? "играет" : "пауза"}</small></div>
            <span class="pill">${d.speaker.volume}%</span>
          </div>
        </div>

        <div class="sp12"></div>

        <div class="actions">
          <button class="btn secondary" id="lightToggle">${d.light.power ? "Выключить свет" : "Включить свет"}</button>
          <button class="btn secondary" id="musicToggle">${d.speaker.playing ? "Pause" : "Play"}</button>
        </div>

        <div class="actions">
          <button class="btn secondary" id="brDown">Свет -10%</button>
          <button class="btn secondary" id="brUp">Свет +10%</button>
        </div>

        <div class="actions">
          <button class="btn secondary" id="volDown">Громк -10</button>
          <button class="btn secondary" id="volUp">Громк +10</button>
        </div>
      </div>
    `;
  },

  // ---------- Scenes ----------
  renderScenes(){
    const scenes = AURA.state.scenes || [];
    const list = scenes.length ? scenes.map(s=>`
      <div class="chip" style="cursor:pointer" data-scene="${s.id}">
        <div><b>${this.escape(s.name)}</b><small>${this.escape(s.time)}</small></div>
        <span class="pill">▶</span>
      </div>
    `).join("") : `<div class="muted">Пока нет сцен. Создай ниже.</div>`;

    return `
      <div class="card glowBorder">
        <div class="h1">Сцены</div>
        <div class="muted">Сцена — это команда + время запуска.</div>
        <div class="sp12"></div>

        ${list}

        <div class="sp12"></div>

        <input class="input" id="sceneName" placeholder="Название (например: Ночь)" />
        <div class="sp12"></div>
        <input class="input" id="sceneTime" placeholder="Время HH:MM (например: 22:00)" />
        <div class="sp12"></div>
        <button class="btn secondary" id="addScene">Добавить сцену</button>
      </div>
    `;
  },

  // ---------- Account ----------
  renderAccount(){
    const u = AURA.state.user;

    return `
      <div class="card glowBorder">
        <div class="h1">Аккаунт</div>
        <div class="muted">Имя и ID берём из Telegram.</div>
        <div class="sp12"></div>

        <div class="muted"><b>Имя:</b> ${this.escape(u.name || "Гость")}</div>
        <div class="muted"><b>ID:</b> ${this.escape(String(u.telegramId || "—"))}</div>
        <div class="muted"><b>Роль:</b> ${this.escape(u.role)}</div>

        <div class="sp12"></div>

        <div class="actions">
          <button class="btn secondary" id="roleOwner">Owner</button>
          <button class="btn secondary" id="roleGuest">Guest</button>
        </div>

        <div class="sp12"></div>
        <button class="btn secondary" id="reset">Сбросить приложение</button>
      </div>
    `;
  },

  bind(){
    const q = document.getElementById("q");
    const gen = document.getElementById("gen");
    if(gen && q){
      gen.onclick = ()=> AI.generate(q.value);
      document.querySelectorAll("[data-p]").forEach(b=>{
        b.onclick = ()=>{
          q.value = b.dataset.p;
          AI.generate(q.value);
        };
      });
    }

    const copy = document.getElementById("copy");
    if(copy){
      copy.onclick = async ()=>{
        const text = AURA.state.lastCommand || "";
        try { await navigator.clipboard.writeText(text); } catch {}
        AURA.dispatch({ type:"LOG", payload:"Команда скопирована" });
      };
    }

    const save = document.getElementById("save");
    if(save){
      save.onclick = ()=>{
        const cmd = AURA.state.lastCommand || "";
        if(!cmd) return;

        const now = new Date();
        const hh = String(now.getHours()).padStart(2,"0");
        const mm = String(now.getMinutes()).padStart(2,"0");
        const time = `${hh}:${mm}`;

        AURA.dispatch({
          type:"ADD_SCENE",
          payload:{
            id: String(Date.now()),
            name:"Сцена AURA",
            time,
            command: cmd
          }
        });
        AURA.dispatch({ type:"LOG", payload:"Сцена сохранена" });
      };
    }

    // panel
    const lt = document.getElementById("lightToggle");
    if(lt){
      lt.onclick = ()=>{
        const cur = AURA.state.devices.light.power;
        AURA.dispatch({ type:"DEVICE_UPDATE", device:"light", payload:{ power: !cur }});
      };
    }
    const mt = document.getElementById("musicToggle");
    if(mt){
      mt.onclick = ()=>{
        const cur = AURA.state.devices.speaker.playing;
        AURA.dispatch({ type:"DEVICE_UPDATE", device:"speaker", payload:{ playing: !cur }});
      };
    }
    const brDown = document.getElementById("brDown");
    const brUp = document.getElementById("brUp");
    if(brDown) brDown.onclick = ()=> this.bump("light","brightness",-10,0,100);
    if(brUp) brUp.onclick = ()=> this.bump("light","brightness",+10,0,100);

    const volDown = document.getElementById("volDown");
    const volUp = document.getElementById("volUp");
    if(volDown) volDown.onclick = ()=> this.bump("speaker","volume",-10,0,100);
    if(volUp) volUp.onclick = ()=> this.bump("speaker","volume",+10,0,100);

    // scenes
    const addScene = document.getElementById("addScene");
    if(addScene){
      addScene.onclick = ()=>{
        const name = (document.getElementById("sceneName")?.value || "").trim() || "Сцена";
        const time = (document.getElementById("sceneTime")?.value || "").trim();

        if(!/^\d{2}:\d{2}$/.test(time)){
          AURA.dispatch({ type:"LOG", payload:"Время должно быть HH:MM (пример 22:00)" });
          return;
        }

        AURA.dispatch({
          type:"ADD_SCENE",
          payload:{ id:String(Date.now()), name, time, command: AURA.state.lastCommand || "" }
        });
        AURA.dispatch({ type:"LOG", payload:`Добавлена сцена: ${name} (${time})` });
        this.render();
      };
    }

    // account
    const ro = document.getElementById("roleOwner");
    const rg = document.getElementById("roleGuest");
    if(ro) ro.onclick = ()=> AURA.dispatch({ type:"SET_ROLE", payload:"owner" });
    if(rg) rg.onclick = ()=> AURA.dispatch({ type:"SET_ROLE", payload:"guest" });

    const reset = document.getElementById("reset");
    if(reset){
      reset.onclick = ()=>{
        localStorage.removeItem("aura_x_production_v2");
        location.reload();
      };
    }

    // help
    const help = document.getElementById("helpBtn");
    if(help){
      help.onclick = ()=> {
        AURA.dispatch({ type:"LOG", payload:"Подсказка: напиши 'кино' или 'сон' и нажми Сформировать" });
        this.tab = "center";
        this.renderTabs();
        this.render();
      };
    }
  },

  bump(device, field, delta, min, max){
    const cur = AURA.state.devices?.[device]?.[field];
    const next = Math.max(min, Math.min(max, (cur ?? 0) + delta));
    AURA.dispatch({ type:"DEVICE_UPDATE", device, payload:{ [field]: next }});
  },

  escape(s){
    return String(s||"").replace(/[&<>"']/g, m=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[m]));
  }
};

window.UI = UI;
UI.init();

console.log("AURA X UI ready");