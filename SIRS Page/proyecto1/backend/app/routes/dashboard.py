from datetime import datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.deps import get_current_user
from app.models import Producto, Venta, DetalleVenta, Caja, Usuario

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/metrics")
def get_metrics(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    now = datetime.utcnow()
    start_day = datetime(now.year, now.month, now.day)
    end_day = start_day + timedelta(days=1)

    ventas_query = db.query(Venta).options(
        joinedload(Venta.detalles).joinedload(DetalleVenta.producto)
    ).filter(Venta.fecha >= start_day, Venta.fecha < end_day)

    if current_user.rol != "admin":
        ventas_query = ventas_query.filter(Venta.usuario_id == current_user.id)

    ventas_hoy = ventas_query.all()

    total_dia = sum(v.total for v in ventas_hoy)
    num_ventas = len(ventas_hoy)
    venta_promedio = round(total_dia / num_ventas, 2) if num_ventas > 0 else 0.0

    total_costo = 0.0
    for venta in ventas_hoy:
        for detalle in venta.detalles:
            if detalle.producto:
                total_costo += detalle.cantidad * detalle.producto.costo

    ganancia_dia = round(total_dia - total_costo, 2)
    stock_bajo = db.query(Producto).filter(Producto.stock_actual <= Producto.stock_minimo).count()

    caja_abierta = db.query(Caja).filter(
        Caja.usuario_id == current_user.id,
        Caja.abierta.is_(True)
    ).first() is not None

    return {
        "ventas_dia": round(total_dia, 2),
        "num_ventas_dia": num_ventas,
        "ganancia_dia": ganancia_dia,
        "venta_promedio": venta_promedio,
        "stock_bajo": stock_bajo,
        "caja_abierta": caja_abierta,
    }
