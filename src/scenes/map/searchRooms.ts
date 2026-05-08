import type { FloorManifest, Room } from './floors/piso4.manifest';

function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
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
