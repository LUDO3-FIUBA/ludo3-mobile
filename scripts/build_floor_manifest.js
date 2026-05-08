#!/usr/bin/env node
// Build script: parses Piso4.svg and emits piso4SvgXml.ts + piso4.manifest.ts
// Run with: node scripts/build_floor_manifest.js

const fs = require('fs');
const path = require('path');
const { DOMParser } = require(path.resolve(__dirname, '../node_modules/@xmldom/xmldom'));

const SVG_SRC = path.resolve(__dirname, '../src/assets/Piso4.svg');
const OUT_DIR = path.resolve(__dirname, '../src/scenes/map/floors');

// ─── Helpers ─────────────────────────────────────────────────────────────────

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
  // If it starts with "aula " add the number alone
  const aulaMatch = base.match(/^aula\s+(\d+)$/);
  if (aulaMatch) aliases.push(aulaMatch[1]);
  // Strip trailing dot abbreviations: "bano hombres" alias for "baño hombres"
  const noDots = base.replace(/\./g, '').replace(/\s+/g, ' ').trim();
  if (noDots !== base) aliases.push(noDots);
  return [...new Set(aliases)];
}

// Get bounding box from a <rect> element
function rectBbox(el) {
  const x = parseFloat(el.getAttribute('x') || '0');
  const y = parseFloat(el.getAttribute('y') || '0');
  const w = parseFloat(el.getAttribute('width') || '0');
  const h = parseFloat(el.getAttribute('height') || '0');
  if (w <= 0 || h <= 0) return null;
  return { x, y, width: w, height: h };
}

// Approximate bounding box from a <path> d attribute (handles M, L, H, V, C, Z)
function pathBbox(el) {
  const d = el.getAttribute('d') || '';
  const nums = [];
  // Extract all coordinate pairs via simple regex
  const re = /[MmLlHhVvCcSsQqTtAaZz]([^MmLlHhVvCcSsQqTtAaZz]*)/g;
  let match;
  let xs = [], ys = [];
  let curX = 0, curY = 0;

  // Very small state machine: just track absolute coords for M/L/H/V
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
      case 'C': case 'c':
        // cubic bezier: just push endpoints
        {
          const step = 6;
          const rel = cmd === 'c';
          for (let i = 0; i + 5 < args.length; i += step) {
            const ex = rel ? curX + args[i+4] : args[i+4];
            const ey = rel ? curY + args[i+5] : args[i+5];
            xs.push(ex); ys.push(ey); curX=ex; curY=ey;
          }
        }
        break;
    }
  }
  if (xs.length === 0) return null;
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = maxX - minX, h = maxY - minY;
  if (w <= 0 || h <= 0) return null;
  return { x: minX, y: minY, width: w, height: h };
}

function bboxArea(bbox) {
  return bbox.width * bbox.height;
}

function bboxContains(bbox, px, py) {
  return px >= bbox.x && px <= bbox.x + bbox.width &&
         py >= bbox.y && py <= bbox.y + bbox.height;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const svgSrc = fs.readFileSync(SVG_SRC, 'utf-8');
const parser = new DOMParser();
const doc = parser.parseFromString(svgSrc, 'image/svg+xml');

// Collect all room shapes (rects and paths outside labels group)
const allShapes = [];
function collectShapes(node) {
  if (!node || node.nodeType !== 1) return;
  const id = node.getAttribute && node.getAttribute('id');
  if (id === 'labels') return; // skip labels group
  const tag = node.tagName && node.tagName.toLowerCase();
  if (tag === 'rect') {
    const bbox = rectBbox(node);
    if (bbox) allShapes.push({ el: node, bbox });
  } else if (tag === 'path') {
    const bbox = pathBbox(node);
    if (bbox) allShapes.push({ el: node, bbox });
  }
  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      collectShapes(node.childNodes[i]);
    }
  }
}
collectShapes(doc.documentElement);

// Find labels group
let labelsGroup = null;
function findLabels(node) {
  if (!node || node.nodeType !== 1) return;
  if (node.getAttribute && node.getAttribute('id') === 'labels') {
    labelsGroup = node;
    return;
  }
  if (node.childNodes) {
    for (let i = 0; i < node.childNodes.length; i++) {
      findLabels(node.childNodes[i]);
    }
  }
}
findLabels(doc.documentElement);

if (!labelsGroup) {
  console.error('Could not find <g id="labels">');
  process.exit(1);
}

// Extract text labels
const textEls = [];
for (let i = 0; i < labelsGroup.childNodes.length; i++) {
  const n = labelsGroup.childNodes[i];
  if (n.nodeType === 1 && n.tagName && n.tagName.toLowerCase() === 'text') {
    textEls.push(n);
  }
}

// Build rooms
const slugCounts = {};
const rooms = [];

for (const textEl of textEls) {
  // Collect tspans
  const tspans = [];
  for (let i = 0; i < textEl.childNodes.length; i++) {
    const n = textEl.childNodes[i];
    if (n.nodeType === 1 && n.tagName && n.tagName.toLowerCase() === 'tspan') {
      tspans.push(n);
    }
  }

  // Join text content
  const parts = tspans.map(t => (t.textContent || '').trim()).filter(Boolean);
  if (parts.length === 0) continue;
  const label = parts.join(' ').replace(/\s+/g, ' ').trim();
  if (!label) continue;

  // Anchor point: use first tspan x/y, or text element x/y
  const firstTspan = tspans[0];
  const ax = parseFloat(
    (firstTspan && firstTspan.getAttribute('x')) || textEl.getAttribute('x') || '0'
  );
  const ay = parseFloat(
    (firstTspan && firstTspan.getAttribute('y')) || textEl.getAttribute('y') || '0'
  );

  // Find smallest enclosing shape
  let best = null;
  for (const shape of allShapes) {
    if (bboxContains(shape.bbox, ax, ay)) {
      if (!best || bboxArea(shape.bbox) < bboxArea(best.bbox)) {
        best = shape;
      }
    }
  }

  // Build stable id with disambiguation
  const baseSlug = slugify(label);
  slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
  const count = slugCounts[baseSlug];
  const roomId = count === 1 ? `room-${baseSlug}` : `room-${baseSlug}-${count}`;

  // Tag the shape
  if (best) {
    best.el.setAttribute('id', roomId);
  }

  const bbox = best
    ? best.bbox
    : { x: ax - 30, y: ay - 20, width: 60, height: 40 };

  rooms.push({
    id: roomId,
    label,
    aliases: buildAliases(label),
    category: categorize(label),
    bbox,
    shapeId: roomId,
  });
}

console.log(`Extracted ${rooms.length} rooms`);

// Serialize the modified SVG
function serializeNode(node) {
  if (node.nodeType === 3) return node.nodeValue || '';
  if (node.nodeType !== 1) return '';
  const tag = node.tagName;
  const attrs = [];
  if (node.attributes) {
    for (let i = 0; i < node.attributes.length; i++) {
      const a = node.attributes[i];
      // Drop namespace prefix declarations and xml:space — react-native-svg
      // camel-cases them (e.g. xmlnsSvg, xmlSpace) and React warns about
      // unrecognised DOM props.
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

// Get the SVG element
let svgEl = null;
for (let i = 0; i < doc.documentElement.childNodes.length; i++) {
  const n = doc.documentElement.childNodes[i];
  if (n.nodeType === 1) { svgEl = n; break; }
}
svgEl = doc.documentElement;

const cleanedSvg = serializeNode(svgEl);

// Emit outputs
fs.mkdirSync(OUT_DIR, { recursive: true });

const svgTs = `// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
const piso4Svg = ${JSON.stringify(cleanedSvg)};
export default piso4Svg;
`;

const manifestTs = `// AUTO-GENERATED by scripts/build_floor_manifest.js — do not edit manually
export type RoomCategory = 'aula' | 'oficina' | 'laboratorio' | 'bano' | 'deposito' | 'sala' | 'instituto' | 'departamento' | 'otro';

export type Room = {
  id: string;
  label: string;
  aliases: string[];
  category: RoomCategory;
  bbox: { x: number; y: number; width: number; height: number };
  shapeId: string;
};

export type FloorManifest = {
  floorId: string;
  viewBox: [number, number, number, number];
  rooms: Room[];
};

const piso4Manifest: FloorManifest = ${JSON.stringify({ floorId: 'piso4', viewBox: [0, 0, 1920, 1080], rooms }, null, 2)};

export default piso4Manifest;
`;

fs.writeFileSync(path.join(OUT_DIR, 'piso4SvgXml.ts'), svgTs);
fs.writeFileSync(path.join(OUT_DIR, 'piso4.manifest.ts'), manifestTs);

console.log('Written: piso4SvgXml.ts');
console.log('Written: piso4.manifest.ts');
