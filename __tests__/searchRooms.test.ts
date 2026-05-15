import { describe, it, expect } from '@jest/globals';

import { searchRooms, searchAllFloors } from '../src/scenes/map/searchRooms';
import type { FloorManifest, Room } from '../src/scenes/map/floors/types';
import type { FloorEntry } from '../src/scenes/map/floors/index';

// Mirrors the script's `buildAliases` output: pre-normalized, lowercased, no diacritics.
function makeRoom(id: string, aliases: string[]): Room {
  return {
    id,
    label: id,
    aliases,
    category: 'otro',
    bbox: { x: 0, y: 0, width: 1, height: 1 },
    shapeId: id,
  };
}

function makeManifest(rooms: Room[]): FloorManifest {
  return { floorId: 'test', viewBox: [0, 0, 100, 100], rooms };
}

function makeFloor(id: string, label: string, rooms: Room[]): FloorEntry {
  return { id, label, svgXml: '', manifest: { ...makeManifest(rooms), floorId: id } };
}

describe('searchRooms', () => {
  const manifest = makeManifest([
    makeRoom('aula-101', ['aula 101', '101']),
    makeRoom('aula-102', ['aula 102', '102']),
    makeRoom('bano-hombres', ['bano hombres']),
    makeRoom('lab-redes', ['laboratorio de redes']),
    makeRoom('sala-reuniones', ['sala de reuniones']),
  ]);

  it('returns empty array for an empty query', () => {
    expect(searchRooms(manifest, '')).toEqual([]);
  });

  it('returns empty array for whitespace-only query', () => {
    expect(searchRooms(manifest, '   ')).toEqual([]);
  });

  it('returns empty array when nothing matches', () => {
    expect(searchRooms(manifest, 'xyzzy')).toEqual([]);
  });

  it('finds an exact alias match', () => {
    const results = searchRooms(manifest, '101');
    expect(results[0].id).toBe('aula-101');
  });

  it('normalizes the query: case-insensitive', () => {
    const results = searchRooms(manifest, 'AULA 101');
    expect(results[0].id).toBe('aula-101');
  });

  it('normalizes the query: strips diacritics', () => {
    // "baño" → "bano" should match the pre-normalized alias.
    const results = searchRooms(manifest, 'BAÑO HOMBRES');
    expect(results[0].id).toBe('bano-hombres');
  });

  it('ranks exact match above prefix match', () => {
    const m = makeManifest([
      makeRoom('a', ['ab']),       // prefix
      makeRoom('b', ['a']),        // exact
    ]);
    const results = searchRooms(m, 'a');
    expect(results.map(r => r.id)).toEqual(['b', 'a']);
  });

  it('ranks prefix match above substring match', () => {
    const m = makeManifest([
      makeRoom('a', ['xab']),  // substring contains "ab"
      makeRoom('b', ['abc']),  // starts with "ab"
    ]);
    const results = searchRooms(m, 'ab');
    expect(results.map(r => r.id)).toEqual(['b', 'a']);
  });

  it('falls back to fuzzy match within Levenshtein distance 2', () => {
    const results = searchRooms(manifest, 'aua 101'); // missing "l"
    expect(results.map(r => r.id)).toContain('aula-101');
  });

  it('does not match when Levenshtein distance exceeds 2', () => {
    const m = makeManifest([makeRoom('a', ['hello'])]);
    expect(searchRooms(m, 'world')).toEqual([]);
  });

  it('respects the limit parameter', () => {
    const m = makeManifest([
      makeRoom('a', ['lab']),
      makeRoom('b', ['lab']),
      makeRoom('c', ['lab']),
    ]);
    expect(searchRooms(m, 'lab', 2)).toHaveLength(2);
  });

  it('defaults limit to 8', () => {
    const rooms = Array.from({ length: 12 }, (_, i) => makeRoom(`r${i}`, ['lab']));
    expect(searchRooms(makeManifest(rooms), 'lab')).toHaveLength(8);
  });
});

describe('searchAllFloors', () => {
  it('returns empty array for an empty query', () => {
    const floors = [makeFloor('p4', 'Piso 4', [makeRoom('a', ['aula 101'])])];
    expect(searchAllFloors(floors, '')).toEqual([]);
  });

  it('attaches floorId and floorLabel to each result', () => {
    const floors = [makeFloor('p4', 'Piso 4', [makeRoom('aula-101', ['aula 101'])])];
    const results = searchAllFloors(floors, 'aula 101');
    expect(results[0]).toMatchObject({
      id: 'aula-101',
      floorId: 'p4',
      floorLabel: 'Piso 4',
    });
  });

  it('merges matches from multiple floors', () => {
    const floors = [
      makeFloor('p4', 'Piso 4', [makeRoom('aula-101', ['aula 101'])]),
      makeFloor('ss1', 'Subsuelo 1', [makeRoom('aula-102', ['aula 102'])]),
    ];
    const results = searchAllFloors(floors, 'aula');
    const ids = results.map(r => r.id);
    expect(ids).toContain('aula-101');
    expect(ids).toContain('aula-102');
  });

  it('orders by score descending across floors', () => {
    const floors = [
      // p4 contributes only a substring match (score 2)
      makeFloor('p4', 'Piso 4', [makeRoom('a', ['xlabx'])]),
      // ss1 contributes an exact match (score 4)
      makeFloor('ss1', 'SS1', [makeRoom('b', ['lab'])]),
    ];
    const results = searchAllFloors(floors, 'lab');
    expect(results.map(r => r.id)).toEqual(['b', 'a']);
  });

  it('alternates floors on score ties (fewer-taken wins)', () => {
    const floors = [
      makeFloor('p4', 'Piso 4', [
        makeRoom('p4-a', ['lab']),
        makeRoom('p4-b', ['lab']),
      ]),
      makeFloor('ss1', 'SS1', [
        makeRoom('ss1-a', ['lab']),
        makeRoom('ss1-b', ['lab']),
      ]),
    ];
    const results = searchAllFloors(floors, 'lab');
    // All four rooms tie on score 4 (exact). Expected interleave by floor.
    expect(results.map(r => r.floorId)).toEqual(['p4', 'ss1', 'p4', 'ss1']);
  });

  it('respects the limit parameter', () => {
    const floors = [
      makeFloor('p4', 'Piso 4', [
        makeRoom('a', ['lab']),
        makeRoom('b', ['lab']),
        makeRoom('c', ['lab']),
      ]),
    ];
    expect(searchAllFloors(floors, 'lab', 2)).toHaveLength(2);
  });

  it('drains floors with fewer matches without leaving gaps', () => {
    const floors = [
      makeFloor('p4', 'Piso 4', [makeRoom('only', ['lab'])]),
      makeFloor('ss1', 'SS1', [
        makeRoom('a', ['lab']),
        makeRoom('b', ['lab']),
        makeRoom('c', ['lab']),
      ]),
    ];
    const results = searchAllFloors(floors, 'lab');
    expect(results).toHaveLength(4);
    expect(results.map(r => r.id).sort()).toEqual(['a', 'b', 'c', 'only']);
  });

  it('returns empty when no floor has matches', () => {
    const floors = [
      makeFloor('p4', 'Piso 4', [makeRoom('a', ['aula'])]),
      makeFloor('ss1', 'SS1', [makeRoom('b', ['oficina'])]),
    ];
    expect(searchAllFloors(floors, 'biblioteca')).toEqual([]);
  });
});
