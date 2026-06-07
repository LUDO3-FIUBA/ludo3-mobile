import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BUILDINGS, BUILDING_ORDER, ALL_FLOORS } from './floors/index';
import { searchAllFloors } from './searchRooms';
import type { RoomResult } from './searchRooms';
import type { Room } from './floors/types';
import { useMapTransform } from './useMapTransform';
import FloorMap from './FloorMap';
import MapSearchBar from './MapSearchBar';
import ZoomControls from './ZoomControls';
import FloorPicker from './FloorPicker';
import BuildingPicker from './BuildingPicker';
import { lightModeColors } from '../../styles/colorPalette';

type MapRouteParams = { q?: string };

export default function MapScreen() {
  const { width, height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const canvasH = height - top - bottom;

  const [query, setQuery] = useState('');
  const [highlightedRoom, setHighlightedRoom] = useState<Room | null>(null);
  const [currentBuildingId, setCurrentBuildingId] = useState(BUILDING_ORDER[0]);

  const allBuildings = useMemo(() => BUILDING_ORDER.map(id => BUILDINGS[id]), []);
  const currentBuilding = BUILDINGS[currentBuildingId];
  const buildingFloors = useMemo(
    () => currentBuilding.floorOrder.map(fid => currentBuilding.floors[fid]),
    [currentBuilding]
  );

  const [currentFloorId, setCurrentFloorId] = useState(
    currentBuilding.floorOrder[0] ?? ''
  );
  const currentFloor = currentBuilding.floors[currentFloorId] ?? null;
  const [, , svgW, svgH] = currentFloor?.manifest.viewBox ?? [0, 0, 0, 0];

  const suggestions = useMemo(() => searchAllFloors(buildingFloors, query), [buildingFloors, query]);
  const transformHandle = useMapTransform(width, canvasH, svgW, svgH);

  const route = useRoute<RouteProp<{ Map: MapRouteParams }, 'Map'>>();
  const q = (route.params as MapRouteParams | undefined)?.q;
  useEffect(() => {
    if (q) {
      setQuery(q);
      const match = searchAllFloors(ALL_FLOORS, q)[0];
      if (match) {
        const matchBuilding = BUILDING_ORDER.find(bid =>
          BUILDINGS[bid].floorOrder.includes(match.floorId)
        );
        if (matchBuilding) setCurrentBuildingId(matchBuilding);
        setCurrentFloorId(match.floorId);
        setHighlightedRoom(match);
        transformHandle.focusOnBbox(match.bbox);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const handleBuildingSelect = useCallback((buildingId: string) => {
    const building = BUILDINGS[buildingId];
    setCurrentBuildingId(buildingId);
    setCurrentFloorId(building.floorOrder[0] ?? '');
    setHighlightedRoom(null);
    transformHandle.reset();
  }, [transformHandle]);

  const handleSelect = useCallback((room: RoomResult) => {
    const matchBuilding = BUILDING_ORDER.find(bid =>
      BUILDINGS[bid].floorOrder.includes(room.floorId)
    );
    if (matchBuilding) {
      setCurrentBuildingId(matchBuilding);
    }
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
      {currentFloor ? (
        <>
          <FloorMap
            svgXml={currentFloor.svgXml}
            svgW={svgW}
            svgH={svgH}
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
            topOffset={62}
          />
          <ZoomControls
            onZoomIn={() => transformHandle.stepZoom(1.25)}
            onZoomOut={() => transformHandle.stepZoom(1 / 1.25)}
            onReset={transformHandle.reset}
          />
          <FloorPicker
            floors={buildingFloors}
            currentFloorId={currentFloorId}
            onSelect={handleFloorSelect}
          />
        </>
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            Planos de {currentBuilding.label} en construcción
          </Text>
        </View>
      )}
      {/* Building toggle floats above the search bar so it never overlaps it
          and the map canvas can use the full screen height. */}
      <View pointerEvents="box-none" style={styles.buildingPickerOverlay}>
        <BuildingPicker
          buildings={allBuildings}
          currentBuildingId={currentBuildingId}
          onSelect={handleBuildingSelect}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  buildingPickerOverlay: {
    position: 'absolute',
    // Sits above the search bar (which is pushed down via topOffset).
    top: 12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 5,
  },
  canvas: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  placeholderText: {
    fontSize: 16,
    color: lightModeColors.darkGray,
    textAlign: 'center',
  },
});
