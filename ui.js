console.log("AURA X PRO UI loaded");

const UI = {

  tab: "home",

  render() {
    const root = document.getElementById("app");
    root.innerHTML = this.renderHome();
    this.bind();
  },

  renderHome() {
    const d = AURA.state.devices;

    return `
      <div style="padding:16px 16px 120px;">

        <div style="font-size:22px;font-weight:800;">Мой дом</div>
        <div style="color:#9AA3B2;margin-top:4px;">
          ${this.statusText()}
        </div>

        ${this.roomCard("Гостиная", [
          ["Свет", d.light.power ? "Вкл" : "Выкл"],
          ["Музыка", d.speaker.playing ? "Играет" : "Остановлена"]
        ])}

        ${this.roomCard("Спальня", [
          ["Климат", d.climate.power ? d.climate.temperature + "°" : "Выкл"]
        ])}

        <div style="margin-top:24px;font-size:15px;color:#9AA3B2;">Устройства</div>

        ${this.deviceCard("light","Свет", d.light.power, d.light.brightness+"%")}
        ${this.deviceCard("speaker","Колонка", d.speaker.playing, d.speaker.volume+"%")}
        ${this.deviceCard("climate","Климат", d.climate.power, d.climate.temperature+"°")}

      </div>

      <button id="aiBtn"
        style="
        position:fixed;
        bottom:100px;
        right:20px;
        width:60px;
        height:60px;
        border-radius:50%;
        background:linear-gradient(135deg,#7B61FF,#5E8BFF);
        border:none;
        color:white;
        font-size:24px;
        box-shadow:0 15px 40px rgba(94,139,255,.4);
        ">
        🧠
      </button>
    `;
  },

  statusText() {
    const d = AURA.state.devices;
    if(d.light.power || d.speaker.playing || d.climate.power)
      return "Активные устройства";
    return "Всё спокойно";
  },

  roomCard(title, items) {
    return `
      <div style="
        margin-top:18px;
        background:#1B1F2A;
        border-radius:20px;
        padding:16px;
        box-shadow:0 20px 60px rgba(0,0,0,.5);
        border:1px solid rgba(255,255,255,.05);
      ">
        <div style="font-weight:700;">${title}</div>
        ${items.map(i=>`
          <div style="display:flex;justify-content:space-between;margin-top:8px;color:#9AA3B2;">
            <span>${i[0]}</span>
            <span style="color:${i[1]!=="Выкл"?"#34C759":"#9AA3B2"}">${i[1]}</span>
          </div>
        `).join("")}
      </div>
    `;
  },

  deviceCard(key,title,on,value) {
    return `
      <div data-device="${key}"
        style="
        margin-top:12px;
        background:${on?"rgba(94,139,255,.12)":"#1B1F2A"};
        border-radius:20px;
        padding:16px;
        display:flex;
        justify-content:space-between;
        align-items:center;
        border:1px solid rgba(255,255,255,.05);
      ">
        <div>
          <div style="font-weight:700;">${title}</div>
          <div style="color:#9AA3B2;font-size:13px;margin-top:4px;">${value}</div>
        </div>
        <div style="
          width:48px;
          height:28px;
          border-radius:14px;
          background:${on?"#5E8BFF":"rgba(255,255,255,.15)"};
          position:relative;
        ">
          <div style="
            width:22px;
            height:22px;
            background:white;
            border-radius:50%;
            position:absolute;
            top:3px;
            left:${on?"23px":"3px"};
            transition:.2s;
          "></div>
        </div>
      </div>
    `;
  },

  bind() {

    document.querySelectorAll("[data-device]").forEach(el=>{
      el.onclick=()=>{
        const device = el.dataset.device;
        AURA.dispatch({type:"TOGGLE", device});
      }
    });

    const aiBtn = document.getElementById("aiBtn");
    if(aiBtn) {
      aiBtn.onclick=()=>this.openAI();
    }
  },

  openAI() {

    const overlay = document.createElement("div");
    overlay.style="
      position:fixed;
      inset:0;
      background:rgba(0,0,0,.6);
      backdrop-filter:blur(8px);
    ";

    overlay.innerHTML = `
      <div style="
        position:absolute;
        bottom:0;
        left:0;
        right:0;
        background:#1B1F2A;
        border-top-left-radius:24px;
        border-top-right-radius:24px;
        padding:20px;
      ">
        <div style="font-weight:700;">AI Центр</div>
        <input id="aiInput"
          placeholder="Например: кино / сон / гости"
          style="
            margin-top:12px;
            width:100%;
            padding:14px;
            border-radius:14px;
            border:none;
            background:#242938;
            color:white;
          ">
        <button id="aiRun"
          style="
            margin-top:12px;
            width:100%;
            padding:14px;
            border-radius:14px;
            border:none;
            background:linear-gradient(135deg,#7B61FF,#5E8BFF);
            color:white;
            font-weight:700;
          ">
          Сформировать
        </button>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.onclick=(e)=>{
      if(e.target===overlay) overlay.remove();
    };

    document.getElementById("aiRun").onclick=()=>{
      const text = document.getElementById("aiInput").value.toLowerCase();
      const plan = this.generatePlan(text);
      AURA.dispatch({
        type:"EXECUTE_PLAN",
        plan:plan,
        intent:text
      });
      overlay.remove();
    };
  },

  generatePlan(text) {

    if(text.includes("кино"))
      return [
        {device:"light",brightness:20},
        {device:"speaker",volume:25},
        {device:"climate",temperature:22}
      ];

    if(text.includes("сон"))
      return [
        {device:"light",brightness:5},
        {device:"climate",temperature:21}
      ];

    if(text.includes("гост"))
      return [
        {device:"light",brightness:60},
        {device:"speaker",volume:40}
      ];

    return [
      {device:"light",brightness:40},
      {device:"speaker",volume:25}
    ];
  }

};

window.UI = UI;
UI.render();