// ========== KONFIGURASI FIREBASE ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  set,
  get,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_kvyDshMXYNqj87bqXZC8tKAi_Kko2Rs",
  authDomain: "rabapp-520b5.firebaseapp.com",
  databaseURL: "https://rabapp-520b5-default-rtdb.firebaseio.com",
  projectId: "rabapp-520b5",
  storageBucket: "rabapp-520b5.firebasestorage.app",
  messagingSenderId: "1060443577862",
  appId: "1:1060443577862:web:6618775410d09ae16cad87"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// ============================================================
// ✅ SIMPAN DATA RAB
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
  tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#555;">⏳ Memuat data...</td></tr>`;

  try {
    const snapshot = await get(ref(db, "rabapp/pengajuan"));
    tbody.innerHTML = "";

    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#777;">Belum ada data pengajuan.</td></tr>`;
      return;
    }

    const data = snapshot.val();
    const entries = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    const filtered = isAdmin ? entries : entries.filter(e => e.division === user.division);

    filtered.forEach((entry) => {
      const bulanText = Array.isArray(entry.bulan) ? entry.bulan.join(", ") : entry.bulan || "-";
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${entry.item}</td>
        <td>${entry.jenis}</td>
        <td>${bulanText}</td>
        <td>Rp ${entry.harga?.toLocaleString("id-ID")}</td>
        <td>${entry.satuan || "-"}</td>
        <td>${entry.jumlah}</td>
        <td>Rp ${entry.total?.toLocaleString("id-ID")}</td>
        <td>
          <span class="status ${
            entry.status === "Disetujui"
              ? "status-disetujui"
              : entry.status === "Ditolak"
              ? "status-ditolak"
              : "status-menunggu"
          }">${entry.status}</span>
        </td>
        <td style="text-align:center;">
          <button class="btn-edit" data-id="${entry.id}">✏️</button>
          <button class="btn-del" data-id="${entry.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // === EDIT ===
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const data = entries.find((x) => x.id === id);
        if (!data) return;

        const newNama = prompt("Edit nama item:", data.item);
        const newHarga = prompt("Edit harga satuan:", data.harga);
        const newSatuan = prompt("Edit satuan (pcs/unit/paket):", data.satuan);
        const newJumlah = prompt("Edit jumlah:", data.jumlah);

        if (newNama && newHarga && newJumlah && newSatuan) {
          await update(ref(db, "rabapp/pengajuan/" + id), {
            item: newNama,
            harga: parseFloat(newHarga),
            satuan: newSatuan,
            jumlah: parseInt(newJumlah),
            total: parseFloat(newHarga) * parseInt(newJumlah)
          });
          alert("✅ Data berhasil diperbarui!");
          loadRABList();
        }
      });
    });

    // === HAPUS ===
    document.querySelectorAll(".btn-del").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Yakin ingin menghapus item ini?")) {
          await remove(ref(db, "rabapp/pengajuan/" + id));
          alert("🗑️ Data berhasil dihapus!");
          loadRABList();
        }
      });
    });

  } catch (error) {
    console.error("Gagal memuat data:", error);
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:#dc2626;">Gagal memuat data. Lihat console log.</td></tr>`;
  }
}




// ============================================================
// ✅ TAMPILKAN DATA + FITUR EDIT & HAPUS
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
  tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#555;">⏳ Memuat data...</td></tr>`;

  try {
    const snapshot = await get(ref(db, "rabapp/pengajuan"));
    tbody.innerHTML = "";

    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#777;">Belum ada data pengajuan.</td></tr>`;
      return;
    }

    const data = snapshot.val();
    const entries = Object.entries(data).map(([id, val]) => ({ id, ...val }));
    const filtered = isAdmin ? entries : entries.filter(e => e.division === user.division);

    filtered.forEach((entry) => {
      const bulanText = Array.isArray(entry.bulan) ? entry.bulan.join(", ") : entry.bulan || "-";
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${entry.item}</td>
        <td>${entry.jenis}</td>
        <td>${bulanText}</td>
        <td>${entry.satuan || "-"}</td>
        <td>Rp ${entry.total?.toLocaleString("id-ID")}</td>
        <td>
          <span style="
            background:${entry.status === 'Disetujui' ? '#22c55e' :
                        entry.status === 'Ditolak' ? '#ef4444' : '#f59e0b'};
            color:white;padding:4px 10px;border-radius:8px;font-size:13px;">
            ${entry.status}
          </span>
        </td>
        <td style="text-align:center;">
          <button class="btn-edit" data-id="${entry.id}">✏️</button>
          <button class="btn-del" data-id="${entry.id}">🗑️</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // === EVENT UNTUK EDIT ===
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const data = entries.find((x) => x.id === id);
        if (!data) return;

        const newNama = prompt("Edit nama item:", data.item);
        const newHarga = prompt("Edit harga satuan:", data.harga);
        const newJumlah = prompt("Edit jumlah:", data.jumlah);

        if (newNama && newHarga && newJumlah) {
          await update(ref(db, "rabapp/pengajuan/" + id), {
            item: newNama,
            harga: parseFloat(newHarga),
            jumlah: parseInt(newJumlah),
            total: parseFloat(newHarga) * parseInt(newJumlah)
          });
          alert("✅ Data berhasil diperbarui!");
          loadRABList();
        }
      });
    });

    // === EVENT UNTUK HAPUS ===
    document.querySelectorAll(".btn-del").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        if (confirm("Yakin ingin menghapus item ini?")) {
          await remove(ref(db, "rabapp/pengajuan/" + id));
          alert("🗑️ Data berhasil dihapus!");
          loadRABList();
        }
      });
    });

  } catch (error) {
    console.error("Gagal memuat data:", error);
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#dc2626;">Gagal memuat data. Lihat console log.</td></tr>`;
  }
}
