// Konfigurasi Sistem
const STAFF_LIST = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const SHIFT_TIME = { "PAGI": "07:45", "SHIFT G": "09:45", "SORE": "15:45", "MALAM": "21:45" };
let authMode = 'login';

// --- FITUR SUARA ---
function bicara(teks) {
    const msg = new SpeechSynthesisUtterance();
    msg.text = teks;
    msg.lang = 'id-ID';
    msg.rate = 1;
    window.speechSynthesis.speak(msg);
}

// --- SISTEM LOGIN ---
function showRegister() {
    authMode = 'register';
    document.getElementById('authTitle').innerText = 'DAFTAR AKUN';
    document.getElementById('loginFields').style.display = 'none';
    document.getElementById('registerFields').style.display = 'block';
    document.getElementById('forgotFields').style.display = 'none';
    document.getElementById('mainAuthBtn').innerText = 'DAFTAR SEKARANG';
    document.getElementById('toggleText').innerText = 'Sudah punya akun? Login';
}

function showForgot() {
    authMode = 'forgot';
    document.getElementById('authTitle').innerText = 'LUPA PASSWORD';
    document.getElementById('loginFields').style.display = 'none';
    document.getElementById('registerFields').style.display = 'none';
    document.getElementById('forgotFields').style.display = 'block';
    document.getElementById('mainAuthBtn').innerText = 'KIRIM PERMINTAAN';
    document.getElementById('toggleText').innerText = 'Kembali ke Login';
}

function handleAuth() {
    if (authMode === 'login') {
        const u = document.getElementById('uUser').value;
        const p = document.getElementById('uPass').value;
        if(u === "admin" && p === "admin123") {
            localStorage.setItem('tv_logged', 'true');
            document.getElementById('authOverlay').style.display = 'none';
            bicara("Selamat datang di sistem absensi TV Toto");
        } else {
            alert("Login gagal!");
        }
    } else if (authMode === 'register') {
        alert("Pendaftaran berhasil diajukan ke Admin.");
        location.reload();
    } else {
        alert("Permintaan reset terkirim.");
        location.reload();
    }
}

// --- FITUR ABSENSI ---
window.onload = () => {
    setInterval(updateClock, 1000);
    if(localStorage.getItem('tv_logged') === 'true') document.getElementById('authOverlay').style.display='none';
    document.getElementById('staffs').innerHTML = STAFF_LIST.map(s => `<option value="${s}">`).join('');
    renderTable();
    updateStats();
};

function updateClock() {
    const now = new Date();
    document.getElementById('clockDisplay').innerText = now.toLocaleTimeString('en-GB');
    const days = ["MINGGU", "SENIN", "SELASA", "RABU", "KAMIS", "JUMAT", "SABTU"];
    document.getElementById('pDay').innerText = days[now.getDay()];
    document.getElementById('pDate').innerText = now.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
}

function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if (!STAFF_LIST.includes(name)) return alert("Staff tidak terdaftar!");

    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const isLate = time.substring(0, 5) > SHIFT_TIME[shift];
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";

    logs.push({ shift, name, target: SHIFT_TIME[shift], actual: time, status });
    localStorage.setItem('tv_logs', JSON.stringify(logs));

    // Suara Konfirmasi
    bicara(`Absen Berhasil. ${name}. Status. ${status}`);
    addVoiceLog(`Absen: ${name} - ${status}`);
    
    document.getElementById('iName').value = "";
    renderTable();
    updateStats();
}

function renderTable() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    document.querySelector('#tblMain tbody').innerHTML = logs.slice().reverse().map(x => `
        <tr>
            <td>${x.shift}</td>
            <td style="color: blue">${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td style="color:${x.status==='TERLAMBAT'?'red':'green'}">${x.status}</td>
        </tr>
    `).join('');
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    document.getElementById('sOn').innerText = logs.filter(x => x.status === "TEPAT WAKTU").length;
    document.getElementById('sLate').innerText = logs.filter(x => x.status === "TERLAMBAT").length;
    document.getElementById('sAbs').innerText = 65 - logs.length;
}

function addVoiceLog(msg) {
    const wrap = document.getElementById('chatWrap');
    wrap.innerHTML += `<div><span style="color:#94a3b8">[${new Date().toLocaleTimeString()}]</span> ${msg}</div>`;
    wrap.scrollTop = wrap.scrollHeight;
}

function logout() { localStorage.removeItem('tv_logged'); location.reload(); }
function hapusChat() { document.getElementById('chatWrap').innerHTML = ""; }
function resetData() { if(confirm("Hapus data hari ini?")) { localStorage.removeItem('tv_logs'); renderTable(); updateStats(); } }
