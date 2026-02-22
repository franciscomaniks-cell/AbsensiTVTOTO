const STAFF_LIST = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const SHIFT_TIME = { "PAGI": "07:45", "SHIFT G": "09:45", "SORE": "15:45", "MALAM": "21:45" };
let currentMode = 'login';

// --- LOGIKA AWAL (CEK LOGIN) ---
window.onload = () => {
    const isLogged = localStorage.getItem('tv_logged');
    const overlay = document.getElementById('authOverlay');
    
    if (isLogged === 'true') {
        overlay.style.display = 'none'; // Tetap sembunyi jika sudah login
    } else {
        overlay.style.display = 'flex'; // Tampilkan jika belum
    }
    
    setInterval(updateClock, 1000);
    document.getElementById('staffs').innerHTML = STAFF_LIST.map(s => `<option value="${s}">`).join('');
    renderTable();
    updateStats();
};

// --- FITUR CHAT (PERBAIKAN) ---
function sendAdminChat() {
    const input = document.getElementById('chatIn');
    const pesan = input.value.trim();
    
    if (pesan !== "") {
        const time = new Date().toLocaleTimeString('en-GB');
        const wrap = document.getElementById('chatWrap');
        
        // Tambahkan ke log tampilan
        wrap.innerHTML += `<div><span style="color:#8b949e">[${time}]</span> <span style="color:#fff">Admin:</span> ${pesan}</div>`;
        
        // Bicara otomatis jika diawali pesan tertentu (opsional)
        // bicara(pesan); 

        input.value = ""; // Kosongkan input
        wrap.scrollTop = wrap.scrollHeight; // Auto scroll ke bawah
    }
}

// --- FUNGSI LOGIN / DAFTAR ---
function toggleAuth(mode) {
    currentMode = mode;
    document.getElementById('loginGroup').style.display = 'none';
    document.getElementById('registerGroup').style.display = 'none';
    document.getElementById('forgotGroup').style.display = 'none';
    
    if(mode === 'login') {
        document.getElementById('authTitle').innerText = "LOGIN SYSTEM";
        document.getElementById('loginGroup').style.display = 'block';
    } else if(mode === 'register') {
        document.getElementById('authTitle').innerText = "DAFTAR AKUN";
        document.getElementById('registerGroup').style.display = 'block';
    } else {
        document.getElementById('authTitle').innerText = "RESET PASSWORD";
        document.getElementById('forgotGroup').style.display = 'block';
    }
}

function handleAuth() {
    if (currentMode === 'login') {
        const u = document.getElementById('uUser').value;
        const p = document.getElementById('uPass').value;
        if (u === "admin" && p === "admin123") {
            localStorage.setItem('tv_logged', 'true');
            document.getElementById('authOverlay').style.display = 'none';
            bicara("Selamat datang admin");
        } else { alert("User atau Password salah!"); }
    } else {
        alert("Permintaan berhasil diproses.");
        toggleAuth('login');
    }
}

function logout() {
    localStorage.removeItem('tv_logged');
    location.reload();
}

// --- FITUR ABSENSI ---
function bicara(teks) {
    const speech = new SpeechSynthesisUtterance(teks);
    speech.lang = 'id-ID';
    window.speechSynthesis.speak(speech);
}

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

    if (!STAFF_LIST.includes(name)) return alert("Nama tidak terdaftar!");

    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const status = time.substring(0, 5) > SHIFT_TIME[shift] ? "TERLAMBAT" : "TEPAT WAKTU";

    logs.push({ shift, name, target: SHIFT_TIME[shift], actual: time, status });
    localStorage.setItem('tv_logs', JSON.stringify(logs));

    bicara(`${name} berhasil absen. Status ${status}`);
    const wrap = document.getElementById('chatWrap');
    wrap.innerHTML += `<div><span style="color:#8b949e">[${time}]</span> ${name} - ${status}</div>`;
    
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

function hapusChat() { document.getElementById('chatWrap').innerHTML = ""; }
