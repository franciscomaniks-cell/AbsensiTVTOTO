// --- CONFIGURATION ---
const STAFF_LIST = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const SHIFT_TARGETS = { "PAGI": "07:45", "SHIFT G": "09:45", "SORE": "15:45", "MALAM": "21:45" };

// --- FITUR SUARA (Text-to-Speech) ---
function bicara(teks) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = teks;
    speech.lang = 'id-ID'; // Bahasa Indonesia
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
}

window.onload = () => {
    updateClock();
    setInterval(updateClock, 1000);
    const dl = document.getElementById('staffs');
    if (dl) dl.innerHTML = STAFF_LIST.map(name => `<option value="${name}">`).join('');
    if (localStorage.getItem('tv_auth') === 'true') document.getElementById('authOverlay').style.display = 'none';
    renderTable();
    updateStats();
};

function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-GB');
    const options = { weekday: 'long', day: '2-digit', month: 'short', year: 'numeric' };
    const dateParts = now.toLocaleDateString('id-ID', options).toUpperCase().split(' ');

    document.getElementById('clockDisplay').innerText = timeStr;
    document.getElementById('pDay').innerText = dateParts[0].replace(',', '');
    document.getElementById('pDate').innerText = dateParts.slice(1).join(' ');
}

function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if (!STAFF_LIST.includes(name)) return alert("Staff Tidak Terdaftar!");

    let logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const target = SHIFT_TARGETS[shift];
    const isLate = time.substring(0, 5) > target;
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";

    logs.push({ id: Date.now(), shift, name, target, actual: time, status });
    localStorage.setItem('tv_absensi', JSON.stringify(logs));

    // AKTIFKAN SUARA
    const pesanSuara = isLate 
        ? `Absen berhasil. ${name}, anda datang terlambat di shift ${shift}` 
        : `Absen berhasil. Terima kasih ${name}, anda tepat waktu`;
    bicara(pesanSuara);

    document.getElementById('iName').value = "";
    addVoiceLog(`Absen: ${name} [${shift}] - ${status}`);
    renderTable();
    updateStats();
}

function renderTable(data = null) {
    const logs = data || JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    tbody.innerHTML = logs.slice().reverse().map(x => `
        <tr class="${x.status === 'TERLAMBAT' ? 'row-late' : ''}">
            <td>${x.shift}</td>
            <td style="font-weight:bold">${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td style="color:${x.status === 'TERLAMBAT' ? '#ff4d4d' : '#00ff88'}">${x.status}</td>
            <td><button onclick="hapusEntry(${x.id})" style="background:none; border:none; cursor:pointer;">❌</button></td>
        </tr>
    `).join('');
}

function updateStats() {
    const logs = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    document.getElementById('sOn').innerText = logs.filter(x => x.status === "TEPAT WAKTU").length;
    document.getElementById('sLate').innerText = logs.filter(x => x.status === "TERLAMBAT").length;
    document.getElementById('sAbs').innerText = Math.max(0, 65 - logs.length);
}

function addVoiceLog(msg) {
    const wrap = document.getElementById('chatWrap');
    const div = document.createElement('div');
    div.style.padding = "5px 0";
    div.style.borderBottom = "1px solid #1e293b";
    div.innerHTML = `<span style="color:#94a3b8">[${new Date().toLocaleTimeString()}]</span> ${msg}`;
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
}

function handleAuth() {
    if (document.getElementById('uUser').value === "admin" && document.getElementById('uPass').value === "admin123") {
        localStorage.setItem('tv_auth', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    }
}

function logout() { localStorage.removeItem('tv_auth'); location.reload(); }
function resetData() { if(confirm("Reset data?")) { localStorage.removeItem('tv_absensi'); renderTable(); updateStats(); } }
function hapusChat() { document.getElementById('chatWrap').innerHTML = ""; }
