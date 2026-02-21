// --- CONFIG DATA ---
const NAMES = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "JANNIFER MENTARI", "CINDY NURUL", "SENDI REVIAN", "SYUKUR KURNIAWAN", "HARYATI DEWI"];
const TARGETS = { "PAGI": "07:45:00", "SHIFT G": "09:45:00", "SHIFT G2": "11:45:00", "SORE": "15:45:00", "MALAM": "21:45:00" };

// --- NAVIGATION SYSTEM ---
function showPage(pageId) {
    document.querySelectorAll('.page-container').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    
    document.getElementById('page-' + pageId).classList.add('active');
    document.getElementById('nav-' + pageId).classList.add('active');
    
    if(pageId === 'absensi') renderAbsensi();
}

// --- AUTH SYSTEM ---
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    if(u === "admin" && p === "admin123") {
        localStorage.setItem('tv_logged', 'true');
        document.getElementById('authOverlay').style.display = 'none';
        speakAI("Akses diterima, selamat datang di sistem Power.");
    } else {
        alert("Username/Password Salah!");
    }
}

function logout() {
    localStorage.removeItem('tv_logged');
    location.reload();
}

// --- ABSENSI LOGIC ---
function speakAI(msg) {
    const utter = new SpeechSynthesisUtterance(msg.toLowerCase());
    utter.lang = 'id-ID';
    window.speechSynthesis.speak(utter);
}

function updateClock() {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = now.toLocaleDateString('id-ID', {day:'numeric', month:'long', year:'numeric'}).toUpperCase();
    const dayStr = now.toLocaleDateString('id-ID', {weekday:'long'}).toUpperCase();
    
    if(document.getElementById('clockDisplay')) document.getElementById('clockDisplay').innerText = timeStr;
    if(document.getElementById('pDate')) document.getElementById('pDate').innerText = dateStr;
    if(document.getElementById('pDay')) document.getElementById('pDay').innerText = dayStr;
    if(document.getElementById('tableDateText')) document.getElementById('tableDateText').innerText = dateStr;
}

function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;

    if(!NAMES.includes(name)) return alert("Nama tidak terdaftar!");
    let db = JSON.parse(localStorage.getItem('tv_absensi_v1') || "[]");
    if(db.some(x => x.name === name)) return alert("Sudah absen!");

    db.push({ name, shift, actual: time, target: TARGETS[shift] });
    localStorage.setItem('tv_absensi_v1', JSON.stringify(db));
    speakAI(`Absen berhasil, selamat bertugas ${name}`);
    document.getElementById('iName').value = "";
    renderAbsensi();
}

function renderAbsensi() {
    let db = JSON.parse(localStorage.getItem('tv_absensi_v1') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if(!tbody) return;
    tbody.innerHTML = "";

    let late = 0;
    db.reverse().forEach(x => {
        const row = tbody.insertRow();
        row.innerHTML = `<td>${x.shift}</td><td>${x.name}</td><td>${x.target}</td><td>${x.actual}</td><td>OK</td><td>✕</td>`;
    });

    document.getElementById('sOn').innerText = db.length;
    document.getElementById('sAbs').innerText = NAMES.length - db.length;
}

// --- JOBDESK LOGIC ---
let dbHistory = JSON.parse(localStorage.getItem("tvtoto_history")) || [];

function generateJobdesk() {
    const shift = document.getElementById("shiftSelect").value;
    document.getElementById("shiftDisplayText").innerText = "SHIFT " + shift;

    const staffArr = document.getElementById("staffInput").value.split("\n").filter(t => t.trim() !== "");
    const jobArr = document.getElementById("jobInput").value.split("\n").filter(t => t.trim() !== "");

    if (staffArr.length < 1) return alert("Masukkan nama staff!");

    const results = [];
    results.push({ name: staffArr[0], job: "OPERATOR" });

    const otherStaff = staffArr.slice(1);
    let shuffledJobs = [...jobArr].sort(() => Math.random() - 0.5);

    otherStaff.forEach((name, i) => {
        results.push({ name: name, job: shuffledJobs[i] || "OFF / CADANGAN" });
    });

    renderJobTable(results);
    saveJobHistory(results, shift);
}

function renderJobTable(data) {
    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = data.map((item, i) => {
        const isOp = item.job === "OPERATOR";
        return `<tr class="${isOp ? 'operator-lock' : ''}"><td>${item.name.toUpperCase()}</td><td>${item.job.toUpperCase()}</td></tr>`;
    }).join("");
}

function saveJobHistory(data, shift) {
    const entry = { id: Date.now(), shift, assignments: data, time: new Date().toLocaleTimeString() };
    dbHistory.unshift(entry);
    if(dbHistory.length > 5) dbHistory.pop();
    localStorage.setItem("tvtoto_history", JSON.stringify(dbHistory));
    renderJobHistory();
}

function renderJobHistory() {
    const list = document.getElementById("historyList");
    list.innerHTML = dbHistory.map(h => `
        <div style="background:rgba(255,255,255,0.05); padding:10px; border-radius:8px; margin-bottom:5px; font-size:0.7rem;">
            <b>${h.shift}</b> - ${h.time}
        </div>
    `).join("");
}

async function copyToClipboard() {
    const canvas = await html2canvas(document.getElementById("captureArea"));
    canvas.toBlob(blob => {
        navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        alert("Gambar tersalin!");
    });
}

function downloadImage() {
    html2canvas(document.getElementById("captureArea")).then(canvas => {
        const link = document.createElement("a");
        link.download = `Jobdesk-POWER.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

// --- INIT ---
setInterval(updateClock, 1000);
window.onload = () => {
    if(localStorage.getItem('tv_logged') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }
    updateClock();
    renderAbsensi();
    renderJobHistory();
    document.getElementById('staffs').innerHTML = NAMES.map(n => `<option value="${n}">`).join('');
};

// --- LOGIKA KHUSUS ATUR JOBDESK (POWER EDITION) ---

// 1. Inisialisasi Riwayat dari LocalStorage
let dbHistory = JSON.parse(localStorage.getItem("tvtoto_history")) || [];

// 2. Fungsi Utama: Acak & Simpan
function generateJobdesk() {
    const shift = document.getElementById("shiftSelect").value;
    const staffInput = document.getElementById("staffInput").value.trim();
    const jobInput = document.getElementById("jobInput").value.trim();

    // Validasi
    if (!staffInput) return alert("Daftar Staff tidak boleh kosong!");
    if (!jobInput) return alert("Daftar Jobdesk tidak boleh kosong!");

    const staffArr = staffInput.split("\n").filter(t => t.trim() !== "");
    const jobArr = jobInput.split("\n").filter(t => t.trim() !== "");

    // Ambil baris pertama sebagai Operator (Sesuai permintaan Anda)
    const operatorName = staffArr[0];
    const otherStaff = staffArr.slice(1);
    
    // Acak Jobdesk (Shuffle Algorithm)
    let shuffledJobs = [...jobArr].sort(() => Math.random() - 0.5);

    const results = [];
    // Masukkan Operator di baris pertama
    results.push({ name: operatorName, job: "OPERATOR" });

    // Masukkan Staff lain dengan Jobdesk yang sudah diacak
    otherStaff.forEach((name, i) => {
        results.push({
            name: name,
            job: shuffledJobs[i] || "OFF / CADANGAN",
        });
    });

    // Update Tampilan Preview
    document.getElementById("shiftDisplayText").innerText = "SHIFT " + shift;
    renderJobTable(results);
    
    // Simpan ke Riwayat
    saveJobHistory(results, shift);
    
    speakAI("Jobdesk berhasil diacak untuk shift " + shift);
}

// 3. Fungsi Render Tabel Preview
function renderJobTable(data) {
    const tbody = document.getElementById("resultBody");
    tbody.innerHTML = "";
    
    data.forEach((item, i) => {
        const isOp = item.job === "OPERATOR";
        const rowClass = isOp ? "operator-lock" : (i % 2 === 0 ? "row-pink" : "");
        
        const tr = document.createElement("tr");
        if (isOp) tr.className = "operator-lock";
        // Tambahkan style pink soft manual jika di CSS belum ada
        if (!isOp && i % 2 === 0) tr.style.backgroundColor = "#fff1f2"; 

        tr.innerHTML = `
            <td style="text-align:left; padding-left:20px;">${item.name.toUpperCase()}</td>
            <td style="font-weight:bold;">${item.job.toUpperCase()}</td>
        `;
        tbody.appendChild(tr);
    });
}

// 4. Fungsi Riwayat (History)
function saveJobHistory(data, shift) {
    const now = new Date();
    const entry = {
        id: Date.now(),
        date: now.toLocaleDateString("id-ID"),
        time: now.toLocaleTimeString("id-ID"),
        shift: shift,
        assignments: data,
    };
    
    dbHistory.unshift(entry);
    if (dbHistory.length > 10) dbHistory.pop(); // Simpan 10 riwayat terakhir
    localStorage.setItem("tvtoto_history", JSON.stringify(dbHistory));
    renderJobHistoryList();
}

function renderJobHistoryList() {
    const container = document.getElementById("historyList");
    if (!container) return;
    
    container.innerHTML = dbHistory.map(item => `
        <div class="log-item" style="cursor:pointer; border-left:3px solid var(--accent);" onclick="loadHistoryToPreview(${item.id})">
            <div style="font-weight:bold; color:var(--accent);">${item.shift}</div>
            <div style="font-size:0.7rem; color:#94a3b8;">${item.date} - ${item.time}</div>
            <div style="font-size:0.7rem;">Op: ${item.assignments[0].name}</div>
        </div>
    `).join("");
}

function loadHistoryToPreview(id) {
    const item = dbHistory.find(h => h.id === id);
    if (item) {
        document.getElementById("shiftDisplayText").innerText = "SHIFT " + item.shift;
        renderJobTable(item.assignments);
        alert("Riwayat dimuat ke preview!");
    }
}

// 5. Fungsi Ekspor (PNG & Copy)
async function copyToClipboard() {
    const area = document.getElementById("captureArea");
    try {
        const canvas = await html2canvas(area, { scale: 2 });
        canvas.toBlob(blob => {
            const data = [new ClipboardItem({ [blob.type]: blob })];
            navigator.clipboard.write(data).then(() => {
                alert("✅ Gambar berhasil disalin ke clipboard!");
            });
        });
    } catch (err) {
        alert("Gagal menyalin gambar.");
    }
}

function downloadImage() {
    const area = document.getElementById("captureArea");
    const shift = document.getElementById("shiftSelect").value;
    html2canvas(area, { scale: 2 }).then(canvas => {
        const link = document.createElement("a");
        link.download = `JOBDESK-${shift}-${Date.now()}.png`;
        link.href = canvas.toDataURL();
        link.click();
    });
}

// Panggil render riwayat saat startup
window.addEventListener('load', () => {
    renderJobHistoryList();
});
