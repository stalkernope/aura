console.log("AURA X Premium UI loaded");

const UI = {
  tab: "home",

  tabs: [
    { key:"home", title:"Дом" },
    { key:"scenes", title:"Сценарии" },
    { key:"history", title:"История" },
    { key:"profile", title:"Профиль" }
  ],

  init(){
    this.renderTabs();
    this.render();
    this.bindGlobal();
  },

  renderTabs(){
    const wrap = document.getElementById("tabs");
    wrap.innerHTML = this.tabs.map(t => `
      <div class="tab ${this.tab===t.key?"active":""}" data-tab="${t.key}">
        ${t.title}
      </div>
    `).join("");

    wrap.querySelectorAll("[data-tab]").forEach(el=>{
      el.onclick=()=>{
        this.tab=el.dataset.tab;
        this.renderTabs();
        this.render();
      }
    });
  },

  render(){
    const root=document.getElementById("app");

    if(this.tab==="home") root.innerHTML=this.renderHome();
    if(this.tab==="scenes") root.innerHTML=this.renderScenes();
    if(this.tab==="history") root.innerHTML=this.renderHistory();
    if(this.tab==="profile") root.innerHTML=this.renderProfile();
  },

  renderHome(){
    const d=AURA.state.devices;

    return `
      <div class="section">
        <h3>Комнаты</h3>
        <div class="grid-rooms">
          <div class="room-card">
            <div class="room-title">Гостиная</div>
            <div class="room-meta">2 устройства активны</div>
            <div class="device-row">
              <span>Свет</span>
              <span class="${d.light.power?'device-on':'device-off'}">
                ${d.light.power?'Вкл':'Выкл'}
              </span>
            </div>
            <div class="device-row">
              <span>Музыка</span>
              <span class="${d.speaker.playing?'device-on':'device-off'}">
                ${d.speaker.playing?'Играет':'Остановлена'}
              </span>
            </div>
          </div>

          <div class="room-card">
            <div class="room-title">Спальня</div>
            <div class="room-meta">Климат</div>
            <div class="device-row">
              <span>Температура</span>
              <span>${d.climate.temperature}°</span>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  renderScenes(){
    return `
      <div class="section">
        <h3>Рекомендованные</h3>
        <div class="card">
          Режим "Релакс"<br/>
          <small>AI рекомендует на вечер</small>
        </div>
        <div class="card">
          Авто-свет 19:00<br/>
          <small>Вы часто включаете свет в это время</small>
        </div>
      </div>
    `;
  },

  renderHistory(){
    return `
      <div class="section">
        <h3>Последние действия</h3>
        ${AURA.state.executionLog.map(x=>{
          const t=new Date(x.time).toLocaleTimeString();
          return `<div class="card">${t} — ${x.plan.intent}</div>`
        }).join("")}
      </div>
    `;
  },

  renderProfile(){
    return `
      <div class="section">
        <h3>Профиль</h3>
        <div class="card">
          Имя: ${AURA.state.user.name || "Гость"}<br/>
          Роль: ${AURA.state.user.role}
        </div>
      </div>
    `;
  },

  bindGlobal(){
    const fab=document.getElementById("aiFab");
    const sheet=document.getElementById("aiSheet");
    const generate=document.getElementById("aiGenerate");
    const input=document.getElementById("aiInput");
    const planBox=document.getElementById("planBox");

    fab.onclick=()=>sheet.classList.toggle("open");

    generate.onclick=()=>{
      if(!input.value.trim()) return;
      const plan=AI.generate(input.value);
      planBox.innerHTML=this.formatPlan(plan);
    };
  },

  formatPlan(plan){
    if(!plan) return "";
    return `
      <strong>План:</strong><br/>
      ${plan.plan.map(p=>`
        • ${p.device} 
        ${p.brightness?`— ${p.brightness}%`:``}
        ${p.volume?`— ${p.volume}%`:``}
        ${p.temperature?`— ${p.temperature}°`:``}
      `).join("<br/>")}
      <br/><br/>
      <button onclick="AURA.dispatch({type:'EXECUTE_PLAN'})" class="ai-btn">
        Применить
      </button>
    `;
  }

};

window.UI=UI;
UI.init();