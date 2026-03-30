// compras.js — Módulo de compras: manual + orden de reabastecimiento masivo

let productosDisp = [];
let proveedoresDisp = [];

function currency(v) { return '₲\u00a0' + Math.round(Number(v) || 0).toLocaleString('es-PY'); }

// ────────────────────────────────────────────────────────────
// RESTOCK: renderizar panel de reabastecimiento
// ────────────────────────────────────────────────────────────
function renderRestockPanel(sugeridos) {
  const panel = document.getElementById("restockPanel");
  const groupsEl = document.getElementById("restockGroups");
  const badge  = document.getElementById("restockBadge");
  if (!panel || !sugeridos.length) return;

  badge.textContent = `${sugeridos.length} producto(s)`;
  panel.style.display = "block";

  // Group by proveedor_id
  const grouped = {};
  sugeridos.forEach(it => {
    const key = it.proveedor_id || "sin_proveedor";
    if (!grouped[key]) grouped[key] = { proveedor_id: it.proveedor_id, nombre: it.proveedor_nombre || "Sin proveedor", items: [] };
    grouped[key].items.push(it);
  });

  groupsEl.innerHTML = Object.values(grouped).map((g, gi) => `
    <div class="restock-group" data-gi="${gi}">
      <div class="restock-group-header">
        🏭 ${g.nombre}
        <span class="muted" style="font-size:.82rem;font-weight:400;">${g.items.length} producto(s)</span>
      </div>
      <div class="restock-item" style="font-weight:700;font-size:.8rem;color:var(--text-muted);padding-bottom:.3rem;">
        <span>Producto</span><span>Stock actual</span><span>Cantidad a pedir</span><span>Costo unit. ($)</span><span></span>
      </div>
      ${g.items.map((it, ii) => `
        <div class="restock-item" data-gi="${gi}" data-ii="${ii}">
          <div>
            <div class="prod-name">${it.nombre}</div>
            <div class="stock-info">Mín: ${it.stock_minimo}</div>
          </div>
          <div>
            <strong style="color:var(--danger,#dc2626)">${it.stock_actual}</strong>
          </div>
          <div>
            <input type="number" min="1" value="${it.cantidad_sugerida}"
                   id="rs_qty_${gi}_${ii}" class="rs-qty" onchange="recalcRestockTotal()" oninput="recalcRestockTotal()" />
          </div>
          <div>
            <input type="number" min="0" step="0.01" value="${it.precio_promedio}"
                   id="rs_precio_${gi}_${ii}" class="rs-precio" onchange="recalcRestockTotal()" oninput="recalcRestockTotal()" />
          </div>
          <div>
            <button class="btn danger tiny" onclick="removeRestockItem(${gi},${ii})">✕</button>
          </div>
        </div>`).join("")}
    </div>`).join("");

  panel._data = Object.values(grouped);
  recalcRestockTotal();
}

function removeRestockItem(gi, ii) {
  const panel = document.getElementById("restockPanel");
  if (!panel._data) return;
  panel._data[gi].items.splice(ii, 1);
  panel._data = panel._data.filter(g => g.items.length > 0);
  const remaining = panel._data.flatMap(g =>
    g.items.map(it => ({ ...it, proveedor_id: g.proveedor_id, proveedor_nombre: g.nombre }))
  );
  if (!remaining.length) {
    panel.style.display = "none";
    sessionStorage.removeItem("restock_items");
    return;
  }
  renderRestockPanel(remaining);
}

function recalcRestockTotal() {
  const panel = document.getElementById("restockPanel");
  if (!panel || !panel._data) return;
  let total = 0;
  panel._data.forEach((g, gi) => {
    g.items.forEach((it, ii) => {
      const qty  = parseFloat(document.getElementById(`rs_qty_${gi}_${ii}`)?.value || 0);
      const prec = parseFloat(document.getElementById(`rs_precio_${gi}_${ii}`)?.value || 0);
      total += qty * prec;
    });
  });
  document.getElementById("restockTotal").textContent = currency(total);
}

async function confirmarRestock() {
  const panel = document.getElementById("restockPanel");
  const msg   = document.getElementById("msgRestock");
  const btn   = document.getElementById("confirmarRestockBtn");
  if (!panel._data) return;

  msg.textContent = "";
  btn.disabled = true;
  btn.textContent = "Procesando…";

  let creadas = 0;
  const errores = [];

  for (let gi = 0; gi < panel._data.length; gi++) {
    const g = panel._data[gi];
    if (!g.proveedor_id || !g.items.length) { errores.push(`Grupo sin proveedor`); continue; }

    const items = g.items.map((it, ii) => ({
      producto_id:     it.producto_id,
      cantidad:        parseInt(document.getElementById(`rs_qty_${gi}_${ii}`)?.value || 0),
      precio_unitario: parseFloat(document.getElementById(`rs_precio_${gi}_${ii}`)?.value || 0),
    })).filter(it => it.cantidad > 0 && it.precio_unitario > 0);

    if (!items.length) continue;

    try {
      await apiRequest("/compras", {
        method: "POST",
        body: JSON.stringify({ proveedor_id: g.proveedor_id, items }),
      });
      creadas++;
    } catch (e) {
      errores.push(`${g.nombre}: ${e.message}`);
    }
  }

  btn.disabled = false;
  btn.textContent = "✅ Confirmar y Generar Compra(s)";

  if (creadas > 0) {
    msg.textContent = `✅ Se generaron ${creadas} orden(es) de compra correctamente.${errores.length ? " Errores: " + errores.join("; ") : ""}`;
    msg.className = "message ok";
    sessionStorage.removeItem("restock_items");
    panel.style.display = "none";
    await loadHistorial();
  } else {
    msg.textContent = "Error: " + errores.join(" | ");
    msg.className = "message error";
  }
}

// ────────────────────────────────────────────────────────────
// MANUAL PURCHASE
// ────────────────────────────────────────────────────────────
async function loadCatalogs() {
  ensureSession();
  const [prods, provs] = await Promise.all([
    apiRequest("/productos"),
    apiRequest("/proveedores"),
  ]);
  productosDisp = prods;
  proveedoresDisp = provs;

  const sel = document.getElementById("proveedorSelect");
  provs.forEach(p => {
    const o = document.createElement("option");
    o.value = p.id; o.textContent = p.nombre; sel.appendChild(o);
  });

  const searchProv = document.getElementById("searchProveedor");
  if (searchProv) {
    const provOpts = provs.map(p => ({ value: p.id, label: p.nombre }));
    attachSelectSearch(searchProv, sel, provOpts, "-- Seleccionar proveedor --");
  }

  const params = new URLSearchParams(window.location.search);

  // ── Bulk restock: check sessionStorage (URL param unreliable with some servers) ─
  const raw = sessionStorage.getItem("restock_items");
  if (raw) {
    try {
      const sugeridos = JSON.parse(raw);
      if (sugeridos.length) {
        renderRestockPanel(sugeridos);
        document.getElementById("restockPanel").scrollIntoView({ behavior: "smooth" });
        return;
      }
    } catch(e) { console.warn("restock parse error", e); }
  }

  // ── Single product prefill (from other pages via URL params) ──────────────────
  const preProveedor = params.get("proveedor_id");
  const preProducto  = params.get("producto_id");
  if (preProveedor) sel.value = preProveedor;
  addItemRow(preProducto);
}

function productosOptions() {
  return productosDisp.map(p =>
    `<option value="${p.id}">${p.nombre} (stock: ${p.stock_actual})</option>`
  ).join("");
}

function addItemRow(defaultProductoId, defaultCantidad, defaultPrecio) {
  const container = document.getElementById("itemsContainer");
  const row = document.createElement("div");
  row.className = "form-row item-row";
  row.style.cssText = "align-items:end; border:1px solid var(--border); border-radius:10px; padding:0.8rem; margin-bottom:0.5rem;";
  row.innerHTML = `
    <label style="grid-column:1">Producto
      <input type="search" class="item-search" placeholder="🔍 Buscar…" autocomplete="off" />
      <select class="item-producto">${productosOptions()}</select>
    </label>
    <label>Cantidad
      <input class="item-cantidad" type="number" min="1" value="${defaultCantidad || 1}" />
    </label>
    <label>Costo Unitario ($)
      <input class="item-precio" type="number" step="0.01" placeholder="0.00" value="${defaultPrecio || ""}" />
    </label>
    <div style="display:flex;align-items:flex-end;">
      <button class="btn danger tiny" type="button" onclick="this.closest('.item-row').remove(); recalcTotal();">✕ Quitar</button>
    </div>`;
  if (defaultProductoId) {
    setTimeout(() => { row.querySelector(".item-producto").value = defaultProductoId; }, 0);
  }
  row.querySelector(".item-cantidad").addEventListener("input", recalcTotal);
  row.querySelector(".item-precio").addEventListener("input", recalcTotal);

  const allProdOpts = productosDisp.map(p => ({ value: p.id, label: p.nombre }));
  attachSelectSearch(
    row.querySelector(".item-search"),
    row.querySelector(".item-producto"),
    allProdOpts
  );

  container.appendChild(row);
  recalcTotal();
}

function recalcTotal() {
  let total = 0;
  document.querySelectorAll(".item-row").forEach(row => {
    const cant   = parseFloat(row.querySelector(".item-cantidad").value) || 0;
    const precio = parseFloat(row.querySelector(".item-precio").value)   || 0;
    total += cant * precio;
  });
  document.getElementById("totalCompra").textContent = currency(total);
}

async function loadHistorial() {
  try {
    const compras = await apiRequest("/compras");
    const tbody = document.getElementById("comprasBody");
    tbody.innerHTML = compras.map(c => {
      const fecha = new Date(c.fecha + "Z").toLocaleString("es-ES");
      return `<tr>
        <td>#${c.id}</td>
        <td>${c.proveedor_nombre || "-"}</td>
        <td>${fecha}</td>
        <td>${currency(c.total)}</td>
        <td><span class="badge ${c.estado === "recibida" ? "received" : "pending"}">${c.estado}</span></td>
      </tr>`;
    }).join("");
    if (!compras.length) tbody.innerHTML = "<tr><td colspan='5' class='muted' style='text-align:center;padding:1rem;'>Sin compras registradas</td></tr>";
  } catch (e) { console.error(e); }
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  await loadCatalogs();
  await loadHistorial();

  document.getElementById("addItemBtn").addEventListener("click", () => addItemRow());

  document.getElementById("submitCompraBtn").addEventListener("click", async () => {
    const msg = document.getElementById("msgCompra");
    msg.textContent = "";
    const proveedorId = parseInt(document.getElementById("proveedorSelect").value);
    if (!proveedorId) { msg.textContent = "Selecciona un proveedor."; msg.className = "message error"; return; }

    const items = [];
    document.querySelectorAll(".item-row").forEach(row => {
      const producto_id   = parseInt(row.querySelector(".item-producto").value);
      const cantidad      = parseInt(row.querySelector(".item-cantidad").value);
      const precio        = parseFloat(row.querySelector(".item-precio").value);
      if (producto_id && cantidad > 0 && precio > 0) items.push({ producto_id, cantidad, precio_unitario: precio });
    });

    if (!items.length) { msg.textContent = "Agrega al menos un producto."; msg.className = "message error"; return; }

    try {
      await apiRequest("/compras", {
        method: "POST",
        body: JSON.stringify({ proveedor_id: proveedorId, items }),
      });
      msg.textContent = "Compra registrada correctamente.";
      msg.className = "message ok";
      document.getElementById("itemsContainer").innerHTML = "";
      document.getElementById("totalCompra").textContent = "0.00";
      document.getElementById("proveedorSelect").value = "";
      addItemRow();
      await loadHistorial();
    } catch (e) {
      msg.textContent = e.message;
      msg.className = "message error";
    }
  });

  document.getElementById("confirmarRestockBtn")?.addEventListener("click", confirmarRestock);

  document.getElementById("cancelRestockBtn")?.addEventListener("click", () => {
    sessionStorage.removeItem("restock_items");
    document.getElementById("restockPanel").style.display = "none";
    history.replaceState({}, "", "compras.html");
    addItemRow();
  });
});
