let productos = [];
let proveedores = [];

function currency(v) { return '₲\u00a0' + Math.round(Number(v) || 0).toLocaleString('es-PY'); }

async function loadData() {
  ensureSession();
  try {
    [productos, proveedores] = await Promise.all([
      apiRequest("/productos"),
      apiRequest("/proveedores"),
    ]);
    renderAlerts();
    renderInventario();
  } catch (e) { console.error(e); }
}

function renderAlerts() {
  const box    = document.getElementById("alertas");
  const btn    = document.getElementById("btnRestockMasivo");
  const isAdmin = (localStorage.getItem("superstock_rol") || "") === "admin";
  const bajo   = productos.filter(p => p.stock_actual <= p.stock_minimo);

  if (!bajo.length) {
    box.innerHTML = "<p class='muted'>Todo el stock está dentro de los niveles mínimos. ✓</p>";
    if (btn) btn.style.display = "none";
    return;
  }

  if (btn) btn.style.display = isAdmin ? "inline-flex" : "none";

  box.innerHTML = bajo.map(p => {
    const falta = p.stock_minimo - p.stock_actual;
    const prov  = proveedores.find(v => v.id === p.proveedor_id);
    return `<div class="alert warning" style="margin-bottom:0.4rem;">
      <strong>${p.nombre}</strong>
      — Stock: <strong>${p.stock_actual}</strong> / Mínimo: ${p.stock_minimo}
      — Faltan: <strong>${falta} uds.</strong>
      ${prov ? `<span class="muted" style="font-size:.82rem;margin-left:.5rem;">(Prov: ${prov.nombre})</span>` : ""}
    </div>`;
  }).join("");
}

function renderInventario() {
  const tbody = document.getElementById("inventarioBody");
  tbody.innerHTML = productos.map(p => {
    const bajo = p.stock_actual <= p.stock_minimo;
    return `<tr>
      <td><strong>${p.nombre}</strong></td>
      <td>${p.categoria}</td>
      <td><strong>${p.stock_actual}</strong></td>
      <td>${p.stock_minimo}</td>
      <td><span class="badge ${bajo ? "low" : "ok"}">${bajo ? "⚠ Bajo" : "✓ OK"}</span></td>
      <td>
        <span class="muted" style="font-size:.82rem;">${currency(p.precio_venta)}</span>
      </td>
    </tr>`;
  }).join("");
  const st = document.getElementById("searchInventario");
  if (st && st.value) st.dispatchEvent(new Event("input"));
}

async function crearRestockMasivo() {
  const btn = document.getElementById("btnRestockMasivo");
  btn.disabled = true;
  btn.textContent = "Cargando…";

  try {
    const sugeridos = await apiRequest("/compras/restock-sugerido");
    if (!sugeridos.length) {
      alert("No hay productos con stock bajo en este momento.");
      return;
    }
    // Store in sessionStorage — avoids URL length limits
    sessionStorage.setItem("restock_items", JSON.stringify(sugeridos));
    window.location.href = "compras.html?restock=1";
  } catch (e) {
    alert("Error al obtener sugerencias: " + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "🛒 Crear Orden de Reabastecimiento";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadData();
  attachTableFilter(
    document.getElementById("searchInventario"),
    document.getElementById("inventarioBody")
  );

  const btn = document.getElementById("btnRestockMasivo");
  if (btn) btn.addEventListener("click", crearRestockMasivo);
});
