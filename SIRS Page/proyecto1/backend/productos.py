from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models import Producto, Usuario
from app.schemas import ProductoIn, ProductoOut

router = APIRouter(prefix="/productos", tags=["productos"])


@router.get("", response_model=list[ProductoOut])
def listar_productos(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return db.query(Producto).order_by(Producto.nombre.asc()).all()


@router.post("", response_model=ProductoOut)
def crear_producto(
    payload: ProductoIn,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    producto = Producto(**payload.model_dump())
    db.add(producto)
    db.commit()
    db.refresh(producto)
    return producto


@router.put("/{producto_id}", response_model=ProductoOut)
def actualizar_producto(
    producto_id: int,
    payload: ProductoIn,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    data = payload.model_dump()
    for key, value in data.items():
        setattr(producto, key, value)

    db.commit()
    db.refresh(producto)
    return producto
