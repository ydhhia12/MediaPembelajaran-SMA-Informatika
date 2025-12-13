// ===============================
// NAVIGASI HALAMAN
// ===============================
function showSection(id) {
    document.querySelectorAll("main section").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

// ===============================
// LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("loginAdmin");
    alert("Logout berhasil!");
    window.location.href = "login.html";
}

// ===============================
// LOAD DATA OTOMATIS
// ===============================
window.onload = () => {
    muatAkun();
    muatSoalFirebase();
    muatMateri();
    muatNilai();
    muatEsai();
};

// ===================================================================
// AKUN SISWA
// ===================================================================
function muatAkun() {
    const tabel = document.getElementById("akunlist");
    tabel.innerHTML = "";

    firebase.database().ref("akunSiswa").once("value", snap => {
        snap.forEach(child => {
            const d = child.val();
            tabel.innerHTML += `
                <tr>
                    <td>${d.username}</td>
                    <td>${d.namaLengkap}</td>
                    <td>${d.kelas}</td>
                    <td><button onclick="hapusAkun('${child.key}')">❌</button></td>
                </tr>`;
        });
    });
}

function hapusAkun(id) {
    if (!confirm("Hapus akun ini?")) return;
    firebase.database().ref("akunSiswa/" + id).remove().then(muatAkun);
}

function resetSemuaAkun() {
    if (!confirm("⚠ Hapus SEMUA akun siswa?")) return;
    firebase.database().ref("akunSiswa").remove().then(() => {
        alert("🔥 Semua akun dihapus");
        muatAkun();
    });
}

// ===================================================================
// KELOLA SOAL
// ===================================================================
let tempSoal = [];

function togglePgOptions() {
    const jenis = document.getElementById("jenisSoal").value;
    const pg = document.getElementById("pgOptions");

    if (jenis === "pg") {
        pg.style.display = "block";
    } else {
        pg.style.display = "none";
        ["optionA","optionB","optionC","optionD","optionE","jawabanBenar"]
            .forEach(id => document.getElementById(id).value = "");
    }
}

document.getElementById("jenisSoal").addEventListener("change", togglePgOptions);
togglePgOptions();

document.getElementById("formSoal").addEventListener("submit", e => {
    e.preventDefault();

    const jenis = jenisSoal.value;
    let soal = {
        soal: soalText.value,
        jenis,
        bab: babSoal.value,
        kelas: kelasSoal.value,
        semester: semesterSoal.value,
        target: targetKuis.value
    };

    if (jenis === "pg") {
        soal.opsi = {
            A: optionA.value,
            B: optionB.value,
            C: optionC.value,
            D: optionD.value,
            E: optionE.value
        };
        soal.kunci = jawabanBenar.value;
    } else {
        soal.kunci = "-";
    }

    tempSoal.push(soal);
    tampilkanTempSoal();
    formSoal.reset();
    togglePgOptions();
});

function tampilkanTempSoal() {
    const tabel = document.getElementById("soalList");
    tabel.innerHTML = "";

    tempSoal.forEach((s, i) => {
        tabel.innerHTML += `
            <tr>
                <td>${s.soal}</td>
                <td>${s.jenis}</td>
                <td>${s.bab}</td>
                <td>${s.kelas}</td>
                <td>${s.semester}</td>
                <td>${s.jenis === "pg" ? s.kunci : "-"}</td>
                <td>${s.target}</td>
                <td><button onclick="hapusTempSoal(${i})">❌</button></td>
            </tr>`;
    });

    document.getElementById("jumlah-soal").innerText =
        tempSoal.length ? `Jumlah soal sementara: ${tempSoal.length}` : "Belum ada soal ditambahkan.";
}

function hapusTempSoal(i) {
    tempSoal.splice(i, 1);
    tampilkanTempSoal();
}

function uploadSemuaSoal() {
    if (tempSoal.length === 0) return alert("Belum ada soal!");

    const ref = firebase.database().ref("soalKuis");
    tempSoal.forEach(s => ref.push(s));

    alert("✅ Semua soal diupload");
    tempSoal = [];
    tampilkanTempSoal();
    muatSoalFirebase();
}

function muatSoalFirebase() {
    const tabel = document.getElementById("soalListFirebase");
    tabel.innerHTML = "";
    let no = 1;

    firebase.database().ref("soalKuis").once("value", snap => {
        snap.forEach(child => {
            const s = child.val();
            tabel.innerHTML += `
                <tr>
                    <td>${no++}. ${s.soal}</td>
                    <td>${s.jenis}</td>
                    <td>${s.bab}</td>
                    <td>${s.kelas}</td>
                    <td>${s.semester}</td>
                    <td>${s.kunci || "-"}</td>
                    <td>${s.target}</td>
                    <td><button onclick="hapusSoal('${child.key}')">❌</button></td>
                </tr>`;
        });
    });
}

function hapusSoal(id) {
    if (!confirm("Hapus soal ini?")) return;
    firebase.database().ref("soalKuis/" + id).remove().then(muatSoalFirebase);
}

function resetSemuaSoal() {
    if (!confirm("⚠ Hapus SEMUA soal?")) return;
    firebase.database().ref("soalKuis").remove().then(() => {
        tempSoal = [];
        tampilkanTempSoal();
        muatSoalFirebase();
        alert("🔥 Semua soal dihapus");
    });
}

// ===============================
// MATERI
// ===============================

// 🔥 Render konten (Youtube / teks)
function renderKonten(konten) {
    if (!konten) return "-";

    return konten.replace(
        /(https?:\/\/(?:www\.)?youtube\.com\/(?:watch\?v=|live\/)|https?:\/\/youtu\.be\/)([A-Za-z0-9_-]{11})[^\s]*/g,
        `<iframe width="300" height="170"
            src="https://www.youtube.com/embed/$2"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen></iframe>`
    );
}

// ================== Muat Materi ==================
function muatMateri() {
    const tabel = document.getElementById("materiList");
    tabel.innerHTML = "";

    firebase.database().ref("materi").once("value", snap => {
        if (!snap.exists()) {
            tabel.innerHTML = `<tr><td colspan="5" style="text-align:center;">Belum ada materi</td></tr>`;
            return;
        }

        snap.forEach(kelasSnap => {
            const kelasKey = kelasSnap.key; // "10", "11", "12"

            kelasSnap.forEach(semesterSnap => {
                const semesterKey = semesterSnap.key; // "1", "2"

                semesterSnap.forEach(materiSnap => {
                    const d = materiSnap.val();
                    tabel.innerHTML += `
                        <tr>
                            <td>${d.judul || "-"}</td>
                            <td>${renderKonten(d.konten)}</td>
                            <td>${d.kelas || kelasKey}</td>
                            <td>${d.semester || semesterKey}</td>
                            <td>
                                <button onclick="hapusMateri('${kelasKey}','${semesterKey}','${materiSnap.key}')">❌</button>
                            </td>
                        </tr>
                    `;
                });
            });
        });
    });
}

// ================== Tambah Materi ==================
document.getElementById("formMateri").addEventListener("submit", e => {
    e.preventDefault();

    const judul = document.getElementById("judulMateri").value;
    const konten = document.getElementById("kontenMateri").value;
    const kelas = document.getElementById("kelasMateri").value;
    const semester = document.getElementById("semesterMateri").value;

    if (!judul || !konten || !kelas || !semester) {
        alert("Isi semua field dulu!");
        return;
    }

    firebase.database()
        .ref(`materi/${kelas}/${semester}`)
        .push({
            judul: judul,
            konten: konten,
            kelas: kelas,
            semester: semester
        })
        .then(() => {
            alert("Materi berhasil ditambahkan!");
            muatMateri();
            document.getElementById("formMateri").reset();
        });
});

// ================== Hapus Materi ==================
function hapusMateri(kelas, semester, id) {
    if (!confirm("Hapus materi ini?")) return;

    firebase.database()
      .ref(`materi/${kelas}/${semester}/${id}`)
      .remove()
      .then(() => {
          alert("Materi dihapus");
          muatMateri();
      });
}

// ================== Reset Semua Materi ==================
function resetSemuaMateri() {
    if (!confirm("⚠ Hapus SEMUA materi?")) return;

    firebase.database()
      .ref("materi")
      .remove()
      .then(() => {
          alert("🔥 Semua materi dihapus");
          muatMateri();
      });
}

// ================== Inisialisasi ==================
muatMateri();

// ===================================================================
// NILAI
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
                    <td>${n.jenisSoal}</td>
                    <td>${n.nilai}</td>
                    <td>
                        <button onclick="hapusNilai('${child.key}')">❌</button>
                    </td>
                </tr>`;
        });
    });
}

function hapusNilai(id) {
    if (!confirm("Hapus nilai ini?")) return;

    firebase.database()
        .ref("rekapNilai/" + id)
        .remove()
        .then(muatNilai);
}

// ===============================
//  RESET SEMUA NILAI
// ===============================
function resetSemuaNilai() {
    if (!confirm("⚠ Hapus SEMUA rekap nilai siswa?")) return;

    firebase.database()
        .ref("rekapNilai")
        .remove()
        .then(() => {
            alert("🔥 Semua rekap nilai dihapus");
            muatNilai();
        });
}

// ===================================================================
// ESAI
// ===================================================================
function muatEsai() {
    const tabel = document.getElementById("esaiList");
    tabel.innerHTML = "";

    firebase.database().ref("jawabanEsai").once("value", snap => {
        snap.forEach(child => {
            const d = child.val();
            const user = child.key;

            tabel.innerHTML += `
                <tr>
                    <td>${user}</td>
                    <td>${d.nama || "-"}</td>
                    <td>${d.soal1 || "-"}</td>
                    <td>${d.soal2 || "-"}</td>
                    <td>${d.soal3 || "-"}</td>
                    <td>${d.soal4 || "-"}</td>
                    <td>${d.soal5 || "-"}</td>
                    ${[1,2,3,4,5].map(i => `
                        <td>
                            <input type="number" min="0" max="100"
                                value="${d['nilai'+i] ?? ""}"
                                onchange="simpanNilaiEsai('${user}',${i},this.value)">
                        </td>`).join("")}
                    <td><button onclick="hapusEsai('${user}')">❌</button></td>
                </tr>`;
        });
    });
}

function simpanNilaiEsai(username, nomor, nilai) {
    if (nilai === "") return;
    firebase.database()
        .ref(`jawabanEsai/${username}`)
        .update({ [`nilai${nomor}`]: Number(nilai) });
}

function hapusEsai(id) {
    if (!confirm("Hapus esai ini?")) return;
    firebase.database().ref("jawabanEsai/" + id).remove().then(muatEsai);
}

function resetSemuaEsai() {
    if (!confirm("⚠ Hapus SEMUA esai?")) return;
    firebase.database().ref("jawabanEsai").remove().then(() => {
        alert("🔥 Semua esai dihapus");
        muatEsai();
    });
}
