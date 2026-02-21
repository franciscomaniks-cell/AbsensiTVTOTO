// Konfigurasi Staff
const STAFF_LIST = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const SHIFT_TIME = { "PAGI": "07:45", "SHIFT G": "09:45", "SORE": "15:45", "MALAM": "21:45" };

// Fitur Suara (Text-to-Speech)
function bicara(teks) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = teks;
    speech.lang = 'id-ID';
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
}

window.onload = () => {
    // Jalankan Jam
    setInterval(updateClock, 1000);
    
    // Load Daftar Staff ke Datalist
    const dl = document.getElementById('staffs');
    dl.innerHTML = STAFF_LIST.map(s => `<option value="${s}">`).join('');
    
    // Cek Login
    if(localStorage.getItem('tv_logged') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }
    
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

    if (!STAFF_LIST.includes(name)) {
        alert("Nama staff tidak terdaftar dalam sistem!");
        return;
    }

    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    
    // Cek Duplikat
    if(logs.find(x => x.name === name)) {
        alert("Staff ini sudah melakukan absen hari ini!");
        return;
    }

    const target = SHIFT_TIME[shift];
    const isLate = time.substring(0, 5) > target;
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";

    const newLog = { shift, name, target, actual: time, status };
    logs.push(newLog);
    localStorage.setItem('tv_logs', JSON.stringify(logs));

    // AKTIFKAN SUARA
    bicara(`Absen berhasil. ${name}. Status anda ${status}`);

    addVoiceLog(`Absen Berhasil: ${name} [${shift}] - ${status}`);
    document.getElementById('iName').value = "";
    renderTable();
    updateStats();
}

function renderTable() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    tbody.innerHTML = logs.slice().reverse().map(x => `
        <tr style="background: ${x.status === 'TERLAMBAT' ? '#fff1f2' : 'transparent'}">
            <td>${x.shift}</td>
            <td style="color: #2e3192">${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td style="color: ${x.status === 'TERLAMBAT' ? '#e11d48' : '#16a34a'}">${x.status}</td>
        </tr>
    `).join('');
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const onTimeCount = logs.filter(x => x.status === "TEPAT WAKTU").length;
    const lateCount = logs.filter(x => x.status === "TERLAMBAT").length;
    
    document.getElementById('sOn').innerText = onTimeCount;
    document.getElementById('sLate').innerText = lateCount;
    document.getElementById('sAbs').innerText = Math.max(0, 65 - logs.length);
}

function addVoiceLog(msg) {
    const wrap = document.getElementById('chatWrap');
    const time = new Date().toLocaleTimeString();
    wrap.innerHTML += `<div><span style="color: #94a3b8">[${time}]</span> ${msg}</div>`;
    wrap.scrollTop = wrap.scrollHeight;
}

function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    if(u === "admin" && p === "admin123") {
        localStorage.setItem('tv_logged', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    } else {
        alert("Username atau Password salah!");
    }
}

function logout() {
    localStorage.removeItem('tv_logged');
    location.reload();
}

function resetData() {
    if(confirm("Apakah anda yakin ingin menghapus semua data absen hari ini?")) {
        localStorage.removeItem('tv_logs');
        renderTable();
        updateStats();
        addVoiceLog("SYSTEM: Data absensi telah di-reset.");
    }
}

function hapusChat() {
    document.getElementById('chatWrap').innerHTML = "";
}
