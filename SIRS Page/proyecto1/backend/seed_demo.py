"""
seed_demo.py — Genera datos demo realistas para SuperStock
Cubre diciembre 2025 – marzo 2026
Uso: python seed_demo.py
"""

import random
import sys
import os
from datetime import datetime, timedelta

# Asegurar que el modulo app sea encontrado
sys.path.insert(0, os.path.dirname(__file__))

from app.db import SessionLocal, engine
from app import models
from app.models import Base
from app.core.security import get_password_hash as hash_password

random.seed(42)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def rnd_date(start: datetime, end: datetime) -> datetime:
    delta = end - start
    return start + timedelta(seconds=random.randint(0, int(delta.total_seconds())))

def rnd_time_in_day(d: datetime) -> datetime:
    return d.replace(hour=random.randint(7, 21), minute=random.randint(0, 59), second=random.randint(0, 59))

# ---------------------------------------------------------------------------
# Datos maestros
# ---------------------------------------------------------------------------

def pyg(usd_price: float) -> float:
    """Convierte precio USD a PYG redondeado al multiplo de 500 mas cercano."""
    return round(usd_price * 7500 / 500) * 500

CATEGORIAS = ["Lácteos", "Carnes y Embutidos", "Bebidas", "Snacks y Dulces",
               "Limpieza", "Panadería", "Enlatados", "Frutas y Verduras",
               "Higiene Personal", "Congelados"]

PRODUCTOS_BASE = [
    # (nombre, categoria, precio_venta, costo)
    ("Leche Entera 1L", "Lácteos", pyg(1.80), pyg(1.10)),
    ("Leche Semidescremada 1L", "Lácteos", pyg(1.80), pyg(1.10)),
    ("Crema de Leche 500ml", "Lácteos", pyg(2.10), pyg(1.30)),
    ("Queso Blanco 500g", "Lácteos", pyg(4.50), pyg(2.80)),
    ("Queso Amarillo 300g", "Lácteos", pyg(3.80), pyg(2.40)),
    ("Mantequilla 200g", "Lácteos", pyg(2.60), pyg(1.70)),
    ("Yogurt Natural 200ml", "Lácteos", pyg(1.20), pyg(0.70)),
    ("Yogurt Fresa 200ml", "Lácteos", pyg(1.20), pyg(0.70)),
    ("Yogurt Melocotón 200ml", "Lácteos", pyg(1.20), pyg(0.70)),
    ("Leche Condensada 395g", "Lácteos", pyg(2.20), pyg(1.40)),
    ("Pollo Entero kg", "Carnes y Embutidos", pyg(5.50), pyg(3.60)),
    ("Pollo Pechuga kg", "Carnes y Embutidos", pyg(6.80), pyg(4.50)),
    ("Carne Molida kg", "Carnes y Embutidos", pyg(7.20), pyg(4.80)),
    ("Bistec de Res kg", "Carnes y Embutidos", pyg(9.50), pyg(6.20)),
    ("Costilla de Cerdo kg", "Carnes y Embutidos", pyg(7.80), pyg(5.10)),
    ("Salchicha 500g", "Carnes y Embutidos", pyg(3.40), pyg(2.00)),
    ("Jamón de Pavo 300g", "Carnes y Embutidos", pyg(3.20), pyg(1.90)),
    ("Chorizo 300g", "Carnes y Embutidos", pyg(3.60), pyg(2.20)),
    ("Mortadela 300g", "Carnes y Embutidos", pyg(2.80), pyg(1.70)),
    ("Tocino 250g", "Carnes y Embutidos", pyg(4.20), pyg(2.70)),
    ("Agua Mineral 1.5L", "Bebidas", pyg(0.80), pyg(0.40)),
    ("Agua Mineral 600ml", "Bebidas", pyg(0.50), pyg(0.25)),
    ("Refresco Cola 2L", "Bebidas", pyg(1.60), pyg(0.90)),
    ("Refresco Cola 1L", "Bebidas", pyg(1.00), pyg(0.55)),
    ("Refresco Naranja 2L", "Bebidas", pyg(1.60), pyg(0.90)),
    ("Jugo de Naranja 1L", "Bebidas", pyg(2.20), pyg(1.30)),
    ("Jugo de Manzana 1L", "Bebidas", pyg(2.00), pyg(1.20)),
    ("Cerveza Pilsener 355ml", "Bebidas", pyg(1.20), pyg(0.70)),
    ("Cerveza Premium 355ml", "Bebidas", pyg(1.80), pyg(1.00)),
    ("Vino Tinto 750ml", "Bebidas", pyg(8.50), pyg(5.20)),
    ("Vino Blanco 750ml", "Bebidas", pyg(7.80), pyg(4.80)),
    ("Energizante 250ml", "Bebidas", pyg(2.00), pyg(1.10)),
    ("Té Helado 500ml", "Bebidas", pyg(1.20), pyg(0.65)),
    ("Café Negro 250g", "Bebidas", pyg(4.50), pyg(2.70)),
    ("Café con Leche 500ml", "Bebidas", pyg(1.80), pyg(0.95)),
    ("Papas Fritas 150g", "Snacks y Dulces", pyg(1.80), pyg(1.00)),
    ("Papas Fritas 75g", "Snacks y Dulces", pyg(1.00), pyg(0.55)),
    ("Doritos Nacho 140g", "Snacks y Dulces", pyg(1.80), pyg(1.00)),
    ("Galletas Oreo 120g", "Snacks y Dulces", pyg(1.60), pyg(0.90)),
    ("Galletas de Soda 200g", "Snacks y Dulces", pyg(1.20), pyg(0.65)),
    ("Chocolate Oscuro 100g", "Snacks y Dulces", pyg(2.20), pyg(1.30)),
    ("Chocolate con Leche 100g", "Snacks y Dulces", pyg(2.00), pyg(1.15)),
    ("Gummies 100g", "Snacks y Dulces", pyg(1.40), pyg(0.75)),
    ("Palomitas Micro 100g", "Snacks y Dulces", pyg(1.20), pyg(0.65)),
    ("Granola Barra 40g", "Snacks y Dulces", pyg(1.00), pyg(0.55)),
    ("Detergente Líquido 1L", "Limpieza", pyg(3.50), pyg(2.00)),
    ("Detergente Polvo 1kg", "Limpieza", pyg(3.20), pyg(1.90)),
    ("Suavizante Ropa 1L", "Limpieza", pyg(2.80), pyg(1.60)),
    ("Cloro 1L", "Limpieza", pyg(1.40), pyg(0.75)),
    ("Limpiapisos 1L", "Limpieza", pyg(2.20), pyg(1.30)),
    ("Desengrasante 500ml", "Limpieza", pyg(2.60), pyg(1.50)),
    ("Esponjas x3", "Limpieza", pyg(1.20), pyg(0.60)),
    ("Bolsas Basura 10uds", "Limpieza", pyg(1.60), pyg(0.85)),
    ("Papel Higiénico x4", "Higiene Personal", pyg(2.80), pyg(1.65)),
    ("Papel Higiénico x12", "Higiene Personal", pyg(7.50), pyg(4.50)),
    ("Toallas de Papel x2", "Limpieza", pyg(1.60), pyg(0.90)),
    ("Pan Blanco 500g", "Panadería", pyg(1.40), pyg(0.80)),
    ("Pan Integral 500g", "Panadería", pyg(1.60), pyg(0.95)),
    ("Pan de Hot Dog x6", "Panadería", pyg(1.20), pyg(0.65)),
    ("Pan de Hamburguesa x4", "Panadería", pyg(1.20), pyg(0.65)),
    ("Croissant x4", "Panadería", pyg(2.50), pyg(1.50)),
    ("Atún en Lata 170g", "Enlatados", pyg(2.20), pyg(1.30)),
    ("Sardinas en Lata 120g", "Enlatados", pyg(1.60), pyg(0.90)),
    ("Frijoles Negros 400g", "Enlatados", pyg(1.20), pyg(0.65)),
    ("Maíz Dulce 400g", "Enlatados", pyg(1.40), pyg(0.78)),
    ("Tomate Triturado 400g", "Enlatados", pyg(1.20), pyg(0.65)),
    ("Pasta de Tomate 200g", "Enlatados", pyg(0.90), pyg(0.48)),
    ("Durazno en Almíbar 400g", "Enlatados", pyg(2.00), pyg(1.15)),
    ("Aceitunas 200g", "Enlatados", pyg(2.80), pyg(1.65)),
    ("Aceite de Oliva 500ml", "Enlatados", pyg(6.50), pyg(4.00)),
    ("Aceite Vegetal 1L", "Enlatados", pyg(2.20), pyg(1.30)),
    ("Tomate Cherry 500g", "Frutas y Verduras", pyg(2.40), pyg(1.40)),
    ("Cebolla kg", "Frutas y Verduras", pyg(1.20), pyg(0.60)),
    ("Zanahoria kg", "Frutas y Verduras", pyg(1.10), pyg(0.55)),
    ("Papa kg", "Frutas y Verduras", pyg(1.40), pyg(0.72)),
    ("Plátano kg", "Frutas y Verduras", pyg(1.00), pyg(0.50)),
    ("Manzana kg", "Frutas y Verduras", pyg(2.50), pyg(1.50)),
    ("Naranja kg", "Frutas y Verduras", pyg(1.60), pyg(0.80)),
    ("Lechuga Unidad", "Frutas y Verduras", pyg(1.20), pyg(0.65)),
    ("Aguacate Unidad", "Frutas y Verduras", pyg(0.90), pyg(0.48)),
    ("Pimiento Rojo kg", "Frutas y Verduras", pyg(2.20), pyg(1.20)),
    ("Shampoo 400ml", "Higiene Personal", pyg(4.50), pyg(2.70)),
    ("Acondicionador 400ml", "Higiene Personal", pyg(4.50), pyg(2.70)),
    ("Jabón de Baño x3", "Higiene Personal", pyg(2.40), pyg(1.35)),
    ("Pasta de Dientes 100ml", "Higiene Personal", pyg(2.20), pyg(1.25)),
    ("Desodorante Aerosol 150ml", "Higiene Personal", pyg(3.50), pyg(2.10)),
    ("Desodorante Roll-on 50ml", "Higiene Personal", pyg(2.80), pyg(1.65)),
    ("Maquina de Afeitar x2", "Higiene Personal", pyg(2.00), pyg(1.10)),
    ("Gel de Baño 400ml", "Higiene Personal", pyg(3.80), pyg(2.25)),
    ("Pizza Congelada 400g", "Congelados", pyg(5.50), pyg(3.30)),
    ("Nuggets de Pollo 500g", "Congelados", pyg(5.80), pyg(3.50)),
    ("Helado Vainilla 1L", "Congelados", pyg(4.50), pyg(2.70)),
    ("Helado Chocolate 1L", "Congelados", pyg(4.50), pyg(2.70)),
    ("Waffles Congelados 6uds", "Congelados", pyg(3.20), pyg(1.90)),
    ("Papas Fritas Congeladas 1kg", "Congelados", pyg(3.80), pyg(2.25)),
    ("Arroz Blanco 1kg", "Enlatados", pyg(1.50), pyg(0.85)),
    ("Arroz Integral 1kg", "Enlatados", pyg(1.80), pyg(1.05)),
    ("Espagueti 500g", "Enlatados", pyg(1.40), pyg(0.78)),
    ("Macarrones 500g", "Enlatados", pyg(1.40), pyg(0.78)),
]

# Relleno para llegar a 500 productos
EXTRA_CATEGORIAS = CATEGORIAS
EXTRA_BASE = [
    ("Harina de Trigo 1kg", "Panadería", pyg(1.20), pyg(0.65)),
    ("Azúcar 1kg", "Panadería", pyg(1.10), pyg(0.60)),
    ("Sal 500g", "Panadería", pyg(0.60), pyg(0.30)),
    ("Vinagre 500ml", "Enlatados", pyg(0.90), pyg(0.45)),
    ("Mostaza 300g", "Enlatados", pyg(1.40), pyg(0.78)),
    ("Ketchup 400g", "Enlatados", pyg(1.60), pyg(0.90)),
    ("Mayonesa 400g", "Enlatados", pyg(2.20), pyg(1.30)),
    ("Salsa de Soya 150ml", "Enlatados", pyg(1.80), pyg(1.00)),
    ("Pimienta Negra 50g", "Enlatados", pyg(1.40), pyg(0.75)),
    ("Orégano 20g", "Enlatados", pyg(0.80), pyg(0.40)),
    ("Canela 20g", "Enlatados", pyg(0.90), pyg(0.48)),
    ("Comino 20g", "Enlatados", pyg(0.80), pyg(0.40)),
    ("Leche Evaporada 400g", "Lácteos", pyg(2.00), pyg(1.20)),
    ("Crema Agria 200ml", "Lácteos", pyg(1.80), pyg(1.05)),
    ("Queso Crema 200g", "Lácteos", pyg(2.80), pyg(1.70)),
    ("Jamón Serrano 150g", "Carnes y Embutidos", pyg(4.20), pyg(2.60)),
    ("Pepperoni 200g", "Carnes y Embutidos", pyg(3.80), pyg(2.30)),
    ("Filete de Pescado 500g", "Congelados", pyg(6.50), pyg(4.00)),
    ("Camarones 500g", "Congelados", pyg(9.50), pyg(6.20)),
    ("Calamar 500g", "Congelados", pyg(7.20), pyg(4.50)),
]

# Generar mas productos hasta 500
def gen_products(count: int):
    prods = list(PRODUCTOS_BASE)
    variants = ["Premium", "Especial", "Natural", "Orgánico", "Familiar", "Mini", "Giant", "Classic"]
    sizes = ["250g", "500g", "1kg", "2kg", "1L", "2L", "300ml", "750ml"]
    cat_cycle = EXTRA_CATEGORIAS * 20
    extra = list(EXTRA_BASE)
    idx = 0
    base_names = ["Cereal", "Granola", "Avena", "Miel", "Mermelada", "Jalea", "Mantequilla de Maní",
                  "Galleta", "Wafer", "Chocobamba", "Chicle", "Caramelo", "Paleta", "Brownie",
                  "Muffin", "Donut", "Croissant", "Torta", "Biscocho", "Empanada",
                  "Jugo", "Néctar", "Smoothie", "Kombucha", "Isotónico", "Cacao", "Malta",
                  "Mezcla", "Polvo Proteico", "Barra Energética",
                  "Limpiador Multi", "Cuidado Hogar", "Ambientador", "Insecticida", "Raticida",
                  "Esponja Lava Platos", "Guante Cocina", "Trapo Microfibra",
                  "Crema Facial", "Loción Corporal", "Protector Solar", "Cotonetes", "Hilo Dental"]
    while len(prods) < count:
        if idx < len(extra):
            prods.append(extra[idx])
            idx += 1
        else:
            name = random.choice(base_names)
            variant = random.choice(variants)
            size = random.choice(sizes)
            cat = cat_cycle[len(prods) % len(cat_cycle)]
            precio = round(random.uniform(3000, 90000) / 500) * 500
            costo  = round(precio * random.uniform(0.55, 0.72) / 500) * 500
            prods.append((f"{name} {variant} {size}", cat, precio, costo))
    return prods[:count]

PROVEEDORES = [
    {"nombre": "Distribuidora Central SA", "contacto": "Carlos Méndez", "email": "carlos@distcentral.com", "telefono": "0414-555-0101"},
    {"nombre": "Alimentos del Valle", "contacto": "Ana Torres", "email": "ana@alivalley.com", "telefono": "0212-555-0202"},
    {"nombre": "ProCosta Importaciones", "contacto": "Luis García", "email": "luis@procosta.com", "telefono": "0416-555-0303"},
    {"nombre": "MegaSupply Corp", "contacto": "Elena Ríos", "email": "elena@megasupply.com", "telefono": "0261-555-0404"},
    {"nombre": "Lácteos El Rancho", "contacto": "Pedro Blanco", "email": "pedro@elrancho.com", "telefono": "0424-555-0505"},
    {"nombre": "Bebidas y Más SRL", "contacto": "Sandra Lima", "email": "sandra@bebidasmas.com", "telefono": "0212-555-0606"},
    {"nombre": "Carnes Premium CA", "contacto": "Roberto Vega", "email": "roberto@carnespremium.com", "telefono": "0414-555-0707"},
    {"nombre": "Fresh Verduras", "contacto": "María Soria", "email": "maria@freshverduras.com", "telefono": "0416-555-0808"},
]

# ---------------------------------------------------------------------------
# Main seed
# ---------------------------------------------------------------------------

def seed():
    db = SessionLocal()
    try:
        Base.metadata.create_all(bind=engine)
        print("Limpiando base de datos...")
        db.query(models.DetalleVenta).delete()
        db.query(models.Venta).delete()
        db.query(models.DetalleCompra).delete()
        db.query(models.Compra).delete()
        db.query(models.Caja).delete()
        db.query(models.Producto).delete()
        db.query(models.Proveedor).delete()
        db.query(models.Usuario).delete()
        db.commit()

        # ----------------------------------------------------------------
        # Usuarios
        # ----------------------------------------------------------------
        print("Creando usuarios...")
        admin = models.Usuario(username="admin", password=hash_password("admin123"), rol="admin")
        vendedor = models.Usuario(username="vendedor", password=hash_password("vendedor123"), rol="vendedor")
        db.add_all([admin, vendedor])
        db.flush()

        # ----------------------------------------------------------------
        # Proveedores
        # ----------------------------------------------------------------
        print("Creando proveedores...")
        provs = []
        for p in PROVEEDORES:
            obj = models.Proveedor(**p)
            db.add(obj)
            provs.append(obj)
        db.flush()

        # ----------------------------------------------------------------
        # Productos (500)
        # ----------------------------------------------------------------
        print("Creando 500 productos...")
        all_prods_data = gen_products(500)
        productos = []
        for nombre, cat, precio, costo in all_prods_data:
            prov = random.choice(provs)
            stock = random.randint(5, 300)
            stock_min = random.choice([5, 10, 15, 20])
            p = models.Producto(
                nombre=nombre, categoria=cat,
                precio_venta=precio, costo=costo,
                stock_actual=stock, stock_minimo=stock_min,
                proveedor_id=prov.id,
            )
            db.add(p)
            productos.append(p)
        db.flush()

        # ----------------------------------------------------------------
        # Cajas y Ventas + Compras  Dec 2025 – Mar 2026
        # ----------------------------------------------------------------
        print("Generando historial de cajas, ventas y compras (diciembre 2025 – marzo 2026)...")

        # Productos "ganadores" por mes – distintos en cada mes
        ganadores_dic = random.sample(productos[:50], 8)
        ganadores_ene = random.sample(productos[50:150], 8)
        ganadores_feb = random.sample(productos[30:100], 8)
        ganadores_mar = random.sample(productos[0:80], 8)

        meses = [
            # (primer_dia, factor_trafico, ganadores, factor_gasto_compras)
            (datetime(2025, 12, 1),  1.5,  ganadores_dic, 1.3),   # Diciembre – alto
            (datetime(2026,  1, 1),  0.7,  ganadores_ene, 0.8),   # Enero – bajo
            (datetime(2026,  2, 1),  1.0,  ganadores_feb, 1.0),   # Febrero – normal
            (datetime(2026,  3, 1),  1.1,  ganadores_mar, 1.1),   # Marzo – creciendo
        ]

        METODOS = ["efectivo", "tarjeta_credito", "transferencia"]
        METODO_W = [0.60, 0.25, 0.15]

        for mes_inicio, factor, ganadores_mes, factor_compras in meses:
            year = mes_inicio.year
            month = mes_inicio.month
            # dias del mes
            if month == 12:
                dias = 31
            elif month in [1, 3]:
                dias = 31
            elif month == 2:
                dias = 28
            else:
                dias = 30

            # Determinar hasta qué día (marzo solo hasta hoy)
            if month == 3 and year == 2026:
                dias = 29  # hasta 29 de marzo

            # ---- COMPRAS del mes ----
            num_compras = int(random.randint(8, 18) * factor_compras)
            for _ in range(num_compras):
                dia_compra = random.randint(1, dias)
                fecha_compra = datetime(year, month, dia_compra,
                                        random.randint(8, 17), random.randint(0, 59))
                prov = random.choice(provs)
                compra = models.Compra(
                    proveedor_id=prov.id,
                    fecha=fecha_compra,
                    total=0.0,
                    estado=random.choices(["recibida", "pendiente"], weights=[0.85, 0.15])[0],
                )
                db.add(compra)
                db.flush()

                total_compra = 0.0
                prods_compra = random.sample(productos, random.randint(3, 12))
                for prod in prods_compra:
                    qty = random.randint(10, 100)
                    # variación de precio de costo +/-15%
                    precio_u = round(prod.costo * random.uniform(0.85, 1.15), 2)
                    det = models.DetalleCompra(
                        compra_id=compra.id,
                        producto_id=prod.id,
                        cantidad=qty,
                        precio_unitario=precio_u,
                    )
                    db.add(det)
                    total_compra += qty * precio_u
                compra.total = round(total_compra, 2)

            # ---- CAJAS y VENTAS por día ----
            for dia in range(1, dias + 1):
                fecha_dia = datetime(year, month, dia)
                # Saltar domingos (descanso) 30% de las veces
                if fecha_dia.weekday() == 6 and random.random() < 0.30:
                    continue

                # Apertura de caja
                hora_apertura = datetime(year, month, dia, 7, random.randint(0, 30))
                caja = models.Caja(
                    usuario_id=admin.id,
                    fecha_apertura=hora_apertura,
                    monto_inicial=random.choice([150000.0, 200000.0, 250000.0]),
                    abierta=False,
                )
                db.add(caja)
                db.flush()

                # Ventas del día
                base_ventas = int(random.randint(10, 30) * factor)
                hora = 7
                for _ in range(base_ventas):
                    mins_after = random.randint(0, 780)  # hasta 13h = 780 min
                    hora_venta = hora_apertura + timedelta(minutes=mins_after)
                    metodo = random.choices(METODOS, weights=METODO_W)[0]

                    venta = models.Venta(
                        usuario_id=random.choice([admin.id, vendedor.id]),
                        fecha=hora_venta,
                        total=0.0,
                        metodo_pago=metodo,
                    )
                    db.add(venta)
                    db.flush()

                    total_venta = 0.0
                    # 1-5 items por venta; mayor prob. de ganadores del mes
                    num_items = random.randint(1, 5)
                    pool = ganadores_mes * 4 + productos  # ganadores tienen 4x prob
                    items_sel = random.sample(pool, min(num_items, len(pool)))
                    seen_ids = set()
                    for prod in items_sel:
                        if prod.id in seen_ids:
                            continue
                        seen_ids.add(prod.id)
                        qty = random.randint(1, 6)
                        det = models.DetalleVenta(
                            venta_id=venta.id,
                            producto_id=prod.id,
                            cantidad=qty,
                            precio_unitario=prod.precio_venta,
                        )
                        db.add(det)
                        total_venta += qty * prod.precio_venta

                    venta.total = round(total_venta, 2)

                # Cierre de caja
                hora_cierre = datetime(year, month, dia, 20, random.randint(0, 59))
                caja.fecha_cierre = hora_cierre
                caja.monto_final = round(
                    caja.monto_inicial + sum(
                        v.total for v in db.query(models.Venta)
                        .filter(
                            models.Venta.fecha >= hora_apertura,
                            models.Venta.fecha < hora_cierre,
                            models.Venta.metodo_pago == "efectivo"
                        ).all()
                    ),
                    2
                )

            db.commit()
            print(f"  Mes {month}/{year} listo.")

        # ---- Caja de hoy abierta ----
        print("Abriendo caja de hoy (30 mar 2026)...")
        hoy = datetime(2026, 3, 30, 7, 15)
        caja_hoy = models.Caja(
            usuario_id=admin.id,
            fecha_apertura=hoy,
            monto_inicial=200000.0,
            abierta=True,
        )
        db.add(caja_hoy)
        db.commit()

        print("\nDatos demo generados exitosamente.")
        print(f"  Usuarios:   admin / admin123  |  vendedor / vendedor123")
        print(f"  Productos:  500")
        print(f"  Proveedores: {len(PROVEEDORES)}")

    except Exception as e:
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()


