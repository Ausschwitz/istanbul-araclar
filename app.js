const SUPABASE_URL = "https://ynwybfequmttfqrloqtl.supabase.co";
const SUPABASE_KEY = "sb_publishable_HmDxeh3imA0fEW8h6ygz-g_2zssLCfo";
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const defaultSettings = {
  title: "İstanbul Araçlar",
  slogan: "Premium araçların sergilendiği özel galeri",
  whatsapp: "",
  telegram: "",
  emptyText: "Yeni sahibini bekliyor",
  vipCount: 50,
  normalCount: 150,
  gridCount: 5,
  colors: {
    bgStart: "#4a0030",
    bgEnd: "#2a0018",
    headerColor: "#ff4fa3",
    menuColor: "#ffffff",
    textColor: "#fff4f8",
    emptyColor: "#5a5a5a",
    cardTextColor: "#ffffff",
    detailTextColor: "#ffffff"
  }
};

let settings = { ...defaultSettings };

const FALLBACK_IMAGE =
  "https://via.placeholder.com/1200x800/5a0030/ffffff?text=Gorsel+Yok";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadSettings() {
  const { data, error } = await sb
    .from("settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    console.error("Settings yüklenemedi:", error);
    settings = { ...defaultSettings };
    return;
  }

  settings = {
    ...defaultSettings,
    title: data.title || defaultSettings.title,
    slogan: data.slogan || defaultSettings.slogan,
    whatsapp: data.whatsapp || defaultSettings.whatsapp,
    telegram: data.telegram || defaultSettings.telegram,
    emptyText: data.empty_text || defaultSettings.emptyText
  };
}

function applyThemeToPage() {
  document.documentElement.style.setProperty("--bg-start", settings.colors.bgStart);
  document.documentElement.style.setProperty("--bg-end", settings.colors.bgEnd);
  document.documentElement.style.setProperty("--header-color", settings.colors.headerColor);
  document.documentElement.style.setProperty("--menu-color", settings.colors.menuColor);
  document.documentElement.style.setProperty("--text-color", settings.colors.textColor);
  document.documentElement.style.setProperty("--empty-color", settings.colors.emptyColor);
  document.documentElement.style.setProperty("--card-text-color", settings.colors.cardTextColor);
  document.documentElement.style.setProperty("--detail-text-color", settings.colors.detailTextColor);
  document.documentElement.style.setProperty("--grid-count", settings.gridCount);
  document.title = settings.title;
}

function setHeaderTexts(title = settings.title, slogan = settings.slogan) {
  const siteTitle = document.getElementById("siteTitle");
  const sloganEl = document.getElementById("slogan");

  if (siteTitle) siteTitle.textContent = title;
  if (sloganEl) sloganEl.textContent = slogan;

  document.title = title;
}

function getCarThumb(car) {
  if (Array.isArray(car.images) && car.images.length > 0) {
    return car.images[0];
  }
  return FALLBACK_IMAGE;
}

function go(id) {
  window.location.href = `detay.html?id=${id}`;
}

function createVipCard(car) {
  const thumb = getCarThumb(car);
  const labelHtml = car.card_label
    ? `<div class="card-badge">${escapeHtml(car.card_label)}</div>`
    : "";

  const div = document.createElement("div");
  div.className = "card vip-card";
  div.onclick = () => go(car.id);
  div.innerHTML = `
    <img src="${thumb}" alt="${escapeHtml(car.name)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
    ${labelHtml}
    <div class="overlay">${escapeHtml(car.name)}</div>
  `;
  return div;
}

function createNormalCard(car) {
  const thumb = getCarThumb(car);
  const labelHtml = car.card_label
    ? `<div class="card-badge">${escapeHtml(car.card_label)}</div>`
    : "";

  const div = document.createElement("div");
  div.className = "card normal-card";
  div.onclick = () => go(car.id);
  div.innerHTML = `
    <img src="${thumb}" alt="${escapeHtml(car.name)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
    ${labelHtml}
    <div class="overlay">${escapeHtml(car.name)}</div>
  `;
  return div;
}

async function loadCars() {
  await loadSettings();
  applyThemeToPage();
  setHeaderTexts(settings.title, settings.slogan);

  const vipContainer = document.getElementById("vipCars");
  const normalContainer = document.getElementById("normalCars");

  if (!vipContainer || !normalContainer) return;

  vipContainer.innerHTML = "";
  normalContainer.innerHTML = "";

  const { data, error } = await sb
    .from("cars")
    .select("*")
    .eq("is_active", true);

  if (error) {
    console.error(error);
    vipContainer.innerHTML = `<div class="empty-box vip-empty">Araçlar yüklenemedi</div>`;
    normalContainer.innerHTML = `<div class="empty-box">Araçlar yüklenemedi</div>`;
    return;
  }

  const cars = Array.isArray(data) ? data : [];

  for (let i = 1; i <= settings.vipCount; i++) {
    const car = cars.find(
      (item) => item.type === "vip" && Number(item.vip_slot) === i
    );

    if (car) {
      vipContainer.appendChild(createVipCard(car));
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-box vip-empty";
      empty.textContent = settings.emptyText;
      vipContainer.appendChild(empty);
    }
  }

  for (let i = 1; i <= settings.normalCount; i++) {
    const car = cars.find(
      (item) => item.type === "normal" && Number(item.normal_slot) === i
    );

    if (car) {
      normalContainer.appendChild(createNormalCard(car));
    } else {
      const empty = document.createElement("div");
      empty.className = "empty-box";
      empty.textContent = settings.emptyText;
      normalContainer.appendChild(empty);
    }
  }
}

async function loadDetail() {
  await loadSettings();
  applyThemeToPage();
  setHeaderTexts("Araç Detayı", settings.slogan);

  const content = document.getElementById("content");
  if (!content) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    content.innerHTML = '<div class="empty-box">Araç bulunamadı</div>';
    return;
  }

  const { data, error } = await sb
    .from("cars")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error(error);
    content.innerHTML = '<div class="empty-box">Araç bulunamadı</div>';
    return;
  }

  const images =
    Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : [FALLBACK_IMAGE];

  const galleryHtml = images
    .map(
      (img) => `
        <div class="detail-slide">
          <img src="${img}" alt="${escapeHtml(data.name)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
        </div>
      `
    )
    .join("");

  let buttonsHtml = "";

  if (data.phone) {
    buttonsHtml += `<a class="contact-btn phone-btn" href="tel:${escapeHtml(data.phone)}">📞 Telefon</a>`;
  }

  if (data.whatsapp) {
    buttonsHtml += `<a class="contact-btn whatsapp-btn" target="_blank" href="https://wa.me/${escapeHtml(data.whatsapp)}">💬 WhatsApp</a>`;
  }

  if (data.telegram) {
    buttonsHtml += `<a class="contact-btn telegram-btn" target="_blank" href="https://t.me/${escapeHtml(data.telegram)}">✈️ Telegram</a>`;
  }

  content.innerHTML = `
    <div class="detail-wrap">
      <h1 class="detail-title">${escapeHtml(data.name)}</h1>

      <div class="detail-gallery">
        ${galleryHtml}
      </div>

      <div class="car-specs specs">
        ${data.age ? `<div>🎂 Yaş: ${escapeHtml(data.age)}</div>` : ""}
        ${data.height ? `<div>📏 Boy: ${escapeHtml(data.height)}</div>` : ""}
        ${data.weight ? `<div>⚖️ Kilo: ${escapeHtml(data.weight)}</div>` : ""}
      </div>

      <div class="detail-info">
        <p class="detail-description">${escapeHtml(data.description || "")}</p>
        ${buttonsHtml ? `<div class="detail-buttons">${buttonsHtml}</div>` : ""}
      </div>
    </div>
  `;
}

async function loadContact() {
  await loadSettings();
  applyThemeToPage();
  setHeaderTexts(
    "Bizimle İletişime Geç",
    "Hızlı iletişim için aşağıdaki kanalları kullanabilirsiniz."
  );

  const wp = document.getElementById("whatsappLink");
  const tg = document.getElementById("telegramLink");
  const empty = document.getElementById("contactEmpty");

  let visibleCount = 0;

  if (wp) {
    if (settings.whatsapp) {
      wp.href = `https://wa.me/${settings.whatsapp}`;
      wp.style.display = "inline-flex";
      visibleCount++;
    } else {
      wp.style.display = "none";
    }
  }

  if (tg) {
    if (settings.telegram) {
      tg.href = `https://t.me/${settings.telegram}`;
      tg.style.display = "inline-flex";
      visibleCount++;
    } else {
      tg.style.display = "none";
    }
  }

  if (empty) {
    empty.style.display = visibleCount === 0 ? "block" : "none";
  }
}  
