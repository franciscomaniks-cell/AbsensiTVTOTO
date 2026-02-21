// CONFIG
const ADMIN_PIN = "741852963";
const NAMES = ["MARKUS FEBRIAN", "PUTRI CAHAYA", "RADO DINATA", "IRVAN GANESHA", "CINDY NURUL"];
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

let authMode = 'LOGIN';

// --- 1. FITUR LOGIN, REGISTER, FORGOT ---
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    let accounts = JSON.parse(localStorage.getItem('tv_accounts') || '{"admin":"admin123"}');

    if(authMode === 'LOGIN') {
        if(accounts[u] === p) {
            localStorage.setItem('tv_logged', 'true');
            document.getElementById('authOverlay').style.display = 'none';
        } else { alert("Login Gagal!"); }
    } 
    else if(authMode === 'REGISTER') {
        accounts[u] = p;
        localStorage.setItem('tv_accounts', JSON.stringify(accounts));
        alert("Berhasil Daftar! Silakan Login.");
        showLogin();
    }
    else if(authMode === 'FORGOT') {
        if(accounts[u]) {
            accounts[u] = p;
            localStorage.setItem('tv_accounts', JSON.stringify(accounts));
            alert("Password diperbarui!");
            showLogin();
        } else { alert("User tidak ditemukan!"); }
    }
}

function showRegister() {
    authMode = 'REGISTER';
    document.getElementById('authTitle').innerText = 'DAFTAR AKUN';
    document.getElementById('mainAuthBtn').innerText = 'BUAT AKUN';
    document.getElementById('toggleText').innerHTML = 'Sudah punya akun? <span onclick="showLogin()">Masuk</span>';
}

function showLogin() {
    authMode = 'LOGIN';
    document.getElementById('authTitle').innerText = 'LOGIN SYSTEM';
    document.getElementById('mainAuthBtn').innerText = 'MASUK';
    document.getElementById('toggleText').innerHTML = 'Belum punya akun? <span onclick="showRegister()">Daftar</span>';
}

function showForgot() {
    authMode = 'FORGOT';
    document.getElementById('authTitle').innerText = 'RESET PASSWORD';
    document.getElementById('mainAuthBtn').innerText = 'UPDATE PASSWORD';
    document.getElementById('uPass').placeholder = 'Password Baru';
}

function logout() {
    localStorage.removeItem('tv_logged');
    location.reload();
}

// --- SISTEM ABSENSI ---
function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;
    
    if(!NAMES.includes(name)) return alert("Nama tidak terdaftar!");
    
    let db = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    db.push({ shift, name, target: TARGETS[shift], actual: time });
    localStorage.setItem('tv_absensi', JSON.stringify(db));
    render();
}

function render() {
    const db = JSON.parse(localStorage.getItem('tv_absensi') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if(!tbody) return;
    
    tbody.innerHTML = db.reverse().map(d => `
        <tr class="${d.actual > d.target ? 'row-late' : ''}">
            <td>${d.shift}</td>
            <td>${d.name}</td>
            <td>${d.target}</td>
            <td>${d.actual}</td>
            <td>${d.actual > d.target ? 'TERLAMBAT' : 'TEPAT'}</td>
            <td><button onclick="hapusOne('${d.name}')">✕</button></td>
        </tr>
    `).join('');
}

// JAM DIGITAL
setInterval(() => {
    const now = new Date();
    if(document.getElementById('clockDisplay')) {
        document.getElementById('clockDisplay').innerText = now.toTimeString().split(' ')[0];
    }
}, 1000);

window.onload = () => {
    if(localStorage.getItem('tv_logged') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }
    render();
};
