// Database Staff
const STAFF_LIST = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const SHIFT_TIME = { "PAGI": "07:45", "SHIFT G": "09:45", "SORE": "15:45", "MALAM": "21:45" };

window.onload = () => {
    // Pengecekan Login
    const isLogged = localStorage.getItem('tv_logged');
    const overlay = document.getElementById('authOverlay');
    if (isLogged !== 'true') {
        overlay.style.display = 'flex';
    }

    // Inisialisasi
    setInterval(updateClock, 1000);
    document.getElementById('staffs').innerHTML = STAFF_LIST.map(s => `<option value="${s}">`).join('');
    renderTable();
    updateStats();
};

// --- FUNGSI SIDEBAR (Bisa Tutup/Buka) ---
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    sb.classList.toggle('closed');
}

// --- FUNGSI CHAT ---
function sendAdminChat() {
    const input = document.getElementById('chatIn');
    const msg = input.value.trim();
    if (msg) {
        const time = new Date().toLocaleTimeString('en-GB');
        const wrap = document.getElementById('chatWrap');
        wrap.innerHTML += `<div class="msg"><span>[${time}]</span> <strong>Admin:</strong> ${msg}</div>`;
        input.value = "";
        wrap.scrollTop = wrap.scrollHeight;
    }
}

// --- FUNGSI ABSENSI ---
function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if (!STAFF_LIST.includes(name)) return alert("Staff tidak terdaftar!");

    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const status = time.substring(0, 5) > SHIFT_TIME[shift] ? "TERLAMBAT" : "TEPAT WAKTU";

    logs.push({ shift, name, target: SHIFT_TIME[shift], actual: time, status });
    localStorage.setItem('tv_logs', JSON.stringify(logs));

    // Suara & Log
    const speech = new SpeechSynthesisUtterance(`${name} berhasil absen. Status ${status}`);
    speech.lang = 'id-ID';
    window.speechSynthesis.speak(speech);

    document.getElementById('chatWrap').innerHTML += `<div class="msg"><span>[${time}]</span> ${name} - ${status}</div>`;
    document.getElementById('iName').value = "";
    renderTable();
    updateStats();
}

function renderTable() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    document.querySelector('#tblMain tbody').innerHTML = logs.slice().reverse().map(x => `
        <tr>
            <td>${x.shift}</td>
            <td style="color: #61dafb; font-weight: bold;">${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td style="color:${x.status==='TERLAMBAT'?'#ff4d4d':'#00ff88'}">${x.status}</td>
        </tr>
    `).join('');
}

function updateClock() {
    const now = new Date();
    document.getElementById('clockDisplay').innerText = now.toLocaleTimeString('en-GB');
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    document.getElementById('sOn').innerText = logs.filter(x => x.status === "TEPAT WAKTU").length;
    document.getElementById('sLate').innerText = logs.filter(x => x.status === "TERLAMBAT").length;
    document.getElementById('sAbs').innerText = 65 - logs.length;
}

function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    if (u === "admin" && p === "admin123") {
        localStorage.setItem('tv_logged', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    } else { alert("Salah!"); }
}

function logout() {
    localStorage.removeItem('tv_logged');
    location.reload();
}

function hapusChat() { document.getElementById('chatWrap').innerHTML = ""; }

function resetData() {
    if(confirm("Hapus semua?")) {
        localStorage.removeItem('tv_logs');
        renderTable();
        updateStats();
    }
}
