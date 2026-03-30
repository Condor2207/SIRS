from datetime import datetime, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models import Compra, DetalleCompra, Producto, Proveedor, Usuario
from app.schemas import CompraCreateIn, CompraOut

router = APIRouter(prefix="/compras", tags=["compras"])


@router.get("/restock-sugerido")
def restock_sugerido(
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    """
    Returns all low-stock products with:
    - cantidad_sugerida: how many to buy to reach stock_minimo * 2
    - precio_promedio: avg unit cost from purchases in the last 2 months (or product.costo fallback)
    - proveedor_id / proveedor_nombre: product's default supplier
    """
    ahora = datetime.utcnow()
    hace_2_meses = ahora - timedelta(days=60)

    # Avg cost per product_id from the last 2 months of purchases
    detalles_hist = (
        db.query(DetalleCompra)
        .join(Compra)
        .filter(Compra.fecha >= hace_2_meses)
        .all()
    )
    costos: dict = defaultdict(list)
    for d in detalles_hist:
        costos[d.producto_id].append(d.precio_unitario)

    bajo = (
        db.query(Producto)
        .join(Proveedor, Producto.proveedor_id == Proveedor.id, isouter=True)
        .filter(Producto.stock_actual <= Producto.stock_minimo)
        .all()
    )

    result = []
    for p in bajo:
        precios = costos.get(p.id, [])
        precio_prom = round(sum(precios) / len(precios), 2) if precios else round(p.costo, 2)
        cantidad_sug = max(p.stock_minimo * 2 - p.stock_actual, p.stock_minimo)
        prov = p.proveedor
        result.append({
            "producto_id": p.id,
            "nombre": p.nombre,
            "categoria": p.categoria,
            "stock_actual": p.stock_actual,
            "stock_minimo": p.stock_minimo,
            "cantidad_sugerida": cantidad_sug,
            "precio_promedio": precio_prom,
            "proveedor_id": prov.id if prov else None,
            "proveedor_nombre": prov.nombre if prov else "-",
        })

    return result


@router.get("", response_model=list[CompraOut])
def listar_compras(db: Session = Depends(get_db), _: Usuario = Depends(require_admin)):
    compras = db.query(Compra).options(joinedload(Compra.detalles), joinedload(Compra.proveedor)).order_by(Compra.fecha.desc()).all()
    result = []
    for c in compras:
        item = CompraOut(
            id=c.id,
            proveedor_id=c.proveedor_id,
            proveedor_nombre=c.proveedor.nombre if c.proveedor else "-",
            fecha=c.fecha,
            total=c.total,
            estado=c.estado,
            detalles=c.detalles,
        )
        result.append(item)
    return result


@router.post("", response_model=CompraOut)
def crear_compra(
    payload: CompraCreateIn,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="La compra no tiene items")

    total = 0.0
    detalles: list[DetalleCompra] = []

    for item in payload.items:
        producto = db.query(Producto).filter(Producto.id == item.producto_id).first()
        if not producto:
            raise HTTPException(status_code=404, detail=f"Producto {item.producto_id} no existe")

        producto.stock_actual += item.cantidad
        subtotal = item.precio_unitario * item.cantidad
        total += subtotal
        detalles.append(
            DetalleCompra(
                producto_id=producto.id,
                cantidad=item.cantidad,
                precio_unitario=item.precio_unitario,
            )
        )

    compra = Compra(proveedor_id=payload.proveedor_id, total=round(total, 2), detalles=detalles)
    db.add(compra)
    db.commit()
    db.refresh(compra)
    return compra


@router.put("/{compra_id}/recibir")
def recibir_compra(compra_id: int, db: Session = Depends(get_db), _: Usuario = Depends(require_admin)):
    compra = db.query(Compra).filter(Compra.id == compra_id).first()
    if not compra:
        raise HTTPException(status_code=404, detail="Compra no encontrada")
    compra.estado = "recibida"
    db.commit()
    return {"ok": True}
