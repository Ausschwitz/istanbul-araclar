const SUPABASE_URL = "https://ynwybfequmttfqrloqtl.supabase.co";
const SUPABASE_KEY = "sb_publishable_HmDxeh3imA0fEW8h6ygz-g_2zssLCfo";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ==========================
// ANA SAYFA
// ==========================
async function loadCars() {
  const { data, error } = await sb
    .from("cars")
    .select("*")
    .eq("is_active", true);

  if (error) return console.error(error);

  const vip = data.filter(x => x.type === "vip").sort((a,b)=>a.vip_slot-b.vip_slot);
  const normal = data.filter(x => x.type === "normal").sort((a,b)=>a.normal_slot-b.normal_slot);

  renderCars(vip, "vipCars");
  renderCars(normal, "normalCars");
}

function renderCars(list, containerId){
  const container = document.getElementById(containerId);
  if(!container) return;

  container.innerHTML = "";

  list.forEach(car=>{
    const img = car.images?.[0] || "";

    const div = document.createElement("div");
    div.className = "car-box";

    div.innerHTML = `
      <img src="${img}">
      <h3>${car.name}</h3>
      <p>${car.card_label || ""}</p>
    `;

    div.onclick = ()=>{
      localStorage.setItem("car", JSON.stringify(car));
      window.location.href = "detay.html";
    }

    container.appendChild(div);
  });
}

// ==========================
// DETAY SAYFASI
// ==========================
function loadDetail(){
  const car = JSON.parse(localStorage.getItem("car"));
  if(!car) return;

  document.getElementById("title").innerText = car.name;
  document.getElementById("desc").innerText = car.description || "";

  const gallery = document.getElementById("gallery");
  gallery.innerHTML = "";

  car.images?.forEach(img=>{
    const i = document.createElement("img");
    i.src = img;
    gallery.appendChild(i);
  });

  document.getElementById("whatsappBtn").href = `https://wa.me/${car.whatsapp || ""}`;
  document.getElementById("telegramBtn").href = `https://t.me/${car.telegram || ""}`;
}

// ==========================
// İLETİŞİM SAYFASI
// ==========================
async function loadContact(){
  const { data } = await sb.from("cars").select("*").limit(1);

  if(!data || data.length === 0) return;

  const car = data[0];

  const wa = document.getElementById("whatsappLink");
  const tg = document.getElementById("telegramLink");
  const empty = document.getElementById("contactEmpty");

  if(car.whatsapp){
    wa.href = `https://wa.me/${car.whatsapp}`;
  } else {
    wa.style.display = "none";
  }

  if(car.telegram){
    tg.href = `https://t.me/${car.telegram}`;
  } else {
    tg.style.display = "none";
  }

  empty.style.display = "none";
}