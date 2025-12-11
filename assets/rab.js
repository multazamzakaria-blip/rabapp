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

  // modal elements
  const modal = document.getElementById("editModal");
  const btnSaveEdit = document.getElementById("btnSaveEdit");
  const btnCloseEdit = document.getElementById("btnCloseEdit");

  const editNama = document.getElementById("editNama");
  const editHarga = document.getElementById("editHarga");
  const editSatuan = document.getElementById("editSatuan");
  const editJumlah = document.getElementById("editJumlah");

  let currentEditId = null;

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
      const bulanText = Array.isArray(entry.bulan) ? entry.bulan.join(", ") : entry.bulan || "-";
      const total = entry.total || 0;
      if (entry.status === "Disetujui") acc += total;
      else if (entry.status === "Menunggu") pending += total;
      else if (entry.status === "Ditolak") reject += total;

      const disableAction = (entry.status === "Disetujui" || entry.status === "Ditolak")
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
            entry.status === "Disetujui" ? "status-disetujui" :
            entry.status === "Ditolak" ? "status-ditolak" :
            "status-menunggu"
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

    // Setujui
    document.querySelectorAll(".btn-acc").forEach(btn =>
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        await update(ref(db, "rabapp/pengajuan/" + id), { status: "Disetujui" });
        loadRABAdmin();
      })
    );

    // Tolak
    document.querySelectorAll(".btn-reject").forEach(btn =>
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        await update(ref(db, "rabapp/pengajuan/" + id), { status: "Ditolak" });
        loadRABAdmin();
      })
    );

    // Edit (open modal)
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = e.target.dataset.id;
        const entry = data[id];
        if (!entry) return;
        currentEditId = id;

        editNama.value = entry.item || "";
        editHarga.value = entry.harga || "";
        editSatuan.value = entry.satuan || "";
        editJumlah.value = entry.jumlah || "";

        modal.style.display = "flex";
      });
    });

    // Save edit
    btnSaveEdit.onclick = async () => {
      if (!currentEditId) return;
      const newNama = editNama.value.trim();
      const newHarga = parseFloat(editHarga.value);
      const newSatuan = editSatuan.value.trim();
      const newJumlah = parseInt(editJumlah.value);

      if (!newNama || !newHarga || !newJumlah) {
        alert("Lengkapi semua kolom!");
        return;
      }

      await update(ref(db, "rabapp/pengajuan/" + currentEditId), {
        item: newNama,
        harga: newHarga,
        satuan: newSatuan,
        jumlah: newJumlah,
        total: newHarga * newJumlah
      });

      modal.style.display = "none";
      alert("✅ Data berhasil diperbarui!");
      loadRABAdmin();
    };

    // Close modal
    btnCloseEdit.onclick = () => (modal.style.display = "none");
    window.onclick = e => {
      if (e.target === modal) modal.style.display = "none";
    };

    // Hapus
    document.querySelectorAll(".btn-del").forEach(btn =>
      btn.addEventListener("click", async e => {
        const id = e.target.dataset.id;
        if (confirm("Yakin ingin menghapus item ini?")) {
          await remove(ref(db, "rabapp/pengajuan/" + id));
          alert("🗑️ Data berhasil dihapus!");
          loadRABAdmin();
        }
      })
    );
  } catch (err) {
    console.error(err);
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
