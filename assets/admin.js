import { db } from "./firebase.js";
import { ref, onValue, update } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-database.js";

const tbody = document.querySelector("#adminTable tbody");
const rabRef = ref(db, "rabapp/rab");

onValue(rabRef, (snapshot) => {
  tbody.innerHTML = "";
  const data = snapshot.val();
  for (let id in data) {
    const r = data[id];
    const row = `<tr>
      <td>${r.division}</td>
      <td>${r.item}</td>
      <td>${r.jenis}</td>
      <td>${r.bulan}</td>
      <td>Rp ${r.total.toLocaleString()}</td>
      <td>${r.status}</td>
      <td>
        <button onclick="updateStatus('${id}', 'Disetujui')">✔️</button>
        <button onclick="updateStatus('${id}', 'Ditolak')">❌</button>
      </td>
    </tr>`;
    tbody.innerHTML += row;
  }
});

window.updateStatus = (id, status) => {
  const refUpdate = ref(db, `rabapp/rab/${id}`);
  update(refUpdate, { status }).then(() => alert(`Status diperbarui: ${status}`));
};
