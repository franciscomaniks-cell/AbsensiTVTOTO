// CONFIGURATION
const ADMIN_PIN = "741852963";
const NAMES = ["MARKUS FEBRIAN", "RADO DINATA", "PUTRI CAHAYA", "HENDRA", "SENDI REVIAN"];
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

let authMode = 'LOGIN';

// --- 1. LOGIN, DAFTAR & FORGOT ---
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    let accounts = JSON.parse(localStorage.getItem('tv_accounts') || '{"admin":"admin123"}');

    if (authMode === 'LOGIN') {
        if (accounts[u] === p) {
            localStorage.setItem('tv_logged', 'true');
            document.getElementById('authOverlay').style.display = 'none';
        } else { alert("Login Gagal! Cek Username/Password."); }
    } else if (authMode === 'REGISTER') {
        accounts[u] = p;
        localStorage.setItem('tv_accounts', JSON.stringify(accounts));
        alert("Pendaftaran Berhasil! Silakan Login.");
        showLogin();
    } else if (authMode === 'FORGOT') {
        if(accounts[u]) {
            accounts[u] = p; // Reset password ke yang baru diketik
            localStorage.setItem('tv_accounts', JSON.stringify(accounts));
            alert("Password Akun Berhasil Diperbarui!");
            showLogin();
        } else { alert("User tidak ditemukan."); }
    }
}

function showRegister() {
    authMode = 'REGISTER';
    document.getElementById('authTitle').innerText = 'DAFTAR AKUN';
    document.getElementById('mainAuthBtn').innerText = 'BUAT AKUN';
    document.getElementById('uConfirm').style.display = 'block';
    document.getElementById('toggleText').innerHTML = 'Sudah punya akun? <span onclick="showLogin()">Masuk</span>';
}

function showLogin() {
    authMode = 'LOGIN';
    document.getElementById('authTitle').innerText = 'LOGIN SYSTEM';
    document.getElementById('mainAuthBtn').innerText = 'MASUK';
    document.getElementById('uConfirm').style.display = 'none';
    document.getElementById('toggleText').innerHTML = 'Belum punya akun? <span onclick="showRegister()">Daftar</span>';
}

function showForgot() {
    authMode = 'FORGOT';
    document.getElementById('authTitle').innerText = 'LUPA PASSWORD';
    document.getElementById('uPass').placeholder = 'Password Baru';
    document.getElementById('mainAuthBtn').innerText = 'RESET PASSWORD';
}

function logout() {
    localStorage.removeItem('tv_logged');
    location.reload();
}

// --- 2. ABSENSI LOGIC ---
function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if(!NAMES.includes(name)) return alert("Nama Staff Tidak Terdaftar di Sistem!");
    
    let db = JSON.parse(localStorage.getItem('tv_data_v1') || "[]");
    db.push({ shift, name, target: TARGETS[shift], actual: time });
    localStorage.setItem('tv_data_v1', JSON.stringify(db));
    render();
}

function render() {
    const db = JSON.parse(localStorage.getItem('tv_data_v1') || "[]");
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

// --- 3. JOBDESK LOGIC ---
function generateJobs() {
    const staff = document.getElementById('staffList').value.split('\n').filter(n => n.trim() !== "");
    const tasks = document.getElementById('taskList').value.split('\n').filter(t => t.trim() !== "");
    
    if(staff.length === 0) return alert("Masukkan minimal satu nama staff!");
    
    let shuffledTasks = [...tasks].sort(() => Math.random() - 0.5);
    let html = `<table style="width:100%; color:white; background:rgba(0,0,0,0.5); border-radius:10px;">
                <tr style="background:#2e3192"><th>NAMA STAFF</th><th>TUGAS</th></tr>`;
    
    staff.forEach((s, i) => {
        html += `<tr><td>${s.toUpperCase()}</td><td>${shuffledTasks[i] || 'CADANGAN/OFF'}</td></tr>`;
    });
    html += `</table>`;
    document.getElementById('jobResults').innerHTML = html;
}

// --- INITIALIZE SYSTEM ---
function init() {
    // Check Login Status
    if(localStorage.getItem('tv_logged') === 'true') {
        if(document.getElementById('authOverlay')) document.getElementById('authOverlay').style.display = 'none';
    }
    
    // Clock & Date
    setInterval(() => {
        const now = new Date();
        if(document.getElementById('clockDisplay')) document.getElementById('clockDisplay').innerText = now.toTimeString().split(' ')[0];
        if(document.getElementById('pDate')) document.getElementById('pDate').innerText = now.toLocaleDateString('id-ID', {day:'2-digit', month:'short', year:'numeric'}).toUpperCase();
        if(document.getElementById('pDay')) document.getElementById('pDay').innerText = now.toLocaleDateString('id-ID', {weekday:'long'}).toUpperCase();
    }, 1000);

    // Populate Datalist
    const dl = document.getElementById('staffs');
    if(dl) dl.innerHTML = NAMES.map(n => `<option value="${n}">`).join('');
    
    render();
}

window.onload = init;
