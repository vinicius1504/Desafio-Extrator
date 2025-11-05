#!/usr/bin/env bash
# exit on error
set -o errexit

cd backend

# Executar migrations
python manage.py migrate --noinput

# Criar admin padrão
python manage.py create_admin

# Iniciar Gunicorn
gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
