#!/bin/bash
# Crear directorios necesarios
mkdir -p uploads generated static/img

# Iniciar la aplicación
gunicorn --bind 0.0.0.0:$PORT app:app