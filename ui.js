/* AURA X PRO — UI (premium B, stable) */
(function(){
  const app = document.getElementById("app");
  const hudErr = document.getElementById("hudErr");

  function showErr(msg){
    if(!hudErr) return;
    hudErr.style.display = "block";
    hudErr.textContent = msg;
  }

  // Global crash guard (чтобы не было “чёрного экрана”)
  window.addEventListener("error", (e)=>{
    showErr("JS ERROR:\n" + (e?.message || "unknown"));
  });
  window.addEventListener("unhandledrejection", (e)=>{
    showErr("PROMISE ERROR:\n" + (e?.reason?.message || String(e?.reason || "unknown")));
  });

  function esc(s){ return String(s).replace(/[&<>"']/g, m=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m])); }
  function fmtTime(iso){
    try{
      const d = new Date(iso);
      const hh = String(d.getHours()).padStart(2,"0");
      const mm = String(d.getMinutes()).padStart(2,"0");
      return `${hh}:${mm}`;
    }catch(e){ return ""; }
  }

  function statusPillText(){
    const d = AURA.state.devices;
    const active = (d.light.power?1:0) + (d.speaker.power?1:0) + (d.climate.power?1:0);
    return active ? `Активно: ${active}` : "Всё спокойно";
  }

  function roomSummary(room){
    const d = AURA.state.devices;
    const lines = [];
    room.devices.forEach(id=>{
      const dv = d[id];
      if(!dv) return;
      if(dv.type==="light"){
        lines.push(["Свет", dv.power ? "Вкл" : "Выкл"]);
      }
      if(dv.type==="speaker"){
        lines.push(["Музыка", dv.power ? (dv.playing ? "Играет" : "Пауза") : "Остановлена"]);
      }
      if(dv.type==="climate"){
        lines.push(["Климат", dv.power ? (dv.temperature + "°") : "Выкл"]);
      }
    });
    return lines;
  }

  function navHTML(active){
    const btn = (id, ico, label)=>`
      <div class="navBtn ${active===id?"active":""}" data-tab="${id}">
        <div class="ico">${ico}</div>
        <div>${label}</div>
      </div>
    `;
    return `
      <div class="nav">
        ${btn("home","🏠","Дом")}
        ${btn("scenes","✨","Сценарии")}
        ${btn("history","🧾","История")}
        ${btn("profile","👤","Профиль")}
      </div>
    `;
  }

  function topHTML(title, subtitle){
    return `
      <div class="top">
        <div class="row">
          <div class="brand">
            <div class="logo"></div>
            <div>
              <div class="title">${esc(title)}</div>
              <div class="sub">${esc(subtitle)}</div>
            </div>
          </div>

          <div class="row" style="justify-content:flex-end">
            <div class="pill"><span class="dot"></span> ${esc(statusPillText())}</div>
            <div class="btnIcon" id="btnHelp">?</div>
          </div>
        </div>
      </div>
    `;
  }

  function deviceCard(id){
    const d = AURA.state.devices[id];
    if(!d) return "";

    let sub = "";
    let slider = "";
    if(d.type==="light"){
      sub = `Яркость: ${d.brightness}%`;
      slider = sliderHTML(id, 0, 100, d.brightness, "Яркость");
    }
    if(d.type==="speaker"){
      sub = `Громкость: ${d.volume}%`;
      slider = sliderHTML(id, 0, 100, d.volume, "Громкость");
    }
    if(d.type==="climate"){
      sub = `Темп.: ${d.temperature}°`;
      slider = sliderHTML(id, 16, 30, d.temperature, "Температура");
    }

    return `
      <div class="device" data-toggle="${esc(id)}">
        <div class="devLeft">
          <div class="devName">${esc(d.name)}</div>
          <div class="devSub">${esc(sub)}</div>
          ${slider}
        </div>

        <div class="devRight">
          <div class="toggle ${d.power?"on":""}" data-toggleonly="${esc(id)}">
            <div class="knob"></div>
          </div>
        </div>
      </div>
    `;
  }

  function sliderHTML(id, min, max, value, label){
    return `
      <div class="sliderWrap" data-sliderwrap="${esc(id)}">
        <div class="sliderRow">
          <span>${esc(label)}</span>
          <span>${esc(String(value))}</span>
        </div>
        <input type="range" min="${min}" max="${max}" value="${value}" data-slider="${esc(id)}" />
      </div>
    `;
  }

  function homeHTML(){
    const st = AURA.state;
    const rooms = st.home.rooms;

    return `
      ${topHTML("AURA X", st.home.name)}
      <div class="section">
        <div class="h">Комнаты</div>
        <div class="grid2">
          ${rooms.map(r=>{
            const lines = roomSummary(r);
            const activeCount = lines.filter(x=>x[1] !== "Выкл" && x[1] !== "Остановлена").length;
            return `
              <div class="card room" data-room="${esc(r.id)}">
                <div class="roomName">${esc(r.name)}</div>
                <div class="roomMeta">${activeCount} устройства активны</div>
                <div class="kvs">
                  ${lines.map(([k,v])=>`
                    <div class="kv"><span>${esc(k)}</span><b>${esc(v)}</b></div>
                  `).join("")}
                </div>
              </div>
            `;
          }).join("")}
        </div>

        <div class="h">Устройства</div>
        ${deviceCard("light")}
        ${deviceCard("speaker")}
        ${deviceCard("climate")}
      </div>

      <div class="aiFab" id="aiFab">🧠</div>
      ${navHTML("home")}
    `;
  }

  function scenesHTML(){
    const sc = AURA.state.scenes;
    const ui = AURA.state.ui || {};
    const mode = ui.scMode || "my";

    const tabs = `
      <div class="card" style="padding:8px; display:flex; gap:8px;">
        <div class="navBtn ${mode==="my"?"active":""}" style="height:52px" data-scmode="my">
          <div style="font-weight:900">Мои</div>
        </div>
        <div class="navBtn ${mode==="rec"?"active":""}" style="height:52px" data-scmode="rec">
          <div style="font-weight:900">Рекомендуемые</div>
        </div>
      </div>
    `;

    const list = (mode==="my" ? sc.my : sc.recommended).map(x=>`
      <div class="item" data-runscene="${esc(x.intent)}">
        <div class="itemT">${esc(x.icon)} ${esc(x.name)}</div>
        <div class="itemS">${esc(x.planHint)}</div>
      </div>
    `).join("");

    return `
      ${topHTML("Сценарии", "AI подбирает план под твою привычку")}
      <div class="section">
        ${tabs}
        <div class="list">${list}</div>
      </div>

      <div class="aiFab" id="aiFab">🧠</div>
      ${navHTML("scenes")}
    `;
  }

  function historyHTML(){
    const hist = AURA.state.history || [];
    const list = hist.length ? hist.map(h=>`
      <div class="item">
        <div class="itemT">${esc(h.title)} <span style="color:#96a0b5;font-weight:700">• ${esc(fmtTime(h.time))}</span></div>
        <div class="itemS">${esc(h.detail || h.type)}</div>
      </div>
    `).join("") : `
      <div class="item">
        <div class="itemT">Пока пусто</div>
        <div class="itemS">Сделай действие или запусти AI — появится история.</div>
      </div>
    `;

    return `
      ${topHTML("История", "Лог действий и AI-выполнений")}
      <div class="section">
        <div class="list">${list}</div>
      </div>

      <div class="aiFab" id="aiFab">🧠</div>
      ${navHTML("history")}
    `;
  }

  function profileHTML(){
    const u = AURA.state.user;

    return `
      ${topHTML("Профиль", "Telegram + роль доступа")}
      <div class="section">

        <div class="card" style="padding:14px">
          <div style="font-weight:900;font-size:16px">${esc(u.name)}</div>
          <div style="color:#96a0b5;font-size:12px;margin-top:6px">
            ID: ${esc(String(u.telegramId || 0))}${u.username ? ` • @${esc(u.username)}` : ""}
          </div>

          <div class="h" style="margin-top:14px">Роль</div>
          <div style="display:flex;gap:10px">
            <div class="chip" data-role="owner" style="${u.role==="owner"?"border-color:rgba(123,97,255,.35);background:rgba(123,97,255,.16);":""}">Owner</div>
            <div class="chip" data-role="guest" style="${u.role==="guest"?"border-color:rgba(123,97,255,.35);background:rgba(123,97,255,.16);":""}">Guest</div>
          </div>

          <div class="h" style="margin-top:14px">Сервис</div>
          <div class="chip" id="btnReset" style="background:rgba(255,255,255,.05)">Сбросить демо-дом</div>
        </div>

      </div>

      <div class="aiFab" id="aiFab">🧠</div>
      ${navHTML("profile")}
    `;
  }

  function openAI(){
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    overlay.innerHTML = `
      <div class="sheet" role="dialog" aria-modal="true">
        <div class="grab"></div>
        <div class="sheetTitle">AI-центр AURA</div>
        <div class="sheetSub">Опиши намерение — AURA построит план и применит его к дому.</div>

        <input class="input" id="aiInput" placeholder="Например: кино, свет 20, температура 22" />

        <button class="primary" id="aiGo">Сформировать и выполнить</button>

        <div class="chips">
          <div class="chip" data-chip="кино">🎬 Кино</div>
          <div class="chip" data-chip="сон">💤 Сон</div>
          <div class="chip" data-chip="гости">🎉 Гости</div>
          <div class="chip" data-chip="работа">💻 Работа</div>
          <div class="chip" data-chip="уборка">🧹 Уборка</div>
        </div>
      </div>
    `;

    overlay.addEventListener("click", (e)=>{
      if(e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);

    const aiInput = overlay.querySelector("#aiInput");
    const aiGo = overlay.querySelector("#aiGo");

    overlay.querySelectorAll("[data-chip]").forEach(el=>{
      el.addEventListener("click", ()=>{
        aiInput.value = el.getAttribute("data-chip") || "";
        aiInput.focus();
      });
    });

    function run(){
      const text = (aiInput.value || "").trim();
      if(!text) return;
      AURA.dispatch({ type:"RUN_AI", intent: text });
      overlay.remove();
    }

    aiGo.addEventListener("click", run);
    aiInput.addEventListener("keydown", (e)=>{ if(e.key === "Enter") run(); });

    setTimeout(()=>aiInput.focus(), 50);
  }

  function bindCommon(){
    // Bottom nav
    document.querySelectorAll("[data-tab]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const tab = el.getAttribute("data-tab");
        UI.setTab(tab);
      });
    });

    // AI button
    const aiFab = document.getElementById("aiFab");
    if(aiFab) aiFab.addEventListener("click", openAI);

    // help
    const help = document.getElementById("btnHelp");
    if(help){
      help.addEventListener("click", ()=>{
        openAI();
      });
    }

    // toggle power click
    document.querySelectorAll("[data-toggleonly]").forEach(el=>{
      el.addEventListener("click", (e)=>{
        e.stopPropagation();
        const id = el.getAttribute("data-toggleonly");
        AURA.dispatch({ type:"TOGGLE_POWER", id });
      });
    });

    // sliders
    document.querySelectorAll("[data-slider]").forEach(el=>{
      el.addEventListener("input", ()=>{
        const id = el.getAttribute("data-slider");
        const v = parseInt(el.value, 10);
        AURA.dispatch({ type:"SET_RANGE", id, value: v });
      });
    });

    // scenes mode
    document.querySelectorAll("[data-scmode]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const mode = el.getAttribute("data-scmode");
        const st = AURA.state;
        st.ui = st.ui || {};
        st.ui.scMode = mode === "rec" ? "rec" : "my";
        localStorage.setItem("aura_x_pro_state_v2", JSON.stringify(st));
        UI.render();
      });
    });

    // run scene
    document.querySelectorAll("[data-runscene]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const intent = el.getAttribute("data-runscene") || "";
        AURA.dispatch({ type:"RUN_AI", intent });
      });
    });

    // role
    document.querySelectorAll("[data-role]").forEach(el=>{
      el.addEventListener("click", ()=>{
        const r = el.getAttribute("data-role");
        AURA.dispatch({ type:"SET_ROLE", role: r });
      });
    });

    // reset
    const reset = document.getElementById("btnReset");
    if(reset){
      reset.addEventListener("click", ()=>{
        AURA.dispatch({ type:"RESET" });
      });
    }
  }

  const UI = {
    tab: "home",

    setTab(tab){
      UI.tab = tab || "home";
      UI.render();
    },

    render(){
      try{
        if(!app){
          document.body.innerHTML = "NO APP ROOT";
          return;
        }
        if(hudErr) hudErr.style.display = "none";

        if(UI.tab === "home") app.innerHTML = homeHTML();
        else if(UI.tab === "scenes") app.innerHTML = scenesHTML();
        else if(UI.tab === "history") app.innerHTML = historyHTML();
        else if(UI.tab === "profile") app.innerHTML = profileHTML();
        else app.innerHTML = homeHTML();

        bindCommon();
      }catch(e){
        console.error(e);
        showErr("RENDER ERROR:\n" + (e?.message || String(e)));
      }
    }
  };

  window.UI = UI;

  // Boot
  try{
    UI.render();
  }catch(e){
    showErr("BOOT ERROR:\n" + (e?.message || String(e)));
  }
})();