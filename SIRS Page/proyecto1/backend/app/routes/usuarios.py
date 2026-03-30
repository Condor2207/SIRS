from fastapi import APIRouter, Depends

from app.db import get_db
from app.deps import get_current_user
from app.models import Usuario
from app.schemas import UsuarioOut
from sqlalchemy.orm import Session

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.get("/me", response_model=UsuarioOut)
def get_current_usuario(current_user: Usuario = Depends(get_current_user)):
    return current_user
