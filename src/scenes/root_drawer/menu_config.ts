import { Platform } from 'react-native';
import User from '../../models/User';

export type Scope = 'student' | 'teacher' | 'shared';

export type DirectItem = {
  kind: 'direct';
  key: string;
  label: string;
  icon: string;
  iconOutline: string;
  route?: string;
  params?: Record<string, unknown>;
  action?: 'logout';
  scope: Scope;
  conditional?: 'faceNotRegistered';
  /** Omit (or leave undefined) to show on both platforms. */
  platform?: 'mobile' | 'web';
};

export type SubmenuItem = {
  kind: 'submenu';
  key: string;
  label: string;
  icon: string;
  iconOutline: string;
  children: DirectItem[];
  scope: Scope;
};

export type MenuItem = DirectItem | SubmenuItem;

// ─── Student ──────────────────────────────────────────────────────────────────

const studentMenu: MenuItem[] = [
  {
    kind: 'direct', key: 'home', label: 'Inicio',
    icon: 'home', iconOutline: 'home-outline',
    route: 'Home', scope: 'student',
  },
  {
    kind: 'submenu', key: 'user', label: 'Usuario',
    icon: 'account', iconOutline: 'account-outline', scope: 'student',
    children: [
      { kind: 'direct', key: 'scan-qr', label: 'Escanear QR', icon: 'qrcode-scan', iconOutline: 'qrcode-scan', route: 'ScanQR', scope: 'student', platform: 'mobile' },
      { kind: 'direct', key: 'verify-identity', label: 'Verificar identidad', icon: 'face-recognition', iconOutline: 'face-recognition', route: 'VerifyIdentity', scope: 'student', platform: 'mobile' },
      { kind: 'direct', key: 'student-credential', label: 'Mi credencial', icon: 'card-account-details', iconOutline: 'card-account-details-outline', route: 'StudentCredential', scope: 'student' },
      { kind: 'direct', key: 'face-registration', label: 'Completar registro facial', icon: 'face-recognition', iconOutline: 'face-recognition', route: 'CompleteFaceRegistration', scope: 'shared', conditional: 'faceNotRegistered', platform: 'mobile' },
      { kind: 'direct', key: 'change-password', label: 'Cambiar contraseña', icon: 'lock-reset', iconOutline: 'lock-reset', route: 'ChangePassword', scope: 'shared' },
      { kind: 'direct', key: 'logout', label: 'Cerrar sesión', icon: 'logout-variant', iconOutline: 'logout-variant', action: 'logout', scope: 'shared' },
    ],
  },
  {
    kind: 'submenu', key: 'academic', label: 'Académico',
    icon: 'school', iconOutline: 'school-outline', scope: 'student',
    children: [
      { kind: 'direct', key: 'commission-inscriptions', label: 'Materias en curso', icon: 'text-box-multiple', iconOutline: 'text-box-multiple-outline', route: 'CurrentCommissionInscriptions', scope: 'student' },
      { kind: 'direct', key: 'pending-subjects', label: 'Materias pendientes', icon: 'file-clock', iconOutline: 'file-clock-outline', route: 'PendingSubjects', scope: 'student' },
      { kind: 'direct', key: 'approved-subjects', label: 'Materias aprobadas', icon: 'text-box-check', iconOutline: 'text-box-check-outline', route: 'ApprovedSubjects', scope: 'student' },
      { kind: 'direct', key: 'student-stats', label: 'Estadísticas', icon: 'chart-box', iconOutline: 'chart-box-outline', route: 'StudentStats', scope: 'student' },
      { kind: 'direct', key: 'departments', label: 'Departamentos', icon: 'office-building', iconOutline: 'office-building-outline', route: 'StudentDepartmentList', scope: 'shared' },
      { kind: 'direct', key: 'student-procedures', label: 'Trámites', icon: 'file-document-edit', iconOutline: 'file-document-edit-outline', route: 'StudentProcedures', scope: 'student' },
    ],
  },
  {
    kind: 'direct', key: 'calendar', label: 'Calendario',
    icon: 'calendar', iconOutline: 'calendar-outline',
    route: 'Calendar', scope: 'student',
  },
  // { kind: 'direct', key: 'map', label: 'Mapa', icon: 'map', iconOutline: 'map-outline', route: 'Map', scope: 'student' }, // Next feature
];

// ─── Teacher ──────────────────────────────────────────────────────────────────

const teacherMenu: MenuItem[] = [
  {
    kind: 'direct', key: 'teacher-home', label: 'Mis Comisiones',
    icon: 'home', iconOutline: 'home-outline',
    route: 'TeacherHome', scope: 'teacher',
  },
  {
    kind: 'submenu', key: 'user', label: 'Usuario',
    icon: 'account', iconOutline: 'account-outline', scope: 'teacher',
    children: [
      { kind: 'direct', key: 'teacher-profile', label: 'Mi perfil profesional', icon: 'account-details', iconOutline: 'account-details-outline', route: 'TeacherProfile', scope: 'teacher' },
      { kind: 'direct', key: 'change-password', label: 'Cambiar contraseña', icon: 'lock-reset', iconOutline: 'lock-reset', route: 'ChangePassword', scope: 'shared' },
      { kind: 'direct', key: 'logout', label: 'Cerrar sesión', icon: 'logout-variant', iconOutline: 'logout-variant', action: 'logout', scope: 'shared' },
    ],
  },
  {
    kind: 'submenu', key: 'academic', label: 'Académico',
    icon: 'school', iconOutline: 'school-outline', scope: 'teacher',
    children: [
      { kind: 'direct', key: 'create-semester', label: 'Crear cuatrimestre', icon: 'plus-circle', iconOutline: 'plus-circle-outline', route: 'CreateSemester', scope: 'teacher' },
      { kind: 'direct', key: 'departments', label: 'Departamentos', icon: 'office-building', iconOutline: 'office-building-outline', route: 'StudentDepartmentList', scope: 'shared' },
      { kind: 'direct', key: 'teacher-procedures', label: 'Validación de trámites', icon: 'clipboard-check', iconOutline: 'clipboard-check-outline', route: 'TeacherProceduresValidation', scope: 'teacher' },
    ],
  },
];

// ─── Admin ────────────────────────────────────────────────────────────────────

const adminMenu: MenuItem[] = [
  {
    kind: 'submenu', key: 'user', label: 'Usuario',
    icon: 'account', iconOutline: 'account-outline', scope: 'shared',
    children: [
      { kind: 'direct', key: 'change-password', label: 'Cambiar contraseña', icon: 'lock-reset', iconOutline: 'lock-reset', route: 'ChangePassword', scope: 'shared' },
      { kind: 'direct', key: 'logout', label: 'Cerrar sesión', icon: 'logout-variant', iconOutline: 'logout-variant', action: 'logout', scope: 'shared' },
    ],
  },
  {
    kind: 'submenu', key: 'academic', label: 'Académico',
    icon: 'school', iconOutline: 'school-outline', scope: 'shared',
    children: [
      { kind: 'direct', key: 'admin-departments', label: 'Departamentos', icon: 'office-building', iconOutline: 'office-building-outline', route: 'AdminDepartmentList', scope: 'shared' },
      { kind: 'direct', key: 'admin-commissions', label: 'Comisiones', icon: 'account-group', iconOutline: 'account-group-outline', route: 'AdminCommissionList', scope: 'shared' },
      { kind: 'direct', key: 'admin-user-search', label: 'Buscar Usuarios', icon: 'account-search', iconOutline: 'account-search-outline', route: 'AdminUserSearch', scope: 'shared' },
      { kind: 'direct', key: 'admin-procedures', label: 'Gestor de Trámites', icon: 'clipboard-list', iconOutline: 'clipboard-list-outline', route: 'AdminProceduresManager', scope: 'shared' },
    ],
  },
  {
    kind: 'direct', key: 'admin-notifications', label: 'Avisos',
    icon: 'bell', iconOutline: 'bell-outline',
    route: 'AdminNotificationList', scope: 'shared',
  },
];

// ─── Merged Student + Teacher ─────────────────────────────────────────────────

function buildMergedMenu(): MenuItem[] {
  const studentUser = studentMenu.find(i => i.kind === 'submenu' && i.key === 'user') as SubmenuItem;
  const teacherUser = teacherMenu.find(i => i.kind === 'submenu' && i.key === 'user') as SubmenuItem;
  const studentAcademic = studentMenu.find(i => i.kind === 'submenu' && i.key === 'academic') as SubmenuItem;
  const teacherAcademic = teacherMenu.find(i => i.kind === 'submenu' && i.key === 'academic') as SubmenuItem;

  const sharedUserItems = studentUser.children.filter(c => c.key === 'change-password' || c.key === 'logout');
  const studentOnlyUserItems = studentUser.children.filter(c => c.key !== 'change-password' && c.key !== 'logout' && c.key !== 'face-registration');
  const faceItem = studentUser.children.find(c => c.key === 'face-registration')!;
  const teacherOnlyUserItems = teacherUser.children.filter(c => c.key !== 'change-password' && c.key !== 'logout');

  // Mis Comisiones is demoted from top-level tab to first teacher item in Académico
  const teacherHomeMergedItem: DirectItem = {
    kind: 'direct', key: 'teacher-home', label: 'Mis Comisiones',
    icon: 'home', iconOutline: 'home-outline', route: 'TeacherHome', scope: 'teacher',
  };
  const teacherAcademicChildren = teacherAcademic.children.filter(c => c.key !== 'departments');

  return [
    {
      kind: 'direct', key: 'home', label: 'Inicio',
      icon: 'home', iconOutline: 'home-outline', route: 'Home', scope: 'student',
    },
    {
      kind: 'submenu', key: 'user', label: 'Usuario',
      icon: 'account', iconOutline: 'account-outline', scope: 'shared',
      children: [
        ...studentOnlyUserItems,
        faceItem,                  // conditional — filtered later
        ...teacherOnlyUserItems,   // teacher-scoped
        ...sharedUserItems,        // change-password + logout last
      ],
    },
    {
      kind: 'submenu', key: 'academic', label: 'Académico',
      icon: 'school', iconOutline: 'school-outline', scope: 'shared',
      children: [
        ...studentAcademic.children,
        teacherHomeMergedItem,     // teacher-scoped
        ...teacherAcademicChildren, // teacher-scoped items (excl. Departamentos — already in student list)
      ],
    },
    {
      kind: 'direct', key: 'calendar', label: 'Calendario',
      icon: 'calendar', iconOutline: 'calendar-outline', route: 'Calendar', scope: 'student',
    },
    // { kind: 'direct', key: 'map', label: 'Mapa', icon: 'map', iconOutline: 'map-outline', route: 'Map', scope: 'student' }, // Next feature
  ];
}

// ─── Public API ───────────────────────────────────────────────────────────────

function visibleOnPlatform(platform?: 'mobile' | 'web'): boolean {
  if (platform === 'mobile') return Platform.OS !== 'web';
  if (platform === 'web') return Platform.OS === 'web';
  return true;
}

export function isMergedMenu(user: User): boolean {
  return user.isStudent() && user.isTeacher() && !user.isAdmin();
}

export function resolveMenu(user: User): MenuItem[] {
  let raw: MenuItem[];

  if (user.isAdmin()) {
    raw = adminMenu;
  } else if (isMergedMenu(user)) {
    raw = buildMergedMenu();
  } else if (user.isTeacher()) {
    raw = teacherMenu;
  } else {
    raw = studentMenu;
  }

  return raw
    .filter(item => item.kind !== 'direct' || visibleOnPlatform(item.platform))
    .map(item => {
      if (item.kind === 'submenu') {
        return {
          ...item,
          children: item.children.filter(child => {
            if (!visibleOnPlatform(child.platform)) return false;
            if (child.conditional === 'faceNotRegistered') {
              return user.faceRegistered === false;
            }
            return true;
          }),
        };
      }
      return item;
    });
}
