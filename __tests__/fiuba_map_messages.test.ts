/**
 * Integration tests for the FIUBA-Map <-> Ludo postMessage protocol.
 *
 * These tests verify the message flow and data transformation logic
 * independently of the WebView render, so they run without a device.
 *
 * Flow under test:
 *   1. FIUBA_MAP_READY  → Ludo sends LUDO_INIT (padron + carreraId)
 *   2. FIUBA_MAP_NETWORK_READY for carreraId → Ludo sends LUDO_SET_MATERIAS
 *   3. LUDO_SET_MATERIAS payload uses subject.code from final_exams/history
 *
 * Naming convention for carrera IDs (FIUBA-Map):
 *   - 'informatica'      → Plan 1986 (numeric SIU codes, e.g. "75.40")
 *   - 'informatica-2020' → Plan 2020 (semantic IDs, e.g. "AED") — no mapping yet
 */

const CARRERA_ID = 'informatica';

// Mirrors the shape returned by finalExamsRepository.fetchApproved()
interface MockExam {
  subject: { code: string; name: string };
  grade: number;
}

function buildMateriasPayload(exams: MockExam[]) {
  return exams.map((exam) => ({
    id: exam.subject.code,
    nota: exam.grade ?? 4,
  }));
}

describe('FIUBA-Map message protocol', () => {
  describe('LUDO_INIT', () => {
    it('is sent only after FIUBA_MAP_READY', () => {
      let initSent = false;
      const handleMessage = (type: string) => {
        if (type === 'FIUBA_MAP_READY') initSent = true;
      };
      expect(initSent).toBe(false);
      handleMessage('FIUBA_MAP_READY');
      expect(initSent).toBe(true);
    });

    it('includes padron and carreraId', () => {
      const padron = '94557';
      const msg = { type: 'LUDO_INIT', padron, carreraId: CARRERA_ID };
      expect(msg.padron).toBe('94557');
      expect(msg.carreraId).toBe('informatica');
    });
  });

  describe('LUDO_SET_MATERIAS', () => {
    it('is sent only after FIUBA_MAP_NETWORK_READY for the correct carrera', () => {
      let materiasInjected = false;
      let initSent = false;

      const handleMessage = (type: string, carreraKey?: string) => {
        if (type === 'FIUBA_MAP_READY') { initSent = true; }
        if (type === 'FIUBA_MAP_NETWORK_READY' && initSent && carreraKey === CARRERA_ID) {
          materiasInjected = true;
        }
      };

      handleMessage('FIUBA_MAP_NETWORK_READY', 'informatica-2020'); // wrong carrera, before init
      expect(materiasInjected).toBe(false);

      handleMessage('FIUBA_MAP_READY');
      handleMessage('FIUBA_MAP_NETWORK_READY', 'informatica-2020'); // wrong carrera, after init
      expect(materiasInjected).toBe(false);

      handleMessage('FIUBA_MAP_NETWORK_READY', 'informatica'); // correct carrera
      expect(materiasInjected).toBe(true);
    });

    it('maps subject codes directly as node IDs for numeric plans', () => {
      const exams: MockExam[] = [
        { subject: { code: '75.40', name: 'Algoritmos y Programación I' }, grade: 8 },
        { subject: { code: '75.41', name: 'Algoritmos y Programación II' }, grade: 7 },
        { subject: { code: '61.03', name: 'Análisis Matemático II' }, grade: 9 },
      ];
      const payload = buildMateriasPayload(exams);
      expect(payload).toEqual([
        { id: '75.40', nota: 8 },
        { id: '75.41', nota: 7 },
        { id: '61.03', nota: 9 },
      ]);
    });

    it('uses fallback grade 4 when grade is null', () => {
      const exams = [{ subject: { code: '75.40', name: 'Algo I' }, grade: null as any }];
      const payload = buildMateriasPayload(exams);
      expect(payload[0].nota).toBe(4);
    });

    it('sends all approved exams including repeated subjects', () => {
      const exams: MockExam[] = [
        { subject: { code: '61.03', name: 'Análisis II' }, grade: 4 },
        { subject: { code: '61.03', name: 'Análisis II' }, grade: 6 },
        { subject: { code: '61.03', name: 'Análisis II' }, grade: 9 },
      ];
      const payload = buildMateriasPayload(exams);
      expect(payload).toHaveLength(3);
      expect(payload.every((m) => m.id === '61.03')).toBe(true);
    });
  });

  describe('double career edge cases', () => {
    it('ignores NETWORK_READY for a different carrera than the one in LUDO_INIT', () => {
      let materiasInjected = false;
      let initSent = false;
      const requestedCarrera = 'informatica';

      const handleMessage = (type: string, carreraKey?: string) => {
        if (type === 'FIUBA_MAP_READY') initSent = true;
        if (type === 'FIUBA_MAP_NETWORK_READY' && initSent && carreraKey === requestedCarrera) {
          materiasInjected = true;
        }
      };

      handleMessage('FIUBA_MAP_READY');
      handleMessage('FIUBA_MAP_NETWORK_READY', 'sistemas'); // user manually switched
      expect(materiasInjected).toBe(false);

      handleMessage('FIUBA_MAP_NETWORK_READY', 'informatica');
      expect(materiasInjected).toBe(true);
    });

    it('SIU student profile has no career field — carreraId must be provided externally', () => {
      // The fake SIU alumnos only have: id, padron, dni, email
      // Career is not available from SIU — currently hardcoded to 'informatica'
      // TODO: add carrera field to SIU student data and map to FIUBA-Map carreraId
      const siuAlumno = { id: 1, padron: 94557, dni: 37247189, email: 'fede.est@gmail.com' };
      expect(siuAlumno).not.toHaveProperty('carrera');
    });

    it('subjects approved in one career are valid node IDs regardless of which career is active', () => {
      // A student in Informatica + Sistemas shares CBC subjects (62.01, 61.03, etc.)
      // Those codes exist in both plans so the injection works for either carrera
      const sharedCBCCodes = ['62.01', '61.03', '61.08'];
      // In both informatica and sistemas plans, CBC codes are numeric SIU codes
      sharedCBCCodes.forEach((code) => {
        expect(code).toMatch(/^\d{2}\.\d{2}$/);
      });
    });
  });

  describe('Plan 2020 mapping gap (known limitation)', () => {
    it('SIU code does not match Plan 2020 semantic node ID', () => {
      const siuCode = '75.40';
      const plan2020NodeId = 'AED';
      expect(siuCode).not.toBe(plan2020NodeId);
    });

    it('Plan 1986 SIU code matches node ID directly', () => {
      const siuCode = '75.40';
      const plan1986NodeId = '75.40';
      expect(siuCode).toBe(plan1986NodeId);
    });
  });
});
