FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependências Python (incluindo gunicorn para produção)
RUN pip install --no-cache-dir -r requirements.txt gunicorn

# Copiar código do projeto
COPY . .

# Criar diretórios para uploads e media
RUN mkdir -p /app/media /app/uploads

# Coletar arquivos estáticos
RUN python manage.py collectstatic --noinput --settings=backend.settings.production || true

# Expor porta
EXPOSE 8000

# Comando de produção com gunicorn
CMD python manage.py migrate --noinput && \
    python manage.py create_admin && \
    gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
