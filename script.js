// --- KONFIGURASI SISTEM ---
const STAFF_LIST = [
    "RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", 
    "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", 
    "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"
];

const SHIFT_TARGETS = {
    "PAGI": "07:45",
    "SHIFT G": "09:45",
    "SORE": "15:45",
    "MALAM": "21:45"
};

// --- INISIALISASI ---
window.onload = () => {
    checkAuth();
    startClock();
    updateStaffDatalist();
    renderTable();
    updateStats();
};

// 1. Sistem Login
function handleAuth() {
    const user = document.getElementById('uUser').value;
    const pass = document.getElementById('uPass').value;
    
    if (user === "admin" && pass === "admin123") {
        localStorage.setItem('tv_logged_in', 'true');
        document.getElementById('authOverlay').style.display = 'none';
        addVoiceLog("System: Admin berhasil masuk.");
    } else {
        alert("Username atau Password salah!");
    }
}

function checkAuth() {
    if (localStorage.getItem('tv_logged_in') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }
}

function logout() {
    if (confirm("Keluar dari sistem?")) {
        localStorage.removeItem('tv_logged_in');
        location.reload();
    }
}

// 2. Jam & Tanggal Real-time
function startClock() {
    setInterval(() => {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
        const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
        const dateStr = now.toLocaleDateString('id-ID', options).toUpperCase();
        
        document.getElementById('clockDisplay').innerText = timeStr;
        const [day, ...rest] = dateStr.split(' ');
        document.getElementById('pDay').innerText = day.replace(',', '');
        document.getElementById('pDate').innerText = rest.join(' ');
    }, 1000);
}

// 3. Logika Absensi
function updateStaffDatalist() {
    const dl = document.getElementById('staffs');
    dl.innerHTML = STAFF_LIST.map(name => `<option value="${name}">`).join('');
}

function tambahAbsen() {
    const nameInput = document.getElementById('iName');
    const name = nameInput.value.trim().toUpperCase();
    const shift = document.getElementById('sShift').value;
    const currentTime = document.getElementById('clockDisplay').innerText;

    if (!STAFF_LIST.includes(name)) {
        alert("Nama staff tidak terdaftar!");
        return;
    }

    let logs = JSON.parse(localStorage.getItem('tv_absensi_data') || "[]");
    
    // Cek duplikat hari ini
    const isDuplicate = logs.some(l => l.nama === name && l.shift === shift);
    if (isDuplicate) {
        alert("Staff sudah absen untuk shift ini!");
        return;
    }

    const targetTime = SHIFT_TARGETS[shift];
    const status = currentTime > targetTime ? "TERLAMBAT" : "TEPAT WAKTU";

    const newLog = {
        id: Date.now(),
        shift: shift,
        nama: name,
        target: targetTime,
        aktual: currentTime,
        status: status
    };

    logs.push(newLog);
    localStorage.setItem('tv_absensi_data', JSON.stringify(logs));
    
    nameInput.value = "";
    addVoiceLog(`Absen: ${name} [${shift}] - ${status}`);
    renderTable();
    updateStats();
}

function renderTable(filterData = null) {
    const logs = filterData || JSON.parse(localStorage.getItem('tv_absensi_data') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    tbody.innerHTML = "";

    logs.slice().reverse().forEach(log => {
        const row = `
            <tr class="${log.status === 'TERLAMBAT' ? 'row-late' : ''}">
                <td>${log.shift}</td>
                <td style="font-weight: 800">${log.nama}</td>
                <td>${log.target}</td>
                <td>${log.aktual}</td>
                <td class="${log.status === 'TERLAMBAT' ? 'text-late' : 'text-ontime'}">${log.status}</td>
                <td><button onclick="hapusEntry(${log.id})" class="btn-del">❌</button></td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi_data') || "[]");
    const ontime = logs.filter(l => l.status === "TEPAT WAKTU").length;
    const late = logs.filter(l => l.status === "TERLAMBAT").length;
    
    document.getElementById('sOn').innerText = ontime;
    document.getElementById('sLate').innerText = late;
    document.getElementById('sAbs').innerText = Math.max(0, 65 - logs.length);
}

function filterTelat() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi_data') || "[]");
    const lateOnly = logs.filter(l => l.status === "TERLAMBAT");
    renderTable(lateOnly);
    addVoiceLog("System: Menampilkan daftar terlambat.");
}

function resetData() {
    if (confirm("Hapus semua data absensi hari ini?")) {
        localStorage.removeItem('tv_absensi_data');
        renderTable();
        updateStats();
        addVoiceLog("System: Database di-reset.");
    }
}

// 4. Voice Logs & CSV
function addVoiceLog(msg) {
    const wrap = document.getElementById('chatWrap');
    const time = new Date().toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'});
    const entry = `<div class="log-item"><span>[${time}]</span> ${msg}</div>`;
    wrap.innerHTML += entry;
    wrap.scrollTop = wrap.scrollHeight;
}

function hapusChat() {
    document.getElementById('chatWrap').innerHTML = "";
}

function exportData() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi_data') || "[]");
    if (logs.length === 0) return alert("Tidak ada data untuk diekspor!");

    let csv = "SHIFT,NAMA,TARGET,AKTUAL,STATUS\n";
    logs.forEach(l => {
        csv += `${l.shift},${l.nama},${l.target},${l.aktual},${l.status}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Absensi_TVTOTO_${new Date().toLocaleDateString()}.csv`);
    a.click();
}

function hapusEntry(id) {
    let logs = JSON.parse(localStorage.getItem('tv_absensi_data') || "[]");
    logs = logs.filter(l => l.id !== id);
    localStorage.setItem('tv_absensi_data', JSON.stringify(logs));
    renderTable();
    updateStats();
}
