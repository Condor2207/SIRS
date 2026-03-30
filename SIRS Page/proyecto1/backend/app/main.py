from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import Base, engine
from app.routes import auth, productos, ventas, dashboard, proveedores, compras, caja, usuarios, reportes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SuperStock Demo API", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(productos.router)
app.include_router(ventas.router)
app.include_router(dashboard.router)
app.include_router(proveedores.router)
app.include_router(compras.router)
app.include_router(caja.router)
app.include_router(reportes.router)


@app.get("/")
def healthcheck():
    return {"status": "ok", "service": "superstock-demo-api"}
