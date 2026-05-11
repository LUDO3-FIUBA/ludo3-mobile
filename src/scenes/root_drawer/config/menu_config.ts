import { Platform } from 'react-native';
import User from '../../../models/User';

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
  webOrder?: number;
  mobileOrder?: number;
};

export type SubmenuItem = {
  kind: 'submenu';
  key: string;
  label: string;
  icon: string;
  iconOutline: string;
  children: DirectItem[];
  scope: Scope;
  webOrder?: number;
  mobileOrder?: number;
};

export type MenuItem = DirectItem | SubmenuItem;

// ─── Student ──────────────────────────────────────────────────────────────────

export const studentMenu: MenuItem[] = [
  {
    kind: 'submenu', key: 'user', label: 'Usuario',
    icon: 'account', iconOutline: 'account-outline', scope: 'student',
    webOrder: 5, mobileOrder: 1,
    children: [
      { kind: 'direct', key: 'student-credential', label: 'Mi credencial', icon: 'card-account-details', iconOutline: 'card-account-details-outline', route: 'StudentCredential', scope: 'student' },
      { kind: 'direct', key: 'scan-qr', label: 'Escanear QR', icon: 'qrcode-scan', iconOutline: 'qrcode-scan', route: 'ScanQR', scope: 'student', platform: 'mobile' },
      { kind: 'direct', key: 'verify-identity', label: 'Verificar identidad', icon: 'face-recognition', iconOutline: 'face-recognition', route: 'VerifyIdentity', scope: 'student', platform: 'mobile' },
      { kind: 'direct', key: 'face-registration', label: 'Completar registro facial', icon: 'face-recognition', iconOutline: 'face-recognition', route: 'CompleteFaceRegistration', scope: 'shared', conditional: 'faceNotRegistered', platform: 'mobile' },
      { kind: 'direct', key: 'my-account', label: 'Mi Cuenta', icon: 'account-cog', iconOutline: 'account-cog-outline', route: 'MyAccount', scope: 'shared' },
      { kind: 'direct', key: 'student-useful-links', label: 'Enlaces útiles', icon: 'link-variant', iconOutline: 'link-variant', route: 'StudentUsefulLinks', scope: 'student' },
      { kind: 'direct', key: 'change-password', label: 'Cambiar contraseña', icon: 'lock-reset', iconOutline: 'lock-reset', route: 'ChangePassword', scope: 'shared' },
      { kind: 'direct', key: 'logout', label: 'Cerrar sesión', icon: 'logout-variant', iconOutline: 'logout-variant', action: 'logout', scope: 'shared' },
    ],
  },
  {
    kind: 'submenu', key: 'academic', label: 'Académico',
    icon: 'school', iconOutline: 'school-outline', scope: 'student',
    webOrder: 3, mobileOrder: 2,
    children: [
      { kind: 'direct', key: 'commission-inscriptions', label: 'Materias en curso', icon: 'text-box-multiple', iconOutline: 'text-box-multiple-outline', route: 'CurrentCommissionInscriptions', scope: 'student' },
      { kind: 'direct', key: 'pending-subjects', label: 'Materias pendientes', icon: 'file-clock', iconOutline: 'file-clock-outline', route: 'PendingSubjects', scope: 'student' },
      { kind: 'direct', key: 'approved-subjects', label: 'Materias aprobadas', icon: 'text-box-check', iconOutline: 'text-box-check-outline', route: 'ApprovedSubjects', scope: 'student' },
      { kind: 'direct', key: 'student-stats', label: 'Estadísticas', icon: 'chart-box', iconOutline: 'chart-box-outline', route: 'StudentStats', scope: 'student' },
      { kind: 'direct', key: 'departments', label: 'Departamentos', icon: 'office-building', iconOutline: 'office-building-outline', route: 'StudentDepartmentList', scope: 'shared' },
      { kind: 'direct', key: 'student-procedures', label: 'Trámites', icon: 'file-document-edit', iconOutline: 'file-document-edit-outline', route: 'FormsList', scope: 'student' },
    ],
  },
  {
    kind: 'direct', key: 'home', label: 'Inicio',
    icon: 'home', iconOutline: 'home-outline',
    route: 'Home', scope: 'student',
    webOrder: 1, mobileOrder: 3,
  },
  {
    kind: 'direct', key: 'calendar', label: 'Calendario',
    icon: 'calendar', iconOutline: 'calendar-outline',
    route: 'Calendar', scope: 'student',
    webOrder: 2, mobileOrder: 4,
  },
  { kind: 'direct', key: 'map', label: 'Mapa', icon: 'map', iconOutline: 'map-outline', route: 'Map', scope: 'student', webOrder: 4, mobileOrder: 5 },
];

// ─── Teacher ──────────────────────────────────────────────────────────────────

export const teacherMenu: MenuItem[] = [
  {
    kind: 'submenu', key: 'user', label: 'Usuario',
    icon: 'account', iconOutline: 'account-outline', scope: 'teacher',
    webOrder: 3, mobileOrder: 1,
    children: [
      { kind: 'direct', key: 'teacher-profile', label: 'Mi perfil profesional', icon: 'account-details', iconOutline: 'account-details-outline', route: 'TeacherProfile', scope: 'teacher' },
      { kind: 'direct', key: 'my-account', label: 'Mi Cuenta', icon: 'account-cog', iconOutline: 'account-cog-outline', route: 'MyAccount', scope: 'shared' },
      { kind: 'direct', key: 'teacher-useful-links', label: 'Enlaces útiles', icon: 'link-variant', iconOutline: 'link-variant', route: 'TeacherUsefulLinks', scope: 'teacher' },
      { kind: 'direct', key: 'change-password', label: 'Cambiar contraseña', icon: 'lock-reset', iconOutline: 'lock-reset', route: 'ChangePassword', scope: 'shared' },
      { kind: 'direct', key: 'logout', label: 'Cerrar sesión', icon: 'logout-variant', iconOutline: 'logout-variant', action: 'logout', scope: 'shared' },
    ],
  },
  {
    kind: 'direct', key: 'teacher-home', label: 'Mis Comisiones',
    icon: 'home', iconOutline: 'home-outline',
    route: 'TeacherHome', scope: 'teacher',
    webOrder: 1, mobileOrder: 2,
  },
  {
    kind: 'submenu', key: 'academic', label: 'Académico',
    icon: 'school', iconOutline: 'school-outline', scope: 'teacher',
    webOrder: 2, mobileOrder: 3,
    children: [
      { kind: 'direct', key: 'create-semester', label: 'Crear cuatrimestre', icon: 'plus-circle', iconOutline: 'plus-circle-outline', route: 'CreateSemester', scope: 'teacher' },
      { kind: 'direct', key: 'departments', label: 'Departamentos', icon: 'office-building', iconOutline: 'office-building-outline', route: 'StudentDepartmentList', scope: 'shared' },
      { kind: 'direct', key: 'teacher-procedures', label: 'Validación de trámites', icon: 'clipboard-check', iconOutline: 'clipboard-check-outline', route: 'TeacherForms', scope: 'teacher' },
    ],
  },
];

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminMenu: MenuItem[] = [
  {
    kind: 'submenu', key: 'user', label: 'Usuario',
    icon: 'account', iconOutline: 'account-outline', scope: 'shared',
    webOrder: 3, mobileOrder: 1,
    children: [
      { kind: 'direct', key: 'change-password', label: 'Cambiar contraseña', icon: 'lock-reset', iconOutline: 'lock-reset', route: 'ChangePassword', scope: 'shared' },
      { kind: 'direct', key: 'logout', label: 'Cerrar sesión', icon: 'logout-variant', iconOutline: 'logout-variant', action: 'logout', scope: 'shared' },
    ],
  },
  {
    kind: 'submenu', key: 'academic', label: 'Académico',
    icon: 'school', iconOutline: 'school-outline', scope: 'shared',
    webOrder: 2, mobileOrder: 2,
    children: [
      { kind: 'direct', key: 'admin-departments', label: 'Departamentos', icon: 'office-building', iconOutline: 'office-building-outline', route: 'AdminDepartmentList', scope: 'shared' },
      { kind: 'direct', key: 'admin-commissions', label: 'Comisiones', icon: 'account-group', iconOutline: 'account-group-outline', route: 'AdminCommissionList', scope: 'shared' },
      { kind: 'direct', key: 'admin-user-search', label: 'Buscar Usuarios', icon: 'account-search', iconOutline: 'account-search-outline', route: 'AdminUserSearch', scope: 'shared' },
      { kind: 'direct', key: 'admin-procedures', label: 'Gestor de Trámites', icon: 'clipboard-list', iconOutline: 'clipboard-list-outline', route: 'FormsManager', scope: 'shared' },
    ],
  },
  {
    kind: 'direct', key: 'admin-notifications', label: 'Avisos',
    icon: 'bell', iconOutline: 'bell-outline',
    route: 'AdminNotificationList', scope: 'shared',
    webOrder: 1, mobileOrder: 3,
  },
];

// ─── Hidden Web Routes ────────────────────────────────────────────────────────

export type HiddenWebRoute = {
  route: string;
  title: string;
  /** If set, only register for users with this role. Undefined = all authenticated users. */
  roleFilter?: 'student' | 'teacher' | 'admin';
};

export const hiddenWebRoutes: HiddenWebRoute[] = [
  { route: 'AdminDepartmentDetail', title: 'Departamento', roleFilter: 'admin' },
  { route: 'AdminDepartmentCreate', title: 'Nuevo Departamento', roleFilter: 'admin' },
  { route: 'AdminDepartmentEdit', title: 'Editar Departamento', roleFilter: 'admin' },
  { route: 'AdminCommissionCreate', title: 'Nueva Comisión', roleFilter: 'admin' },
  { route: 'AdminCommissionDetail', title: 'Comisión', roleFilter: 'admin' },
  { route: 'AdminCommissionEdit', title: 'Editar Comisión', roleFilter: 'admin' },
  { route: 'AdminUserDetail', title: 'Usuario', roleFilter: 'admin' },
  { route: 'AdminNotificationCreate', title: 'Nuevo Aviso', roleFilter: 'admin' },
  { route: 'Notifications', title: 'Notificaciones' },
];

// ─── Public API ───────────────────────────────────────────────────────────────

function visibleOnPlatform(platform?: 'mobile' | 'web'): boolean {
  if (platform === 'mobile') return Platform.OS !== 'web';
  if (platform === 'web') return Platform.OS === 'web';
  return true;
}

function sortByPlatformOrder(items: MenuItem[]): MenuItem[] {
  const isWeb = Platform.OS === 'web';
  return [...items].sort((a, b) => {
    const orderA = (isWeb ? a.webOrder : a.mobileOrder) ?? Infinity;
    const orderB = (isWeb ? b.webOrder : b.mobileOrder) ?? Infinity;
    return orderA - orderB;
  });
}

/** Teacher menu for toggle mode: excludes shared nav items already in student menu. */
function buildTeacherMenuForToggle(): MenuItem[] {
  return teacherMenu.map(item => {
    if (item.kind === 'submenu' && item.key === 'academic') {
      return {
        ...item,
        children: (item as SubmenuItem).children.filter(c => c.key !== 'departments'),
      };
    }
    return item;
  });
}

export function canToggleRole(user: User): boolean {
  return user.isStudent() && user.isTeacher() && !user.isAdmin();
}

/**
 * @param roleOverride  When provided for a dual-role user, returns
 *   the single-role menu.
 */
export function resolveMenu(user: User, roleOverride?: 'student' | 'teacher'): MenuItem[] {
  let raw: MenuItem[];

  if (user.isAdmin()) {
    raw = adminMenu;
  } else if (roleOverride === 'student') {
    raw = studentMenu;
  } else if (roleOverride === 'teacher') {
    raw = buildTeacherMenuForToggle();
  } else if (user.isTeacher() && !user.isStudent()) {
    raw = teacherMenu;
  } else {
    raw = studentMenu;
  }

  const filtered = raw
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

  return sortByPlatformOrder(filtered);
}
