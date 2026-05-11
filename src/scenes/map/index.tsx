import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useHeaderHeight } from '@react-navigation/elements';

import { FLOORS, FLOOR_ORDER } from './floors/index';
import { searchAllFloors } from './searchRooms';
import type { RoomResult } from './searchRooms';
import type { Room } from './floors/types';
import { useMapTransform } from './useMapTransform';
import FloorMap from './FloorMap';
import MapSearchBar from './MapSearchBar';
import ZoomControls from './ZoomControls';
import FloorPicker from './FloorPicker';

type MapRouteParams = { q?: string };

export default function MapScreen() {
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const canvasH = height - headerHeight;

  const [query, setQuery] = useState('');
  const [highlightedRoom, setHighlightedRoom] = useState<Room | null>(null);
  const [currentFloorId, setCurrentFloorId] = useState(FLOOR_ORDER[0]);

  const allFloors = useMemo(() => FLOOR_ORDER.map(id => FLOORS[id]), []);
  const currentFloor = FLOORS[currentFloorId];

  const suggestions = useMemo(() => searchAllFloors(allFloors, query), [allFloors, query]);
  const transformHandle = useMapTransform(width, canvasH);

  const route = useRoute<RouteProp<{ Map: MapRouteParams }, 'Map'>>();
  const q = (route.params as MapRouteParams | undefined)?.q;
  useEffect(() => {
    if (q) {
      setQuery(q);
      const match = searchAllFloors(allFloors, q)[0];
      if (match) {
        setCurrentFloorId(match.floorId);
        setHighlightedRoom(match);
        transformHandle.focusOnBbox(match.bbox);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleSelect = useCallback((room: RoomResult) => {
    setQuery(room.label);
    setCurrentFloorId(room.floorId);
    setHighlightedRoom(room);
    transformHandle.focusOnBbox(room.bbox);
  }, [transformHandle]);

  const handleFloorSelect = useCallback((floorId: string) => {
    setCurrentFloorId(floorId);
    setHighlightedRoom(null);
    transformHandle.reset();
  }, [transformHandle]);

  const handleClear = useCallback(() => {
    setQuery('');
    setHighlightedRoom(null);
  }, []);

  const handleChange = useCallback((text: string) => {
    setQuery(text);
    if (!text) setHighlightedRoom(null);
  }, []);

  return (
    <View style={styles.screen}>
      <FloorMap
        svgXml={currentFloor.svgXml}
        highlightedRoom={highlightedRoom}
        transformHandle={transformHandle}
        canvasStyle={styles.canvas}
      />
      <MapSearchBar
        query={query}
        results={suggestions}
        onChange={handleChange}
        onSelect={handleSelect}
        onClear={handleClear}
      />
      <ZoomControls
        onZoomIn={() => transformHandle.stepZoom(1.25)}
        onZoomOut={() => transformHandle.stepZoom(1 / 1.25)}
        onReset={transformHandle.reset}
      />
      <FloorPicker
        floors={allFloors}
        currentFloorId={currentFloorId}
        onSelect={handleFloorSelect}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});
