// --- KONFIGURASI DATA ---
const ADMIN_PIN = "741852963"; 
const NAMES = ["MARKUS FEBRIAN PAMUNGKAS ATJE", "PUTRI CAHAYA", "RADO DINATA", "SELWEN AL KHAIRI", "GIERDAV ALDEN AZUTOS DUMAT", "S PRIYA DARSIN", "DONY KRIS SANDI", "ALIKA SALSABILAH", "MUHAMMAD HABIB", "RIZKY AULIA", "NOVITA SARI", "ZULMADIL REYDINATA", "INDA AFRITYA", "AMANDA REZKY TANJUNG", "SAWALUDDIN HASIBUAN", "RISKA ARNITA PUTRI", "DIAN THERESA SIMAMORA", "JONATHAN QUEEN", "HENDRA", "SENDI REVIAN", "SYUKUR KURNIAWAN", "OGI CANDRA SAPUTRA", "IRVAN GANESHA", "RAHMA TINA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON MAULANA", "JIMMY", "CINDY NURUL AMALIA HASIBUAN", "DEVA NANDA", "MUHAMMAD JUHARI", "FANNY FADILLA", "WIRA ARIA SAPUTRA", "JANNIFER MENTARI SINGKOH", "AGUSSALIM FAJAR", "SASITHAREN", "JUWAN", "FRENDYCO", "KHOIRUL AMRI", "AL BETO", "APRI YOGO JOHANDA SEMBIRING", "ANDI", "FRANS WILLIAM ISKANDAR TAMBUNAN", "INDRA", "WILSON LEO WU", "ECHA ADELIA", "AHLUN IQBAL", "INDRA KURNIAWAN", "MARIO CHRISTOPHER SUNARWAN", "NADYA TASYA", "LUSI", "YOGI ARDIANSYAH", "SANJELIA PUTRI", "ARUN RAJZ", "KHAIRUL AZHAR", "BOBI ARFANDI", "HARIS MULIA MANURUNG", "ANDRA FAUZI", "ADITYA RIWANA", "JOHANDA JAYUSMAN", "SABAR MORANDO FRANCISCO MANIK", "RAJA EDWARD BANGUN", "DENNIS GOLDSTEIN", "DWIKI RAMDANI", "ABDUL TARIGAN", "RAHMAT HIDAYAT"];
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };
let modeTelat = false;
let authMode = 'LOGIN';

// --- SISTEM AUTH (LOGIN, DAFTAR, RESET) ---
function handleAuth() {
    const user = document.getElementById('uUser').value.trim();
    const pass = document.getElementById('uPass').value.trim();
    const conf = document.getElementById('uConfirm').value.trim();
    let accounts = JSON.parse(localStorage.getItem('tv_accounts') || '{"admin":"admin123"}');

    if(!user || !pass) return alert("Harap isi semua kolom!");

    if(authMode === 'LOGIN') {
        if(accounts[user] && accounts[user] === pass) {
            // SIMPAN STATUS LOGIN
            localStorage.setItem('tv_isLoggedIn', 'true');
            document.getElementById('authOverlay').style.display = 'none';
            speakAI("Akses diterima. Selamat datang.");
        } else { alert("Username atau Password salah!"); }
    } 
    else if(authMode === 'REGISTER') {
        if(accounts[user]) return alert("Username sudah digunakan!");
        accounts[user] = pass;
        localStorage.setItem('tv_accounts', JSON.stringify(accounts));
        alert("Pendaftaran Berhasil! Silakan Login.");
        showLogin();
    }
    else if(authMode === 'FORGOT') {
        if(!accounts[user]) return alert("Username tidak ditemukan!");
        if(pass !== conf) return alert("Konfirmasi password tidak cocok!");
        accounts[user] = pass;
        localStorage.setItem('tv_accounts', JSON.stringify(accounts));
        alert("Password berhasil diperbarui!");
        showLogin();
    }
}

function showRegister() {
    authMode = 'REGISTER';
    document.getElementById('authTitle').innerText = 'DAFTAR';
    document.getElementById('mainAuthBtn').innerText = 'BUAT AKUN';
    document.getElementById('uConfirm').style.display = 'none';
    document.getElementById('forgotLink').style.display = 'none';
    document.getElementById('toggleText').innerHTML = 'Sudah punya akun? <span onclick="showLogin()">Masuk</span>';
}

function showLogin() {
    authMode = 'LOGIN';
    document.getElementById('authTitle').innerText = 'LOGIN';
    document.getElementById('mainAuthBtn').innerText = 'MASUK';
    document.getElementById('uConfirm').style.display = 'none';
    document.getElementById('forgotLink').style.display = 'block';
    document.getElementById('toggleText').innerHTML = 'Belum punya akun? <span onclick="showRegister()">Daftar</span>';
}

function showForgot() {
    authMode = 'FORGOT';
    document.getElementById('authTitle').innerText = 'RESET';
    document.getElementById('mainAuthBtn').innerText = 'UPDATE PASSWORD';
    document.getElementById('uPass').placeholder = 'Password Baru';
    document.getElementById('uConfirm').style.display = 'block';
    document.getElementById('toggleText').innerHTML = '<span onclick="showLogin()">Kembali ke Login</span>';
}

// FUNGSI LOGOUT DENGAN KONFIRMASI
function logout() {
    if(confirm("Apakah anda ingin logout?")) {
        localStorage.removeItem('tv_isLoggedIn');
        location.reload();
    }
}

// --- SISTEM ABSENSI ---
function speakAI(text) {
    const synth = window.speechSynthesis;
    synth.cancel(); 
    const utter = new SpeechSynthesisUtterance(text.toLowerCase());
    const voices = synth.getVoices();
    const idVoice = voices.find(v => v.lang.includes('id-ID'));
    if (idVoice) utter.voice = idVoice;
    utter.lang = 'id-ID';
    synth.speak(utter);
}

function hitungSelisih(target, aktual) {
    const [th, tm, ts] = target.split(':').map(Number);
    const [ah, am, as] = aktual.split(':').map(Number);
    const tSec = th*3600 + tm*60 + ts;
    const aSec = ah*3600 + am*60 + as;
    let diff = aSec - tSec;
    if (diff <= 0) return null;
    const h = Math.floor(diff/3600);
    const m = Math.floor((diff%3600)/60);
    const s = diff%60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function tambahAbsen() {
    const input = document.getElementById('iName');
    const name = input.value.trim().toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;
    
    if(!NAMES.includes(name)) return alert("Nama tidak terdaftar!");
    let db = JSON.parse(localStorage.getItem('tv_v18') || "[]");
    if(db.some(x => x.name === name)) return alert("Staff sudah absen!");

    const telat = hitungSelisih(TARGETS[shift], time);
    if(telat) {
        const [h, m] = telat.split(':').map(Number);
        speakAI(`Perhatian ${name.toLowerCase()}, terlambat ${h} jam ${m} menit.`);
    } else {
        speakAI(`Selamat datang ${name.toLowerCase()}.`);
    }

    db.push({ shift, name, target: TARGETS[shift], actual: time });
    localStorage.setItem('tv_v18', JSON.stringify(db));
    input.value = ""; render();
}

function hapusSatu(nama) {
    if(prompt("PIN ADMIN:") === ADMIN_PIN) {
        let db = JSON.parse(localStorage.getItem('tv_v18') || "[]");
        db = db.filter(x => x.name !== nama);
        localStorage.setItem('tv_v18', JSON.stringify(db));
        render();
    } else { alert("PIN Salah!"); }
}

function resetData() {
    if(prompt("PIN ADMIN:") === ADMIN_PIN) {
        localStorage.removeItem('tv_v18');
        render();
    } else { alert("PIN Salah!"); }
}

function render() {
    let db = JSON.parse(localStorage.getItem('tv_v18') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if(!tbody) return;
    tbody.innerHTML = "";
    
    let onTime = 0, late = 0;
    db.forEach(d => { if(hitungSelisih(d.target, d.actual)) late++; else onTime++; });
    document.getElementById('sOn').innerText = onTime;
    document.getElementById('sLate').innerText = late;
    document.getElementById('sAbs').innerText = NAMES.length - db.length;

    let displayDb = [...db].reverse();
    if(modeTelat) displayDb = displayDb.filter(x => hitungSelisih(x.target, x.actual));
    
    displayDb.forEach((d) => {
        const row = tbody.insertRow();
        const telat = hitungSelisih(d.target, d.actual);
        row.className = telat ? 'row-late' : 'row-ontime';
        row.innerHTML = `<td>${d.shift}</td><td style="text-align:left;">${d.name}</td><td>${d.target}</td><td>${d.actual}</td><td>${telat ? 'TELAT '+telat : 'TEPAT'}</td><td><button class="btn-del-pin" onclick="hapusSatu('${d.name}')">✕</button></td>`;
    });

    const dl = document.getElementById('staffs');
    dl.innerHTML = "";
    const sudah = db.map(x=>x.name);
    NAMES.filter(n => !sudah.includes(n)).forEach(n => {
        const o = document.createElement('option'); o.value = n; dl.appendChild(o);
    });
    renderChat();
}

function filterTelat() {
    modeTelat = !modeTelat;
    const btn = document.getElementById('btnF');
    btn.classList.toggle('active');
    btn.innerText = modeTelat ? "LIHAT SEMUA" : "CEK TELAT";
    render();
}

function exportData() {
    const db = JSON.parse(localStorage.getItem('tv_v18') || "[]");
    if (db.length === 0) return alert("Tidak ada data!");
    let csv = "SHIFT,NAMA,TARGET,AKTUAL,STATUS\n";
    db.forEach(x => {
        const t = hitungSelisih(x.target, x.actual);
        csv += `${x.shift},${x.name},${x.target},${x.actual},${t?'TELAT '+t:'TEPAT'}\n`;
    });
    const blob = new Blob([csv], {type: 'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `ABSEN_TVTOTO_${new Date().toLocaleDateString()}.csv`;
    a.click();
}

function renderChat() {
    const box = document.getElementById('chatWrap');
    if(!box) return;
    const c = JSON.parse(localStorage.getItem('tv_chat_v18') || "[]");
    box.innerHTML = c.map(m => `<div class="chat-bubble"><span class="bubble-name">ADMIN</span><br><span style="font-size:0.85rem;">${m.text}</span></div>`).join('');
    box.scrollTop = box.scrollHeight;
}

const chatInput = document.getElementById('chatIn');
if(chatInput) {
    chatInput.addEventListener('keypress', (e) => { 
        if(e.key === 'Enter' && e.target.value.trim()) {
            const pesan = e.target.value.trim();
            let c = JSON.parse(localStorage.getItem('tv_chat_v18') || "[]");
            c.push({ text: pesan });
            localStorage.setItem('tv_chat_v18', JSON.stringify(c));
            speakAI(pesan); 
            e.target.value = ""; 
            renderChat();
        }
    });
}

function hapusChat() { if(confirm("Hapus log suara?")) { localStorage.removeItem('tv_chat_v18'); renderChat(); } }

function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clockDisplay');
    const pDate = document.getElementById('pDate');
    const pDay = document.getElementById('pDay');
    
    if(clock) clock.innerText = now.toTimeString().split(' ')[0];
    if(pDate) pDate.innerText = now.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
    if(pDay) pDay.innerText = now.toLocaleDateString('id-ID', {weekday:'long'}).toUpperCase();
}

// --- AUTO-LOGIN LOGIC ---
function checkLoginStatus() {
    const status = localStorage.getItem("tv_isLoggedIn");
    const overlay = document.getElementById("authOverlay");
    if (status === "true" && overlay) {
        overlay.style.display = "none";
    }
}

function handleAuth() {
    const user = document.getElementById('uUser').value.trim();
    const pass = document.getElementById('uPass').value.trim();
    
    // Admin default atau akun terdaftar
    if(user === "admin" && pass === "admin123") {
        localStorage.setItem('tv_isLoggedIn', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    } else {
        alert("Login Gagal!");
    }
}

function logout() {
    if(confirm("Keluar dari sistem?")) {
        localStorage.removeItem('tv_isLoggedIn');
        location.reload();
    }
}

// --- SIDEBAR TOGGLE ---
function toggleNav() {
    const sidebar = document.getElementById("mySidebar");
    const main = document.getElementById("mainContent");
    const btn = document.getElementById("openBtn");

    if (sidebar.style.width === "0px" || sidebar.classList.contains("closed")) {
        sidebar.style.width = "250px";
        sidebar.classList.remove("closed");
        main.classList.remove("wide");
        btn.style.display = "none";
    } else {
        sidebar.style.width = "0px";
        sidebar.classList.add("closed");
        main.classList.add("wide");
        btn.style.display = "block";
    }
}

// --- INIT ---
window.addEventListener('load', () => {
    checkLoginStatus(); // Penting: Agar refresh tidak minta login ulang
    
    // Inisialisasi tampilan sidebar
    if (window.innerWidth <= 1024) {
        toggleNav(); // Tutup otomatis di HP
    }
});
