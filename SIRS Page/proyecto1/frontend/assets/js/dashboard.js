document.addEventListener("DOMContentLoaded", async () => {
  ensureSession();

  // Date header
  const fechaEl = document.getElementById("fechaHoy");
  if (fechaEl) {
    fechaEl.textContent = new Date().toLocaleDateString("es-ES", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }

  // User badge
  const badge = document.getElementById("userBadge");
  const username = localStorage.getItem("superstock_username") || "";
  if (badge && username) badge.textContent = `👤 ${username}`;

  // Load KPIs
  try {
    const m = await apiRequest("/dashboard/metrics");

    document.getElementById("kVentasDia").textContent  = Math.round(m.ventas_dia ?? 0).toLocaleString('es-PY');
    document.getElementById("kGanancia").textContent   = Math.round(m.ganancia_dia ?? 0).toLocaleString('es-PY');
    document.getElementById("kNumVentas").textContent  = m.num_ventas_dia ?? 0;
    document.getElementById("kStockBajo").textContent  = m.stock_bajo ?? 0;
    document.getElementById("kPromedio").textContent   = Math.round(m.venta_promedio ?? 0).toLocaleString('es-PY');

    const cajaEl   = document.getElementById("kCaja");
    const kpiCaja  = document.getElementById("kpiCaja");
    const alertBox = document.getElementById("alertasCaja");

    if (m.caja_abierta) {
      cajaEl.textContent = "ABIERTA ✅";
      kpiCaja.className  = "kpi-card caja-on";
    } else {
      cajaEl.textContent = "CERRADA 🔒";
      kpiCaja.className  = "kpi-card caja-off";
      alertBox.innerHTML = `
        <div class="alert warning" style="margin-bottom:1rem;">
          <strong>⚠ Caja cerrada</strong> — Las ventas están bloqueadas hasta que abras la caja.
          <a href="caja.html" style="margin-left:0.5rem; font-weight:700; color:var(--accent);">Ir a Caja →</a>
        </div>`;
    }
  } catch (e) {
    console.error("Error cargando métricas:", e);
  }

  // Load products table
  try {
    const productos = await apiRequest("/productos");
    const tbody = document.getElementById("productosBody");
    tbody.innerHTML = productos.map(p => {
      const bajo = p.stock_actual <= p.stock_minimo;
      return `<tr>
        <td><strong>${p.nombre}</strong></td>
        <td>${p.categoria}</td>
        <td><strong>${p.stock_actual}</strong></td>
        <td>${p.stock_minimo}</td>
        <td>
          <span class="badge ${bajo ? "low" : "ok"}">
            ${bajo ? "⚠ Bajo" : "✓ OK"}
          </span>
        </td>
        <td>₲\u00a0${Math.round(p.precio_venta).toLocaleString('es-PY')}</td>
      </tr>`;
    }).join("");
  } catch (e) {
    console.error("Error cargando productos:", e);
  }
});
