function currency(v) { return '₲\u00a0' + Math.round(Number(v) || 0).toLocaleString('es-PY'); }

async function checkCajaStatus() {
  ensureSession();
  try {
    const status = await apiRequest("/caja/actual");
    renderCajaStatus(status);
  } catch (e) {
    console.error(e);
  }
}

function renderCajaStatus(status) {
  const emoji   = document.getElementById("cajaEmoji");
  const texto   = document.getElementById("cajaEstadoText");
  const detalle = document.getElementById("cajaDetalle");
  const cardApertura = document.querySelector("#formApertura").closest(".card");
  const cardCierre   = document.querySelector("#formCierre").closest(".card");

  if (!status.abierta) {
    emoji.textContent   = "🔒";
    texto.textContent   = "Caja Cerrada";
    texto.style.color   = "var(--error)";
    detalle.textContent = "Ingresa el monto inicial para abrir la caja.";
    cardApertura.style.display = "block";
    cardCierre.style.display   = "none";
  } else {
    const fecha = new Date(status.fecha_apertura + "Z").toLocaleString("es-ES");
    emoji.textContent   = "✅";
    texto.textContent   = "Caja Abierta";
    texto.style.color   = "var(--success)";
    detalle.textContent = `Apertura: ${fecha}  |  Monto inicial: ${currency(status.monto_inicial)}`;
    cardApertura.style.display = "none";
    cardCierre.style.display   = "block";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkCajaStatus();

  document.getElementById("formApertura").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("msgApertura");
    msg.textContent = "";
    const monto = parseFloat(document.getElementById("montoApertura").value) || 0;
    try {
      const result = await apiRequest("/caja/apertura", {
        method: "POST",
        body: JSON.stringify({ monto_inicial: monto }),
      });
      msg.textContent = result.mensaje || "Caja abierta correctamente.";
      msg.className = "message ok";
      e.target.reset();
      await checkCajaStatus();
    } catch (error) {
      msg.textContent = error.message;
      msg.className = "message error";
    }
  });

  document.getElementById("formCierre").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg       = document.getElementById("msgCierre");
    const resumenBox = document.getElementById("resumenCierre");
    msg.textContent = "";
    const monto = parseFloat(document.getElementById("montoCierre").value) || 0;
    try {
      const result = await apiRequest("/caja/cierre", {
        method: "POST",
        body: JSON.stringify({ monto_final: monto }),
      });
      msg.textContent = "Caja cerrada correctamente.";
      msg.className = "message ok";
      const dif = result.diferencia;
      resumenBox.innerHTML = `
        <div class="alert ${dif >= 0 ? 'success' : 'error'}">
          <strong>Diferencia: ${currency(dif)}</strong> &nbsp;
          ${dif >= 0 ? "✓ Caja cuadrada" : "⚠ Diferencia negativa"}
        </div>`;
      e.target.reset();
      await checkCajaStatus();
    } catch (error) {
      msg.textContent = error.message;
      msg.className = "message error";
    }
  });
});
