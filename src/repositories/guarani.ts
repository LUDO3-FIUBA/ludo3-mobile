import { get } from './authenticatedRepository';

export interface CarreraInfo {
  propuesta: number;
  propuesta_nombre: string;
  fiuba_map_carrera_id: string | null;
}

export interface MateriaAprobada {
  id: string;
  nota: number;
  nombre: string;
}

export interface PlanCarrera {
  carreras: CarreraInfo[];
  materias_aprobadas: MateriaAprobada[];
}

export async function fetchPlanCarrera(): Promise<PlanCarrera> {
  return get('api/guarani/plan-carrera');
}

export default { fetchPlanCarrera };
