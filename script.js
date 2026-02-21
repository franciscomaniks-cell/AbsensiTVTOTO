const STAFF_LIST = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const SHIFT_TIME = { "PAGI": "07:45", "SHIFT G": "09:45", "SORE": "15:45", "MALAM": "21:45" };

function bicara(teks) {
    const speech = new SpeechSynthesisUtterance();
    speech.text = teks;
    speech.lang = 'id-ID';
    window.speechSynthesis.speak(speech);
}

window.onload = () => {
    setInterval(updateClock, 1000);
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

    if (!STAFF_LIST.includes(name)) return alert("Staff Tidak Terdaftar!");

    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const isLate = time.substring(0, 5) > SHIFT_TIME[shift];
    const status = isLate ? "TERLAMBAT" : "TEPAT WAKTU";

    logs.push({ shift, name, target: SHIFT_TIME[shift], actual: time, status });
    localStorage.setItem('tv_logs', JSON.stringify(logs));

    bicara(`Absen Berhasil. ${name}. Status ${status}`);
    addVoiceLog(`${name} - ${status} (${shift})`);
    
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
    wrap.innerHTML += `<div><span style="color:#8b949e">[${new Date().toLocaleTimeString()}]</span> ${msg}</div>`;
    wrap.scrollTop = wrap.scrollHeight;
}

function logout() { location.reload(); }
function hapusChat() { document.getElementById('chatWrap').innerHTML = ""; }
function resetData() { if(confirm("Reset semua data?")) { localStorage.removeItem('tv_logs'); renderTable(); updateStats(); } }
