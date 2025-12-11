// ========== KONFIGURASI FIREBASE ==========
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
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
export async function saveRAB(e) {
  e.preventDefault();

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
  const satuan = document.getElementById("satuan").value.trim();
  const bulan = [...document.querySelectorAll("#bulan-wrapper input:checked")].map(i => i.value);
  const total = harga * jumlah;

  if (!item || !jenis || !harga || !jumlah) {
    alert("Mohon lengkapi semua kolom!");
    return;
  }

  try {
    await push(ref(db, "rabapp/pengajuan"), {
      item,
      jenis,
      bulan,
      urgensi,
      harga,
      satuan,
      jumlah,
      total,
      status: "Menunggu",
      createdAt: new Date().toISOString(),
      createdBy: user.name || user.username,
      division: user.division || "Belum Ditentukan" // 🟢 Tambahan penting
    });

    alert("✅ Pengajuan berhasil disimpan!");
    e.target.reset();
    document.getElementById("selectedText").innerText = "Pilih Bulan";
  } catch (error) {
    console.error("Gagal menyimpan:", error);
    alert("❌ Terjadi kesalahan saat menyimpan data.");
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
        <td>Rp ${entry.harga ? entry.harga.toLocaleString("id-ID") : "-"}</td>
        <td>${entry.satuan || "-"}</td>
        <td>${entry.jumlah ?? "-"}</td>
        <td>Rp ${entry.total ? entry.total.toLocaleString("id-ID") : "-"}</td>
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
// ✅ ADMIN: LIHAT, SETUJUI / TOLAK / EDIT / HAPUS PENGAJUAN
// ============================================================
export async function loadRABAdmin() {
  const user = JSON.parse(localStorage.getItem("loginUser"));
  if (!user) {
    alert("Anda belum login!");
    window.location.href = "index.html";
    return;
  }

  const tbody = document.querySelector("#rabAdminTable tbody");
  const totalAcc = document.getElementById("totalAcc");
  const totalPending = document.getElementById("totalPending");
  const totalReject = document.getElementById("totalReject");

  tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#555;">⏳ Memuat data...</td></tr>`;

  try {
    const snapshot = await get(ref(db, "rabapp/pengajuan"));
    tbody.innerHTML = "";

    if (!snapshot.exists()) {
      tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#777;">Belum ada data.</td></tr>`;
      return;
    }

    const data = snapshot.val();
    let acc = 0, pending = 0, reject = 0;

    Object.entries(data).forEach(([id, entry]) => {
      const bulanText = Array.isArray(entry.bulan)
        ? entry.bulan.join(", ")
        : entry.bulan || "-";
      const total = entry.total || 0;
      if (entry.status === "Disetujui") acc += total;
      else if (entry.status === "Menunggu") pending += total;
      else if (entry.status === "Ditolak") reject += total;

      const disableAction =
        entry.status === "Disetujui" || entry.status === "Ditolak"
          ? "disabled style='opacity:0.4;cursor:not-allowed;'"
          : "";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${entry.item}</td>
        <td>${entry.jenis}</td>
        <td>${bulanText}</td>
        <td>Rp ${entry.harga?.toLocaleString("id-ID")}</td>
        <td>${entry.jumlah ?? "-"}</td>
        <td>Rp ${total.toLocaleString("id-ID")}</td>
        <td>${entry.division ?? "-"}</td>
        <td>
          <span class="status ${
            entry.status === "Disetujui"
              ? "status-disetujui"
              : entry.status === "Ditolak"
              ? "status-ditolak"
              : "status-menunggu"
          }">${entry.status}</span>
        </td>
        <td style="display:flex;flex-wrap:wrap;gap:4px;justify-content:center;">
          <button class="btn-aksi btn-acc" data-id="${id}" ${disableAction} style="background:#22c55e;">✔ Setujui</button>
          <button class="btn-aksi btn-reject" data-id="${id}" ${disableAction} style="background:#ef4444;">✖ Tolak</button>
          <button class="btn-aksi btn-edit" data-id="${id}" style="background:#2563eb;">✏️ Edit</button>
          <button class="btn-aksi btn-del" data-id="${id}" style="background:#6b7280;">🗑️ Hapus</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    totalAcc.innerText = "Rp " + acc.toLocaleString("id-ID");
    totalPending.innerText = "Rp " + pending.toLocaleString("id-ID");
    totalReject.innerText = "Rp " + reject.toLocaleString("id-ID");

    // === SETUJUI ===
    document.querySelectorAll(".btn-acc").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await update(ref(db, "rabapp/pengajuan/" + id), { status: "Disetujui" });
        alert("✅ Pengajuan disetujui!");
        loadRABAdmin();
      });
    });

    // === TOLAK ===
    document.querySelectorAll(".btn-reject").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await update(ref(db, "rabapp/pengajuan/" + id), { status: "Ditolak" });
        alert("❌ Pengajuan ditolak!");
        loadRABAdmin();
      });
    });

    // === EDIT ===
    document.querySelectorAll(".btn-edit").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        const entry = data[id];
        if (!entry) return;

        const newNama = prompt("Edit nama item:", entry.item);
        const newHarga = prompt("Edit harga satuan:", entry.harga);
        const newSatuan = prompt("Edit satuan:", entry.satuan || "pcs");
        const newJumlah = prompt("Edit jumlah:", entry.jumlah);

        if (newNama && newHarga && newJumlah && newSatuan) {
          await update(ref(db, "rabapp/pengajuan/" + id), {
            item: newNama,
            harga: parseFloat(newHarga),
            satuan: newSatuan,
            jumlah: parseInt(newJumlah),
            total: parseFloat(newHarga) * parseInt(newJumlah),
          });
          alert("✅ Data berhasil diperbarui!");
          loadRABAdmin();
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
          loadRABAdmin();
        }
      });
    });

  } catch (error) {
    console.error("Gagal memuat data:", error);
    tbody.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#dc2626;">Gagal memuat data. Lihat console log.</td></tr>`;
  }
}
