import type { FloorManifest } from './types';
import piso4Svg from './piso4SvgXml';
import piso4Manifest from './piso4.manifest';

export type FloorEntry = {
  id: string;
  label: string;
  svgXml: string;
  manifest: FloorManifest;
};

// Add new floors here — the rest of the UI picks them up automatically.
export const FLOORS: Record<string, FloorEntry> = {
  piso4: {
    id: 'piso4',
    label: 'Piso 4',
    svgXml: piso4Svg,
    manifest: piso4Manifest,
  },
};

export const FLOOR_ORDER: string[] = ['piso4'];
