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

echo "[setup-db] Adding schedules to Fede's active commissions..."
docker-compose -f "$BACKEND_DIR/docker-compose.yml" exec -T web python manage.py shell << 'PYTHON'
from backend.models import Student, CommissionInscription, SemesterSchedule
from datetime import time

fede = Student.objects.filter(user__dni='37247189').first()
if not fede:
    print('[setup-db] Fede not found, skipping schedules.')
else:
    inscriptions = CommissionInscription.objects.filter(student=fede, status='A').select_related('semester')
    # Schedule data: (semester, day_of_week, start_time, end_time)
    # day_of_week: 0=Mon 1=Tue 2=Wed 3=Thu 4=Fri
    SCHEDULES = [
        # Catedra 1 (semester 8) — Lunes y Miércoles 10-12
        (8, 0, time(10, 0), time(12, 0)),
        (8, 2, time(10, 0), time(12, 0)),
        # Catedra 2 (semester 10) — Martes y Jueves 14-16
        (10, 1, time(14, 0), time(16, 0)),
        (10, 3, time(14, 0), time(16, 0)),
    ]
    created = 0
    for sem_id, day, start, end in SCHEDULES:
        insc = inscriptions.filter(semester_id=sem_id).first()
        if insc and not SemesterSchedule.objects.filter(semester_id=sem_id, day_of_week=day).exists():
            SemesterSchedule.objects.create(semester_id=sem_id, day_of_week=day, start_time=start, end_time=end)
            created += 1
    print(f'[setup-db] Created {created} schedule slots for Fede.')
PYTHON

echo "[setup-db] Adding commission inscriptions and schedules for José..."
docker-compose -f "$BACKEND_DIR/docker-compose.yml" exec -T web python manage.py shell << 'PYTHON'
from backend.models import Student, CommissionInscription, Commission, Semester, SemesterSchedule, Teacher
from datetime import time, datetime, timezone

jose = Student.objects.filter(user__dni='12345678').first()
if not jose:
    print('[setup-db] José not found, skipping.')
else:
    teacher = Teacher.objects.first()
    if not teacher:
        print('[setup-db] No teacher found, skipping José schedules.')
    else:
        # Create or get a commission for José (Bases de Datos, siu_id=9999)
        comm, _ = Commission.objects.get_or_create(
            siu_id=9999,
            defaults={
                'chief_teacher': teacher,
                'subject_siu_id': 61,
                'subject_name': 'Bases de Datos - Catedra 1',
            }
        )
        # Create or get a semester
        sem, _ = Semester.objects.get_or_create(
            commission=comm,
            year_moment='FS',
            defaults={'start_date': datetime(2026, 3, 1, tzinfo=timezone.utc), 'classes_amount': 16}
        )
        # Enroll José with status='A'
        insc, _ = CommissionInscription.objects.get_or_create(
            student=jose, semester=sem,
            defaults={'status': 'A'}
        )
        if insc.status != 'A':
            insc.status = 'A'
            insc.save()
        # José: Lunes y Miércoles 12-14 (gap-friendly with Fede's 10-12 and 14-16)
        created = 0
        for day, start, end in [(0, time(12, 0), time(14, 0)), (2, time(12, 0), time(14, 0))]:
            if not SemesterSchedule.objects.filter(semester=sem, day_of_week=day).exists():
                SemesterSchedule.objects.create(semester=sem, day_of_week=day, start_time=start, end_time=end)
                created += 1
        print(f'[setup-db] Created {created} schedule slots for José (sem_id={sem.id}).')
PYTHON

echo "[setup-db] Creating extra schedule test students (Ana, Carlos, María)..."
docker-compose -f "$BACKEND_DIR/docker-compose.yml" exec -T web python manage.py shell << 'PYTHON'
from backend.models import User, Student, CommissionInscription, Commission, Semester, SemesterSchedule, Teacher
from datetime import time, datetime, timezone

teacher = Teacher.objects.first()

STUDENTS = [
    # (dni, padron, first_name, last_name, siu_id, subject_name, schedules)
    # schedules: list of (day_of_week, start, end)  day: 0=Mon..4=Fri
    ('11000001', '11001', 'Ana',    'García',  9901, 'Algoritmos I - C1',  [(0, time(8,0),  time(10,0)), (3, time(8,0),  time(10,0))]),
    ('22000001', '22001', 'Carlos', 'Pérez',   9902, 'Física II - C1',     [(1, time(10,0), time(12,0)), (3, time(10,0), time(12,0))]),
    ('33000001', '33001', 'María',  'López',   9903, 'Química Org - C1',   [(0, time(10,0), time(12,0))]),
]

for dni, padron, fname, lname, siu_id, subject_name, schedules in STUDENTS:
    user, _ = User.objects.get_or_create(dni=dni, defaults={
        'email': f'{fname.lower()}@fi.uba.ar', 'username': '',
        'first_name': fname, 'last_name': lname, 'is_student': True,
    })
    user.set_password('testpass')
    user.save()
    student, _ = Student.objects.get_or_create(user=user, defaults={'padron': padron, 'face_encodings': []})

    comm, _ = Commission.objects.get_or_create(siu_id=siu_id, defaults={
        'chief_teacher': teacher, 'subject_siu_id': siu_id, 'subject_name': subject_name,
    })
    sem, _ = Semester.objects.get_or_create(commission=comm, year_moment='FS', defaults={
        'start_date': datetime(2026, 3, 1, tzinfo=timezone.utc), 'classes_amount': 16,
    })
    insc, _ = CommissionInscription.objects.get_or_create(student=student, semester=sem, defaults={'status': 'A'})
    if insc.status != 'A':
        insc.status = 'A'; insc.save()

    created = 0
    for day, start, end in schedules:
        if not SemesterSchedule.objects.filter(semester=sem, day_of_week=day).exists():
            SemesterSchedule.objects.create(semester=sem, day_of_week=day, start_time=start, end_time=end)
            created += 1
    print(f'[setup-db] {fname}: {created} new schedule slots (sem_id={sem.id}).')
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
