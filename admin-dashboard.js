// ===============================
//  NAVIGASI HALAMAN
// ===============================
function showSection(id) {
    document.querySelectorAll("main section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// ===============================
//  LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("loginAdmin");
    alert("Logout berhasil!");
    window.location.href = "login.html";
}

// ===============================
//  LOAD DATA OTOMATIS SAAT MASUK
// ===============================
window.onload = () => {
    muatAkun();
    muatSoal();
    muatMateri();
    muatNilai();
    muatEsai();
};

// ===================================================================
//                          KELOLA AKUN SISWA
// ===================================================================
function muatAkun() {
    const tabel = document.getElementById("akunlist");
    tabel.innerHTML = "";

    firebase.database().ref("akunSiswa").once("value", snap => {
        snap.forEach(child => {
            const data = child.val();

            tabel.innerHTML += `
                <tr>
                    <td>${data.username}</td>
                    <td>${data.namaLengkap}</td>
                    <td>${data.kelas}</td>
                    <td>
                        <button onclick="hapusAkun('${child.key}')">❌ Hapus</button>
                    </td>
                </tr>
            `;
        });
    });
}

function hapusAkun(username) {
    if (!confirm("Hapus akun ini?")) return;

    firebase.database().ref("akunSiswa/" + username).remove().then(() => {
        alert("Akun dihapus!");
        muatAkun();
    });
}

// ===== RESET SEMUA AKUN =====
function resetSemuaAkun() {
    if (!confirm("Yakin ingin reset semua akun siswa?")) return;

    firebase.database().ref("akunSiswa").remove().then(() => {
        alert("Semua akun berhasil dihapus!");
        muatAkun();
    });
}

// ===================================================================
//                          KELOLA SOAL KUIS
// ===================================================================
let tempSoal = []; // soal yang ditambahkan sebelum upload

function muatSoal() {
    const tabel = document.getElementById("soalList");
    tabel.innerHTML = "";

    firebase.database().ref("soalKuis").once("value", snap => {
        snap.forEach(child => {
            const s = child.val();

            tabel.innerHTML += `
                <tr>
                    <td>${s.soal}</td>
                    <td>${s.jenis}</td>
                    <td>${s.bab}</td>
                    <td>${s.kelas}</td>
                    <td>${s.semester}</td>
                    <td>${s.kunci || "-"}</td>
                    <td>${s.target}</td>
                    <td>
                        <button onclick="hapusSoal('${child.key}')">❌ Hapus</button>
                    </td>
                </tr>
            `;
        });
    });
}

function hapusSoal(id) {
    if (!confirm("Hapus soal ini?")) return;

    firebase.database().ref("soalKuis/" + id).remove().then(() => {
        alert("Soal berhasil dihapus!");
        muatSoal();
    });
}

// ===== RESET SEMUA SOAL =====
function resetSemuaSoal() {
    if (!confirm("Yakin ingin reset semua soal kuis?")) return;

    firebase.database().ref("soalKuis").remove().then(() => {
        alert("Semua soal berhasil dihapus!");
        muatSoal();
    });
}

// ===================================================================
//                          KELOLA MATERI
// ===================================================================
function muatMateri() {
    const tabel = document.getElementById("materiList");
    tabel.innerHTML = "";

    firebase.database().ref("materi").once("value", snap => {
        snap.forEach(child => {
            child.forEach(m => {
                const d = m.val();

                tabel.innerHTML += `
                    <tr>
                        <td>${d.judul}</td>
                        <td>${d.konten}</td>
                        <td>${d.kelas}</td>
                        <td>${d.semester}</td>
                        <td><button onclick="hapusMateri('${child.key}', '${m.key}')">❌</button></td>
                    </tr>
                `;
            });
        });
    });
}

function hapusMateri(kelas, id) {
    if (!confirm("Hapus materi ini?")) return;

    firebase.database().ref("materi/" + kelas + "/" + id).remove().then(() => {
        alert("Materi dihapus!");
        muatMateri();
    });
}

function resetSemuaMateri() {
    if (!confirm("Reset semua materi?")) return;

    firebase.database().ref("materi").remove().then(() => {
        alert("Semua materi direset!");
        muatMateri();
    });
}

// ===================================================================
//                          REKAP NILAI
// ===================================================================
function muatNilai() {
    const tabel = document.getElementById("nilaiList");
    tabel.innerHTML = "";

    firebase.database().ref("rekapNilai").once("value", snap => {
        snap.forEach(child => {
            const n = child.val();

            tabel.innerHTML += `
                <tr>
                    <td>${n.username}</td>
                    <td>${n.nama}</td>
                    <td>${n.kelas}</td>
                    <td>${n.bab}</td>
                    <td>${n.semester}</td>
                    <td>${n.jenis}</td>
                    <td>${n.nilai}</td>
                    <td>
                        <button onclick="hapusNilai('${child.key}')">❌</button>
                    </td>
                </tr>
            `;
        });
    });
}

function hapusNilai(id) {
    if (!confirm("Hapus nilai ini?")) return;

    firebase.database().ref("rekapNilai/" + id).remove().then(() => {
        alert("Nilai dihapus!");
        muatNilai();
    });
}

function resetSemuaNilai() {
    if (!confirm("Reset semua nilai siswa?")) return;

    firebase.database().ref("rekapNilai").remove().then(() => {
        alert("Semua nilai berhasil dihapus!");
        muatNilai();
    });
}

// ===================================================================
//                          JAWABAN ESAI
// ===================================================================
function muatEsai() {
    const tabel = document.getElementById("esaiList");
    tabel.innerHTML = "";

    firebase.database().ref("jawabanEsai").once("value", snap => {
        snap.forEach(child => {
            const d = child.val();

            tabel.innerHTML += `
                <tr>
                    <td>${child.key}</td>
                    <td>${d.nama}</td>
                    <td>${d.soal1 || "-"}</td>
                    <td>${d.soal2 || "-"}</td>
                    <td>${d.soal3 || "-"}</td>
                    <td>${d.soal4 || "-"}</td>
                    <td>${d.soal5 || "-"}</td>
                    <td>${d.nilai1 || "-"}</td>
                    <td>${d.nilai2 || "-"}</td>
                    <td>${d.nilai3 || "-"}</td>
                    <td>${d.nilai4 || "-"}</td>
                    <td>${d.nilai5 || "-"}</td>
                    <td><button onclick="hapusEsai('${child.key}')">❌</button></td>
                </tr>
            `;
        });
    });
}

function hapusEsai(username) {
    if (!confirm("Hapus jawaban esai ini?")) return;

    firebase.database().ref("jawabanEsai/" + username).remove().then(() => {
        alert("Jawaban esai dihapus!");
        muatEsai();
    });
}

function resetSemuaEsai() {
    if (!confirm("Reset semua jawaban esai?")) return;

    firebase.database().ref("jawabanEsai").remove().then(() => {
        alert("Semua esai berhasil dihapus!");
        muatEsai();
    });
}

// ===================================================================
//                          SELESAI
// ===================================================================
