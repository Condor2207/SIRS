from sqlalchemy.orm import Session

from app.db import SessionLocal, Base, engine
from app.models import Usuario, Proveedor, Producto
from app.core.security import get_password_hash


def seed(db: Session):
    if db.query(Usuario).count() == 0:
        db.add_all(
            [
                Usuario(username="admin", password=get_password_hash("admin123"), rol="admin"),
                Usuario(username="vendedor", password=get_password_hash("123456"), rol="vendedor"),
            ]
        )

    if db.query(Proveedor).count() == 0:
        db.add_all(
            [
                Proveedor(nombre="Mayorista Frutas SA", contacto="Juan Perez", email="juan@frutas.com", telefono="098765432", direccion="Calle 1 #123"),
                Proveedor(nombre="Distribuidora Bebidas SRL", contacto="Maria Gomez", email="maria@bebidas.com", telefono="098764321", direccion="Calle 2 #456"),
            ]
        )

    if db.query(Producto).count() == 0:
        db.add_all(
            [
                Producto(nombre="Leche Entera", categoria="Dairy", precio_venta=2.50, costo=1.80, stock_actual=50, stock_minimo=10, proveedor_id=1),
                Producto(nombre="Pan Lactal", categoria="Bakery", precio_venta=1.20, costo=0.80, stock_actual=30, stock_minimo=5, proveedor_id=1),
                Producto(nombre="Coca Cola 2L", categoria="Drinks", precio_venta=3.00, costo=2.00, stock_actual=20, stock_minimo=5, proveedor_id=2),
                Producto(nombre="Arroz 1kg", categoria="Grains", precio_venta=1.80, costo=1.20, stock_actual=100, stock_minimo=20, proveedor_id=1),
                Producto(nombre="Jabon Dove", categoria="Hygiene", precio_venta=2.20, costo=1.50, stock_actual=40, stock_minimo=10, proveedor_id=2),
                Producto(nombre="Huevos Docena", categoria="Dairy", precio_venta=2.90, costo=2.10, stock_actual=25, stock_minimo=6, proveedor_id=1),
                Producto(nombre="Aceite 900ml", categoria="Grocery", precio_venta=2.60, costo=1.95, stock_actual=18, stock_minimo=6, proveedor_id=1),
                Producto(nombre="Fideos 500g", categoria="Grocery", precio_venta=1.10, costo=0.75, stock_actual=80, stock_minimo=15, proveedor_id=1),
                Producto(nombre="Yerba 1kg", categoria="Infusions", precio_venta=4.20, costo=3.10, stock_actual=22, stock_minimo=8, proveedor_id=2),
                Producto(nombre="Galletitas", categoria="Snacks", precio_venta=1.50, costo=1.00, stock_actual=60, stock_minimo=12, proveedor_id=2),
            ]
        )

    db.commit()


def main():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
        print("Seed completado")
    finally:
        db.close()


if __name__ == "__main__":
    main()
