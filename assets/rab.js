import { db } from "./firebase.js";
import { ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

function getUser() {
  return JSON.parse(localStorage.getItem("loginUser"));
}

export function saveRAB(e) {
  e.preventDefault();
  const user = getUser();
  const rabRef = ref(db, "rabapp/rab");

  const newRab = {
    item: document.getElementById("item").value,
    jenis: document.getElementById("jenis").value,
    bulan: document.getElementById("bulan").value,
    urgensi: document.getElementById("urgensi").value,
    harga: parseFloat(document.getElementById("harga").value),
    jumlah: parseInt(document.getElementById("jumlah").value),
    total:
      parseFloat(document.getElementById("harga").value) *
      parseInt(document.getElementById("jumlah").value),
    status: "Menunggu",
    division: user.division,
    createdBy: user.name,
    createdAt: new Date().toISOString(),
  };

  const newRef = push(rabRef);
  set(newRef, newRab)
    .then(() => {
      alert("Pengajuan berhasil disimpan!");
      window.location.href = "list.html";
    })
    .catch((err) => alert("Gagal menyimpan: " + err.message));
}

export function loadRABList() {
  const user = getUser();
  const tbody = document.querySelector("#rabTable tbody");
  const rabRef = ref(db, "rabapp/rab");

  onValue(rabRef, (snapshot) => {
    tbody.innerHTML = "";
    const data = snapshot.val();
    for (let id in data) {
      const r = data[id];
      if (r.division === user.division) {
        const row = `<tr>
          <td>${r.item}</td>
          <td>${r.jenis}</td>
          <td>${r.bulan}</td>
          <td>Rp ${r.total.toLocaleString()}</td>
          <td>${r.status}</td>
        </tr>`;
        tbody.innerHTML += row;
      }
    }
  });
}
