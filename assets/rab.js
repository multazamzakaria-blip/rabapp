// assets/rab.js
import { db } from "./firebase.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

export function saveRAB(event) {
  event.preventDefault(); // Hindari reload halaman

  const user = JSON.parse(localStorage.getItem("loginUser"));
  if (!user) {
    alert("Anda belum login.");
    window.location.href = "index.html";
    return;
  }

  // Ambil nilai form
  const item = document.getElementById("item").value.trim();
  const jenis = document.getElementById("jenis").value;
  const urgensi = document.getElementById("urgensi").value.trim();
  const harga = parseFloat(document.getElementById("harga").value) || 0;
  const jumlah = parseInt(document.getElementById("jumlah").value) || 0;

  // Ambil bulan yang dipilih (dari checkbox dropdown)
  const bulanDipilih = Array.from(document.querySelectorAll("#bulan-wrapper input:checked"))
    .map(b => b.value);

  if (!item || !jenis || bulanDipilih.length === 0 || harga <= 0 || jumlah <= 0) {
    alert("Harap isi semua kolom dengan benar!");
    return;
  }

  const total = harga * jumlah;
  const data = {
    item,
    jenis,
    bulan: bulanDipilih,
    urgensi,
    harga,
    jumlah,
    total,
    division: user.division,
    createdBy: user.name,
    createdAt: new Date().toISOString(),
    status: "Menunggu"
  };

  // Simpan ke Firebase
  const newRef = push(ref(db, "rabapp/pengajuan"));
  set(newRef, data)
    .then(() => {
      alert("✅ Pengajuan berhasil disimpan!");
      window.location.href = "list.html";
    })
    .catch((err) => {
      console.error("❌ Gagal menyimpan:", err);
      alert("Gagal menyimpan data. Periksa koneksi Anda atau konfigurasi Firebase.");
    });
}
