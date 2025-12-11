function saveRAB(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem("loginUser"));
  const rab = {
    item: document.getElementById("item").value,
    jenis: document.getElementById("jenis").value,
    bulan: document.getElementById("bulan").value,
    urgensi: document.getElementById("urgensi").value,
    harga: parseFloat(document.getElementById("harga").value),
    jumlah: parseInt(document.getElementById("jumlah").value),
    total: parseFloat(document.getElementById("harga").value) * parseInt(document.getElementById("jumlah").value),
    status: "Menunggu",
    division: user.division,
    createdBy: user.name,
  };

  const data = JSON.parse(localStorage.getItem("dataRAB")) || [];
  data.push(rab);
  localStorage.setItem("dataRAB", JSON.stringify(data));

  alert("Pengajuan berhasil disimpan!");
  window.location.href = "list.html";
}

function loadRABList() {
  checkLogin();
  const user = JSON.parse(localStorage.getItem("loginUser"));
  const data = JSON.parse(localStorage.getItem("dataRAB")) || [];
  const tbody = document.querySelector("#rabTable tbody");
  tbody.innerHTML = "";

  const list = data.filter(r => r.division === user.division);
  list.forEach(r => {
    const row = `<tr>
      <td>${r.item}</td>
      <td>${r.jenis}</td>
      <td>${r.bulan}</td>
      <td>Rp ${r.total.toLocaleString()}</td>
      <td>${r.status}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}
