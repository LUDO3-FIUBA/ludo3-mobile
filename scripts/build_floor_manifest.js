#!/usr/bin/env node
/* eslint-env node */
// Build script: parses floor SVGs and emits per-floor TS files + floors/index.ts
// Run with: node scripts/build_floor_manifest.js

const fs = require('fs');
const path = require('path');
const { DOMParser } = require('@xmldom/xmldom');

const ASSETS_BASE_DIR = path.resolve(__dirname, '../src/assets');
const OUT_BASE_DIR = path.resolve(__dirname, '../src/scenes/map/floors');

// ─── Building registry ────────────────────────────────────────────────────────
// SVGs are auto-discovered from src/assets/<buildingId>/*.svg.
// Add a building entry here to register a new building; drop SVGs in its folder.
// Output goes to src/scenes/map/floors/<buildingId>/.

const BUILDING_CONFIGS = [
  { buildingId: 'pc', label: 'Paseo Colón',          shortLabel: 'PC' },
  { buildingId: 'lh', label: 'Las Heras',             shortLabel: 'LH' },
  { buildingId: 'cu', label: 'Ciudad Universitaria',  shortLabel: 'CU' },
];

// Derive floor metadata from a SVG filename (e.g. "Piso4.svg" → { floorId: 'piso4', label: 'Piso 4' }).
function discoverFloors(assetsDir) {
  let files;
  try {
    files = fs.readdirSync(assetsDir);
  } catch {
    return [];
  }
  return files
    .filter(f => f.toLowerCase().endsWith('.svg'))
    .sort()
    .map(f => {
      const base = path.basename(f, path.extname(f));
      const floorId = base.toLowerCase();
      const label = base.replace(/([a-zA-Z])(\d)/g, '$1 $2');
      return { floorId, label, svgFile: f };
    });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toCamelId(floorId) {
  return floorId.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function slugify(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripDiacritics(text) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function categorize(label) {
  const u = label.toUpperCase();
  if (u.startsWith('AULA')) return 'aula';
  if (u.startsWith('BAÑO') || u.startsWith('BANO')) return 'bano';
  if (u.startsWith('LAB') || u.startsWith('LABORATORIO')) return 'laboratorio';
  if (u.startsWith('OFICINA') || u.startsWith('SEC.') || u.startsWith('SEC ')) return 'oficina';
  if (u.startsWith('INST.') || u.startsWith('INSTITUTO')) return 'instituto';
  if (u.startsWith('DEPTO') || u.startsWith('DPTO.') || u.startsWith('DEPARTAMENTO')) return 'departamento';
  if (u.startsWith('DEPÓSITO') || u.startsWith('DEPOSITO')) return 'deposito';
  if (u.startsWith('SALA')) return 'sala';
  return 'otro';
}

function buildAliases(label) {
  const base = stripDiacritics(label);
  const aliases = [base];
  const aulaMatch = base.match(/^aula\s+(\d+)$/);
  if (aulaMatch) aliases.push(aulaMatch[1]);
  const noDots = base.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  if (noDots !== base) aliases.push(noDots);
  return [...new Set(aliases)];
}

function rectBbox(el) {
  const x = parseFloat(el.getAttribute('x') || '0');
  const y = parseFloat(el.getAttribute('y') || '0');
  const w = parseFloat(el.getAttribute('width') || '0');
  const h = parseFloat(el.getAttribute('height') || '0');
  if (w <= 0 || h <= 0) return null;
  return { x, y, width: w, height: h };
}

// ─── SVG transform helpers ────────────────────────────────────────────────────
// 2x3 affine matrix [a, b, c, d, e, f]:  [x', y'] = [a c e; b d f] * [x, y, 1]^T

function composeMatrix(a, b) {
  return [
    a[0]*b[0] + a[2]*b[1],
    a[1]*b[0] + a[3]*b[1],
    a[0]*b[2] + a[2]*b[3],
    a[1]*b[2] + a[3]*b[3],
    a[0]*b[4] + a[2]*b[5] + a[4],
    a[1]*b[4] + a[3]*b[5] + a[5],
  ];
}

function applyMatrix(m, x, y) {
  return { x: m[0]*x + m[2]*y + m[4], y: m[1]*x + m[3]*y + m[5] };
}

function parseTransform(str) {
  let m = [1, 0, 0, 1, 0, 0];
  if (!str) return m;
  const re = /(translate|scale|rotate|matrix|skewX|skewY)\s*\(\s*([^)]*)\)/g;
  let match;
  while ((match = re.exec(str)) !== null) {
    const args = match[2].split(/[\s,]+/).filter(Boolean).map(Number);
    let t;
    switch (match[1]) {
      case 'translate':
        t = [1, 0, 0, 1, args[0] || 0, args[1] || 0];
        break;
      case 'scale': {
        const sx = args[0] || 0;
        const sy = args.length > 1 ? args[1] : sx;
        t = [sx, 0, 0, sy, 0, 0];
        break;
      }
      case 'rotate': {
        const rad = ((args[0] || 0) * Math.PI) / 180;
        const cos = Math.cos(rad), sin = Math.sin(rad);
        const r = [cos, sin, -sin, cos, 0, 0];
        if (args.length === 3) {
          const cx = args[1], cy = args[2];
          t = composeMatrix(composeMatrix([1, 0, 0, 1, cx, cy], r), [1, 0, 0, 1, -cx, -cy]);
        } else {
          t = r;
        }
        break;
      }
      case 'matrix':
        t = [args[0]||0, args[1]||0, args[2]||0, args[3]||0, args[4]||0, args[5]||0];
        break;
      case 'skewX': {
        const tan = Math.tan(((args[0] || 0) * Math.PI) / 180);
        t = [1, 0, tan, 1, 0, 0];
        break;
      }
      case 'skewY': {
        const tan = Math.tan(((args[0] || 0) * Math.PI) / 180);
        t = [1, tan, 0, 1, 0, 0];
        break;
      }
      default:
        t = [1, 0, 0, 1, 0, 0];
    }
    m = composeMatrix(m, t);
  }
  return m;
}

// Cumulative transform from `node`'s local coords to root SVG coords.
// Returns null if no ancestor has a transform attribute (caller can skip work).
function elementToRootMatrix(node) {
  const chain = [];
  let cur = node;
  while (cur && cur.nodeType === 1) {
    const t = cur.getAttribute && cur.getAttribute('transform');
    if (t) chain.push(parseTransform(t));
    cur = cur.parentNode;
  }
  if (chain.length === 0) return null;
  let m = [1, 0, 0, 1, 0, 0];
  for (let i = chain.length - 1; i >= 0; i--) m = composeMatrix(m, chain[i]);
  return m;
}

function transformBbox(bbox, m) {
  if (!m) return bbox;
  const corners = [
    applyMatrix(m, bbox.x, bbox.y),
    applyMatrix(m, bbox.x + bbox.width, bbox.y),
    applyMatrix(m, bbox.x, bbox.y + bbox.height),
    applyMatrix(m, bbox.x + bbox.width, bbox.y + bbox.height),
  ];
  const xs = corners.map(c => c.x);
  const ys = corners.map(c => c.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function pathBbox(el) {
  const d = el.getAttribute('d') || '';
  const xs = [], ys = [];
  let curX = 0, curY = 0;
  const tokenRe = /[MmLlHhVvCcSsQqTtAaZz][^MmLlHhVvCcSsQqTtAaZz]*/g;
  const tokens = d.match(tokenRe) || [];
  for (const tok of tokens) {
    const cmd = tok[0];
    const args = tok.slice(1).trim().split(/[\s,]+/).filter(Boolean).map(Number);
    switch (cmd) {
      case 'M': case 'L':
        for (let i = 0; i + 1 < args.length; i += 2) { xs.push(args[i]); ys.push(args[i+1]); curX=args[i]; curY=args[i+1]; }
        break;
      case 'm': case 'l':
        for (let i = 0; i + 1 < args.length; i += 2) { curX+=args[i]; curY+=args[i+1]; xs.push(curX); ys.push(curY); }
        break;
      case 'H': for (const v of args) { xs.push(v); curX=v; } break;
      case 'h': for (const v of args) { curX+=v; xs.push(curX); } break;
      case 'V': for (const v of args) { ys.push(v); curY=v; } break;
      case 'v': for (const v of args) { curY+=v; ys.push(curY); } break;
      case 'C': case 'c': {
        const rel = cmd === 'c';
        for (let i = 0; i + 5 < args.length; i += 6) {
          const ex = rel ? curX + args[i+4] : args[i+4];
          const ey = rel ? curY + args[i+5] : args[i+5];
          xs.push(ex); ys.push(ey); curX=ex; curY=ey;
        }
        break;
      }
    }
  }
  if (xs.length === 0) return null;
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = maxX - minX, h = maxY - minY;
  if (w <= 0 || h <= 0) return null;
  return { x: minX, y: minY, width: w, height: h };
}

function bboxArea(bbox) { return bbox.width * bbox.height; }

function bboxContains(bbox, px, py) {
  return px >= bbox.x && px <= bbox.x + bbox.width &&
         py >= bbox.y && py <= bbox.y + bbox.height;
}

function serializeNode(node) {
  if (node.nodeType === 3) return node.nodeValue || '';
  if (node.nodeType !== 1) return '';
  const tag = node.tagName;
  const attrs = [];
  if (node.attributes) {
    for (let i = 0; i < node.attributes.length; i++) {
      const a = node.attributes[i];
      if (a.name === 'xml:space' || a.name.startsWith('xmlns:')) continue;
      attrs.push(`${a.name}="${a.value.replace(/"/g, '&quot;')}"`);
    }
  }
  const children = [];
  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      children.push(serializeNode(node.childNodes[i]));
    }
  }
  const inner = children.join('');
  if (inner === '') return `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}/>`;
  return `<${tag}${attrs.length ? ' ' + attrs.join(' ') : ''}>${inner}</${tag}>`;
}

function parseViewBox(root) {
  const vb = root.getAttribute('viewBox');
  if (vb) {
    const parts = vb.split(/[\s,]+/).filter(Boolean).map(Number);
    if (parts.length === 4 && parts.every(n => Number.isFinite(n))) {
      return parts;
    }
  }
  const w = parseFloat(root.getAttribute('width') || '');
  const h = parseFloat(root.getAttribute('height') || '');
  if (Number.isFinite(w) && w > 0 && Number.isFinite(h) && h > 0) {
    return [0, 0, w, h];
  }
  throw new Error('SVG root has no usable viewBox or width/height');
}

// ─── Core processor ───────────────────────────────────────────────────────────

function processFloor(svgSrc) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgSrc, 'image/svg+xml');
  const viewBox = parseViewBox(doc.documentElement);

  const allShapes = [];
  function collectShapes(node) {
    if (!node || node.nodeType !== 1) return;
    const id = node.getAttribute && node.getAttribute('id');
    if (id === 'labels') return;
    const tag = node.tagName && node.tagName.toLowerCase();
    if (tag === 'rect' || tag === 'path') {
      const local = tag === 'rect' ? rectBbox(node) : pathBbox(node);
      if (local) {
        const bbox = transformBbox(local, elementToRootMatrix(node));
        allShapes.push({ el: node, bbox });
      }
    }
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) collectShapes(node.childNodes[i]);
    }
  }
  collectShapes(doc.documentElement);

  let labelsGroup = null;
  function findLabels(node) {
    if (!node || node.nodeType !== 1) return;
    if (node.getAttribute && node.getAttribute('id') === 'labels') { labelsGroup = node; return; }
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) findLabels(node.childNodes[i]);
    }
  }
  findLabels(doc.documentElement);

  if (!labelsGroup) throw new Error('Could not find <g id="labels">');

  const textEls = [];
  for (let i = 0; i < labelsGroup.childNodes.length; i++) {
    const n = labelsGroup.childNodes[i];
    if (n.nodeType === 1 && n.tagName && n.tagName.toLowerCase() === 'text') textEls.push(n);
  }

  const slugCounts = {};
  const rooms = [];

  for (const textEl of textEls) {
    const tspans = [];
    for (let i = 0; i < textEl.childNodes.length; i++) {
      const n = textEl.childNodes[i];
      if (n.nodeType === 1 && n.tagName && n.tagName.toLowerCase() === 'tspan') tspans.push(n);
    }
    const parts = tspans.map(t => (t.textContent || '').trim()).filter(Boolean);
    if (parts.length === 0) continue;
    const label = parts.join(' ').replace(/\s+/g, ' ').trim();
    if (!label) continue;

    const firstTspan = tspans[0];
    const localAx = parseFloat((firstTspan && firstTspan.getAttribute('x')) || textEl.getAttribute('x') || '0');
    const localAy = parseFloat((firstTspan && firstTspan.getAttribute('y')) || textEl.getAttribute('y') || '0');
    const labelMatrix = elementToRootMatrix(firstTspan || textEl);
    const { x: ax, y: ay } = labelMatrix
      ? applyMatrix(labelMatrix, localAx, localAy)
      : { x: localAx, y: localAy };

    let best = null;
    for (const shape of allShapes) {
      if (bboxContains(shape.bbox, ax, ay)) {
        if (!best || bboxArea(shape.bbox) < bboxArea(best.bbox)) best = shape;
      }
    }

    const baseSlug = slugify(label);
    slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
    const count = slugCounts[baseSlug];
    const roomId = count === 1 ? `room-${baseSlug}` : `room-${baseSlug}-${count}`;

    if (best) best.el.setAttribute('id', roomId);

    rooms.push({
      id: roomId,
      label,
      aliases: buildAliases(label),
      category: categorize(label),
      bbox: best ? best.bbox : { x: ax - 30, y: ay - 20, width: 60, height: 40 },
      shapeId: roomId,
    });
  }

  return { cleanedSvg: serializeNode(doc.documentElement), rooms, viewBox };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

for (const building of BUILDING_CONFIGS) {
  const assetsDir = path.resolve(ASSETS_BASE_DIR, building.buildingId);
  const outDir = path.resolve(OUT_BASE_DIR, building.buildingId);

  try {
    fs.mkdirSync(outDir, { recursive: true });
  } catch (err) {
    console.error(`Failed to create output directory "${outDir}": ${err.message}`);
    process.exit(1);
  }

  const floors = discoverFloors(assetsDir);

  for (const config of floors) {
    const svgPath = path.resolve(assetsDir, config.svgFile);
    if (!fs.existsSync(svgPath)) {
      console.warn(`Skipping ${config.floorId}: ${config.svgFile} not found in ${assetsDir}`);
      continue;
    }

    let svgSrc;
    try {
      svgSrc = fs.readFileSync(svgPath, 'utf-8');
    } catch (err) {
      console.error(`Failed to read "${svgPath}": ${err.message}`);
      continue;
    }

    let cleanedSvg, rooms, viewBox;
    try {
      ({ cleanedSvg, rooms, viewBox } = processFloor(svgSrc));
    } catch (err) {
      console.error(`Failed to process "${config.svgFile}": ${err.message}`);
      continue;
    }

    const camelId = toCamelId(config.floorId);
    console.log(`[${building.buildingId}] ${config.floorId}: extracted ${rooms.length} rooms, viewBox=[${viewBox.join(', ')}]`);

    const svgTs =
`// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
const ${camelId}Svg = ${JSON.stringify(cleanedSvg)};
export default ${camelId}Svg;
`;

    const manifestTs =
`// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
export type { RoomCategory, Room, FloorManifest } from '../types';
import type { FloorManifest } from '../types';

const ${camelId}Manifest: FloorManifest = ${JSON.stringify({ floorId: config.floorId, viewBox, rooms }, null, 2)};

export default ${camelId}Manifest;
`;

    try {
      fs.writeFileSync(path.join(outDir, `${config.floorId}SvgXml.ts`), svgTs);
      fs.writeFileSync(path.join(outDir, `${config.floorId}.manifest.ts`), manifestTs);
    } catch (err) {
      console.error(`Failed to write output files for "${config.floorId}": ${err.message}`);
      continue;
    }
    console.log(`  Written: ${building.buildingId}/${config.floorId}SvgXml.ts, ${building.buildingId}/${config.floorId}.manifest.ts`);
  }
}

// ─── Regenerate floors/index.ts ───────────────────────────────────────────────

const importLines = [];
const buildingBlocks = [];

for (const building of BUILDING_CONFIGS) {
  const floors = discoverFloors(path.resolve(ASSETS_BASE_DIR, building.buildingId));

  const floorImports = floors
    .map(c => {
      const id = toCamelId(c.floorId);
      return `import ${id}Svg from './${building.buildingId}/${c.floorId}SvgXml';\nimport ${id}Manifest from './${building.buildingId}/${c.floorId}.manifest';`;
    })
    .join('\n');
  if (floorImports) {
    importLines.push(`// ── ${building.shortLabel} floors ──\n${floorImports}`);
  }

  const floorEntries = floors
    .map(c => {
      const id = toCamelId(c.floorId);
      return `      ${c.floorId}: { id: '${c.floorId}', label: '${c.label}', svgXml: ${id}Svg, manifest: ${id}Manifest },`;
    })
    .join('\n');

  const floorOrder = floors.map(c => `'${c.floorId}'`).join(', ');

  buildingBlocks.push(
`  ${building.buildingId}: {
    id: '${building.buildingId}',
    label: '${building.label}',
    shortLabel: '${building.shortLabel}',
    floorOrder: [${floorOrder}],
    floors: {
${floorEntries}
    },
  },`
  );
}

const buildingOrder = BUILDING_CONFIGS.map(b => `'${b.buildingId}'`).join(', ');

const indexTs =
`// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
import type { FloorManifest } from './types';
${importLines.join('\n')}

export type FloorEntry = {
  id: string;
  label: string;
  svgXml: string;
  manifest: FloorManifest;
};

export type BuildingEntry = {
  id: string;
  label: string;
  shortLabel: string;
  floorOrder: string[];
  floors: Record<string, FloorEntry>;
};

// Add new buildings/floors in scripts/build_floor_manifest.js BUILDING_CONFIGS and re-run.
export const BUILDINGS: Record<string, BuildingEntry> = {
${buildingBlocks.join('\n')}
};

export const BUILDING_ORDER: string[] = [${buildingOrder}];

// Flat list of all floors across all buildings (used for cross-building search).
export const ALL_FLOORS: FloorEntry[] = BUILDING_ORDER.flatMap(
  bid => BUILDINGS[bid].floorOrder.map(fid => BUILDINGS[bid].floors[fid])
);
`;

try {
  fs.writeFileSync(path.join(OUT_BASE_DIR, 'index.ts'), indexTs);
} catch (err) {
  console.error(`Failed to write "index.ts": ${err.message}`);
  process.exit(1);
}
console.log('  Written: index.ts');
