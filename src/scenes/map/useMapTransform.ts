import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Gesture,
} from 'react-native-gesture-handler';

export type Transform = { scale: number; tx: number; ty: number };

const SCALE_MIN = 0.5;
const SCALE_MAX = 8;
const ANIM_DURATION = 300;

function clampScale(s: number) {
  'worklet';
  return Math.min(Math.max(s, SCALE_MIN), SCALE_MAX);
}

export function useMapTransform(canvasWidth: number, canvasHeight: number, svgW = 1920, svgH = 1080) {
  const fitScale = Math.min(
    (canvasWidth - 48) / svgW,
    (canvasHeight - 48) / svgH
  );
  const fitTx = (canvasWidth - svgW * fitScale) / 2;
  const fitTy = (canvasHeight - svgH * fitScale) / 2;

  const scale = useSharedValue(fitScale);
  const tx = useSharedValue(fitTx);
  const ty = useSharedValue(fitTy);

  // Saved values for gesture start
  const savedScale = useSharedValue(fitScale);
  const savedTx = useSharedValue(fitTx);
  const savedTy = useSharedValue(fitTy);

  const clampTranslation = useCallback((nextTx: number, nextTy: number, s: number): { tx: number; ty: number } => {
    'worklet';
    const svgScreenW = svgW * s;
    const svgScreenH = svgH * s;
    const minVisible = 0.25;
    const minTx = -(svgScreenW * (1 - minVisible));
    const maxTx = canvasWidth - svgScreenW * minVisible;
    const minTy = -(svgScreenH * (1 - minVisible));
    const maxTy = canvasHeight - svgScreenH * minVisible;
    return {
      tx: Math.min(Math.max(nextTx, minTx), maxTx),
      ty: Math.min(Math.max(nextTy, minTy), maxTy),
    };
  }, [canvasWidth, canvasHeight, svgW, svgH]);

  const pinchGesture = Gesture.Pinch()
    .onBegin(() => {
      'worklet';
      savedScale.value = scale.value;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      'worklet';
      const newScale = clampScale(savedScale.value * e.scale);
      // anchor at focal point
      const fx = e.focalX;
      const fy = e.focalY;
      const ratio = newScale / savedScale.value;
      const newTx = fx - ratio * (fx - savedTx.value);
      const newTy = fy - ratio * (fy - savedTy.value);
      const clamped = clampTranslation(newTx, newTy, newScale);
      scale.value = newScale;
      tx.value = clamped.tx;
      ty.value = clamped.ty;
    });

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .onBegin(() => {
      'worklet';
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      'worklet';
      const clamped = clampTranslation(
        savedTx.value + e.translationX,
        savedTy.value + e.translationY,
        scale.value
      );
      tx.value = clamped.tx;
      ty.value = clamped.ty;
    });

  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      'worklet';
      const newScale = clampScale(scale.value * 2);
      const ratio = newScale / scale.value;
      const newTx = e.x - ratio * (e.x - tx.value);
      const newTy = e.y - ratio * (e.y - ty.value);
      const clamped = clampTranslation(newTx, newTy, newScale);
      scale.value = withTiming(newScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
      tx.value = withTiming(clamped.tx, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
      ty.value = withTiming(clamped.ty, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    });

  // React Native scales from the element's center, not (0,0).
  // tx/ty represent the desired rendered top-left position, so we must offset
  // the CSS translateX/Y to compensate: actualTx = tx - svgW*(1-s)/2.
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value - svgW * (1 - scale.value) / 2 },
      { translateY: ty.value - svgH * (1 - scale.value) / 2 },
      { scale: scale.value },
    ],
  }));

  function focusOnBbox(bbox: { x: number; y: number; width: number; height: number }) {
    const minSide = Math.min(canvasWidth, canvasHeight);
    const bboxScale = clampScale((minSide * 0.6) / Math.max(bbox.width, bbox.height));
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    const newTx = canvasWidth / 2 - centerX * bboxScale;
    const newTy = canvasHeight / 2 - centerY * bboxScale;
    scale.value = withTiming(bboxScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    tx.value = withTiming(newTx, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(newTy, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
  }

  function reset() {
    scale.value = withTiming(fitScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    tx.value = withTiming(fitTx, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(fitTy, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
  }

  function stepZoom(factor: number) {
    const newScale = clampScale(scale.value * factor);
    const ratio = newScale / scale.value;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const newTx = cx - ratio * (cx - tx.value);
    const newTy = cy - ratio * (cy - ty.value);
    const clamped = clampTranslation(newTx, newTy, newScale);
    scale.value = withTiming(newScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    tx.value = withTiming(clamped.x, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(clamped.y, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
  }

  function handleWheel(deltaY: number, focalX: number, focalY: number) {
    const factor = deltaY > 0 ? 0.9 : 1.1;
    const newScale = clampScale(scale.value * factor);
    const ratio = newScale / scale.value;
    const newTx = focalX - ratio * (focalX - tx.value);
    const newTy = focalY - ratio * (focalY - ty.value);
    const { tx: clampedTx, ty: clampedTy } = clampTranslation(newTx, newTy, newScale);
    scale.value = newScale;
    tx.value = clampedTx;
    ty.value = clampedTy;
  }

  return {
    scale,
    tx,
    ty,
    animatedStyle,
    pinchGesture,
    panGesture,
    doubleTapGesture,
    focusOnBbox,
    reset,
    stepZoom,
    handleWheel,
  };
}
