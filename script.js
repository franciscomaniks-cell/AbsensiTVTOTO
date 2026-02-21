const STAFF_LIST = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const SHIFT_TIME = { "PAGI": "07:45", "SHIFT G": "09:45", "SORE": "15:45", "MALAM": "21:45" };

// --- LOGIKA AWAL & ANTI-FLICKER ---
window.onload = () => {
    const isLogged = localStorage.getItem('tv_logged');
    const overlay = document.getElementById('authOverlay');
    
    // Jika belum login, tampilkan overlay. Jika sudah, biarkan display:none
    if (isLogged !== 'true') {
        overlay.style.display = 'flex';
    }
    
    setInterval(updateClock, 1000);
    document.getElementById('staffs').innerHTML = STAFF_LIST.map(s => `<option value="${s}">`).join('');
    renderTable();
    updateStats();
};

// --- FITUR CHAT (REVISI) ---
function sendAdminChat() {
    const input = document.getElementById('chatIn');
    const msg = input.value.trim();
    
    if (msg !== "") {
        const time = new Date().toLocaleTimeString('en-GB');
        const chatWrap = document.getElementById('chatWrap');
        
        // Tambahkan pesan ke dalam box
        chatWrap.innerHTML += `
            <div style="margin-bottom: 8px; font-family: monospace; font-size: 12px;">
                <span style="color: #8b949e;">[${time}]</span> 
                <span style="color: #00ff88; font-weight: bold;">Admin:</span> 
                <span style="color: #fff;">${msg}</span>
            </div>
        `;
        
        input.value = ""; // Kosongkan input
        chatWrap.scrollTop = chatWrap.scrollHeight; // Auto-scroll ke bawah
    }
}

// --- FUNGSI LOGIN & LOGOUT ---
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    
    // Ganti 'admin' & 'admin123' sesuai keinginan Anda
    if (u === "admin" && p === "admin123") {
        localStorage.setItem('tv_logged', 'true');
        document.getElementById('authOverlay').style.display = 'none';
        bicara("Selamat datang admin");
    } else {
        alert("Username atau Password salah!");
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
    const display = document.getElementById('clockDisplay');
    if(display) display.innerText = now.toLocaleTimeString('en-GB');
    
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
    const isLate = time.substring(0, 5) > SHIFT_TIME[shift];
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";

    logs.push({ shift, name, target: SHIFT_TIME[shift], actual: time, status });
    localStorage.setItem('tv_logs', JSON.stringify(logs));

    bicara(`${name} berhasil absen. Status ${status}`);
    
    // Log ke chat otomatis
    const chatWrap = document.getElementById('chatWrap');
    chatWrap.innerHTML += `<div><span style="color:#8b949e">[${time}]</span> ${name} - ${status}</div>`;
    
    document.getElementById('iName').value = "";
    renderTable();
    updateStats();
}

function renderTable() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    tbody.innerHTML = logs.slice().reverse().map((x, index) => `
        <tr>
            <td>${x.shift}</td>
            <td style="color: #2e3192; font-weight: bold;">${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td style="color:${x.status==='TERLAMBAT'?'red':'green'}; font-weight: bold;">${x.status}</td>
            <td><button onclick="hapusBaris(${logs.length - 1 - index})" style="background:none; border:none; cursor:pointer;">🗑️</button></td>
        </tr>
    `).join('');
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    document.getElementById('sOn').innerText = logs.filter(x => x.status === "TEPAT WAKTU").length;
    document.getElementById('sLate').innerText = logs.filter(x => x.status === "TERLAMBAT").length;
    document.getElementById('sAbs').innerText = 65 - logs.length;
}

function hapusBaris(index) {
    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    logs.splice(index, 1);
    localStorage.setItem('tv_logs', JSON.stringify(logs));
    renderTable();
    updateStats();
}

function hapusChat() {
    document.getElementById('chatWrap').innerHTML = "";
}

function resetData() {
    if(confirm("Hapus semua data absensi hari ini?")) {
        localStorage.removeItem('tv_logs');
        renderTable();
        updateStats();
    }
}
