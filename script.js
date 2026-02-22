// --- DATABASE & CONFIG ---
const STAFF_LIST = [
    "RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", 
    "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", 
    "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"
];

const SHIFT_TIMES = {
    "PAGI": "07:45:00",
    "SHIFT G": "09:45:00",
    "SORE": "15:45:00",
    "MALAM": "21:45:00"
};

// --- INITIALIZATION ---
window.onload = () => {
    // Auth Check
    if (localStorage.getItem('tv_auth') === 'true') {
        const overlay = document.getElementById('authOverlay');
        if (overlay) overlay.style.display = 'none';
    }

    // Auto-fill Datalist
    const dl = document.getElementById('staffs');
    if (dl) dl.innerHTML = STAFF_LIST.map(s => `<option value="${s}">`).join('');

    // Start Clock & Date
    updateDateTime();
    setInterval(updateDateTime, 1000);

    renderAbsensi();
    updateStats();
    loadVoiceLogs();
};

function updateDateTime() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    const dateParts = now.toLocaleDateString('id-ID', options).toUpperCase().split(' ');

    if (document.getElementById('clockDisplay')) document.getElementById('clockDisplay').innerText = timeStr;
    if (document.getElementById('pDay')) document.getElementById('pDay').innerText = dateParts[0].replace(',', '');
    if (document.getElementById('pDate')) document.getElementById('pDate').innerText = dateParts.slice(1).join(' ');
}

// --- AUTH SYSTEM ---
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    if (u === "admin" && p === "admin123") {
        localStorage.setItem('tv_auth', 'true');
        document.getElementById('authOverlay').style.display = 'none';
        addVoiceLog("System: Admin Logged In");
    } else {
        alert("Login Salah!");
    }
}

function logout() {
    localStorage.removeItem('tv_auth');
    location.reload();
}

// --- ABSENSI CORE ---
function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if (!STAFF_LIST.includes(name)) return alert("Nama Staff Tidak Terdaftar!");

    let logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const isLate = time > SHIFT_TIMES[shift];
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";

    const entry = { id: Date.now(), name, shift, target: SHIFT_TIMES[shift], actual: time, status };
    logs.push(entry);
    localStorage.setItem('tv_absensi', JSON.stringify(logs));

    addVoiceLog(`Absen: ${name} [${shift}] - ${status}`);
    document.getElementById('iName').value = "";
    renderAbsensi();
    updateStats();
}

function renderAbsensi(filtered = null) {
    const logs = filtered || JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if (!tbody) return;

    tbody.innerHTML = logs.slice().reverse().map(x => `
        <tr class="${x.status === 'TERLAMBAT' ? 'row-late' : ''}">
            <td>${x.shift}</td>
            <td class="font-bold">${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td class="status-text">${x.status}</td>
            <td><button class="btn-del" onclick="hapusAbsen(${x.id})">❌</button></td>
        </tr>
    `).join('');
}

function filterTelat() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const lateOnly = logs.filter(x => x.status === "TERLAMBAT");
    renderAbsensi(lateOnly);
    addVoiceLog("System: Filtering Late Staff");
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const onTime = logs.filter(x => x.status === "TEPAT WAKTU").length;
    const late = logs.filter(x => x.status === "TERLAMBAT").length;

    if (document.getElementById('sOn')) document.getElementById('sOn').innerText = onTime;
    if (document.getElementById('sLate')) document.getElementById('sLate').innerText = late;
    if (document.getElementById('sAbs')) document.getElementById('sAbs').innerText = 65 - logs.length;
}

// --- SYSTEM LOGS ---
function addVoiceLog(msg) {
    let chats = JSON.parse(localStorage.getItem('tv_chats') || "[]");
    const time = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    chats.push(`[${time}] ${msg}`);
    localStorage.setItem('tv_chats', JSON.stringify(chats.slice(-15)));
    loadVoiceLogs();
}

function loadVoiceLogs() {
    const wrap = document.getElementById('chatWrap');
    const chats = JSON.parse(localStorage.getItem('tv_chats') || "[]");
    if (wrap) {
        wrap.innerHTML = chats.map(c => `<div class="log-msg">${c}</div>`).join('');
        wrap.scrollTop = wrap.scrollHeight;
    }
}

function hapusAbsen(id) {
    let logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    logs = logs.filter(x => x.id !== id);
    localStorage.setItem('tv_absensi', JSON.stringify(logs));
    renderAbsensi();
    updateStats();
}

function resetData() {
    if(confirm("Hapus seluruh data absen hari ini?")) {
        localStorage.removeItem('tv_absensi');
        addVoiceLog("System: Database Reset");
        renderAbsensi();
        updateStats();
    }
}
