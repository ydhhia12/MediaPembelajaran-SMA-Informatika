// ====== KELAS 10 JS FULL ======
document.addEventListener("DOMContentLoaded", () => {
  // ====== MATERI TAMBAHAN ======
  const daftarMateriDiv = document.getElementById("daftarMateriTambahan");

  function convertYoutubeLinkToIframe(link) {
    let videoId = "";

    if(link.includes("youtube.com/watch")) {
      const urlParams = new URLSearchParams(link.split("?")[1]);
      videoId = urlParams.get("v");
    }
    else if(link.includes("youtu.be")) {
      videoId = link.split("/").pop();
    }

    if(videoId) {
      return `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    }
    return link;
  }

  // Ambil materi dari Firebase
  firebase.database().ref("materiTambahan/10").on("value", snapshot => {
    daftarMateriDiv.innerHTML = "";

    if (!snapshot.exists()) {
      daftarMateriDiv.innerHTML = "<p>Belum ada materi tambahan untuk kelas 10.</p>";
      return;
    }

    snapshot.forEach(semesterSnap => {
      const semesterKey = semesterSnap.key;
      semesterSnap.forEach(childSnap => {
        const data = childSnap.val();

        let konten = data.kontenMateri || "Konten materi belum tersedia";
        if(konten.includes("youtube.com") || konten.includes("youtu.be")) {
          konten = convertYoutubeLinkToIframe(konten);
        }

        const materiCard = document.createElement("div");
        materiCard.className = "materi-card";
        materiCard.innerHTML = `
          <h3>${data.judulMateri || "Judul Materi"}</h3>
          <div>${konten}</div>
          <small>Semester: ${semesterKey}</small>
        `;
        daftarMateriDiv.appendChild(materiCard);
      });
    });
  });

  // Materi dari localStorage
  const materiTambahanLS = JSON.parse(localStorage.getItem("materiTambahan")) || [];
  materiTambahanLS.filter(m => m.kelas === "10").forEach(m => {
    let konten = m.kontenMateri || "";
    if(konten.includes("youtube.com") || konten.includes("youtu.be")) {
      konten = convertYoutubeLinkToIframe(konten);
    }

    const materiCard = document.createElement("div");
    materiCard.className = "materi-card";
    materiCard.innerHTML = `
      <h3>${m.judulMateri}</h3>
      <div>${konten}</div>
      <small>Semester: Tambahan</small>
    `;
    daftarMateriDiv.appendChild(materiCard);
  });
})
