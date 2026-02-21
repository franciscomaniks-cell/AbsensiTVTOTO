const NAMES = ["RADO DINATA", "IRVAN GANESHA", "JOSIA ROMANDA GINTING", "MUHAMMAD BAKRON", "CINDY NURUL", "SENDI REVIAN"];

// LOGIC LOGIN & CLOCK
function handleAuth() {
    const u = document.getElementById('uUser').value;
    const p = document.getElementById('uPass').value;
    if(u === "admin" && p === "admin123") {
        localStorage.setItem('isAuth', 'true');
        document.getElementById('authOverlay').style.display = 'none';
    }
}

function updateClock() {
    const now = new Date();
    const clock = document.getElementById('clockDisplay');
    if(clock) clock.innerText = now.toTimeString().split(' ')[0];
}
setInterval(updateClock, 1000);

// LOGIC ABSENSI
function tambahAbsen() {
    const name = document.getElementById('iName').value.toUpperCase();
    const shift = document.getElementById('sShift').value;
    const time = document.getElementById('clockDisplay').innerText;
    
    if(!NAMES.includes(name)) return alert("Nama tidak terdaftar!");
    
    let logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    logs.push({ shift, name, actual: time, target: "07:45:00" });
    localStorage.setItem('tv_logs', JSON.stringify(logs));
    renderAbsen();
}

function renderAbsen() {
    const logs = JSON.parse(localStorage.getItem('tv_logs') || "[]");
    const tbody = document.querySelector('#tblMain tbody');
    if(!tbody) return;
    tbody.innerHTML = logs.reverse().map(x => `
        <tr>
            <td>${x.shift}</td>
            <td>${x.name}</td>
            <td>${x.target}</td>
            <td>${x.actual}</td>
            <td style="color:${x.actual > x.target ? 'red' : 'green'}">
                ${x.actual > x.target ? 'TERLAMBAT' : 'TEPAT'}
            </td>
        </tr>
    `).join('');
}

// LOGIC JOBDESK (image_6b8bbf.png)
function generateJobs() {
    const staff = document.getElementById('staffList').value.split('\n').filter(x => x.trim() !== "");
    const tasks = document.getElementById('taskList').value.split('\n').filter(x => x.trim() !== "");
    const shift = document.getElementById('jShift').value;

    if(staff.length === 0) return alert("Masukkan nama staff!");

    let shuffledTasks = [...tasks].sort(() => Math.random() - 0.5);
    let html = `<table><tr><th>NAMA PERSONEL</th><th>TUGAS OPERASIONAL</th></tr>`;
    
    staff.forEach((s, i) => {
        let task = i === 0 ? "OPERATOR" : (shuffledTasks[i-1] || "BACKUP");
        html += `<tr>
            <td style="${i === 0 ? 'color:green' : ''}">${s.toUpperCase()}</td>
            <td style="${i === 0 ? 'color:green' : ''}">${task}</td>
        </tr>`;
    });
    
    html += `</table>`;
    document.getElementById('jobTableResult').innerHTML = html;
    document.getElementById('repShift').innerText = shift.toUpperCase();
}

window.onload = () => {
    if(localStorage.getItem('isAuth') === 'true') {
        document.getElementById('authOverlay').style.display = 'none';
    }
    renderAbsen();
};
