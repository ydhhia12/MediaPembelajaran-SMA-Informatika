// ====== KUIS 11 FULL ======
document.addEventListener("DOMContentLoaded", () => {
  const formNama = document.getElementById("formNama");
  const namaSection = document.getElementById("formNamaSection");
  const formKuis = document.getElementById("formKuis");
  const daftarSoal = document.getElementById("daftarSoal");
  const submitKuis = document.getElementById("submitKuis");
  const hasilDiv = document.getElementById("hasilNilai");

  let namaSiswa = "";
  let soalList = [];

  // Mulai kuis setelah input nama
  formNama.addEventListener("submit", (e) => {
    e.preventDefault();
    namaSiswa = document.getElementById("namaSiswa").value.trim();
    if(!namaSiswa) return alert("Isi nama kamu dulu ya!");

    // Sembunyikan form nama dan tampilkan form kuis
    namaSection.style.display = "none";
    formKuis.style.display = "block";

    // Load soal dari Firebase
    loadSoal();
  });

  function loadSoal() {
    daftarSoal.innerHTML = "";
    soalList = [];

    firebase.database().ref("soalKuis").orderByChild("target").equalTo("kuis11").once("value", snapshot => {
      if(!snapshot.exists()) {
        daftarSoal.innerHTML = "<p>Belum ada soal untuk kuis ini.</p>";
        return;
      }

      snapshot.forEach(soalSnap => {
        const soal = soalSnap.val();
        const key = soalSnap.key;
        soalList.push({ key, ...soal });

        const soalDiv = document.createElement("div");
        soalDiv.className = "soal";

        let jawabanHtml = "";
        if(soal.jenis === "pg") {
          for(const opsi in soal.pg) {
            jawabanHtml += `
              <label>
                <input type="radio" name="${key}" value="${opsi}"> ${opsi}. ${soal.pg[opsi]}
              </label>
            `;
          }
        } else {
          jawabanHtml = `<textarea name="${key}" placeholder="Tulis jawabanmu di sini..."></textarea>`;
        }

        soalDiv.innerHTML = `
          <h3>${soal.soalText}</h3>
          <p>Bab: ${soal.bab}</p>
          ${jawabanHtml}
        `;

        daftarSoal.appendChild(soalDiv);
      });

      submitKuis.style.display = "block";
    });
  }

  // Submit jawaban
  submitKuis.addEventListener("click", () => {
    if(!namaSiswa) return alert("Isi nama kamu dulu ya!");

    const totalSoal = soalList.length;
    let benar = 0;

    soalList.forEach(soal => {
      const jawaban = soal.jenis === "pg"
        ? document.querySelector(`input[name="${soal.key}"]:checked`)?.value || ""
        : document.querySelector(`textarea[name="${soal.key}"]`)?.value.trim() || "";

      // Cek jawaban PG
      if(soal.jenis === "pg" && jawaban.toUpperCase() === soal.jawabanBenar.toUpperCase()) {
        benar += 1;
      }

      // Simpan jawaban esai ke Firebase
      if(soal.jenis === "esai" && jawaban !== "") {
        const usernameKey = namaSiswa.toLowerCase().replace(/\s+/g,"_");
        firebase.database().ref(`jawabanEsai/${usernameKey}/${soal.key}`).set({
          jawaban,
          nilai: null,
          tanggal: new Date().toLocaleString()
        });
      }
    });

    // Hitung skor PG dalam persen
    const totalPG = soalList.filter(s => s.jenis === "pg").length;
    const skorPersen = totalPG > 0 ? Math.round((benar / totalPG) * 100) : 0;

    hasilDiv.style.display = "block";
    hasilDiv.innerHTML = `Hai ${namaSiswa}, skor PG kamu: ${skorPersen} / 100. Jawaban esai tersimpan untuk dinilai guru.`;

    // Simpan skor PG ke rekapNilai
    firebase.database().ref("rekapNilai").push({
      username: namaSiswa.toLowerCase().replace(/\s+/g,"_"),
      nama: namaSiswa,
      kelas: "11",
      bab: "Kuis 11",
      semester: "1/2",
      jenisSoal: "PG",
      nilai: skorPersen,
      totalPG,
      timestamp: Date.now()
    });

    // Redirect otomatis ke beranda setelah 2 detik
    setTimeout(() => window.location.href="kelas11.html", 2000);
  });
});
