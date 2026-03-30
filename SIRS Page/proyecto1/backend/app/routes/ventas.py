from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.deps import get_current_user
from app.models import Venta, DetalleVenta, Producto, Usuario
from app.schemas import VentaCreateIn, VentaOut

router = APIRouter(prefix="/ventas", tags=["ventas"])


@router.get("", response_model=list[VentaOut])
def listar_ventas(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    query = db.query(Venta).options(joinedload(Venta.detalles))
    if current_user.rol != "admin":
        query = query.filter(Venta.usuario_id == current_user.id)
    return query.order_by(Venta.fecha.desc()).all()


@router.post("", response_model=VentaOut)
def crear_venta(payload: VentaCreateIn, db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    if not payload.items:
        raise HTTPException(status_code=400, detail="La venta no tiene items")

    total = 0.0
    detalles: list[DetalleVenta] = []

    for item in payload.items:
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no existe")
        if item.cantidad <= 0:
            raise HTTPException(status_code=400, detail="Cantidad invalida")
        if producto.stock_actual < item.cantidad:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {producto.nombre}")

        producto.stock_actual -= item.cantidad
        subtotal = producto.precio_venta * item.cantidad
        total += subtotal
        detalles.append(
            DetalleVenta(
                producto_id=producto.id,
                cantidad=item.cantidad,
                precio_unitario=producto.precio_venta,
            )
        )

    venta = Venta(
        usuario_id=current_user.id,
        total=round(total, 2),
        metodo_pago=payload.metodo_pago,
        detalles=detalles,
    )
    db.add(venta)
    db.commit()
    db.refresh(venta)
    return venta
