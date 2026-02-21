// Akun default jika belum daftar
const DEFAULT_ACC = {"admin": {"pass": "admin123", "email": "admin@tvtoto.com"}};
const NAMES = ["MARKUS FEBRIAN PAMUNGKAS ATJE", "PUTRI CAHAYA", "RADO DINATA", "SELWEN AL KHAIRI", "GIERDAV ALDEN AZUTOS DUMAT", "DIAN THERESA SIMAMORA"]; // Tambahkan sisanya
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

function handleAuth() {
    const user = document.getElementById('uUser').value.trim();
    const pass = document.getElementById('uPass').value.trim();
    const email = document.getElementById('uEmail').value.trim();
    let accounts = JSON.parse(localStorage.getItem('tv_accounts')) || DEFAULT_ACC;

    if(document.getElementById('uEmail').style.display === 'none') { // LOGIN MODE
        if(accounts[user] && accounts[user].pass === pass) {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', user);
            document.getElementById('authOverlay').style.display = 'none';
            loadProfile();
        } else { alert("User atau Password Salah!"); }
    } else { // REGISTER MODE
        if(!user || !pass || !email) return alert("Lengkapi data!");
        accounts[user] = { pass, email };
        localStorage.setItem('tv_accounts', JSON.stringify(accounts));
        alert("Pendaftaran Berhasil!");
        showLogin();
    }
}

function showRegister() {
    document.getElementById('authTitle').innerText = "DAFTAR";
    document.getElementById('uEmail').style.display = "block";
    document.getElementById('mainAuthBtn').innerText = "Buat Akun";
    document.getElementById('toggleText').innerHTML = 'Sudah punya akun? <span onclick="showLogin()">Login</span>';
}

function showLogin() {
    document.getElementById('authTitle').innerText = "LOGIN";
    document.getElementById('uEmail').style.display = "none";
    document.getElementById('mainAuthBtn').innerText = "➜ Masuk";
    document.getElementById('toggleText').innerHTML = 'Belum punya akun? <span onclick="showRegister()">Daftar</span>';
}

function loadProfile() {
    const user = localStorage.getItem('currentUser');
    const accs = JSON.parse(localStorage.getItem('tv_accounts')) || DEFAULT_ACC;
    if(user && accs[user]) {
        document.getElementById('displayProfileName').innerText = user.toUpperCase();
        document.getElementById('displayProfileEmail').innerText = accs[user].email;
        document.getElementById('avatarInitial').innerText = user.charAt(0).toUpperCase();
        document.getElementById('headerName').innerText = user.toUpperCase();
        document.getElementById('headerEmail').innerText = accs[user].email;
        document.getElementById('avatarSmall').innerText = user.charAt(0).toUpperCase();
    }
}

function toggleUserMenu() {
    const menu = document.getElementById('userDropup');
    menu.style.display = (menu.style.display === "flex") ? "none" : "flex";
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    location.reload();
}

// Fungsi Jam dan Absensi (Lanjutkan kode sebelumnya)
setInterval(() => {
    const now = new Date();
    document.getElementById('clockDisplay').innerText = now.toTimeString().split(' ')[0];
}, 1000);

window.onload = () => {
    if(localStorage.getItem('isLoggedIn') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
        loadProfile();
    }
};
