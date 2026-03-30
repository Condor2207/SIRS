let productos = [];
let cart = [];
let cajaAbierta = false;
let allProductOptions = [];

function currency(v) { return '₲\u00a0' + Math.round(Number(v) || 0).toLocaleString('es-PY'); }

function rebuildProductoSelect(q) {
  const query = (q || "").toLowerCase().trim();
  const filtered = query ? allProductOptions.filter(o => o.label.toLowerCase().includes(query)) : allProductOptions;
  const sel = document.getElementById("productoSelect");
  const prev = sel.value;
  sel.innerHTML = filtered.map(o => `<option value="${o.value}">${o.label}</option>`).join("");
  if (filtered.some(o => String(o.value) === String(prev))) sel.value = prev;
  updateStockInfo();
}

async function checkCaja() {
  try {
    const c = await apiRequest("/caja/actual");
    cajaAbierta = c && c.abierta === true;
  } catch (_) {
    cajaAbierta = false;
  }
  const alerta = document.getElementById("cajaCerradaAlert");
  const btn    = document.getElementById("guardarVentaBtn");
  if (!cajaAbierta) {
    alerta.style.display = "block";
    btn.disabled = true;
    btn.title = "Abre la caja primero";
  } else {
    alerta.style.display = "none";
    btn.disabled = cart.length === 0;
  }
}

async function loadProductos() {
  ensureSession();
  try {
    productos = await apiRequest("/productos");
    allProductOptions = productos.map(p => ({
      value: p.id,
      label: `${p.nombre} — ₲\u00a0${Math.round(p.precio_venta).toLocaleString('es-PY')} (stock: ${p.stock_actual})`
    }));
    const search = document.getElementById("searchProducto");
    rebuildProductoSelect(search ? search.value : "");
  } catch (e) { console.error(e); }
}

function updateStockInfo() {
  const sel = document.getElementById("productoSelect");
  const info = document.getElementById("stockInfo");
  if (!sel || !info) return;
  const p = productos.find(x => x.id === Number(sel.value));
  if (p) info.textContent = `Disponible: ${p.stock_actual} uds.`;
}

function renderCart() {
  const box = document.getElementById("cart");
  const btn = document.getElementById("guardarVentaBtn");
  if (cart.length === 0) {
    box.innerHTML = "<p class='muted'>El carrito está vacío</p>";
    document.getElementById("totalVenta").textContent = "0";
    btn.disabled = true;
    return;
  }
  let total = 0;
  box.innerHTML = cart.map((item, i) => {
    total += item.subtotal;
    return `<div class="cart-item">
      <span><strong>${item.nombre}</strong> ×${item.cantidad}</span>
      <strong>${currency(item.subtotal)}</strong>
      <button class="btn tiny ghost" data-remove="${i}" type="button">✕</button>
    </div>`;
  }).join("");
  box.querySelectorAll("[data-remove]").forEach(b =>
    b.addEventListener("click", () => { cart.splice(Number(b.dataset.remove), 1); renderCart(); })
  );
  document.getElementById("totalVenta").textContent = currency(total);
  if (cajaAbierta) btn.disabled = false;
}

function renderInvoice(venta) {
  const box = document.getElementById("invoiceContainer");
  const sec = document.getElementById("invoiceSection");
  if (sec) sec.style.display = "block";
  const fecha = new Date(venta.fecha + "Z").toLocaleString("es-ES");
  const lineas = (venta.detalles || []).map(d => {
    const p = productos.find(x => x.id === d.producto_id);
    return `<div class="invoice-line">
      <span>${p ? p.nombre : "Prod #"+d.producto_id} ×${d.cantidad}</span>
      <span>${currency(d.precio_unitario * d.cantidad)}</span>
    </div>`;
  }).join("");
  box.innerHTML = `
    <div class="invoice-wrap">
      <div class="invoice-header">
        <h3>SuperStock Demo</h3>
        <p>COMPROBANTE #${venta.id}</p>
        <small>${fecha}</small>
      </div>
      ${lineas}
      <div class="invoice-total">
        <div class="invoice-line"><strong>TOTAL</strong><strong>${currency(venta.total)}</strong></div>
      </div>
      <div class="invoice-footer">
        Método: ${(venta.metodo_pago || "efectivo").toUpperCase()} · ¡Gracias!<br/>
        <button class="btn ghost tiny" onclick="window.print()" style="margin-top:0.5rem;">Imprimir</button>
      </div>
    </div>`;
}

document.addEventListener("DOMContentLoaded", async () => {
  await loadProductos();
  await checkCaja();
  renderCart();

  document.getElementById("productoSelect").addEventListener("change", updateStockInfo);

  const searchProd = document.getElementById("searchProducto");
  if (searchProd) {
    attachSelectSearch(searchProd, document.getElementById("productoSelect"), allProductOptions);
  }

  document.getElementById("agregarItemBtn").addEventListener("click", () => {
    const productoId = Number(document.getElementById("productoSelect").value);
    const cantidad   = Number(document.getElementById("cantidadInput").value);
    const p = productos.find(x => x.id === productoId);
    if (!p || cantidad <= 0) return;
    const existing = cart.find(x => x.producto_id === productoId);
    if (existing) { existing.cantidad += cantidad; existing.subtotal = existing.cantidad * p.precio_venta; }
    else cart.push({ producto_id: p.id, nombre: p.nombre, cantidad, subtotal: cantidad * p.precio_venta });
    renderCart();
  });

  document.getElementById("guardarVentaBtn").addEventListener("click", async () => {
    const msg = document.getElementById("saleMessage");
    msg.textContent = "";
    if (!cajaAbierta) { msg.textContent = "Caja cerrada. Abre la caja primero."; msg.className = "message error"; return; }
    if (cart.length === 0) { msg.textContent = "Carrito vacío."; msg.className = "message error"; return; }
    try {
      const metodo = document.getElementById("metodoSelect").value;
      const grouped = {};
      cart.forEach(item => { grouped[item.producto_id] = (grouped[item.producto_id] || 0) + item.cantidad; });
      const items = Object.entries(grouped).map(([id, cant]) => ({ producto_id: Number(id), cantidad: cant }));
      const venta = await apiRequest("/ventas", {
        method: "POST",
        body: JSON.stringify({ items, metodo_pago: metodo }),
      });
      msg.textContent = "Venta registrada correctamente.";
      msg.className = "message ok";
      cart = [];
      renderCart();
      renderInvoice(venta);
      await loadProductos();
    } catch (e) {
      msg.textContent = e.message;
      msg.className = "message error";
    }
  });
});
