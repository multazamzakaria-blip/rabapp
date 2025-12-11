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

  // Ambil bulan tercentang
  const bulan = Array.from(
    document.querySelectorAll("#bulan-wrapper input[type='checkbox']:checked")
  ).map(c => c.value);

  if (bulan.length === 0) {
    alert("Pilih minimal satu bulan pelaksanaan.");
    return;
  }

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

  const rabRef = ref(db, "rabapp/rab");
  const newEntry = push(rabRef);

  set(newEntry, data)
    .then(() => {
      alert("Pengajuan berhasil disimpan!");
      window.location.href = "list.html";
    })
    .catch(err => {
      console.error(err);
      alert("Gagal menyimpan: " + err.message);
    });
}
