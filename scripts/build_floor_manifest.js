#!/usr/bin/env node
/* eslint-env node */
// Build script: parses floor SVGs and emits per-floor TS files + floors/index.ts
// Run with: node scripts/build_floor_manifest.js

const fs = require('fs');
const path = require('path');
const { DOMParser } = require(path.resolve(__dirname, '../node_modules/@xmldom/xmldom'));

const ASSETS_DIR = path.resolve(__dirname, '../src/assets');
const OUT_DIR = path.resolve(__dirname, '../src/scenes/map/floors');

// ─── Floor registry ───────────────────────────────────────────────────────────
// Add a new entry here to include a new floor; the rest is automatic.

const FLOOR_CONFIGS = [
  { floorId: 'piso4', label: 'Piso 4', svgFile: 'Piso4.svg' },
  // { floorId: 'piso3', label: 'Piso 3', svgFile: 'Piso3.svg' },
];

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

// ─── Core processor ───────────────────────────────────────────────────────────

function processFloor(svgSrc) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgSrc, 'image/svg+xml');

  const allShapes = [];
  function collectShapes(node) {
    if (!node || node.nodeType !== 1) return;
    const id = node.getAttribute && node.getAttribute('id');
    if (id === 'labels') return;
    const tag = node.tagName && node.tagName.toLowerCase();
    if (tag === 'rect') {
      const bbox = rectBbox(node);
      if (bbox) allShapes.push({ el: node, bbox });
    } else if (tag === 'path') {
      const bbox = pathBbox(node);
      if (bbox) allShapes.push({ el: node, bbox });
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
    const ax = parseFloat((firstTspan && firstTspan.getAttribute('x')) || textEl.getAttribute('x') || '0');
    const ay = parseFloat((firstTspan && firstTspan.getAttribute('y')) || textEl.getAttribute('y') || '0');

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

  return { cleanedSvg: serializeNode(doc.documentElement), rooms };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

fs.mkdirSync(OUT_DIR, { recursive: true });

for (const config of FLOOR_CONFIGS) {
  const svgPath = path.resolve(ASSETS_DIR, config.svgFile);
  if (!fs.existsSync(svgPath)) {
    console.warn(`Skipping ${config.floorId}: ${config.svgFile} not found`);
    continue;
  }

  const svgSrc = fs.readFileSync(svgPath, 'utf-8');
  const { cleanedSvg, rooms } = processFloor(svgSrc);
  const camelId = toCamelId(config.floorId);

  console.log(`${config.floorId}: extracted ${rooms.length} rooms`);

  const svgTs =
`// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
const ${camelId}Svg = ${JSON.stringify(cleanedSvg)};
export default ${camelId}Svg;
`;

  const manifestTs =
`// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
export type { RoomCategory, Room, FloorManifest } from './types';
import type { FloorManifest } from './types';

const ${camelId}Manifest: FloorManifest = ${JSON.stringify({ floorId: config.floorId, viewBox: [0, 0, 1920, 1080], rooms }, null, 2)};

export default ${camelId}Manifest;
`;

  fs.writeFileSync(path.join(OUT_DIR, `${config.floorId}SvgXml.ts`), svgTs);
  fs.writeFileSync(path.join(OUT_DIR, `${config.floorId}.manifest.ts`), manifestTs);
  console.log(`  Written: ${config.floorId}SvgXml.ts, ${config.floorId}.manifest.ts`);
}

// Regenerate floors/index.ts
const imports = FLOOR_CONFIGS
  .map(c => {
    const id = toCamelId(c.floorId);
    return `import ${id}Svg from './${c.floorId}SvgXml';\nimport ${id}Manifest from './${c.floorId}.manifest';`;
  })
  .join('\n');

const entries = FLOOR_CONFIGS
  .map(c => {
    const id = toCamelId(c.floorId);
    return `  ${c.floorId}: { id: '${c.floorId}', label: '${c.label}', svgXml: ${id}Svg, manifest: ${id}Manifest },`;
  })
  .join('\n');

const order = FLOOR_CONFIGS.map(c => `'${c.floorId}'`).join(', ');

const indexTs =
`// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
import type { FloorManifest } from './types';
${imports}

export type FloorEntry = {
  id: string;
  label: string;
  svgXml: string;
  manifest: FloorManifest;
};

// Add new floors in scripts/build_floor_manifest.js FLOOR_CONFIGS and re-run.
export const FLOORS: Record<string, FloorEntry> = {
${entries}
};

export const FLOOR_ORDER: string[] = [${order}];
`;

fs.writeFileSync(path.join(OUT_DIR, 'index.ts'), indexTs);
console.log('  Written: index.ts');
