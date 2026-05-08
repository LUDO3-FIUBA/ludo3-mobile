import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

import piso4Svg from './floors/piso4SvgXml';
import piso4Manifest from './floors/piso4.manifest';
import type { Room } from './floors/piso4.manifest';
import { searchRooms } from './searchRooms';
import { useMapTransform } from './useMapTransform';
import FloorMap from './FloorMap';
import MapSearchBar from './MapSearchBar';
import ZoomControls from './ZoomControls';

type MapRouteParams = { q?: string };

export default function MapScreen() {
  const { width, height } = useWindowDimensions();
  // Account for header (~56 px) so the fit is within the visible area
  const canvasH = height - 56;

  const [query, setQuery] = useState('');
  const [highlightedRoom, setHighlightedRoom] = useState<Room | null>(null);

  const suggestions = useMemo(() => searchRooms(piso4Manifest, query), [query]);
  const transformHandle = useMapTransform(width, canvasH);

  // Deep-link pre-fill
  const route = useRoute<RouteProp<{ Map: MapRouteParams }, 'Map'>>();
  const q = (route.params as MapRouteParams | undefined)?.q;
  useEffect(() => {
    if (q) {
      setQuery(q);
      const match = searchRooms(piso4Manifest, q)[0];
      if (match) {
        setHighlightedRoom(match);
        transformHandle.focusOnBbox(match.bbox);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleSelect = useCallback((room: Room) => {
    setQuery(room.label);
    setHighlightedRoom(room);
    transformHandle.focusOnBbox(room.bbox);
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
        svgXml={piso4Svg}
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
