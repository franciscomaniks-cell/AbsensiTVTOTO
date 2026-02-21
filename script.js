const ADMIN_PIN = "741852963";
const NAMES = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "SENDI REVIAN"]; // Tambahkan nama lainnya
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

// --- 1. CEK LOGIN STATUS (EKSEKUSI PERTAMA) ---
(function() {
    if(localStorage.getItem('tv_isLoggedIn') === 'true') {
        window.addEventListener('DOMContentLoaded', () => {
            const overlay = document.getElementById('authOverlay');
            if(overlay) overlay.style.display = 'none';
        });
    }
})();

// --- 2. FUNGSI AUTH ---
function handleAuth() {
    const user = document.getElementById('uUser').value;
    const pass = document.getElementById('uPass').value;
    if(user === "admin" && pass === "admin123") {
        localStorage.setItem('tv_isLoggedIn', 'true');
        location.reload();
    } else {
        alert("Login Gagal!");
    }
}

function logout() {
    if(confirm("Logout dari sistem?")) {
        localStorage.removeItem('tv_isLoggedIn');
        location.reload();
    }
}

// --- 3. SIDEBAR TOGGLE ---
function toggleNav() {
    const sidebar = document.getElementById("mySidebar");
    const main = document.getElementById("mainContent");
    const openBtn = document.getElementById("openBtn");

    if (sidebar.style.width === "0px" || sidebar.classList.contains("closed")) {
        sidebar.style.width = "250px";
        sidebar.classList.remove("closed");
        main.classList.remove("wide");
        if(openBtn) openBtn.style.display = "none";
    } else {
        sidebar.style.width = "0px";
        sidebar.classList.add("closed");
        main.classList.add("wide");
        if(openBtn) openBtn.style.display = "block";
    }
}

// --- 4. LOGIKA ABSENSI ---
function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clockDisplay');
    if(clock) clock.innerText = now.toTimeString().split(' ')[0];
}

setInterval(updateClock, 1000);

window.onload = () => {
    updateClock();
    if(typeof render === 'function') render(); // Jika ada fungsi render tabel
};
