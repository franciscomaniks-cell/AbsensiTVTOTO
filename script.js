// --- DATABASE STAFF & KONFIGURASI ---
const STAFF_LIST = [
    "RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", 
    "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", 
    "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"
];

const TARGETS = { 
    "PAGI": "07:45:00", 
    "SHIFT G": "09:45:00", 
    "SORE": "15:45:00", 
    "MALAM": "21:45:00" 
};

// --- INISIALISASI SISTEM ---
window.onload = () => {
    // Cek Status Login
    if (localStorage.getItem('tv_auth') === 'true') {
        const overlay = document.getElementById('authOverlay');
        if (overlay) overlay.style.display = 'none';
    }
    
    // Update Jam, Hari, dan Tanggal Real-time
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
        const dateParts = now.toLocaleDateString('id-ID', options).toUpperCase().split(' ');
        
        if (document.getElementById('clockDisplay')) document.getElementById('clockDisplay').innerText = timeStr;
        if (document.getElementById('pDay')) document.getElementById('pDay').innerText = dateParts[0].replace(',', '');
        if (document.getElementById('pDate')) document.getElementById('pDate').innerText = dateParts.slice(1).join(' ');
    }, 1000);

    // Isi Datalist Nama Staff
    const dl = document.getElementById('staffs');
    if (dl) dl.innerHTML = STAFF_LIST.map(s => `<option value="${s}">`).join('');

    renderAbsensi();
    updateStats();
    loadVoiceLogs();
};

// --- FITUR LOGIN & LOGOUT ---
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    // Login sederhana: admin / admin123
    if (u === "admin" && p === "admin123") {
        localStorage.setItem('tv_auth', 'true');
        document.getElementById('authOverlay').style.display = 'none';
        addVoiceLog("Sistem: Admin berhasil login.");
    } else { 
        alert("Username atau Password salah!"); 
    }
}

function logout() {
    if(confirm("Apakah Anda ingin logout?")) {
        localStorage.removeItem('tv_auth');
        location.reload();
    }
}

// --- FITUR ABSENSI ---
function tambahAbsen() {
    const nameInput = document.getElementById('iName');
    const name = nameInput.value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if (!STAFF_LIST.includes(name)) return alert("Nama Staff tidak terdaftar di database!");

    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    
    // Cek apakah sudah absen di shift yang sama hari ini
    const isDuplicate = logs.some(l => l.name === name && l.shift === shift);
    if (isDuplicate) return alert(`${name} sudah melakukan absen untuk shift ${shift}!`);

    const isLate = time > TARGETS[shift];
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";
    
    logs.push({ 
        id: Date.now(), 
        shift, 
        name, 
        target: TARGETS[shift], 
        actual: time, 
        status: status 
    });

    localStorage.setItem('tv_logs', JSON.stringify(logs));
    addVoiceLog(`Absen: ${name} [${shift}] - ${status}`);
    
    nameInput.value = "";
    renderAbsensi();
    updateStats();
}

function renderAbsensi() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if (!tbody) return;

    tbody.innerHTML = logs.slice().reverse().map(x => `
        <tr class="${x.status === 'TERLAMBAT' ? 'row-late' : ''}">
            <td>${x.shift}</td>
            <td>${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td class="status-cell" style="color: ${x.status === 'TERLAMBAT' ? '#ef4444' : '#22c55e'}">${x.status}</td>
            <td><button class="btn-del" onclick="hapusEntry(${x.id})">❌</button></td>
        </tr>
    `).join('');
}

function hapusEntry(id) {
    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    logs = logs.filter(x => x.id !== id);
    localStorage.setItem('tv_logs', JSON.stringify(logs));
    renderAbsensi();
    updateStats();
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const onTime = logs.filter(x => x.status === "TEPAT WAKTU").length;
    const late = logs.filter(x => x.status === "TERLAMBAT").length;

    if (document.getElementById('sOn')) document.getElementById('sOn').innerText = onTime;
    if (document.getElementById('sLate')) document.getElementById('sLate').innerText = late;
    if (document.getElementById('sAbs')) document.getElementById('sAbs').innerText = 65 - logs.length;
}

// --- VOICE LOGS / CHAT SYSTEM ---
function addVoiceLog(msg) {
    let chats = JSON.parse(localStorage.getItem('tv_chats') || "[]");
    const time = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
    chats.push(`[${time}] ${msg}`);
    localStorage.setItem('tv_chats', JSON.stringify(chats.slice(-20))); // Simpan 20 log terakhir
    loadVoiceLogs();
}

function loadVoiceLogs() {
    const wrap = document.getElementById('chatWrap');
    const chats = JSON.parse(localStorage.getItem('tv_chats') || "[]");
    if (wrap) {
        wrap.innerHTML = chats.map(c => `<div class="log-entry">${c}</div>`).join('');
        wrap.scrollTop = wrap.scrollHeight;
    }
}

function hapusChat() {
    localStorage.removeItem('tv_chats');
    loadVoiceLogs();
}

function resetData() {
    if(confirm("PERINGATAN: Hapus semua data absensi hari ini?")) {
        localStorage.removeItem('tv_logs');
        addVoiceLog("Sistem: Semua data absensi di-reset.");
        renderAbsensi();
        updateStats();
    }
}

// Fitur Filter Telat
function filterTelat() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const onlyLate = logs.filter(x => x.status === "TERLAMBAT");
    alert("Ditemukan " + onlyLate.length + " staff terlambat.");
}
