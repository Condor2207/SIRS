async function loadData() {
  ensureSession();
  try {
    const provs = await apiRequest("/proveedores");
    renderProveedores(provs);
    // Re-apply table search if active
    const st = document.getElementById("searchTablaProveedores");
    if (st && st.value) st.dispatchEvent(new Event("input"));
  } catch (error) {
    console.error(error);
  }
}

function renderProveedores(provs) {
  const body = document.getElementById("proveedoresBody");
  body.innerHTML = "";
  provs.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.contacto}</td>
      <td>${p.email}</td>
      <td>${p.telefono}</td>
      <td>${p.direccion}</td>
    `;
    body.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  // Table filter
  attachTableFilter(
    document.getElementById("searchTablaProveedores"),
    document.getElementById("proveedoresBody")
  );

  document.getElementById("formProveedor").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("mensaje");
    msg.textContent = "";

    const payload = {
      nombre: document.getElementById("nombre").value,
      contacto: document.getElementById("contacto").value,
      email: document.getElementById("email").value || "",
      telefono: document.getElementById("telefono").value || "",
      direccion: document.getElementById("direccion").value || "",
    };

    try {
      await apiRequest("/proveedores", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      msg.textContent = "Proveedor creado";
      msg.className = "message ok";
      document.getElementById("formProveedor").reset();
      await loadData();
    } catch (error) {
      msg.textContent = error.message;
      msg.className = "message error";
    }
  });

  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("superstock_token");
    window.location.href = "../index.html";
  });
});
