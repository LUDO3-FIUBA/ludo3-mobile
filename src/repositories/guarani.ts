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

async function fetchOfertaComisiones(actividadCodigo?: string): Promise<any[]> {
  const query = actividadCodigo ? `?actividad_codigo=${encodeURIComponent(actividadCodigo)}` : '';
  const result = await get(`api/guarani/oferta-comisiones${query}`);
  return Array.isArray(result) ? result : ((result as any)?.data ?? []);
}

export default { fetchPlanCarrera, fetchOfertaComisiones };
