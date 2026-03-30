from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models import Proveedor, Usuario
from app.schemas import ProveedorIn, ProveedorOut

router = APIRouter(prefix="/proveedores", tags=["proveedores"])


@router.get("", response_model=list[ProveedorOut])
def listar_proveedores(
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    return db.query(Proveedor).order_by(Proveedor.nombre.asc()).all()


@router.post("", response_model=ProveedorOut)
def crear_proveedor(
    payload: ProveedorIn,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    proveedor = Proveedor(**payload.model_dump())
    db.add(proveedor)
    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.get("/{proveedor_id}", response_model=ProveedorOut)
def obtener_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(get_current_user),
):
    proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    return proveedor


@router.put("/{proveedor_id}", response_model=ProveedorOut)
def actualizar_proveedor(
    proveedor_id: int,
    payload: ProveedorIn,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")

    for key, value in payload.model_dump().items():
        setattr(proveedor, key, value)

    db.commit()
    db.refresh(proveedor)
    return proveedor


@router.delete("/{proveedor_id}")
def eliminar_proveedor(
    proveedor_id: int,
    db: Session = Depends(get_db),
    _: Usuario = Depends(require_admin),
):
    proveedor = db.query(Proveedor).filter(Proveedor.id == proveedor_id).first()
    if not proveedor:
        raise HTTPException(status_code=404, detail="Proveedor no encontrado")
    db.delete(proveedor)
    db.commit()
    return {"ok": True}
