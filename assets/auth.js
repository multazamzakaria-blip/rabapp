async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  const res = await fetch("data/users.json");
  const users = await res.json();

  const user = users.find(u => u.username === username && u.password === password);
  if (user) {
    localStorage.setItem("loginUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("error").innerText = "Username atau password salah";
  }
}

function checkLogin() {
  const user = localStorage.getItem("loginUser");
  if (!user) window.location.href = "index.html";
}

function logout() {
  localStorage.removeItem("loginUser");
  window.location.href = "index.html";
}
