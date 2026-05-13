import type { FloorManifest, Room } from './floors/types';
import type { FloorEntry } from './floors/index';

export type RoomResult = Room & { floorId: string; floorLabel: string };

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[m][n];
}

function scoreRoom(room: Room, q: string): number {
  for (const alias of room.aliases) {
    if (alias === q) return 4;
    if (alias.startsWith(q)) return 3;
    if (alias.includes(q)) return 2;
    if (alias.length > 0 && levenshtein(alias, q) <= 2) return 1;
  }
  return 0;
}

export function searchRooms(manifest: FloorManifest, query: string, limit = 8): Room[] {
  const q = normalize(query);
  if (!q) return [];

  const scored: { room: Room; score: number }[] = [];
  for (const room of manifest.rooms) {
    const score = scoreRoom(room, q);
    if (score > 0) scored.push({ room, score });
  }

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(s => s.room);
}

export function searchAllFloors(floors: FloorEntry[], query: string, limit = 8): RoomResult[] {
  const q = normalize(query);
  if (!q) return [];

  // Score per floor, then sort each floor's matches by score desc.
  const perFloor = floors.map(floor => {
    const items: { room: RoomResult; score: number }[] = [];
    for (const room of floor.manifest.rooms) {
      const score = scoreRoom(room, q);
      if (score > 0) {
        items.push({
          room: { ...room, floorId: floor.id, floorLabel: floor.label },
          score,
        });
      }
    }
    items.sort((a, b) => b.score - a.score);
    return items;
  });

  // Merge: pick head of highest score; ties broken by which floor contributed fewer
  // entries so far, so results alternate across floors when scores are equal.
  const idx = perFloor.map(() => 0);
  const taken = perFloor.map(() => 0);
  const result: RoomResult[] = [];
  while (result.length < limit) {
    let pick = -1;
    for (let i = 0; i < perFloor.length; i++) {
      if (idx[i] >= perFloor[i].length) continue;
      if (pick === -1) { pick = i; continue; }
      const headScore = perFloor[i][idx[i]].score;
      const pickScore = perFloor[pick][idx[pick]].score;
      if (headScore > pickScore) pick = i;
      else if (headScore === pickScore && taken[i] < taken[pick]) pick = i;
    }
    if (pick === -1) break;
    result.push(perFloor[pick][idx[pick]].room);
    idx[pick]++;
    taken[pick]++;
  }
  return result;
}
