const ADMIN_PIN = "741852963";
const NAMES = ["MARKUS FEBRIAN", "RADO DINATA", "PUTRI CAHAYA", "HENDRA", "SENDI REVIAN"];
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

// AUTH
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    if(u === "admin" && p === "admin123") {
        localStorage.setItem('tv_logged', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    } else { alert("User/Pass Salah!"); }
}

function logout() {
    localStorage.removeItem('tv_logged');
    location.reload();
}

// ABSENSI
function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if(!NAMES.includes(name)) return alert("Nama tidak terdaftar!");
    
    let db = JSON.parse(localStorage.getItem('tv_data') || "[]");
    db.push({ shift, name, target: TARGETS[shift], actual: time });
    localStorage.setItem('tv_data', JSON.stringify(db));
    render();
}

function render() {
    const db = JSON.parse(localStorage.getItem('tv_data') || "[]");
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

// UPDATE JAM & TANGGAL
function updateClock() {
    const now = new Date();
    if(document.getElementById('clockDisplay')) {
        document.getElementById('clockDisplay').innerText = now.toTimeString().split(' ')[0];
    }
    if(document.getElementById('pDate')) {
        document.getElementById('pDate').innerText = now.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
        document.getElementById('pDay').innerText = now.toLocaleDateString('id-ID', {weekday:'long'}).toUpperCase();
    }
}

window.onload = () => {
    if(localStorage.getItem('tv_logged') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }
    render();
    setInterval(updateClock, 1000);
};
