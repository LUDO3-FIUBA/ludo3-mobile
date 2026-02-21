export interface TeacherRole {
  id: number;
  shortVersion: string;
  longVersion: string;
}

const teacherRoles: TeacherRole[] = [
  {
    id: 1,
    shortVersion: 'Profesor Titular',
    longVersion: 'Profesor Titular'
  },
  {
    id: 2,
    shortVersion: 'Profesor Asociado',
    longVersion: 'Profesor Asociado'
  },
  {
    id: 3,
    shortVersion: 'Profesor Adjunto',
    longVersion: 'Profesor Adjunto'
  },
  {
    id: 4,
    shortVersion: 'Jefe de Trabajos Prácticos',
    longVersion: 'Jefe de Trabajos Prácticos'
  },
  {
    id: 5,
    shortVersion: 'Ayudante de Primera',
    longVersion: 'Ayudante de Primera'
  },
  {
    id: 6,
    shortVersion: 'Ayudante de Segunda',
    longVersion: 'Ayudante de Segunda'
  }
]

export default teacherRoles;
