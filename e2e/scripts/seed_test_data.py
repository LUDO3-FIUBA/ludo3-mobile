"""
Seed the local DB with the Playwright e2e test fixture: one student user with
a deterministic set of approved finals.

Designed to be piped into a Django shell from `setup-db.sh`:

    docker-compose exec -T web python manage.py shell < seed_test_data.py

Idempotent: safe to re-run. Existing user/student/finals are reused; only
missing approved finals are inserted.

All test data lives in the constants at the top of this file. Keep
SUBJECT_CODE_FOR_TESTS in sync with what the e2e specs assert on.
"""
import os
from datetime import datetime, timezone

from backend.models import Final, FinalExam, Student, Teacher, User


# ─── Identity ─────────────────────────────────────────────────────────────────
# Credentials come from the shell env (sourced from test-user.env) so the
# TypeScript side (tests/test-config.ts) and this script agree on one value.
DNI = os.environ['TEST_USER_DNI']
EMAIL = os.environ['TEST_USER_EMAIL']
PADRON = os.environ['TEST_USER_PADRON']
PASSWORD = os.environ['TEST_USER_PASSWORD']
FIRST_NAME = os.environ['TEST_USER_FIRST_NAME']
LAST_NAME = os.environ['TEST_USER_LAST_NAME']

# Teacher whose name appears next to each seeded final. Matches one of the
# names academic.spec.ts looks for ('Jorge Collinet' or 'Iribarren').
TEACHER_LAST_NAME = 'Collinet'


# ─── Approved subjects ────────────────────────────────────────────────────────
# (siu_id, subject_name, grade). The SIU code/name displayed by the app comes
# from fake-siu/db.json keyed by siu_id, not from subject_name here.
APPROVED_SUBJECTS = [
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

EXAM_DATE = datetime(2024, 12, 10, tzinfo=timezone.utc)


# ─── Seed ─────────────────────────────────────────────────────────────────────

user = User.objects.filter(dni=DNI).first()
if user is not None:
    print(
        f'[seed] Test user already exists — skipping creation '
        f'(dni={user.dni}, email={user.email}, '
        f'name="{user.first_name} {user.last_name}")'
    )
else:
    user = User.objects.create(
        dni=DNI,
        email=EMAIL,
        username='',
        first_name=FIRST_NAME,
        last_name=LAST_NAME,
        # Required so the frontend (landing/index.tsx) accepts the login —
        # otherwise it throws NotAStudent → "Tu cuenta no tiene permisos
        # para ingresar."
        is_student=True,
    )
    user.set_password(PASSWORD)
    user.save()
    print(
        f'[seed] Test user created '
        f'(dni={user.dni}, email={user.email}, '
        f'name="{user.first_name} {user.last_name}")'
    )

student, _ = Student.objects.get_or_create(
    user=user, defaults={'padron': PADRON, 'face_encodings': []},
)

# Prefer a deterministic teacher so academic.spec.ts can assert on a specific
# name; fall back to any teacher if the preferred one doesn't exist yet.
teacher = (
    Teacher.objects.filter(user__last_name=TEACHER_LAST_NAME).first()
    or Teacher.objects.first()
)
if not teacher:
    print('[seed] No teacher found. Run: python manage.py initdata first.')
    raise SystemExit(1)

created_count = 0
for siu_id, name, grade in APPROVED_SUBJECTS:
    if FinalExam.objects.filter(
        student=student, final__subject_siu_id=siu_id, grade__gte=4,
    ).exists():
        continue
    final = Final.objects.create(
        teacher=teacher,
        date=EXAM_DATE,
        subject_siu_id=siu_id,
        subject_name=name,
        status='AS',
    )
    FinalExam.objects.create(final=final, student=student, grade=grade)
    created_count += 1

print(
    f'[seed] {created_count} new approved subjects inserted '
    f'(of {len(APPROVED_SUBJECTS)} total).'
)
