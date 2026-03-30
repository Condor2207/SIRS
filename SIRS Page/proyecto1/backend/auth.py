from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models import Usuario
from app.schemas import LoginRequest, Token
from app.core.security import verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(Usuario).filter(Usuario.username == payload.username).first()
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Credenciales invalidas")

    access_token = create_access_token(subject=user.username, role=user.rol)
    return {"access_token": access_token, "token_type": "bearer"}
