#!/bin/bash
# Creates the test user and approved subjects in the local DB.
# Safe to run multiple times — skips if user already exists.

BACKEND_DIR="$(cd "$(dirname "$0")/../../ludo3-backend" && pwd)"

echo "[setup-db] Checking Docker..."
if ! docker ps --filter "name=web" --format "{{.Names}}" 2>/dev/null | grep -q web; then
  echo "[setup-db] Backend container not running. Start it with: cd ludo3-backend && docker-compose up"
  exit 1
fi

echo "[setup-db] Creating test user and approved subjects..."
docker-compose -f "$BACKEND_DIR/docker-compose.yml" exec -T web python manage.py shell << 'PYTHON'
from backend.models import User, Student, Final, FinalExam, Teacher
from datetime import datetime, timezone

DNI = '37247189'
EMAIL = 'fede.est@gmail.com'
PADRON = '94557'
PASSWORD = 'soydeferro'

# Create or get user
user, created = User.objects.get_or_create(dni=DNI, defaults={'email': EMAIL, 'username': ''})
if created or not user.has_usable_password():
    user.set_password(PASSWORD)
    user.save()
    print(f'[setup-db] Created user DNI={DNI}')
else:
    print(f'[setup-db] User DNI={DNI} already exists')

# Ensure student profile
student, _ = Student.objects.get_or_create(user=user, defaults={'padron': PADRON, 'face_encodings': []})

# Create approved subjects if not already present
teacher = Teacher.objects.first()
if not teacher:
    print('[setup-db] No teacher found. Run: python manage.py loaddata or create one manually.')
    exit()

SUBJECTS = [
    (1,  'Fisica I',                     4),
    (3,  'Analisis Matematico II',        9),
    (4,  'Algebra II',                    7),
    (5,  'Algoritmos y Programacion I',   8),
    (6,  'Algoritmos y Programacion II',  7),
    (7,  'Algoritmos y Programacion III', 6),
    (8,  'Quimica I',                     8),
    (9,  'Matematica Discreta',           7),
    (11, 'Laboratorio',                   9),
    (12, 'Estructura del Computador',     8),
    (17, 'Organizacion de Computadoras',  7),
]

existing = FinalExam.objects.filter(student=student, grade__gte=4).count()
if existing >= len(SUBJECTS):
    print(f'[setup-db] {existing} approved subjects already exist, skipping.')
else:
    for siu_id, name, grade in SUBJECTS:
        f = Final.objects.create(
            teacher=teacher,
            date=datetime(2024, 12, 10, tzinfo=timezone.utc),
            subject_siu_id=siu_id,
            subject_name=name,
            status='AS',
        )
        FinalExam.objects.create(final=f, student=student, grade=grade)
    print(f'[setup-db] Created {len(SUBJECTS)} approved subjects.')
PYTHON

echo "[setup-db] Creating SIU test user (Luca)..."
docker-compose -f "$BACKEND_DIR/docker-compose.yml" exec -T web python manage.py shell << 'PYTHON'
from backend.models import User, Student

DNI = '43990892'
EMAIL = 'luca.test@fiuba.ar'
PADRON = '107749'
PASSWORD = 'testpass'

user, created = User.objects.get_or_create(dni=DNI, defaults={'email': EMAIL, 'username': ''})
changed = created
if created or not user.has_usable_password():
    user.set_password(PASSWORD)
    changed = True
if user.is_teacher or user.is_staff:
    user.is_teacher = False
    user.is_staff = False
    changed = True
if not user.is_student:
    user.is_student = True
    changed = True
if changed:
    user.save()
    print(f'[setup-db] Saved Luca user DNI={DNI} as student-only')
else:
    print(f'[setup-db] Luca user DNI={DNI} already configured correctly')

Student.objects.get_or_create(user=user, defaults={'padron': PADRON, 'face_encodings': []})
PYTHON

echo "[setup-db] Done."
