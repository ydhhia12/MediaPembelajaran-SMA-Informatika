const database = firebase.database();

function register(e) {
  e.preventDefault();

  const namaDepan = document.getElementById("namaDepan").value.trim();
  const namaLengkap = document.getElementById("namaLengkap").value.trim();
  const password = document.getElementById("password").value.trim();
  const kelas = document.getElementById("kelas").value;
  const message = document.getElementById("register-message");

  if (!namaDepan || !namaLengkap || !password || !kelas) {
    message.textContent = "Semua kolom harus diisi!";
    message.style.color = "red";
    return;
  }

  // Cek username unik (namaDepan sebagai key)
  database.ref("akunSiswa/" + namaDepan).get().then(snapshot => {
    if (snapshot.exists()) {
      message.textContent = "Nama depan sudah terdaftar, pilih yang lain!";
      message.style.color = "red";
    } else {
      // Simpan akun ke Firebase
      database.ref("akunSiswa/" + namaDepan).set({
        username: namaDepan,
        namaLengkap: namaLengkap,
        password: password,
        kelas: kelas,
        role: "user", // default role siswa
        createdAt: new Date().toISOString()
      }).then(() => {
        message.textContent = "Registrasi berhasil! Mengarahkan ke login...";
        message.style.color = "green";

        // Redirect ke login.html setelah 1,5 detik
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      }).catch(err => {
        message.textContent = "Terjadi kesalahan: " + err.message;
        message.style.color = "red";
      });
    }
  }).catch(err => {
    message.textContent = "Terjadi kesalahan: " + err.message;
    message.style.color = "red";
  });
}
