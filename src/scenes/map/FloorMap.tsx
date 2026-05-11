import React, { useCallback, useEffect, useRef } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';
import type { Room } from './floors/types';
import { lightModeColors } from '../../styles/colorPalette';
import { useMapTransform } from './useMapTransform';

type MapTransformHandle = ReturnType<typeof useMapTransform>;

type Props = {
  svgXml: string;
  highlightedRoom: Room | null;
  transformHandle: MapTransformHandle;
  onRoomPress?: (roomId: string) => void;
  canvasStyle?: StyleProp<ViewStyle>;
};

const HIGHLIGHT_COLOR = lightModeColors.institutional;
const SVG_W = 1920;
const SVG_H = 1080;

export default function FloorMap({
  svgXml,
  highlightedRoom,
  transformHandle,
  onRoomPress,
  canvasStyle,
}: Props) {
  const { animatedStyle, pinchGesture, panGesture, doubleTapGesture, handleWheel } = transformHandle;

  // Pulse animation for highlight overlay
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const triggerPulse = useCallback(() => {
    pulseOpacity.value = 1;
    pulseScale.value = withSequence(
      withTiming(1.04, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      withTiming(1.04, { duration: 800, easing: Easing.inOut(Easing.sin) }),
      withTiming(1.0, { duration: 800, easing: Easing.inOut(Easing.sin) })
    );
  }, []);

  const prevRoomId = useRef<string | null>(null);
  if (highlightedRoom && highlightedRoom.id !== prevRoomId.current) {
    prevRoomId.current = highlightedRoom.id;
    triggerPulse();
  }
  if (!highlightedRoom && prevRoomId.current !== null) {
    prevRoomId.current = null;
    pulseOpacity.value = 0;
    pulseScale.value = 1;
  }

  const overlayStyle = useAnimatedStyle(() => {
    if (!highlightedRoom) return { opacity: 0 };
    const { bbox } = highlightedRoom;
    const cx = bbox.x + bbox.width / 2;
    const cy = bbox.y + bbox.height / 2;
    return {
      position: 'absolute',
      left: bbox.x,
      top: bbox.y,
      width: bbox.width,
      height: bbox.height,
      opacity: pulseOpacity.value,
      transform: [
        { translateX: (bbox.width / 2) * (pulseScale.value - 1) * -1 },
        { translateY: (bbox.height / 2) * (pulseScale.value - 1) * -1 },
        { scaleX: pulseScale.value },
        { scaleY: pulseScale.value },
      ],
    };
  });

  // Build combined SVG with overlay injected
  const composedSvg = highlightedRoom
    ? buildSvgWithHighlight(svgXml, highlightedRoom)
    : svgXml;

  const gesture = Platform.OS !== 'web'
    ? Gesture.Simultaneous(pinchGesture, Gesture.Race(doubleTapGesture, panGesture))
    : panGesture;

  const webContainerRef = useRef<View>(null);

  // Register a non-passive wheel listener so preventDefault() actually works.
  // React's synthetic onWheel is passive by default, which silently ignores
  // preventDefault and lets the page scroll behind the map.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const dom = webContainerRef.current as unknown as HTMLElement | null;
    if (!dom) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      handleWheel(e.deltaY, e.clientX - rect.left, e.clientY - rect.top);
    };
    dom.addEventListener('wheel', handler, { passive: false });
    return () => dom.removeEventListener('wheel', handler);
  }, [handleWheel]);

  // The outer View is the scroll-capture anchor for web wheel events (ref).
  // The fill View gives GestureDetector a non-zero layout size — without it,
  // the absolutely-positioned Animated.View doesn't contribute to parent layout
  // (flex: 0×0), so native gesture recognizers never fire.
  return (
    <View style={[styles.canvas, canvasStyle]} ref={webContainerRef}>
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFillObject}>
          <Animated.View style={[styles.svgContainer, animatedStyle]}>
            <SvgXml xml={composedSvg} width={SVG_W} height={SVG_H} />
          </Animated.View>
        </View>
      </GestureDetector>
    </View>
  );
}

function buildSvgWithHighlight(svgXml: string, room: Room): string {
  const { bbox } = room;
  const color = lightModeColors.institutional;
  // Inject two rects before the closing </svg>: fill overlay + stroke outline
  const overlay = `<rect x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" fill="${color}" fill-opacity="0.35" stroke="none"/>` +
    `<rect x="${bbox.x}" y="${bbox.y}" width="${bbox.width}" height="${bbox.height}" fill="none" stroke="${color}" stroke-width="3"/>`;
  return svgXml.replace('</svg>', overlay + '</svg>');
}

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: lightModeColors.lightGray,
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
