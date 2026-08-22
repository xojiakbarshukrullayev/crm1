#!/bin/bash
# Manga CRM - Render build script (bitta bosish bilan ishlashi uchun)
set -e

echo "=========================================="
echo "  MANGA CRM - Render Build"
echo "=========================================="

# Python deps
echo "[1/5] Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Frontend build
echo "[2/5] Installing Node.js dependencies..."
cd frontend
npm install --no-audit --no-fund --silent
echo "[3/5] Building React frontend..."
npm run build

# Frontend dist -> Django frontend_build (Django template orqali serve qiladi)
echo "[4/5] Copying frontend build to Django..."
mkdir -p ../backend/frontend_build
cp -r dist/* ../backend/frontend_build/
cd ..

# Django migrate + collectstatic
echo "[5/5] Running Django migrations and static files..."
cd backend
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# Superuser yaratish (agar mavjud bo'lmasa)
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin123}"
python <<PY
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'manga_crm.settings')
django.setup()
from accounts.models import User
if not User.objects.filter(username='admin').exists():
    pw = os.environ.get('ADMIN_PASSWORD', 'admin123')
    User.objects.create_superuser('admin', 'admin@manga.uz', pw, role='admin')
    print(f"Superuser yaratildi: admin / {pw}")
else:
    print('Superuser allaqachon mavjud')
PY

echo "=========================================="
echo "  Build complete!"
echo "=========================================="
