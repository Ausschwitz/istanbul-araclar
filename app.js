let cars = JSON.parse(localStorage.getItem('cars')) || [];
let settings = JSON.parse(localStorage.getItem('settings')) || {
    title: 'AstraCarsClub',
    slogan: 'Şehrin En Güzel Makineleri',
    whatsapp: '',
    telegram: '',
    emptyText: 'Yeni sahibini bekliyor',
    vipCount: 50,
    normalCount: 150,
    gridCount: 5,
    colors: {
        bgStart: '#4a0030',
        bgEnd: '#2a0018',
        headerColor: '#ff4fa3',
        menuColor: '#ffffff',
        textColor: '#fff4f8',
        emptyColor: '#5a5a5a',
        cardTextColor: '#ffffff',
        detailTextColor: '#ffffff'
    }
};

const FALLBACK_IMAGE = 'https://via.placeholder.com/1200x800/5a0030/ffffff?text=Gorsel+Yok';

function saveAll(){
    localStorage.setItem('cars', JSON.stringify(cars));
    localStorage.setItem('settings', JSON.stringify(settings));
}

function saveCar(){
    const rawImages = document.getElementById('images').value
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');

    const type = document.getElementById('type').value;
    const vipSlotValue = parseInt(document.getElementById('vipSlot').value || '0', 10);
    const normalSlotValue = parseInt(document.getElementById('normalSlot').value || '0', 10);

    const carData = {
        name: document.getElementById('name').value.trim(),
        cardLabel: document.getElementById('cardLabel').value.trim(),
        images: rawImages,
        age: document.getElementById('age').value.trim(),
        height: document.getElementById('height').value.trim(),
        weight: document.getElementById('weight').value.trim(),
        desc: document.getElementById('desc').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        whatsapp: document.getElementById('carWhatsapp').value.trim(),
        telegram: document.getElementById('carTelegram').value.trim(),
        type,
        vipSlot: type === 'vip' ? vipSlotValue : null,
        normalSlot: type === 'normal' ? normalSlotValue : null
    };

    if(!carData.name){
        alert('Araç adı gerekli');
        return;
    }

    if(type === 'vip' && (!vipSlotValue || vipSlotValue < 1)){
        alert('VIP kutu numarası gerekli');
        return;
    }

    if(type === 'normal' && (!normalSlotValue || normalSlotValue < 1)){
        alert('Normal kutu numarası gerekli');
        return;
    }

    const editId = document.getElementById('editId').value;

    if(type === 'vip'){
        const conflict = cars.find(
            car => String(car.id) !== String(editId) &&
            car.type === 'vip' &&
            Number(car.vipSlot) === vipSlotValue
        );
        if(conflict){
            alert('Bu VIP kutuda zaten başka araç var');
            return;
        }
    }

    if(type === 'normal'){
        const conflict = cars.find(
            car => String(car.id) !== String(editId) &&
            car.type === 'normal' &&
            Number(car.normalSlot) === normalSlotValue
        );
        if(conflict){
            alert('Bu normal kutuda zaten başka araç var');
            return;
        }
    }

    if(editId){
        const index = cars.findIndex(car => String(car.id) === String(editId));
        if(index !== -1){
            cars[index] = { ...cars[index], ...carData };
        }
        alert('Araç güncellendi');
    } else {
        cars.push({
            id: Date.now(),
            ...carData
        });
        alert('Araç eklendi');
    }

    saveAll();
    clearCarForm();
    loadVehicleList();
}

function clearCarForm(){
    document.getElementById('editId').value = '';
    document.getElementById('name').value = '';
    document.getElementById('cardLabel').value = '';
    document.getElementById('images').value = '';
    document.getElementById('age').value = '';
    document.getElementById('height').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('desc').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('carWhatsapp').value = '';
    document.getElementById('carTelegram').value = '';
    document.getElementById('type').value = 'vip';
    document.getElementById('vipSlot').value = '';
    document.getElementById('normalSlot').value = '';
    document.getElementById('saveBtn').innerText = 'Araç Kaydet';
    document.getElementById('cancelEditBtn').style.display = 'none';

    if(typeof toggleSlotInputs === 'function'){
        toggleSlotInputs();
    }
}

function cancelEdit(){
    clearCarForm();
}

function editCar(id){
    const car = cars.find(item => item.id === id);
    if(!car) return;

    document.getElementById('editId').value = car.id;
    document.getElementById('name').value = car.name || '';
    document.getElementById('cardLabel').value = car.cardLabel || '';
    document.getElementById('images').value = (car.images || []).join('\n');
    document.getElementById('age').value = car.age || '';
    document.getElementById('height').value = car.height || '';
    document.getElementById('weight').value = car.weight || '';
    document.getElementById('desc').value = car.desc || '';
    document.getElementById('phone').value = car.phone || '';
    document.getElementById('carWhatsapp').value = car.whatsapp || '';
    document.getElementById('carTelegram').value = car.telegram || '';
    document.getElementById('type').value = car.type || 'vip';
    document.getElementById('vipSlot').value = car.vipSlot || '';
    document.getElementById('normalSlot').value = car.normalSlot || '';
    document.getElementById('saveBtn').innerText = 'Araç Güncelle';
    document.getElementById('cancelEditBtn').style.display = 'block';

    if(typeof toggleSlotInputs === 'function'){
        toggleSlotInputs();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteCar(id){
    const ok = confirm('Bu aracı silmek istiyor musun?');
    if(!ok) return;

    cars = cars.filter(car => car.id !== id);
    saveAll();
    loadVehicleList();
    alert('Araç silindi');
}

function loadVehicleList(){
    const list = document.getElementById('vehicleList');
    if(!list) return;

    list.innerHTML = '';

    if(cars.length === 0){
        list.innerHTML = `
            <div class="vehicle-item">
                <div>
                    <strong>Henüz araç eklenmedi</strong>
                    <span>Liste boş</span>
                </div>
            </div>
        `;
        return;
    }

    cars
        .slice()
        .sort((a, b) => {
            if(a.type === b.type){
                const aSlot = a.type === 'vip' ? (a.vipSlot || 99999) : (a.normalSlot || 99999);
                const bSlot = b.type === 'vip' ? (b.vipSlot || 99999) : (b.normalSlot || 99999);
                return aSlot - bSlot;
            }
            return a.type === 'vip' ? -1 : 1;
        })
        .forEach(car => {
            const slotText = car.type === 'vip'
                ? `VIP Kutu: ${car.vipSlot || '-'}`
                : `Normal Kutu: ${car.normalSlot || '-'}`;

            list.innerHTML += `
                <div class="vehicle-item">
                    <div>
                        <strong>${car.name}</strong>
                        <span>${car.type === 'vip' ? 'VIP' : 'Normal'} • ${slotText}</span>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button class="btn btn-primary" onclick="editCar(${car.id})">Düzenle</button>
                        <button class="btn btn-danger" onclick="deleteCar(${car.id})">Sil</button>
                    </div>
                </div>
            `;
        });
}

function updateSettings(){
    settings.title = document.getElementById('title').value.trim();
    settings.slogan = document.getElementById('slogan').value.trim();
    settings.whatsapp = document.getElementById('whatsapp').value.trim();
    settings.telegram = document.getElementById('telegram').value.trim();
    settings.emptyText = document.getElementById('emptyText').value.trim() || 'Yeni sahibini bekliyor';

    saveAll();
    alert('Genel ayarlar kaydedildi');
}

function updateThemeSettings(){
    settings.colors.bgStart = getColorValue('bgStart');
    settings.colors.bgEnd = getColorValue('bgEnd');
    settings.colors.headerColor = getColorValue('headerColor');
    settings.colors.menuColor = getColorValue('menuColor');
    settings.colors.textColor = getColorValue('textColor');
    settings.colors.emptyColor = getColorValue('emptyColor');
    settings.colors.cardTextColor = getColorValue('cardTextColor');
    settings.colors.detailTextColor = getColorValue('detailTextColor');

    settings.vipCount = parseInt(document.getElementById('vipCount').value || '0', 10);
    settings.normalCount = parseInt(document.getElementById('normalCount').value || '0', 10);
    settings.gridCount = parseInt(document.getElementById('gridCount').value || '5', 10);

    saveAll();
    alert('Tema ve düzen kaydedildi');
}

function getColorValue(id){
    const picker = document.getElementById(id);
    const text = document.getElementById(id + 'Text');
    return (text && text.value.trim()) || (picker && picker.value) || '#ffffff';
}

function loadAdmin(){
    setVal('title', settings.title);
    setVal('slogan', settings.slogan);
    setVal('whatsapp', settings.whatsapp);
    setVal('telegram', settings.telegram);
    setVal('emptyText', settings.emptyText);

    setVal('vipCount', settings.vipCount);
    setVal('normalCount', settings.normalCount);
    setVal('gridCount', settings.gridCount);

    bindColor('bgStart', settings.colors.bgStart);
    bindColor('bgEnd', settings.colors.bgEnd);
    bindColor('headerColor', settings.colors.headerColor);
    bindColor('menuColor', settings.colors.menuColor);
    bindColor('textColor', settings.colors.textColor);
    bindColor('emptyColor', settings.colors.emptyColor);
    bindColor('cardTextColor', settings.colors.cardTextColor);
    bindColor('detailTextColor', settings.colors.detailTextColor);

    clearCarForm();
}

function setVal(id, value){
    const el = document.getElementById(id);
    if(el) el.value = value ?? '';
}

function bindColor(id, value){
    const picker = document.getElementById(id);
    const text = document.getElementById(id + 'Text');

    if(picker) picker.value = value;
    if(text) text.value = value;

    if(picker && text && !picker.dataset.bound){
        picker.addEventListener('input', () => {
            text.value = picker.value;
        });

        text.addEventListener('input', () => {
            if(/^#[0-9A-Fa-f]{6}$/.test(text.value.trim())){
                picker.value = text.value.trim();
            }
        });

        picker.dataset.bound = '1';
    }
}

function loadCars(){
    const vip = document.getElementById('vip');
    const normal = document.getElementById('normal');

    if(!vip || !normal) return;

    applyThemeToPage();

    document.getElementById('siteTitle').innerText = settings.title;
    document.getElementById('slogan').innerText = settings.slogan;

    vip.innerHTML = '';
    normal.innerHTML = '';

    for(let i = 1; i <= settings.vipCount; i++){
        const car = cars.find(c => c.type === 'vip' && Number(c.vipSlot) === i);

        if(car){
            vip.innerHTML += createVipCard(car);
        } else {
            vip.innerHTML += `
                <div class="card empty-card">
                    <div class="empty-box large-empty">${settings.emptyText}</div>
                </div>
            `;
        }
    }

    for(let i = 1; i <= settings.normalCount; i++){
        const car = cars.find(c => c.type === 'normal' && Number(c.normalSlot) === i);

        if(car){
            normal.innerHTML += createNormalCard(car);
        } else {
            normal.innerHTML += `
                <div class="card empty-card">
                    <div class="empty-box">${settings.emptyText}</div>
                </div>
            `;
        }
    }

    document.documentElement.style.setProperty('--grid-count', settings.gridCount);
}

function createVipCard(car){
    const thumb = getCarThumb(car);

    const labelHtml = car.cardLabel
        ? `<div class="card-badge">${car.cardLabel}</div>`
        : '';

    return `
        <div class="card vip-card" onclick="go(${car.id})">
            <img src="${thumb}" alt="${car.name}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
            ${labelHtml}
            <div class="overlay">${car.name}</div>
        </div>
    `;
}

function createNormalCard(car){
    const thumb = getCarThumb(car);

    const labelHtml = car.cardLabel
        ? `<div class="card-badge">${car.cardLabel}</div>`
        : '';

    return `
        <div class="card normal-card" onclick="go(${car.id})">
            <img src="${thumb}" alt="${car.name}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
            ${labelHtml}
            <div class="overlay">${car.name}</div>
        </div>
    `;
}

function getCarThumb(car){
    if(car.images && car.images.length > 0) return car.images[0];
    return FALLBACK_IMAGE;
}

function go(id){
    window.open('detay.html?id=' + id, '_blank');
}

function loadDetail(){
    applyThemeToPage();

    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const car = cars.find(c => String(c.id) === String(id));

    if(!car){
        document.getElementById('content').innerHTML = '<p style="padding:20px;">Araç bulunamadı</p>';
        return;
    }

    const galleryImages = (car.images && car.images.length > 0)
        ? car.images
        : [FALLBACK_IMAGE];

    const galleryHtml = galleryImages.map(img => `
        <div class="detail-slide">
            <img src="${img}" alt="${car.name}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
        </div>
    `).join('');

    let buttonsHtml = '';

    if(car.phone){
        buttonsHtml += `<a class="contact-btn phone-btn" href="tel:${car.phone}">📞 Telefon</a>`;
    }

    if(car.whatsapp){
        buttonsHtml += `<a class="contact-btn whatsapp-btn" target="_blank" href="https://wa.me/${car.whatsapp}">💬 WhatsApp</a>`;
    }

    if(car.telegram){
        buttonsHtml += `<a class="contact-btn telegram-btn" target="_blank" href="https://t.me/${car.telegram}">✈️ Telegram</a>`;
    }

    document.getElementById('content').innerHTML = `
        <div class="detail-wrap">
            <h1 class="detail-title">${car.name}</h1>

            <div class="detail-gallery">
                ${galleryHtml}
            </div>

            <div class="car-specs">
                ${car.age ? `<div>🎂 Yaş: ${car.age}</div>` : ''}
                ${car.height ? `<div>📏 Boy: ${car.height}</div>` : ''}
                ${car.weight ? `<div>⚖️ Kilo: ${car.weight}</div>` : ''}
            </div>

            <div class="detail-info">
                <p>${car.desc || ''}</p>
                ${buttonsHtml ? `<div class="detail-buttons">${buttonsHtml}</div>` : ''}
            </div>
        </div>
    `;
}

function loadContact(){
    applyThemeToPage();

    const wp = document.getElementById('whatsappLink');
    const tg = document.getElementById('telegramLink');
    const empty = document.getElementById('contactEmpty');

    let visibleCount = 0;

    if(wp){
        if(settings.whatsapp){
            wp.href = 'https://wa.me/' + settings.whatsapp;
            wp.style.display = 'flex';
            visibleCount++;
        } else {
            wp.style.display = 'none';
        }
    }

    if(tg){
        if(settings.telegram){
            tg.href = 'https://t.me/' + settings.telegram;
            tg.style.display = 'flex';
            visibleCount++;
        } else {
            tg.style.display = 'none';
        }
    }

    if(empty){
        empty.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function applyThemeToPage(){
    document.documentElement.style.setProperty('--bg-start', settings.colors.bgStart);
    document.documentElement.style.setProperty('--bg-end', settings.colors.bgEnd);
    document.documentElement.style.setProperty('--header-color', settings.colors.headerColor);
    document.documentElement.style.setProperty('--menu-color', settings.colors.menuColor);
    document.documentElement.style.setProperty('--text-color', settings.colors.textColor);
    document.documentElement.style.setProperty('--empty-color', settings.colors.emptyColor);
    document.documentElement.style.setProperty('--card-text-color', settings.colors.cardTextColor);
    document.documentElement.style.setProperty('--detail-text-color', settings.colors.detailTextColor);
    document.documentElement.style.setProperty('--grid-count', settings.gridCount);
    document.title = settings.title;
}