/* =========================
   AURA X — UI ENGINE
========================= */

console.log("AURA X UI initializing...");

const UI = {

  currentTab: "center",

  init() {
    this.render();
  },

  render() {
    const app = document.getElementById("app");

    app.innerHTML = `
      ${this.renderHeader()}
      ${this.renderTabs()}
      <div style="padding:20px">
        ${this.renderContent()}
      </div>
    `;

    this.bind();
  },

  renderHeader() {
    return `
      <div style="padding:20px; border-bottom:1px solid rgba(255,255,255,.08)">
        <h2 style="margin:0">AURA X</h2>
        <div style="opacity:.6;font-size:13px">
          Smart Home Center • ${AURA.state.user.role}
        </div>
      </div>
    `;
  },

  renderTabs() {
    const tabs = ["center", "panel", "scenes", "account"];

    return `
      <div style="display:flex; border-bottom:1px solid rgba(255,255,255,.05)">
        ${tabs.map(tab => `
          <div 
            data-tab="${tab}"
            style="
              flex:1;
              padding:12px;
              text-align:center;
              cursor:pointer;
              background:${this.currentTab === tab ? "rgba(255,255,255,.05)" : "transparent"};
            ">
            ${tab.toUpperCase()}
          </div>
        `).join("")}
      </div>
    `;
  },

  renderContent() {

    if (this.currentTab === "center")
      return this.renderCenter();

    if (this.currentTab === "panel")
      return this.renderPanel();

    if (this.currentTab === "scenes")
      return this.renderScenes();

    if (this.currentTab === "account")
      return this.renderAccount();
  },

  renderCenter() {
    return `
      <div>
        <input 
          id="input"
          placeholder="Например: кино, сон, свет 30"
          style="
            width:100%;
            padding:14px;
            border-radius:12px;
            border:none;
            margin-bottom:12px;
          "
        />

        <button 
          id="generate"
          style="
            width:100%;
            padding:14px;
            border-radius:12px;
            border:none;
            background:linear-gradient(90deg,#7A2BFF,#2B7CFF);
            color:white;
          ">
          Сформировать
        </button>

        ${AURA.state.lastCommand ? `
          <div style="
            margin-top:16px;
            padding:12px;
            background:rgba(255,255,255,.05);
            border-radius:12px;
          ">
            ${AURA.state.lastCommand}
          </div>
        ` : ""}

        <div style="margin-top:20px;font-size:13px;opacity:.6">
          История:
          ${AURA.state.history.slice(0,5).map(h => `
            <div style="margin-top:6px">• ${h}</div>
          `).join("")}
        </div>
      </div>
    `;
  },

  renderPanel() {

    const devices = AURA.state.devices;

    return `
      <div>
        <h3>Устройства</h3>

        ${Object.keys(devices).map(key => `
          <div style="
            margin-bottom:12px;
            padding:12px;
            background:rgba(255,255,255,.05);
            border-radius:12px;
          ">
            <b>${key.toUpperCase()}</b>
            <div style="margin-top:6px;font-size:13px;opacity:.6">
              ${JSON.stringify(devices[key])}
            </div>
          </div>
        `).join("")}
      </div>
    `;
  },

  renderScenes() {
    return `
      <div>
        <h3>Сцены</h3>

        <button 
          id="addScene"
          style="
            width:100%;
            padding:12px;
            border-radius:12px;
            border:none;
            background:rgba(255,255,255,.08);
            color:white;
          ">
          Добавить тест сцену (22:00)
        </button>

        <div style="margin-top:16px;font-size:13px;opacity:.6">
          ${AURA.state.scenes.map(scene => `
            <div>• ${scene.name} (${scene.time})</div>
          `).join("")}
        </div>
      </div>
    `;
  },

  renderAccount() {
    return `
      <div>
        <h3>Аккаунт</h3>

        <div>Имя: ${AURA.state.user.name || "Гость"}</div>
        <div>ID: ${AURA.state.user.telegramId || "-"}</div>

        <div style="margin-top:12px">
          <button data-role="owner">Owner</button>
          <button data-role="guest">Guest</button>
        </div>
      </div>
    `;
  },

  bind() {

    document.querySelectorAll("[data-tab]").forEach(el => {
      el.onclick = () => {
        this.currentTab = el.dataset.tab;
        this.render();
      };
    });

    const generateBtn = document.getElementById("generate");
    if (generateBtn) {
      generateBtn.onclick = () => {
        const text = document.getElementById("input").value;
        AI.generate(text);
        this.render();
      };
    }

    const addSceneBtn = document.getElementById("addScene");
    if (addSceneBtn) {
      addSceneBtn.onclick = () => {
        AURA.dispatch({
          type: "ADD_SCENE",
          payload: {
            name: "Ночная сцена",
            time: "22:0"
          }
        });
        this.render();
      };
    }

    document.querySelectorAll("[data-role]").forEach(el => {
      el.onclick = () => {
        AURA.dispatch({
          type: "SET_ROLE",
          payload: el.dataset.role
        });
        this.render();
      };
    });
  }

};

window.UI = UI;

UI.init();

console.log("AURA X UI ready");