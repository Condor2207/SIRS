from collections import defaultdict
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models import Venta, DetalleVenta, Compra, DetalleCompra, Producto, Usuario

router = APIRouter(prefix="/reportes", tags=["reportes"])


def get_rango(periodo: str, desde: Optional[str], hasta: Optional[str]):
    now = datetime.utcnow()
    if periodo == "hoy":
        start = datetime(now.year, now.month, now.day)
        end = start + timedelta(days=1)
    elif periodo == "semana":
        start = datetime(now.year, now.month, now.day) - timedelta(days=now.weekday())
        end = start + timedelta(days=7)
    elif periodo == "mes":
        start = datetime(now.year, now.month, 1)
        end = datetime(now.year, now.month + 1, 1) if now.month < 12 else datetime(now.year + 1, 1, 1)
    else:  # rango
        start = datetime.fromisoformat(desde) if desde else datetime(now.year, now.month, now.day)
        end = datetime.fromisoformat(hasta) + timedelta(days=1) if hasta else now + timedelta(days=1)
    return start, end


@router.get("/ventas")
def reporte_ventas(
    periodo: str = Query("hoy", pattern="^(hoy|semana|mes|rango)$"),
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    metodo_pago: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    start, end = get_rango(periodo, desde, hasta)

    q = db.query(Venta).filter(Venta.fecha >= start, Venta.fecha < end)
    if current_user.rol != "admin":
        q = q.filter(Venta.usuario_id == current_user.id)
    if metodo_pago:
        q = q.filter(Venta.metodo_pago == metodo_pago)

    ventas = q.options(joinedload(Venta.detalles).joinedload(DetalleVenta.producto)).all()

    # Totales por metodo de pago
    por_metodo: dict = defaultdict(float)
    for v in ventas:
        por_metodo[v.metodo_pago or "efectivo"] += v.total

    # Agrupado: producto + metodo_pago + fecha → rows with date
    grupos: dict = defaultdict(lambda: {"cantidad": 0, "subtotal": 0.0})
    # also per-transaction rows for "desglose" view
    desglose = []
    for v in ventas:
        mp = v.metodo_pago or "efectivo"
        fecha_str = v.fecha.strftime("%d/%m/%Y")
        for d in v.detalles:
            prod_nombre = d.producto.nombre if d.producto else f"#{d.producto_id}"
            key = (prod_nombre, mp, fecha_str)
            grupos[key]["cantidad"] += d.cantidad
            grupos[key]["subtotal"] += round(d.cantidad * d.precio_unitario, 2)

    lineas = [
        {
            "fecha": k[2],
            "producto": k[0],
            "metodo_pago": k[1],
            "cantidad": g["cantidad"],
            "subtotal": round(g["subtotal"], 2),
        }
        for k, g in sorted(grupos.items(), key=lambda x: (x[0][2], -x[1]["subtotal"]))
    ]

    return {
        "cantidad": len(ventas),
        "total": round(sum(v.total for v in ventas), 2),
        "por_metodo": {k: round(v, 2) for k, v in por_metodo.items()},
        "lineas": lineas,
    }


@router.get("/compras")
def reporte_compras(
    periodo: str = Query("hoy", pattern="^(hoy|semana|mes|rango)$"),
    desde: Optional[str] = None,
    hasta: Optional[str] = None,
    proveedor_id: Optional[int] = None,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    start, end = get_rango(periodo, desde, hasta)

    q = (
        db.query(Compra)
        .options(
            joinedload(Compra.proveedor),
            joinedload(Compra.detalles).joinedload(DetalleCompra.producto),
        )
        .filter(Compra.fecha >= start, Compra.fecha < end)
    )
    if proveedor_id:
        q = q.filter(Compra.proveedor_id == proveedor_id)

    compras = q.order_by(Compra.fecha.desc()).all()

    # Totales por proveedor
    por_proveedor: dict = defaultdict(float)
    for c in compras:
        nombre_prov = c.proveedor.nombre if c.proveedor else "-"
        por_proveedor[nombre_prov] += c.total

    # Agrupado: proveedor + producto + fecha → lineas con fecha
    grupos: dict = defaultdict(lambda: {"cantidad": 0, "subtotal": 0.0, "precios": []})
    for c in compras:
        prov_nom = c.proveedor.nombre if c.proveedor else "-"
        fecha_str = c.fecha.strftime("%d/%m/%Y")
        for d in c.detalles:
            prod_nom = d.producto.nombre if d.producto else f"#{d.producto_id}"
            key = (prov_nom, prod_nom, fecha_str)
            grupos[key]["cantidad"] += d.cantidad
            grupos[key]["subtotal"] += round(d.cantidad * d.precio_unitario, 2)
            grupos[key]["precios"].append(d.precio_unitario)

    lineas = [
        {
            "fecha": k[2],
            "proveedor": k[0],
            "producto": k[1],
            "cantidad": g["cantidad"],
            "precio_prom": round(sum(g["precios"]) / len(g["precios"]), 2),
            "subtotal": round(g["subtotal"], 2),
        }
        for k, g in sorted(grupos.items(), key=lambda x: (x[0][2], -x[1]["subtotal"]))
    ]

    return {
        "cantidad": len(compras),
        "total": round(sum(c.total for c in compras), 2),
        "por_proveedor": {k: round(v, 2) for k, v in por_proveedor.items()},
        "lineas": lineas,
    }
