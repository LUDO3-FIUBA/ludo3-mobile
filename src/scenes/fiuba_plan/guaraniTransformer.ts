const SEMANA_IDX: Record<string, number> = {
  domingo: 0,
  lunes: 1,
  martes: 2,
  'miércoles': 3,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  'sábado': 6,
  sabado: 6,
};

function normalizeDia(dia: any): number {
  if (typeof dia === 'string') return SEMANA_IDX[dia.toLowerCase().trim()] ?? -1;
  if (dia && typeof dia === 'object') return normalizeDia(dia.nombre ?? dia.name ?? '');
  return -1;
}

export function guaraniToHorariosSIU(comisiones: any[]): any | null {
  if (!comisiones?.length) return null;

  const materiasMap = new Map<string, { nombre: string; codigo: string; cursos: string[] }>();
  const cursosList: any[] = [];

  for (const com of comisiones) {
    const actividad = com.actividad ?? {};
    const matCodigo = actividad.codigo ?? String(actividad.id ?? com.id ?? '');
    if (!matCodigo) continue;

    const matNombre = actividad.nombre ?? 'Sin nombre';
    const comNombre = com.nombre ?? String(com.id ?? '');
    const comCodigo = `${matCodigo}-${comNombre}`;

    const clases = (com.horarios ?? [])
      .map((h: any) => {
        const dia = normalizeDia(h.dia);
        if (dia < 0) return null;
        return {
          dia,
          inicio: String(h.inicio ?? h.hora_desde ?? '').substring(0, 5),
          fin: String(h.fin ?? h.hora_hasta ?? '').substring(0, 5),
        };
      })
      .filter(Boolean);

    if (!clases.length) continue;

    if (!materiasMap.has(matCodigo)) {
      materiasMap.set(matCodigo, { nombre: matNombre, codigo: matCodigo, cursos: [] });
    }
    materiasMap.get(matCodigo)!.cursos.push(comCodigo);

    const docentes = (com.docentes ?? [])
      .map((d: any) => [d.apellido, d.nombres ?? d.nombre].filter(Boolean).join(' '))
      .join(' / ');

    cursosList.push({ materia: matCodigo, codigo: comCodigo, docentes, clases });
  }

  if (!materiasMap.size) return null;

  const periodo = comisiones.find(c => c.periodo_lectivo?.nombre)?.periodo_lectivo?.nombre ?? 'Oferta actual';

  return {
    periodo,
    materias: Array.from(materiasMap.values()),
    cursos: cursosList,
    timestamp: Date.now(),
  };
}
