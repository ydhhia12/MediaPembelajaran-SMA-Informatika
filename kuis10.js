// ====== KUIS 10 FULL (FIXED) ======
document.addEventListener("DOMContentLoaded", () => {
  const formNama = document.getElementById("formNama");
  const namaSection = document.getElementById("formNamaSection");
  const formKuis = document.getElementById("formKuis");
  const daftarSoal = document.getElementById("daftarSoal");
  const submitKuis = document.getElementById("submitKuis");
  const hasilDiv = document.getElementById("hasilNilai");

  let namaSiswa = "";
  let soalList = [];

  // ================= MULAI KUIS =================
  formNama.addEventListener("submit", e => {
    e.preventDefault();
    namaSiswa = document.getElementById("namaSiswa").value.trim();
    if (!namaSiswa) return alert("Isi nama kamu dulu ya!");

    namaSection.style.display = "none";
    formKuis.style.display = "block";
    loadSoal();
  });

  // ================= LOAD SOAL =================
  function loadSoal() {
    daftarSoal.innerHTML = "";
    soalList = [];

    firebase.database()
      .ref("soalKuis")
      .orderByChild("target")
      .equalTo("kuis10")
      .once("value", snap => {

        if (!snap.exists()) {
          daftarSoal.innerHTML = "<p>Belum ada soal.</p>";
          return;
        }

        snap.forEach(child => {
          const soal = child.val();
          const key = child.key;
          soalList.push({ key, ...soal });

          let jawabanHTML = "";

          // ===== PILIHAN GANDA =====
          if (soal.jenis === "pg") {
            for (const opsi in soal.opsi) {
              jawabanHTML += `
                <label>
                  <input type="radio" name="${key}" value="${opsi}">
                  ${opsi}. ${soal.opsi[opsi]}
                </label><br>
              `;
            }
          }

          // ===== ESAI =====
          else {
            jawabanHTML = `
              <textarea name="${key}" rows="3"
                placeholder="Tulis jawabanmu di sini..."></textarea>
            `;
          }

          const soalDiv = document.createElement("div");
          soalDiv.className = "soal";
          soalDiv.innerHTML = `
            <h3>${soal.soal}</h3>
            <p><b>Bab:</b> ${soal.bab}</p>
            ${jawabanHTML}
          `;

          daftarSoal.appendChild(soalDiv);
        });

        submitKuis.style.display = "block";
      });
  }

  // ================= SUBMIT KUIS =================
  submitKuis.addEventListener("click", () => {
    if (!namaSiswa) return alert("Isi nama dulu!");

    let benar = 0;
    let totalPG = 0;

    soalList.forEach(soal => {
      let jawaban = "";

      if (soal.jenis === "pg") {
        totalPG++;
        jawaban =
          document.querySelector(`input[name="${soal.key}"]:checked`)
            ?.value || "";

        if (jawaban.toUpperCase() === soal.kunci.toUpperCase()) {
          benar++;
        }
      }

      // ===== SIMPAN ESAI =====
      if (soal.jenis === "esai") {
        jawaban =
          document.querySelector(`textarea[name="${soal.key}"]`)
            ?.value.trim() || "";

        if (jawaban) {
          const userKey = namaSiswa.toLowerCase().replace(/\s+/g, "_");
          firebase.database()
            .ref(`jawabanEsai/${userKey}/${soal.key}`)
            .set({
              nama: namaSiswa,
              soal: soal.soal,
              jawaban,
              waktu: Date.now()
            });
        }
      }
    });

    const skor = totalPG > 0 ? Math.round((benar / totalPG) * 100) : 0;

    hasilDiv.style.display = "block";
    hasilDiv.innerHTML = `
      Hai <b>${namaSiswa}</b> 👋<br>
      Skor PG kamu: <b>${skor}</b>/100<br>
      Jawaban esai sudah dikirim ke guru.
    `;

    // ===== SIMPAN NILAI =====
    firebase.database().ref("rekapNilai").push({
      username: namaSiswa.toLowerCase().replace(/\s+/g, "_"),
      nama: namaSiswa,
      kelas: "10",
      bab: "Kuis 10",
      semester: "1/2",
      jenis: "PG",
      nilai: skor,
      totalPG,
      timestamp: Date.now()
    });

    setTimeout(() => {
      window.location.href = "kelas10.html";
    }, 2000);
  });
});
