from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    token_type: str


class LoginRequest(BaseModel):
    username: str
    password: str


class UsuarioOut(BaseModel):
    id: int
    username: str
    rol: str

    class Config:
        from_attributes = True


class ProveedorIn(BaseModel):
    nombre: str
    contacto: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ProveedorOut(ProveedorIn):
    id: int

    class Config:
        from_attributes = True


class ProductoIn(BaseModel):
    nombre: str
    categoria: str
    precio_venta: float
    costo: float
    stock_actual: int
    stock_minimo: int
    proveedor_id: int


class ProductoOut(ProductoIn):
    id: int

    class Config:
        from_attributes = True


class VentaItemIn(BaseModel):
    producto_id: int
    cantidad: int


class VentaCreateIn(BaseModel):
    items: list[VentaItemIn]
    metodo_pago: str = "efectivo"


class VentaDetalleOut(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

    class Config:
        from_attributes = True


class VentaOut(BaseModel):
    id: int
    usuario_id: int
    fecha: datetime
    total: float
    metodo_pago: str = "efectivo"
    detalles: list[VentaDetalleOut]

    class Config:
        from_attributes = True


class DetalleCompraIn(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float


class CompraCreateIn(BaseModel):
    proveedor_id: int
    items: list[DetalleCompraIn]


class DetalleCompraOut(BaseModel):
    producto_id: int
    cantidad: int
    precio_unitario: float

    class Config:
        from_attributes = True


class CompraOut(BaseModel):
    id: int
    proveedor_id: int
    proveedor_nombre: str = ""
    fecha: datetime
    total: float
    estado: str
    detalles: list[DetalleCompraOut] = []

    class Config:
        from_attributes = True


class CajaCreateIn(BaseModel):
    monto_inicial: float


class CajaOut(BaseModel):
    id: int
    usuario_id: int
    fecha_apertura: datetime
    fecha_cierre: Optional[datetime] = None
    monto_inicial: float
    monto_final: Optional[float] = None
    abierta: bool

    class Config:
        from_attributes = True
