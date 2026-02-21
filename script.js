// --- KONFIGURASI ---
const ADMIN_PIN = "741852963";
const NAMES = ["MARKUS FEBRIAN", "PUTRI CAHAYA", "RADO DINATA", "SELWEN AL KHAIRI", "GIERDAV ALDEN", "S PRIYA DARSIN", "DONY KRIS SANDI", "ALIKA SALSABILAH", "MUHAMMAD HABIB", "RIZKY AULIA", "NOVITA SARI", "ZULMADIL REYDINATA", "INDA AFRITYA", "AMANDA REZKY TANJUNG", "SAWALUDDIN HASIBUAN", "RISKA ARNITA PUTRI", "DIAN THERESA", "JONATHAN QUEEN", "HENDRA", "SENDI REVIAN", "SYUKUR KURNIAWAN", "OGI CANDRA", "IRVAN GANESHA", "RAHMA TINA", "JOSIA ROMANDA", "MUHAMMAD BAKRON", "JIMMY", "CINDY NURUL", "DEVA NANDA", "MUHAMMAD JUHARI", "FANNY FADILLA", "WIRA ARIA", "JANNIFER MENTARI", "AGUSSALIM FAJAR", "SASITHAREN", "JUWAN", "FRENDYCO", "KHOIRUL AMRI", "AL BETO", "APRI YOGO", "ANDI", "FRANS WILLIAM", "INDRA", "WILSON LEO WU", "ECHA ADELIA", "AHLUN IQBAL", "INDRA KURNIAWAN", "MARIO CHRISTOPHER", "NADYA TASYA", "LUSI", "YOGI ARDIANSYAH", "SANJELIA PUTRI", "ARUN RAJZ", "KHAIRUL AZHAR", "BOBI ARFANDI", "HARIS MULIA", "ANDRA FAUZI", "ADITYA RIWANA", "JOHANDA JAYUSMAN", "SABAR MORANDO", "RAJA EDWARD", "DENNIS GOLDSTEIN", "DWIKI RAMDANI", "ABDUL TARIGAN", "RAHMAT HIDAYAT"];
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

// --- AUTO LOGIN CHECK (CEPAT) ---
if (localStorage.getItem('tv_isLoggedIn') === 'true') {
    document.documentElement.style.setProperty('--display-auth', 'none');
    window.addEventListener('DOMContentLoaded', () => {
        const overlay = document.getElementById('authOverlay');
        if(overlay) overlay.style.display = 'none';
    });
}

// --- SIDEBAR LOGIC ---
function toggleNav() {
    const sb = document.getElementById("mySidebar");
    const mc = document.getElementById("mainContent");
    const btn = document.getElementById("openBtn");
    
    if (sb.classList.contains("closed")) {
        sb.classList.remove("closed");
        mc.classList.remove("wide");
        btn.style.display = "none";
    } else {
        sb.classList.add("closed");
        mc.classList.add("wide");
        btn.style.display = "block";
    }
}

// --- AUTH FUNCTIONS ---
let authMode = 'LOGIN';
function handleAuth() {
    const user = document.getElementById('uUser').value.trim();
    const pass = document.getElementById('uPass').value.trim();
    let accounts = JSON.parse(localStorage.getItem('tv_accounts') || '{"admin":"admin123"}');

    if(authMode === 'LOGIN') {
        if(accounts[user] && accounts[user] === pass) {
            localStorage.setItem('tv_isLoggedIn', 'true');
            location.reload();
        } else { alert("Akses Ditolak!"); }
    } else if(authMode === 'REGISTER') {
        accounts[user] = pass;
        localStorage.setItem('tv_accounts', JSON.stringify(accounts));
        alert("Terdaftar! Silakan Login.");
        location.reload();
    }
}

function logout() {
    if(confirm("Logout?")) {
        localStorage.removeItem('tv_isLoggedIn');
        location.reload();
    }
}

// --- ABSENSI LOGIC ---
function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clockDisplay');
    const pDate = document.getElementById('pDate');
    const pDay = document.getElementById('pDay');
    
    if(clock) clock.innerText = now.toTimeString().split(' ')[0];
    if(pDate) pDate.innerText = now.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
    if(pDay) pDay.innerText = now.toLocaleDateString('id-ID', {weekday:'long'}).toUpperCase();

    // Untuk halaman jobdesk
    const jdDate = document.getElementById('jobDateDisplay');
    if(jdDate) jdDate.innerText = "LAPORAN TUGAS - " + now.toLocaleDateString('id-ID', {day:'2-digit', month:'long', year:'numeric'});
}

function speakAI(text) {
    const synth = window.speechSynthesis;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'id-ID';
    synth.speak(utter);
}

function hitungSelisih(target, aktual) {
    const t = target.split(':').map(Number);
    const a = aktual.split(':').map(Number);
    const diff = (a[0]*3600 + a[1]*60 + a[2]) - (t[0]*3600 + t[1]*60 + t[2]);
    if (diff <= 0) return null;
    return `${Math.floor(diff/3600)}j ${Math.floor((diff%3600)/60)}m`;
}

function tambahAbsen() {
    const name = document.getElementById('iName').value.trim().toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;
    
    if(!NAMES.includes(name)) return alert("Nama Tidak Terdaftar!");
    
    let db = JSON.parse(localStorage.getItem('tv_v18') || "[]");
    if(db.some(x => x.name === name)) return alert("Sudah Absen!");

    const late = hitungSelisih(TARGETS[shift], time);
    speakAI(late ? `Perhatian ${name}, terlambat ${late}` : `Selamat bekerja ${name}`);

    db.push({ shift, name, target: TARGETS[shift], actual: time });
    localStorage.setItem('tv_v18', JSON.stringify(db));
    document.getElementById('iName').value = "";
    render();
}

function render() {
    const tbody = document.querySelector('#tblMain tbody');
    if(!tbody) return;
    
    let db = JSON.parse(localStorage.getItem('tv_v18') || "[]");
    tbody.innerHTML = "";
    
    let onTime = 0, lateCount = 0;
    db.forEach(d => {
        const isLate = hitungSelisih(d.target, d.actual);
        if(isLate) lateCount++; else onTime++;
        
        const row = tbody.insertRow();
        row.style.background = isLate ? "#fff0f0" : "#f0fff4";
        row.innerHTML = `<td>${d.shift}</td><td>${d.name}</td><td>${d.target}</td><td>${d.actual}</td>
        <td style="color:${isLate?'red':'green'}">${isLate ? 'TELAT '+isLate : 'TEPAT'}</td>
        <td><button onclick="hapusAbsen('${d.name}')" style="border:none; background:none; cursor:pointer;">✕</button></td>`;
    });

    document.getElementById('sOn').innerText = onTime;
    document.getElementById('sLate').innerText = lateCount;
    document.getElementById('sAbs').innerText = NAMES.length - db.length;
}

function hapusAbsen(name) {
    if(prompt("PIN ADMIN:") === ADMIN_PIN) {
        let db = JSON.parse(localStorage.getItem('tv_v18') || "[]");
        localStorage.setItem('tv_v18', JSON.stringify(db.filter(x => x.name !== name)));
        render();
    }
}

function resetData() {
    if(prompt("PIN KONFIRMASI:") === ADMIN_PIN) {
        localStorage.removeItem('tv_v18');
        render();
    }
}

// Init
setInterval(updateClock, 1000);
window.onload = () => {
    updateClock();
    render();
    // Render datalist
    const dl = document.getElementById('staffs');
    if(dl) NAMES.forEach(n => dl.innerHTML += `<option value="${n}">`);
};
