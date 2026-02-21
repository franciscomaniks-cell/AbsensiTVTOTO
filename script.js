// --- CONFIGURATION ---
const STAFF_LIST = [
    "RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", 
    "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", 
    "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"
];

const SHIFT_TARGETS = {
    "PAGI": "07:45:00",
    "SHIFT G": "09:45:00",
    "SHIFT G2": "11:45:00",
    "SORE": "15:45:00",
    "MALAM": "21:45:00"
};

// --- INITIALIZATION ---
window.onload = () => {
    // Jalankan Jam
    updateClock();
    setInterval(updateClock, 1000);

    // Isi Datalist Nama
    const dl = document.getElementById('staffs');
    if (dl) dl.innerHTML = STAFF_LIST.map(name => `<option value="${name}">`).join('');

    // Cek Login
    if (localStorage.getItem('tv_auth') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }

    renderTable();
    updateStats();
};

// --- CORE FUNCTIONS ---

function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    const dateParts = now.toLocaleDateString('id-ID', options).toUpperCase().split(' ');

    if (document.getElementById('clockDisplay')) document.getElementById('clockDisplay').innerText = timeStr;
    if (document.getElementById('pDay')) document.getElementById('pDay').innerText = dateParts[0].replace(',', '');
    if (document.getElementById('pDate')) document.getElementById('pDate').innerText = dateParts.slice(1).join(' ');
}

function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    if (u === "admin" && p === "admin123") {
        localStorage.setItem('tv_auth', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    } else {
        alert("Akses Ditolak!");
    }
}

function logout() {
    localStorage.removeItem('tv_auth');
    location.reload();
}

function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if (!STAFF_LIST.includes(name)) return alert("Nama Staff Tidak Terdaftar!");

    let logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    
    // Logika Cek Terlambat
    const target = SHIFT_TARGETS[shift];
    const isLate = time > target;
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";

    const entry = { id: Date.now(), shift, name, target, actual: time, status };
    logs.push(entry);
    localStorage.setItem('tv_absensi', JSON.stringify(logs));

    // Reset Input & Update View
    document.getElementById('iName').value = "";
    addVoiceLog(`Absen: ${name} [${shift}] - ${status}`);
    renderTable();
    updateStats();
}

function renderTable(data = null) {
    const logs = data || JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if (!tbody) return;

    tbody.innerHTML = logs.slice().reverse().map(x => `
        <tr class="${x.status === 'TERLAMBAT' ? 'row-late' : ''}">
            <td>${x.shift}</td>
            <td style="font-weight:bold">${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td class="status-cell ${x.status === 'TERLAMBAT' ? 'txt-red' : 'txt-green'}">${x.status}</td>
            <td><button class="btn-del" onclick="hapusEntry(${x.id})">❌</button></td>
        </tr>
    `).join('');
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const onTime = logs.filter(x => x.status === "TEPAT WAKTU").length;
    const late = logs.filter(x => x.status === "TERLAMBAT").length;

    document.getElementById('sOn').innerText = onTime;
    document.getElementById('sLate').innerText = late;
    document.getElementById('sAbs').innerText = 65 - logs.length;
}

function filterTelat() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const lateOnly = logs.filter(x => x.status === "TERLAMBAT");
    renderTable(lateOnly);
    addVoiceLog("System: Menampilkan daftar terlambat.");
}

function exportData() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    if (logs.length === 0) return alert("Data Kosong!");

    let csv = "SHIFT,NAMA,TARGET,AKTUAL,STATUS\n";
    logs.forEach(x => csv += `${x.shift},${x.name},${x.target},${x.actual},${x.status}\n`);

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Absensi_TVTOTO_${new Date().toLocaleDateString()}.csv`;
    a.click();
}

function resetData() {
    if (confirm("Hapus semua data absen hari ini?")) {
        localStorage.removeItem('tv_absensi');
        addVoiceLog("System: Database Reset.");
        renderTable();
        updateStats();
    }
}

// --- LOGGING ---
function addVoiceLog(msg) {
    const wrap = document.getElementById('chatWrap');
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = 'log-entry';
    div.innerHTML = `<span style="color:#94a3b8">[${time}]</span> ${msg}`;
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
}

function hapusChat() {
    document.getElementById('chatWrap').innerHTML = "";
}

function hapusEntry(id) {
    let logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    logs = logs.filter(x => x.id !== id);
    localStorage.setItem('tv_absensi', JSON.stringify(logs));
    renderTable();
    updateStats();
}
