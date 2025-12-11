// assets/rab.js
import { db } from "./firebase.js";
import { ref, push, set, get, child } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

// === FUNGSI SIMPAN (sudah ada di versi sebelumnya) ===
export async function saveRAB(event) {
  event.preventDefault();
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

    if (!item || !jenis || bulanDipilih.length === 0 || !harga || !jumlah) {
      alert("Harap isi semua kolom dengan benar dan pilih minimal satu bulan.");
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
    showToast("❌ Gagal menyimpan: " + error.message, true);
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

// === FUNGSI TAMPILKAN DATA DI LIST.HTML ===
export async function loadRABList() {
  const user = JSON.parse(localStorage.getItem("loginUser"));
  if (!user) {
    alert("Anda belum login.");
    window.location.href = "index.html";
    return;
  }

  const adminDivisions = ["Direktur", "Wakil Direktur"];
  const isAdmin = adminDivisions.includes(user.division);

  try {
    const snapshot = await get(child(ref(db), "rabapp/pengajuan"));
    const tableBody = document.querySelector("#rabTable tbody");
    tableBody.innerHTML = "";

    if (snapshot.exists()) {
      const data = snapshot.val();
      const entries = Object.values(data);

      const filtered = isAdmin
        ? entries
        : entries.filter(item => item.division === user.division);

      if (filtered.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#777;">Belum ada pengajuan</td></tr>`;
        return;
      }

      filtered.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.item}</td>
          <td>${item.jenis}</td>
          <td>${item.bulan.join(", ")}</td>
          <td>Rp ${item.total.toLocaleString("id-ID")}</td>
          <td>${item.status}</td>
        `;
        tableBody.appendChild(row);
      });
    } else {
      tableBody.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#777;">Belum ada data</td></tr>`;
    }
  } catch (error) {
    console.error("Gagal memuat data:", error);
  }
}

// === FUNGSI NOTIFIKASI ===
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
