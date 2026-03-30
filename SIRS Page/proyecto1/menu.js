document.addEventListener("DOMContentLoaded", () => {
  ensureSession();

  const username = localStorage.getItem("superstock_username") || "Usuario";
  const rol = localStorage.getItem("superstock_rol") || "usuario";
  
  document.getElementById("usuarioInfo").textContent = `${username} (${rol})`;
  document.getElementById("welcomeMsg").textContent = `Accede a los módulos desde el menú. Sistema listo para gestionar ventas, inventario y reportes.`;

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("superstock_token");
    localStorage.removeItem("superstock_username");
    localStorage.removeItem("superstock_rol");
    window.location.href = "../index.html";
  });
});
