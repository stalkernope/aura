/* core.js — AURA X core (navigation + sheets + local state) */

(() => {
  const { qs, qsa, setHTML, icons } = window.UI;

  const state = {
    tab: "home",
    notifications: 8,
    houseName: "Мой дом",
    devicesCount: 0,
    status: "Всё спокойно",
    lastAI: "",
  };

  const persistKey = "AURA_X_STATE_V1";

  function load() {
    try {
      const raw = localStorage.getItem(persistKey);
      if (!raw) return;
      const obj = JSON.parse(raw);
      Object.assign(state, obj || {});
    } catch {}
  }
  function save() {
    try { localStorage.setItem(persistKey, JSON.stringify(state)); } catch {}
  }

  function setTab(tab) {
    state.tab = tab;
    save();
    render();
  }

  // ===== sheet =====
  const sheetBackdrop = () => qs("#sheetBackdrop");
  const sheet = () => qs("#sheet");
  const openSheet = (title = "Добавить") => {
    qs("#sheetTitle").textContent = title;
    sheetBackdrop().classList.add("show");
    sheet().classList.add("show");
  };
  const closeSheet = () => {
    sheetBackdrop().classList.remove("show");
    sheet().classList.remove("show");
  };

  function bind() {
    // header icons
    setHTML(qs("#settingsBtn"), icons.gear);
    setHTML(qs("#addBtn"), icons.plus);

    qs("#settingsBtn").addEventListener("click", () => openSheet("Настройки"));
    qs("#addBtn").addEventListener("click", () => openSheet("Добавить"));

    // quick row
    qs("#quickRow").addEventListener("click", (e) => {
      const btn = e.target.closest("[data-quick]");
      if (!btn) return;
      const t = btn.getAttribute("data-quick");
      if (t === "new") openSheet("Что нового");
      if (t === "bell") openSheet("Уведомления");
      if (t === "alarm") openSheet("Будильники");
    });

    // tiles
    qs("#tileAlice").addEventListener("click", () => openSheet("Устройства с Алисой"));
    qs("#tileSmart").addEventListener("click", () => openSheet("Устройства умного дома"));

    // bottom nav
    qs("#bottomNav").addEventListener("click", (e) => {
      const item = e.target.closest(".navItem");
      if (!item) return;
      const tab = item.getAttribute("data-tab");
      if (tab) setTab(tab);
    });

    // fab
    setHTML(qs("#fabBtn"), icons.aura);
    qs("#fabBtn").addEventListener("click", () => {
      openSheet("Добавить");
    });

    // sheet close
    setHTML(qs("#sheetClose"), `<div style="width:18px;height:18px;position:relative">
      <span style="position:absolute;left:50%;top:50%;width:18px;height:2px;background:rgba(255,255,255,.70);transform:translate(-50%,-50%) rotate(45deg);border-radius:2px"></span>
      <span style="position:absolute;left:50%;top:50%;width:18px;height:2px;background:rgba(255,255,255,.70);transform:translate(-50%,-50%) rotate(-45deg);border-radius:2px"></span>
    </div>`);
    qs("#sheetClose").addEventListener("click", closeSheet);
    sheetBackdrop().addEventListener("click", closeSheet);

    // prevent scroll bounce weird
    document.addEventListener("touchmove", (e) => {
      if (sheet().classList.contains("show")) return;
    }, { passive: true });
  }

  function renderQuickRow() {
    const row = qs("#quickRow");
    row.innerHTML = "";

    // Featured "Новое"
    const featured = document.createElement("div");
    featured.className = "qbtn featured";
    featured.setAttribute("data-quick", "new");
    featured.innerHTML = `<div class="label">Новое</div>` + `<div class="badge">${state.notifications}</div>`;
    row.appendChild(featured);

    const bell = document.createElement("div");
    bell.className = "qbtn";
    bell.setAttribute("data-quick", "bell");
    bell.innerHTML = icons.bell;
    row.appendChild(bell);

    const alarm = document.createElement("div");
    alarm.className = "qbtn";
    alarm.setAttribute("data-quick", "alarm");
    alarm.innerHTML = icons.alarm;
    row.appendChild(alarm);
  }

  function renderTilesPics(){
    setHTML(qs("#tileAlicePic"), icons.devicePack("alice"));
    setHTML(qs("#tileSmartPic"), icons.devicePack("smart"));
  }

  function renderBottomNav(){
    setHTML(qs("#navHomeIco"), icons.home);
    setHTML(qs("#navScenesIco"), icons.scenes);
    setHTML(qs("#navCatalogIco"), icons.catalog);
    setHTML(qs("#navTipsIco"), icons.tips);

    qsa(".navItem").forEach(el => {
      const tab = el.getAttribute("data-tab");
      el.classList.toggle("active", tab === state.tab);
      el.classList.toggle("pos", tab === "home");
      // “pill” только у активного — как в фотке (слева подсветка)
      const pill = el.querySelector(".pill");
      if (pill) pill.style.display = (tab === state.tab) ? "block" : "none";
    });
  }

  function renderHeader() {
    qs("#homeTitle").textContent = state.houseName;
    qs("#homeSub").textContent = state.devicesCount ? `Устройств: ${state.devicesCount}` : "Пока нет устройств";
    qs("#statusText").textContent = state.status;
  }

  function sheetContentFor(title){
    const list = qs("#sheetList");

    const mkRow = (icoHtml, title, sub, action) => {
      const row = document.createElement("div");
      row.className = "row";
      row.innerHTML = `
        <div class="rIco">${icoHtml}</div>
        <div class="rText">
          <div class="rTitle">${title}</div>
          <div class="rSub">${sub}</div>
        </div>
        <div class="chev" aria-hidden="true">›</div>
      `;
      row.addEventListener("click", () => {
        closeSheet();
        action && action();
      });
      return row;
    };

    list.innerHTML = "";

    if (title === "Добавить") {
      list.appendChild(mkRow(icons.aura, "Устройство с Алисой", "Подключение через аккаунт Яндекса (позже)", () => {
        state.status = "Режим: подключение (демо)";
        save(); render();
      }));
      list.appendChild(mkRow(icons.catalog, "Устройство умного дома", "Свет, розетки, пылесос, ТВ и другое", () => {
        state.status = "Открыт каталог устройств (демо)";
        save(); render();
      }));
      list.appendChild(mkRow(icons.scenes, "Сценарий", "Создать новый сценарий", () => setTab("scenes")));
      list.appendChild(mkRow(icons.home, "Дом", "Переименовать, комнаты, гости", () => {
        const n = prompt("Название дома", state.houseName);
        if (n && n.trim().length > 0) state.houseName = n.trim();
        save(); render();
      }));
      list.appendChild(mkRow(icons.tips, "Людей", "Owner / Guest (демо)", () => {
        state.status = "Профили: Owner/Guest (демо)";
        save(); render();
      }));
      list.appendChild(mkRow(icons.bell, "История", "События дома и устройств (демо)", () => setTab("tips")));
    }
    else if (title === "Настройки") {
      list.appendChild(mkRow(icons.gear, "Интерфейс", "Скоро: темы, акценты, шрифты", () => {}));
      list.appendChild(mkRow(icons.home, "Дом", "Название, комнаты, устройства", () => {}));
      list.appendChild(mkRow(icons.bell, "Уведомления", "Предупреждения и важные события", () => {}));
    }
    else if (title === "Уведомления") {
      list.appendChild(mkRow(icons.bell, "Пока пусто", "Здесь будут события и алерты", () => {}));
    }
    else if (title === "Будильники") {
      list.appendChild(mkRow(icons.alarm, "Голосовая команда", "«Алиса, буди меня по будням в 8 утра»", () => {}));
      list.appendChild(mkRow(icons.alarm, "Поставь Мо́ю волну", "«Поставь Мою волну на будильник»", () => {}));
      list.appendChild(mkRow(icons.alarm, "Громкость", "«Сделай громкость будильника на 10»", () => {}));
    }
    else if (title === "Что нового") {
      list.appendChild(mkRow(icons.tips, "Интересные сценарии", "Каталог идей под твой дом", () => setTab("scenes")));
      list.appendChild(mkRow(icons.catalog, "Каталог устройств", "Что купить и как подключить", () => setTab("catalog")));
    }
    else if (title === "Устройства с Алисой") {
      list.appendChild(mkRow(icons.aura, "Подключить Яндекс", "OAuth позже. Сейчас демо-режим.", () => {
        state.status = "Алиса: не подключена (демо)";
        save(); render();
      }));
      list.appendChild(mkRow(icons.catalog, "Список брендов", "Xiaomi, Aqara, Samsung… (демо)", () => {}));
    }
    else if (title === "Устройства умного дома") {
      list.appendChild(mkRow(icons.catalog, "Поиск Zigbee", "Скоро (демо)", () => {}));
      list.appendChild(mkRow(icons.catalog, "Поиск Matter", "Скоро (демо)", () => {}));
      list.appendChild(mkRow(icons.catalog, "Настроить вручную", "Добавить устройство без поиска", () => {}));
    }
    else {
      list.appendChild(mkRow(icons.tips, "Раздел в разработке", "Сделаем 1-в-1 + ИИ-фишки", () => {}));
    }
  }

  function renderBodyByTab(){
    // сейчас оставляем “главную” как на фото,
    // остальные вкладки — короткий демо-режим через состояние (позже сделаем отдельные экраны)
    const emptyTitle = qs("#emptyTitle");
    const emptySub = qs("#emptySub");
    const aiBar = qs("#aiBar");

    if (state.tab === "home") {
      emptyTitle.textContent = state.devicesCount ? `Устройств: ${state.devicesCount}` : "Пока нет устройств";
      emptySub.textContent = "Добавьте устройство и управляйте им из приложения";
      aiBar.classList.remove("hidden");
      return;
    }
    if (state.tab === "scenes") {
      emptyTitle.textContent = "Сценарии";
      emptySub.textContent = "Каталог идей + ваши сценарии (добавим 1-в-1)";
      aiBar.classList.add("hidden");
      return;
    }
    if (state.tab === "catalog") {
      emptyTitle.textContent = "Каталог";
      emptySub.textContent = "Устройства, бренды, совместимость (добавим 1-в-1)";
      aiBar.classList.add("hidden");
      return;
    }
    if (state.tab === "tips") {
      emptyTitle.textContent = "Советы";
      emptySub.textContent = "Рекомендации и события (добавим 1-в-1)";
      aiBar.classList.add("hidden");
      return;
    }
  }

  function render() {
    renderHeader();
    renderQuickRow();
    renderTilesPics();
    renderBottomNav();
    renderBodyByTab();
  }

  // Hook sheet title changes to build content
  const _openSheet = (t) => {
    // title already set inside openSheet, but build content here
    sheetContentFor(t);
  };

  // Patch openSheet to also render content
  const oldOpenSheet = window.openSheet;
  window.openSheet = (title) => { (oldOpenSheet ? oldOpenSheet(title) : null); _openSheet(title); };

  // expose openSheet/closeSheet for other scripts (ai.js)
  window.AURA = {
    state,
    setTab,
    openSheet(title){
      qs("#sheetTitle").textContent = title;
      sheetContentFor(title);
      sheetBackdrop().classList.add("show");
      sheet().classList.add("show");
    },
    closeSheet
  };

  // init
  load();
  bind();

  // connect openSheet calls in this module
  // (we used local functions, so also wire them)
  function sheetBackdrop(){ return qs("#sheetBackdrop"); }
  function sheet(){ return qs("#sheet"); }
  function closeSheet(){
    sheetBackdrop().classList.remove("show");
    sheet().classList.remove("show");
  }
  function openSheet(title="Добавить"){
    qs("#sheetTitle").textContent = title;
    sheetContentFor(title);
    sheetBackdrop().classList.add("show");
    sheet().classList.add("show");
  }

  // rebind buttons to local openSheet
  qs("#settingsBtn").onclick = () => openSheet("Настройки");
  qs("#addBtn").onclick = () => openSheet("Добавить");
  qs("#fabBtn").onclick = () => openSheet("Добавить");

  qs("#sheetClose").onclick = closeSheet;
  qs("#sheetBackdrop").onclick = closeSheet;

  // quickRow clicks
  qs("#quickRow").onclick = (e) => {
    const btn = e.target.closest("[data-quick]");
    if (!btn) return;
    const t = btn.getAttribute("data-quick");
    if (t === "new") openSheet("Что нового");
    if (t === "bell") openSheet("Уведомления");
    if (t === "alarm") openSheet("Будильники");
  };

  // tiles
  qs("#tileAlice").onclick = () => openSheet("Устройства с Алисой");
  qs("#tileSmart").onclick = () => openSheet("Устройства умного дома");

  // bottom nav
  qs("#bottomNav").onclick = (e) => {
    const item = e.target.closest(".navItem");
    if (!item) return;
    const tab = item.getAttribute("data-tab");
    if (tab) setTab(tab);
  };

  // initial sheet content not needed
  render();

  // small UX: close sheet on ESC
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

})();