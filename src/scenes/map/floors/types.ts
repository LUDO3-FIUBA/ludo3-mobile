export type RoomCategory =
  | 'aula'
  | 'oficina'
  | 'laboratorio'
  | 'bano'
  | 'deposito'
  | 'sala'
  | 'instituto'
  | 'departamento'
  | 'otro';

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
