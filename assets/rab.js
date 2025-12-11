// assets/rab.js
import { db } from "./firebase.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

export async function saveRAB(event) {
  event.preventDefault(); // hindari reload halaman

  const btn = event.target.querySelector("button[type='submit']");
  const originalText = btn.innerHTML;
  btn.innerHTML = "⏳ Menyimpan...";
  btn.disabled = true;

  try {
    const user = JSON.parse(localStorage.getItem("loginUser"));
    if (!user) {
      alert("Anda belum login. Silakan login dulu.");
      window.location.href = "index.html";
      return;
    }

    const item = document.getElementById("item").value.trim();
    const jenis = document.getElementById("jenis").value;
    const urgensi = document.getElementById("urgensi").value.trim();
    const harga = parseFloat(document.getElementById("harga").value);
    const jumlah = parseInt(document.getElementById("jumlah").value);

    const bulanDipilih = Array.from(
      document.querySelectorAll("#bulan-wrapper input:checked")
    ).map(el => el.value);

    // Validasi dasar
    if (!item || !jenis || bulanDipilih.length === 0 || !harga || !jumlah) {
      alert("Harap isi semua kolom dan pilih minimal satu bulan.");
      btn.innerHTML = originalText;
      btn.disabled = false;
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
      createdBy: user.name,
      division: user.division,
      status: "Menunggu",
      createdAt: new Date().toISOString(),
    };

    const newDataRef = push(ref(db, "rabapp/pengajuan"));
    await set(newDataRef, data);

    showToast("✅ Pengajuan berhasil disimpan!");
    setTimeout(() => (window.location.href = "list.html"), 1500);
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    showToast("❌ Gagal menyimpan data: " + error.message, true);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// 🔔 Notifikasi elegan
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "30px";
  toast.style.right = "30px";
  toast.style.padding = "14px 22px";
  toast.style.borderRadius = "10px";
  toast.style.background = isError ? "#dc2626" : "#16a34a";
  toast.style.color = "#fff";
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  toast.style.fontSize = "15px";
  toast.style.zIndex = "1000";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
