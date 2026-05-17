import { describe, it, expect } from '@jest/globals';
import { guaraniToHorariosSIU } from '../src/scenes/fiuba_plan/guaraniTransformer';

function makeComision(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    nombre: 'A',
    actividad: { id: 75, codigo: '75.01', nombre: 'Análisis Matemático I' },
    horarios: [{ dia: 'Lunes', inicio: '08:00:00', fin: '12:00:00' }],
    docentes: [{ apellido: 'García', nombres: 'Juan' }],
    ...overrides,
  };
}

describe('guaraniToHorariosSIU', () => {

  // ── Casos vacíos ────────────────────────────────────────────────────────────

  it('devuelve null para array vacío', () => {
    expect(guaraniToHorariosSIU([])).toBeNull();
  });

  it('devuelve null si ninguna comisión tiene horarios', () => {
    const com = makeComision({ horarios: [] });
    expect(guaraniToHorariosSIU([com])).toBeNull();
  });

  it('devuelve null si todos los días son inválidos', () => {
    const com = makeComision({ horarios: [{ dia: 'Xueves', inicio: '08:00', fin: '10:00' }] });
    expect(guaraniToHorariosSIU([com])).toBeNull();
  });

  // ── Transformación básica ───────────────────────────────────────────────────

  it('devuelve periodo, materias y cursos para una comisión válida', () => {
    const result = guaraniToHorariosSIU([makeComision()]);
    expect(result).not.toBeNull();
    expect(result!.materias).toHaveLength(1);
    expect(result!.cursos).toHaveLength(1);
  });

  it('usa periodo_lectivo.nombre de la primera comisión que lo tenga', () => {
    const com = makeComision({ periodo_lectivo: { periodo_lectivo: 71, nombre: '1er Cuatrimestre 2026' } });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.periodo).toBe('1er Cuatrimestre 2026');
  });

  it('cae a "Oferta actual" si ninguna comisión tiene periodo_lectivo', () => {
    const result = guaraniToHorariosSIU([makeComision()]);
    expect(result!.periodo).toBe('Oferta actual');
  });

  it('mapea correctamente el código y nombre de la materia', () => {
    const result = guaraniToHorariosSIU([makeComision()]);
    expect(result!.materias[0]).toMatchObject({ codigo: '75.01', nombre: 'Análisis Matemático I' });
  });

  it('el código del curso combina materia y comisión', () => {
    const result = guaraniToHorariosSIU([makeComision({ nombre: 'B' })]);
    expect(result!.cursos[0].codigo).toBe('75.01-B');
  });

  it('trunca inicio y fin a HH:MM', () => {
    const result = guaraniToHorariosSIU([makeComision()]);
    const clase = result!.cursos[0].clases[0];
    expect(clase.inicio).toBe('08:00');
    expect(clase.fin).toBe('12:00');
  });

  // ── Normalización de días ───────────────────────────────────────────────────

  it.each([
    ['Lunes', 1],
    ['MARTES', 2],
    ['miércoles', 3],
    ['miercoles', 3],
    ['Jueves', 4],
    ['viernes', 5],
    ['Sábado', 6],
    ['sabado', 6],
    ['Domingo', 0],
  ])('normaliza "%s" a índice %d', (dia, idx) => {
    const com = makeComision({ horarios: [{ dia, inicio: '08:00', fin: '10:00' }] });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.cursos[0].clases[0].dia).toBe(idx);
  });

  it('descarta clases con día desconocido y mantiene las válidas', () => {
    const com = makeComision({
      horarios: [
        { dia: 'Lunes', inicio: '08:00', fin: '10:00' },
        { dia: 'Xueves', inicio: '14:00', fin: '16:00' },
      ],
    });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.cursos[0].clases).toHaveLength(1);
    expect(result!.cursos[0].clases[0].dia).toBe(1);
  });

  // ── Docentes ────────────────────────────────────────────────────────────────

  it('formatea un docente como "Apellido Nombres"', () => {
    const result = guaraniToHorariosSIU([makeComision()]);
    expect(result!.cursos[0].docentes).toBe('García Juan');
  });

  it('formatea múltiples docentes separados por " / "', () => {
    const com = makeComision({
      docentes: [
        { apellido: 'García', nombres: 'Juan' },
        { apellido: 'López', nombres: 'Ana' },
      ],
    });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.cursos[0].docentes).toBe('García Juan / López Ana');
  });

  it('omite nombres si no existe el campo', () => {
    const com = makeComision({ docentes: [{ apellido: 'García' }] });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.cursos[0].docentes).toBe('García');
  });

  it('tolera lista de docentes vacía', () => {
    const com = makeComision({ docentes: [] });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.cursos[0].docentes).toBe('');
  });

  // ── Agrupación por materia ──────────────────────────────────────────────────

  it('agrupa dos comisiones de la misma materia bajo una sola entrada', () => {
    const comA = makeComision({ nombre: 'A' });
    const comB = makeComision({ nombre: 'B' });
    const result = guaraniToHorariosSIU([comA, comB]);
    expect(result!.materias).toHaveLength(1);
    expect(result!.materias[0].cursos).toEqual(['75.01-A', '75.01-B']);
    expect(result!.cursos).toHaveLength(2);
  });

  it('genera entradas separadas para materias distintas', () => {
    const comA = makeComision({ actividad: { codigo: '75.01', nombre: 'AM1' } });
    const comB = makeComision({ actividad: { codigo: '75.02', nombre: 'AM2' }, nombre: 'A' });
    const result = guaraniToHorariosSIU([comA, comB]);
    expect(result!.materias).toHaveLength(2);
  });

  it('omite la comisión sin horarios pero incluye las demás de la misma materia', () => {
    const conHorario = makeComision({ nombre: 'A' });
    const sinHorario = makeComision({ nombre: 'B', horarios: [] });
    const result = guaraniToHorariosSIU([conHorario, sinHorario]);
    expect(result!.cursos).toHaveLength(1);
    expect(result!.materias[0].cursos).toEqual(['75.01-A']);
  });

  // ── Fallbacks de campos ─────────────────────────────────────────────────────

  it('usa actividad.id como código si falta actividad.codigo', () => {
    const com = makeComision({ actividad: { id: 99, nombre: 'Sin código' } });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.materias[0].codigo).toBe('99');
  });

  it('acepta hora_desde/hora_hasta como fallback de inicio/fin', () => {
    const com = makeComision({
      horarios: [{ dia: 'Lunes', hora_desde: '10:00:00', hora_hasta: '12:00:00' }],
    });
    const result = guaraniToHorariosSIU([com]);
    expect(result!.cursos[0].clases[0].inicio).toBe('10:00');
    expect(result!.cursos[0].clases[0].fin).toBe('12:00');
  });

  // ── timestamp ───────────────────────────────────────────────────────────────

  it('incluye un timestamp numérico reciente', () => {
    const before = Date.now();
    const result = guaraniToHorariosSIU([makeComision()]);
    const after = Date.now();
    expect(result!.timestamp).toBeGreaterThanOrEqual(before);
    expect(result!.timestamp).toBeLessThanOrEqual(after);
  });
});
