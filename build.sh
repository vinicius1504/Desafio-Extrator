#!/usr/bin/env bash
# exit on error
set -o errexit

# Navegar para o diretório do backend
cd backend

# Instalar dependências
pip install -r requirements.txt

# Coletar arquivos estáticos
python manage.py collectstatic --no-input

# Executar migrations
python manage.py migrate --noinput

echo "Build completed successfully!"
