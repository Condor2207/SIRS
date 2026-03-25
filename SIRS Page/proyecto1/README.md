# Proyecto 1 - Dashboard Bancario Chile

## Contenido
- `index.html`: landing local con redirección al demo.
- `demo.html`: dashboard funcional en modo demo.
- `assets/`: carpeta reservada para recursos visuales futuros.

## Ejecución local
Abrir `index.html` o `demo.html?mode=demo` directamente con protocolo `file://`.

## Modo demo
El dashboard detecta `?mode=demo` y persiste el estado en `localStorage` bajo la clave `sirs-proyecto1-mode`.

## Deployment estático
1. Copiar la carpeta `proyecto1/` a cualquier hosting estático.
2. Mantener la estructura de archivos.
3. Publicar sin necesidad de servidor backend.

## Notas
- Exporta CSV desde el navegador.
- Actualiza métricas cada 5 segundos con datos ficticios coherentes.
