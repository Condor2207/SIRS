let proveedores = [];

function currency(value) {
  return '₲\u00a0' + Math.round(Number(value) || 0).toLocaleString('es-PY');
}

async function loadData() {
  ensureSession();
  try {
    const prods = await apiRequest("/productos");
    const provs = await apiRequest("/proveedores");
    
    proveedores = provs;
    
    const select = document.getElementById("proveedor_id");
    select.innerHTML = '<option value="">-- Seleccionar --</option>';
    provs.forEach((p) => {
      const option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.nombre;
      select.appendChild(option);
    });

    renderProductos(prods);
    // Re-apply table search if active
    const st = document.getElementById("searchTablaProductos");
    if (st && st.value) st.dispatchEvent(new Event("input"));
  } catch (error) {
    console.error(error);
  }
}

function renderProductos(prods) {
  const body = document.getElementById("productosBody");
  body.innerHTML = "";
  prods.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${p.id}</td>
      <td>${p.nombre}</td>
      <td>${p.categoria}</td>
      <td>${currency(p.precio_venta)}</td>
      <td>${currency(p.costo)}</td>
      <td>${p.stock_actual}</td>
      <td>${p.stock_minimo}</td>
      <td><button class="btn tiny ghost" data-edit="${p.id}" type="button">Editar</button></td>
    `;
    body.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();

  // Table filter
  attachTableFilter(
    document.getElementById("searchTablaProductos"),
    document.getElementById("productosBody")
  );

  document.getElementById("formProducto").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("mensaje");
    msg.textContent = "";

    const payload = {
      nombre: document.getElementById("nombre").value,
      categoria: document.getElementById("categoria").value,
      precio_venta: parseFloat(document.getElementById("precio_venta").value),
      costo: parseFloat(document.getElementById("costo").value),
      stock_actual: parseInt(document.getElementById("stock_actual").value),
      stock_minimo: parseInt(document.getElementById("stock_minimo").value),
      proveedor_id: parseInt(document.getElementById("proveedor_id").value),
    };

    try {
      await apiRequest("/productos", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      msg.textContent = "Producto creado";
      msg.className = "message ok";
      document.getElementById("formProducto").reset();
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
