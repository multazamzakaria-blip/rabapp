import { db } from "./firebase.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

function getUser() {
  return JSON.parse(localStorage.getItem("loginUser"));
}

export function saveRAB(event) {
  event.preventDefault();

  const user = getUser();
  if (!user) {
    alert("Anda belum login.");
    return;
  }

  // Ambil bulan multiple
  const bulan = Array.from(document.getElementById("bulan").selectedOptions)
                     .map(opt => opt.value);

  const rabRef = ref(db, "rabapp/rab");

  const data = {
    item: document.getElementById("item").value,
    jenis: document.getElementById("jenis").value,
    bulan: bulan,
    urgensi: document.getElementById("urgensi").value,
    harga: Number(document.getElementById("harga").value),
    jumlah: Number(document.getElementById("jumlah").value),
    total: Number(document.getElementById("harga").value) * Number(document.getElementById("jumlah").value),
    status: "Menunggu",
    division: user.division,
    createdBy: user.name,
    createdAt: new Date().toISOString()
  };

  const newRef = push(rabRef);

  set(newRef, data)
    .then(() => {
      alert("Pengajuan berhasil disimpan.");
      window.location.href = "list.html";
    })
    .catch(err => {
      console.error(err);
      alert("Gagal menyimpan: " + err.message);
    });
}
