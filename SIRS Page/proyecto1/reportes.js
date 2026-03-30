// reportes.js — Ventas + Compras con filtros por período, método de pago y proveedor

let currentPeriodo = "hoy";
let desdeVal = "";
let hastaVal = "";
let currentMetodo = "";
let currentProveedorId = "";
let allVentasLineas = [];
let allComprasLineas = [];
let isAdmin = false;

function currency(v) { return '₲\u00a0' + Math.round(Number(v) || 0).toLocaleString('es-PY'); }

function metodoBadge(m) {
  const map = {
    efectivo:        '<span class="badge-ef">💵 Efectivo</span>',
    tarjeta_credito: '<span class="badge-tc">💳 Tarjeta</span>',
    transferencia:   '<span class="badge-tr">🏦 Transferencia</span>',
  };
  return map[m] || `<span>${m}</span>`;
}

// ─── Export helpers ───────────────────────────────────────────
function tableToArray(tableId) {
  const table = document.getElementById(tableId);
  const rows = [];
  table.querySelectorAll("tr").forEach(tr => {
    rows.push([...tr.querySelectorAll("th,td")].map(c => c.innerText.trim()));
  });
  return rows;
}

function exportExcel(tableId, filename) {
  const data = tableToArray(tableId);
  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Reporte");
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

function exportPdf(tableId, filename, title) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "landscape" });
  doc.text(title, 14, 14);
  doc.autoTable({ html: `#${tableId}`, startY: 22, styles: { fontSize: 8 } });
  doc.save(`${filename}.pdf`);
}

function reportLabel() {
  const p = currentPeriodo === "rango" ? `${desdeVal} al ${hastaVal}` :
            currentPeriodo === "hoy"   ? "Hoy" :
            currentPeriodo === "semana"? "Esta Semana" : "Este Mes";
  return p;
}

// ─── URL helpers ──────────────────────────────────────────────
function ventasUrl() {
  let u = `/reportes/ventas?periodo=${currentPeriodo}`;
  if (currentPeriodo === "rango" && desdeVal && hastaVal) u += `&desde=${desdeVal}&hasta=${hastaVal}`;
  return u;
}
function comprasUrl() {
  let u = `/reportes/compras?periodo=${currentPeriodo}`;
  if (currentPeriodo === "rango" && desdeVal && hastaVal) u += `&desde=${desdeVal}&hasta=${hastaVal}`;
  if (currentProveedorId) u += `&proveedor_id=${currentProveedorId}`;
  return u;
}

// ─── Render Ventas ────────────────────────────────────────────
function renderVentasLineas(searchQ, metodoFilter) {
  const tbody = document.getElementById("ventasBody");
  let rows = allVentasLineas;

  if (metodoFilter) rows = rows.filter(r => r.metodo_pago === metodoFilter);
  if (searchQ) {
    const q = searchQ.toLowerCase();
    rows = rows.filter(r => r.producto.toLowerCase().includes(q) || (r.fecha || "").includes(q));
  }

  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="muted" style="text-align:center;padding:1.2rem;">Sin resultados</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.fecha || "-"}</td>
      <td>${r.producto}</td>
      <td>${metodoBadge(r.metodo_pago)}</td>
      <td style="text-align:right;">${r.cantidad}</td>
      <td style="text-align:right;font-weight:700;">$${currency(r.subtotal)}</td>
    </tr>`).join("");
}

async function loadVentas() {
  try {
    const rv = await apiRequest(ventasUrl());
    // Update KPI values
    document.getElementById("rTotalVentas").textContent = currency(rv.total);
    document.getElementById("rNumVentas").textContent   = rv.cantidad;
    document.getElementById("rEfectivo").textContent    = currency(rv.por_metodo?.efectivo || 0);
    document.getElementById("rTarjeta").textContent     = currency(rv.por_metodo?.tarjeta_credito || 0);
    document.getElementById("rTransf").textContent      = currency(rv.por_metodo?.transferencia || 0);

    allVentasLineas = rv.lineas || [];
    renderVentasLineas(
      document.getElementById("searchVentasRep")?.value || "",
      currentMetodo
    );
  } catch (e) { console.error("loadVentas:", e); }
}

// ─── Render Compras ───────────────────────────────────────────
function renderComprasLineas(searchQ) {
  const tbody = document.getElementById("comprasBodyRep");
  let rows = allComprasLineas;
  if (searchQ) {
    const q = searchQ.toLowerCase();
    rows = rows.filter(r =>
      r.producto.toLowerCase().includes(q) || r.proveedor.toLowerCase().includes(q) || (r.fecha || "").includes(q)
    );
  }
  if (!rows.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="muted" style="text-align:center;padding:1.2rem;">Sin resultados</td></tr>`;
    return;
  }
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td>${r.fecha || "-"}</td>
      <td>${r.proveedor}</td>
      <td>${r.producto}</td>
      <td style="text-align:right;">${r.cantidad}</td>
      <td style="text-align:right;">${currency(r.precio_prom)}</td>
      <td style="text-align:right;font-weight:700;">${currency(r.subtotal)}</td>
    </tr>`).join("");
}

function renderProveedorChart(porProveedor) {
  const el = document.getElementById("proveedorChart");
  if (!el) return;
  const entries = Object.entries(porProveedor).sort((a, b) => b[1] - a[1]);
  if (!entries.length) { el.innerHTML = `<p class="muted">Sin datos</p>`; return; }
  const max = entries[0][1];
  el.innerHTML = entries.map(([nom, val]) => `
    <div class="prov-bar-row">
      <span class="prov-bar-name" title="${nom}">${nom}</span>
      <div class="prov-bar-track"><div class="prov-bar-fill" style="width:${(val/max*100).toFixed(1)}%"></div></div>
      <span class="prov-bar-val">${currency(val)}</span>
    </div>`).join("");
}

async function loadCompras() {
  if (!isAdmin) return;
  try {
    const rc = await apiRequest(comprasUrl());
    document.getElementById("rTotalCompras").textContent = currency(rc.total);
    document.getElementById("rNumCompras").textContent   = rc.cantidad;
    allComprasLineas = rc.lineas || [];
    renderComprasLineas(document.getElementById("searchComprasRep")?.value || "");
    renderProveedorChart(rc.por_proveedor || {});
  } catch (e) { console.error("loadCompras:", e); }
}

async function loadProveedoresFiltro() {
  try {
    const list = await apiRequest("/proveedores");
    const sel = document.getElementById("filtroProveedor");
    (list || []).forEach(p => {
      const o = document.createElement("option");
      o.value = p.id; o.textContent = p.nombre;
      sel.appendChild(o);
    });
  } catch(e) {}
}

// ─── Tab switching ────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll(".rep-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === name));
  document.querySelectorAll(".rep-tab-panel").forEach(p => p.classList.toggle("active", p.id === `panel-${name}`));
  if (name === "compras") loadCompras();
}

// ─── Period change → reload active tab ───────────────────────
function reloadActive() {
  const activeTab = document.querySelector(".rep-tab.active")?.dataset.tab || "ventas";
  if (activeTab === "ventas") loadVentas();
  else loadCompras();
}

// ─── Read URL params (preset from dashboard) ─────────────────
function applyUrlParams() {
  const p = new URLSearchParams(location.search);
  if (p.has("periodo")) {
    currentPeriodo = p.get("periodo");
    document.querySelectorAll(".periodo-btn").forEach(b => {
      b.className = b.dataset.periodo === currentPeriodo ? "btn primary periodo-btn" : "btn ghost periodo-btn";
    });
    if (currentPeriodo === "rango") document.getElementById("rangoInputs").style.display = "flex";
  }
  if (p.has("metodo")) {
    currentMetodo = p.get("metodo");
    // activate correct chip
    document.querySelectorAll(".method-filters .chip").forEach(c => {
      c.classList.toggle("active", c.dataset.m === currentMetodo);
    });
    // activate correct KPI
    document.querySelectorAll(".rep-kpi").forEach(k => {
      k.classList.toggle("active", k.dataset.metodo === currentMetodo);
    });
  }
}

// ─── DOMContentLoaded ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  ensureSession();
  isAdmin = (localStorage.getItem("superstock_rol") || "") === "admin";

  if (!isAdmin) {
    const tabBtn = document.getElementById("tabComprasBtn");
    if (tabBtn) tabBtn.style.display = "none";
  }

  applyUrlParams();
  loadVentas();
  if (isAdmin) loadProveedoresFiltro();

  // ── Export buttons ──
  document.getElementById("exportVentasExcel").addEventListener("click", () => {
    exportExcel("tablaVentas", `ventas_${currentPeriodo}_${new Date().toISOString().slice(0,10)}`);
  });
  document.getElementById("exportVentasPdf").addEventListener("click", () => {
    exportPdf("tablaVentas", `ventas_${currentPeriodo}`, `Reporte de Ventas — ${reportLabel()}`);
  });
  document.getElementById("exportComprasExcel").addEventListener("click", () => {
    exportExcel("tablaCompras", `compras_${currentPeriodo}_${new Date().toISOString().slice(0,10)}`);
  });
  document.getElementById("exportComprasPdf").addEventListener("click", () => {
    exportPdf("tablaCompras", `compras_${currentPeriodo}`, `Reporte de Compras — ${reportLabel()}`);
  });

  // ── Period buttons ──
  document.querySelectorAll(".periodo-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".periodo-btn").forEach(b => b.className = "btn ghost periodo-btn");
      btn.className = "btn primary periodo-btn";
      currentPeriodo = btn.dataset.periodo;
      const r = document.getElementById("rangoInputs");
      r.style.display = currentPeriodo === "rango" ? "flex" : "none";
      if (currentPeriodo !== "rango") reloadActive();
    });
  });

  document.getElementById("aplicarRangoBtn").addEventListener("click", () => {
    desdeVal = document.getElementById("desdeInput").value;
    hastaVal = document.getElementById("hastaInput").value;
    if (desdeVal && hastaVal) reloadActive();
  });

  // ── Tab buttons ──
  document.querySelectorAll(".rep-tab").forEach(t => {
    t.addEventListener("click", () => switchTab(t.dataset.tab));
  });

  // ── KPI cards as method filters ──
  document.querySelectorAll(".rep-kpi[data-metodo]").forEach(card => {
    card.addEventListener("click", () => {
      const m = card.dataset.metodo;
      currentMetodo = m;
      document.querySelectorAll(".rep-kpi").forEach(k => k.classList.remove("active"));
      card.classList.add("active");
      // sync chips
      document.querySelectorAll(".method-filters .chip").forEach(c => {
        c.classList.toggle("active", c.dataset.m === m);
      });
      renderVentasLineas(document.getElementById("searchVentasRep")?.value || "", currentMetodo);
    });
  });

  // ── Method chips ──
  document.querySelectorAll(".method-filters .chip").forEach(chip => {
    chip.addEventListener("click", () => {
      const m = chip.dataset.m;
      currentMetodo = m;
      document.querySelectorAll(".method-filters .chip").forEach(c => c.classList.remove("active"));
      chip.classList.add("active");
      // sync KPI highlight
      document.querySelectorAll(".rep-kpi").forEach(k => {
        k.classList.toggle("active", k.dataset.metodo === m);
      });
      renderVentasLineas(document.getElementById("searchVentasRep")?.value || "", currentMetodo);
    });
  });

  // ── Ventas live search ──
  document.getElementById("searchVentasRep").addEventListener("input", e => {
    renderVentasLineas(e.target.value, currentMetodo);
  });

  // ── Compras live search ──
  document.getElementById("searchComprasRep").addEventListener("input", e => {
    renderComprasLineas(e.target.value);
  });

  // ── Compras proveedor filter button ──
  document.getElementById("aplicarFilProveedor").addEventListener("click", () => {
    currentProveedorId = document.getElementById("filtroProveedor").value;
    loadCompras();
  });
  document.getElementById("filtroProveedor").addEventListener("change", () => {
    currentProveedorId = document.getElementById("filtroProveedor").value;
    loadCompras();
  });
});
