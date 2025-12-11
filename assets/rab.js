// ========== KONFIGURASI FIREBASE ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

// ⚙️ Ganti dengan konfigurasi Firebase milikmu
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "rabapp-520b5.firebaseapp.com",
  databaseURL: "https://rabapp-520b5-default-rtdb.firebaseio.com",
  projectId: "rabapp-520b5",
  storageBucket: "rabapp-520b5.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================================================
// ✅ FUNGSI SIMPAN DATA RAB
// ============================================================
export async function saveRAB(event) {
  event.preventDefault();

  const user = JSON.parse(localStorage.getItem("loginUser"));
  if (!user) {
    alert("Anda belum login!");
    window.location.href = "index.html";
    return;
  }

  const item = document.getElementById("item").value.trim();
  const jenis = document.getElementById("jenis").value;
  const urgensi = document.getElementById("urgensi").value.trim();
  const harga = parseFloat(document.getElementById("harga").value);
  const jumlah = parseInt(document.getElementById("jumlah").value);
  const bulanSelect = document.getElementById("bulan");
  const bulanDipilih = Array.from(bulanSelect.selectedOptions).map(opt => opt.value);

  if (!item || !jenis || bulanDipilih.length === 0 || !harga || !jumlah) {
    alert("⚠️ Harap isi semua kolom dengan benar.");
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
    createdAt: new Date().toISOString()
  };

  try {
    const newRef = push(ref(db, "rabapp/pengajuan"));
    await set(newRef, data);
    alert("✅ Pengajuan berhasil disimpan!");
    window.location.href = "list.html";
  } catch (error) {
    console.error(error);
    alert("❌ Gagal menyimpan data: " + error.message);
  }
}

// ============================================================
// ✅ FUNGSI TAMPILKAN DATA DI LIST.HTML
// ============================================================
export async function loadRABList() {
  const user = JSON.parse(localStorage.getItem("loginUser"));
  if (!user) {
    alert("Anda belum login!");
    window.location.href = "index.html";
    return;
  }

  const adminDivisions = ["Direktur", "Wakil Direktur"];
  const isAdmin = adminDivisions.includes(user.division);

  const tbody = document.querySelector("#rabTable tbody");
  tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#555;">⏳ Memuat data...</td></tr>`;

  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, "rabapp/pengajuan"));

    tbody.innerHTML = "";

    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#777;">Belum ada data pengajuan.</td></tr>`;
      return;
    }

    const data = snapshot.val();
    const allEntries = Object.entries(data).map(([id, val]) => ({
      id,
      ...val
    }));

    // Filter sesuai divisi
    const filtered = isAdmin
      ? allEntries
      : allEntries.filter(entry => entry.division === user.division);

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#777;">Belum ada pengajuan untuk divisi Anda.</td></tr>`;
      return;
    }

    filtered.forEach((entry) => {
      const bulan = Array.isArray(entry.bulan)
        ? entry.bulan.join(", ")
        : entry.bulan || "-";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${entry.item}</td>
        <td>${entry.jenis}</td>
        <td>${bulan}</td>
        <td>Rp ${entry.total.toLocaleString("id-ID")}</td>
        <td>
          <span style="
            background:${entry.status === 'Disetujui' ? '#22c55e' : entry.status === 'Ditolak' ? '#ef4444' : '#f59e0b'};
            color:white;
            padding:4px 10px;
            border-radius:8px;
            font-size:13px;
            ">
            ${entry.status}
          </span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Gagal memuat data:", error);
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;">Gagal memuat data. Lihat console log.</td></tr>`;
  }
}
