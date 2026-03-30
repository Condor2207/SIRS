/* sidebar.js – shared sidebar & logout for all inner pages */
(function () {
  const LINKS = [
    { href: "dashboard.html",   label: "Dashboard",    icon: "📊", roles: ["admin", "vendedor"] },
    { href: "ventas.html",      label: "Ventas (POS)", icon: "💰", roles: ["admin", "vendedor"] },
    { href: "caja.html",        label: "Caja",         icon: "🏦", roles: ["admin", "vendedor"] },
    { href: "inventario.html",  label: "Inventario",   icon: "📋", roles: ["admin", "vendedor"] },
    { href: "reportes.html",    label: "Reportes",     icon: "📈", roles: ["admin", "vendedor"] },
    { divider: true, label: "Administración", roles: ["admin"] },
    { href: "productos.html",   label: "Productos",    icon: "📦", roles: ["admin"] },
    { href: "proveedores.html", label: "Proveedores",  icon: "🚚", roles: ["admin"] },
    { href: "compras.html",     label: "Compras",      icon: "🛒", roles: ["admin"] },
  ];

  function build() {
    const sidebar = document.getElementById("sidebar");
    if (!sidebar) return;

    const rol      = localStorage.getItem("superstock_rol")      || "vendedor";
    const username = localStorage.getItem("superstock_username") || "Usuario";
    const currentPage = window.location.pathname.split("/").pop();

    const linksHtml = LINKS
      .filter(l => l.roles.includes(rol))
      .map(l => {
        if (l.divider) {
          return `<div class="sidebar-sep">${l.label}</div>`;
        }
        const active = currentPage === l.href ? " active" : "";
        return `<a href="${l.href}" class="sidebar-link${active}">
          <span class="sidebar-icon">${l.icon}</span>${l.label}
        </a>`;
      })
      .join("");

    sidebar.innerHTML = `
      <div class="sidebar-user">
        <strong>${username}</strong>
        <span class="sidebar-role">${rol}</span>
      </div>
      <nav class="sidebar-nav">${linksHtml}</nav>
    `;
  }

  /* Logout wired to any element with id="logoutBtn" */
  function wireLogout() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", () => {
      localStorage.removeItem("superstock_token");
      localStorage.removeItem("superstock_username");
      localStorage.removeItem("superstock_rol");
      window.location.href = "../index.html";
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    build();
    wireLogout();
  });
})();
