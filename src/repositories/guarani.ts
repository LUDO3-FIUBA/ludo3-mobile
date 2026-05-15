import { get } from './authenticatedRepository';

async function fetchOfertaComisiones(actividadCodigo?: string): Promise<any[]> {
    const query = actividadCodigo ? `?actividad_codigo=${encodeURIComponent(actividadCodigo)}` : '';
    const result = await get(`api/guarani/oferta-comisiones${query}`);
    return Array.isArray(result) ? result : (result?.data ?? []);
}

export default { fetchOfertaComisiones };
