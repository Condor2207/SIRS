# SuperStock Demo

Demo enfocada en ventas y ganancias para supermercado pequeno.

## Stack

- Backend: FastAPI + SQLAlchemy + JWT
- Frontend: HTML + CSS + JavaScript
- Tema: Light/Dark con toggle y persistencia en localStorage

## Paleta aplicada (light)

- Primary: #10B981
- Secondary: #34D399
- Background: #F1F5F9
- Surface: #FFFFFF
- Text: #0F172A
- Accent: #F59E0B
- Success: #059669
- Error: #DC2626

## Credenciales demo

- admin / admin123
- vendedor / 123456

## Ejecutar backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m app.seed_data
uvicorn app.main:app --reload --port 8000
```

## Ejecutar frontend

En otra terminal:

```powershell
cd frontend
python -m http.server 3000
```

Abrir:

- Frontend: http://localhost:3000
- API docs: http://localhost:8000/docs
