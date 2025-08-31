# Formulario de Mantenimiento - Versión Corporativa

Este proyecto genera reportes (DOCX + PDF) con el formato corporativo que solicitaste:
- Cabecera con logos (Navitrans + 'Juntos...')
- Título central en franja roja: 'REPORTE TÉCNICO SERVICIO\nTALLER'
- Secciones numeradas con fondo rojo
- Checkboxes claros: '☐' y '☑'
- Pie de página con numeración de páginas

## Estructura
```
formulario_mantenimiento_complete/
├─ app.py
├─ requirements.txt
├─ Procfile
├─ render.yaml
├─ templates/
│  ├─ base.html
│  ├─ form.html
│  ├─ result.html
│  └─ report.html
├─ static/
│  ├─ css/styles.css
│  ├─ js/form.js
│  └─ img/
│     ├─ logo_navitrans.png
│     └─ logo_juntos.png
├─ uploads/        # imágenes subidas
└─ generated/      # DOCX y PDF generados
```

## Instrucciones rápidas

1. Reemplaza los archivos `static/img/logo_navitrans.png` y `static/img/logo_juntos.png` por tus logos reales (mismo nombre).
2. Crear y activar entorno virtual:
```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```
3. Instalar dependencias:
```bash
pip install -r requirements.txt
```
4. Ejecutar la app:
```bash
python app.py
```
5. Abrir `http://127.0.0.1:5000` y probar: llena el formulario, sube imágenes en Correcciones y pulsa 'Generar Reporte'.

---
Nota: Si el PDF no se genera en algunos entornos por limitaciones del paquete `xhtml2pdf`, abre la vista HTML resultante y usa "Imprimir → Guardar como PDF" desde el navegador como alternativa.
