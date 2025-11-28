const database = firebase.database();

function login(e) {
  e.preventDefault();

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const message = document.getElementById("login-message");

  if (!username || !password) {
    message.textContent = "Isi semua kolom!";
    message.style.color = "red";
    return;
  }

  // === Cek Admin ===
  database.ref("Admin").once("value").then(snapshot => {
    if (snapshot.exists()) {
      const adminData = snapshot.val();
      console.log("Data admin dari Firebase:", adminData); // cek di console

      if (
        adminData.username === username &&
        adminData.password === password &&
        adminData.role === "admin"
      ) {
        message.textContent = "Login Admin berhasil!";
        message.style.color = "green";

        localStorage.setItem("akunLogin", JSON.stringify(adminData));

        setTimeout(() => {
          window.location.href = "admin-dashboard.html";
        }, 1000);
        return; // stop di sini kalau admin login
      }
    }

    // === Kalau bukan admin → cek akun siswa ===
    database.ref("akunSiswa/" + username).get().then(snapshot2 => {
      if (snapshot2.exists()) {
        const data = snapshot2.val();

        if (data.password === password) {
          message.textContent = "Login berhasil! Mengarahkan...";
          message.style.color = "green";

          localStorage.setItem("akunLogin", JSON.stringify(data));

          setTimeout(() => {
            if (data.kelas === "10") {
              window.location.href = "kelas10.html";
            } else if (data.kelas === "11") {
              window.location.href = "kelas11.html";
            } else if (data.kelas === "12") {
              window.location.href = "kelas12.html";
            } else {
              window.location.href = "materi.html";
            }
          }, 1000);
        } else {
          message.textContent = "Password salah!";
          message.style.color = "red";
        }
      } else {
        message.textContent = "Username tidak ditemukan!";
        message.style.color = "red";
      }
    });

  }).catch(err => {
    message.textContent = "Terjadi kesalahan: " + err.message;
    message.style.color = "red";
  });
}
