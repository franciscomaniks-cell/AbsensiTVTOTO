const ADMIN_PIN = "741852963";
const NAMES = ["MARKUS FEBRIAN", "RADO DINATA", "PUTRI CAHAYA", "HENDRA", "SENDI REVIAN"];
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

// --- AUTH SYSTEM ---
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    // Default admin:admin123
    if(u === "admin" && p === "admin123") {
        localStorage.setItem('tv_is_logged', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    } else { alert("Akses Ditolak!"); }
}

function logout() {
    localStorage.removeItem('tv_is_logged');
    location.reload();
}

// --- ABSENSI ---
function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if(!NAMES.includes(name)) return alert("Nama Staff Tidak Terdaftar!");
    
    let db = JSON.parse(localStorage.getItem('tv_logs_vFinal') || "[]");
    db.push({ shift, name, target: TARGETS[shift], actual: time });
    localStorage.setItem('tv_logs_vFinal', JSON.stringify(db));
    render();
}

function render() {
    const db = JSON.parse(localStorage.getItem('tv_logs_vFinal') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if(!tbody) return;
    tbody.innerHTML = db.reverse().map(x => `
        <tr>
            <td>${x.shift}</td>
            <td>${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td style="color:${x.actual > x.target ? 'red' : 'green'}">${x.actual > x.target ? 'TELAT' : 'TEPAT'}</td>
        </tr>
    `).join('');
}

// --- JOBDESK ---
function generateJobs() {
    const staff = document.getElementById('staffList').value.split('\n').filter(n => n.trim() !== "");
    const tasks = document.getElementById('taskList').value.split('\n').filter(t => t.trim() !== "");
    if(staff.length === 0) return alert("Isi daftar staff!");
    
    let shuffled = [...tasks].sort(() => Math.random() - 0.5);
    let res = `<table style="width:100%; color:white; background:rgba(255,255,255,0.1); border-radius:10px;">
               <tr style="background:#2e3192"><th>STAFF</th><th>TUGAS</th></tr>`;
    staff.forEach((s, i) => {
        res += `<tr><td>${s.toUpperCase()}</td><td>${shuffled[i] || 'CADANGAN'}</td></tr>`;
    });
    document.getElementById('jobResults').innerHTML = res + `</table>`;
}

// --- INIT ---
window.onload = () => {
    if(localStorage.getItem('tv_is_logged') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }
    
    setInterval(() => {
        const n = new Date();
        if(document.getElementById('clockDisplay')) document.getElementById('clockDisplay').innerText = n.toTimeString().split(' ')[0];
        if(document.getElementById('pDate')) document.getElementById('pDate').innerText = n.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
        if(document.getElementById('pDay')) document.getElementById('pDay').innerText = n.toLocaleDateString('id-ID', {weekday:'long'}).toUpperCase();
    }, 1000);

    const dl = document.getElementById('staffs');
    if(dl) dl.innerHTML = NAMES.map(n => `<option value="${n}">`).join('');
    render();
};
