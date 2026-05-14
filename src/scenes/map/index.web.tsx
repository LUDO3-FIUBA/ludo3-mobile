import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, LayoutChangeEvent } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

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

// Height that accommodates the search bar: top padding (16) + bar height (44) + bottom padding (16).
// The bar is position:absolute inside this container; the dropdown overflows below it (overflow:visible).
const SEARCH_CONTAINER_HEIGHT = 76;

export default function MapScreen() {
  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  const [query, setQuery] = useState('');
  const [highlightedRoom, setHighlightedRoom] = useState<Room | null>(null);
  const [currentFloorId, setCurrentFloorId] = useState(FLOOR_ORDER[0]);

  const allFloors = useMemo(() => FLOOR_ORDER.map(id => FLOORS[id]), []);
  const currentFloor = FLOORS[currentFloorId];
  const [, , svgW, svgH] = currentFloor.manifest.viewBox;

  const suggestions = useMemo(() => searchAllFloors(allFloors, query), [allFloors, query]);
  const transformHandle = useMapTransform(canvasWidth, canvasHeight, svgW, svgH);

  const route = useRoute<RouteProp<{ Map: MapRouteParams }, 'Map'>>();
  const q = (route.params as MapRouteParams | undefined)?.q;
  useEffect(() => {
    if (q && canvasWidth > 0) {
      setQuery(q);
      const match = searchAllFloors(allFloors, q)[0];
      if (match) {
        setCurrentFloorId(match.floorId);
        setHighlightedRoom(match);
        transformHandle.focusOnBbox(match.bbox);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, canvasWidth]);

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

  // Measure the map canvas (not the whole screen) so the transform bounds
  // reflect the actual drawable area, excluding the search bar above.
  const handleCanvasLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setCanvasWidth(width);
      setCanvasHeight(height);
    }
  }, []);

  return (
    <View style={styles.screen}>
      {/* Search bar lives in its own fixed-height row above the canvas so it
          is never inside a scrollable region and cannot scroll off screen.
          overflow:visible lets the suggestion dropdown extend below. */}
      <View style={styles.searchContainer}>
        <MapSearchBar
          query={query}
          results={suggestions}
          onChange={handleChange}
          onSelect={handleSelect}
          onClear={handleClear}
        />
      </View>

      {/* Map canvas — zoom controls and floor picker remain as absolute overlays */}
      <View style={styles.canvas} onLayout={handleCanvasLayout}>
        {canvasWidth > 0 && (
          <>
            <FloorMap
              svgXml={currentFloor.svgXml}
              svgW={svgW}
              svgH={svgH}
              highlightedRoom={highlightedRoom}
              transformHandle={transformHandle}
              canvasStyle={styles.canvasFill}
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
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  searchContainer: {
    height: SEARCH_CONTAINER_HEIGHT,
    zIndex: 10,
    overflow: 'visible',
  } as any,
  canvas: {
    flex: 1,
    overflow: 'hidden',
  },
  canvasFill: {
    flex: 1,
  },
});
