document.addEventListener("DOMContentLoaded", () => {
  const daftarMateriDiv = document.getElementById("daftarMateriTambahan");
  if (!daftarMateriDiv) return; // safety check kalau element nggak ada

  // Ambil semua kelas (10, 11, 12) atau ganti sesuai kebutuhan
  firebase.database().ref("materi").on("value", snapshot => {
    daftarMateriDiv.innerHTML = "";

    if (!snapshot.exists()) {
      daftarMateriDiv.innerHTML = "<p>Belum ada materi tambahan.</p>";
      return;
    }

    snapshot.forEach(kelasSnap => {
      const kelasKey = kelasSnap.key;

      kelasSnap.forEach(semesterSnap => {
        const semesterKey = semesterSnap.key;

        semesterSnap.forEach(materiSnap => {
          const data = materiSnap.val();
          let konten = data.konten || "";

          // 🔥 FORCE LINK YOUTUBE → IFRAME
          konten = konten.replace(
            /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})[^\s]*)/g,
            `<iframe width="300" height="170"
              src="https://www.youtube.com/embed/$2" 
              allowfullscreen>
            </iframe>`
          );

          const div = document.createElement("div");
          div.className = "materi-item";
          div.innerHTML = `
            <h3>${data.judul || "Judul Materi"}</h3>
            <div>${konten}</div>
            <small>Kelas: ${kelasKey} | Semester: ${semesterKey}</small>
          `;

          daftarMateriDiv.appendChild(div);
        });
      });
    });
  });
});
