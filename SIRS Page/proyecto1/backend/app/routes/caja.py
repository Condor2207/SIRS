from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db import get_db
from app.deps import get_current_user, require_admin
from app.models import Caja, Usuario

router = APIRouter(prefix="/caja", tags=["caja"])


@router.post("/apertura", response_model=dict)
def abrir_caja(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    caja_abierta = db.query(Caja).filter(Caja.usuario_id == current_user.id, Caja.abierta.is_(True)).first()
    if caja_abierta:
        raise HTTPException(status_code=400, detail="Ya hay una caja abierta")

    monto = payload.get("monto_inicial", 0.0)
    caja = Caja(usuario_id=current_user.id, monto_inicial=monto)
    db.add(caja)
    db.commit()
    return {"mensaje": "Caja abierta", "caja_id": caja.id}


@router.post("/cierre")
def cerrar_caja(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    caja = db.query(Caja).filter(Caja.usuario_id == current_user.id, Caja.abierta.is_(True)).first()
    if not caja:
        raise HTTPException(status_code=400, detail="No hay caja abierta")

    monto = payload.get("monto_final", 0.0)
    caja.fecha_cierre = datetime.utcnow()
    caja.monto_final = monto
    caja.abierta = False
    db.commit()
    return {"mensaje": "Caja cerrada", "diferencia": monto - caja.monto_inicial}


@router.get("/actual")
def caja_actual(db: Session = Depends(get_db), current_user: Usuario = Depends(get_current_user)):
    caja = db.query(Caja).filter(Caja.usuario_id == current_user.id, Caja.abierta.is_(True)).first()
    if not caja:
        return {"abierta": False, "caja_id": None}
    return {
        "abierta": True,
        "caja_id": caja.id,
        "monto_inicial": caja.monto_inicial,
        "fecha_apertura": caja.fecha_apertura,
    }
