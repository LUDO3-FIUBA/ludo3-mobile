import { useCallback, useEffect } from 'react';
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

const SCALE_MAX = 8;
const ANIM_DURATION = 300;

export function useMapTransform(canvasWidth: number, canvasHeight: number, svgW: number, svgH: number) {
  const fitScale = Math.min(
    canvasWidth / svgW,
    canvasHeight / svgH
  );
  const fitTx = (canvasWidth - svgW * fitScale) / 2;
  const fitTy = (canvasHeight - svgH * fitScale) / 2;

  const scaleMin = useSharedValue(fitScale);
  const scale = useSharedValue(fitScale);
  const tx = useSharedValue(fitTx);
  const ty = useSharedValue(fitTy);

  // Saved values for gesture start
  const savedScale = useSharedValue(fitScale);
  const savedTx = useSharedValue(fitTx);
  const savedTy = useSharedValue(fitTy);
  const savedFocalX = useSharedValue(0);
  const savedFocalY = useSharedValue(0);

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
    .onBegin((e) => {
      'worklet';
      savedScale.value = scale.value;
      savedTx.value = tx.value;
      savedTy.value = ty.value;
      savedFocalX.value = e.focalX;
      savedFocalY.value = e.focalY;
    })
    .onUpdate((e) => {
      'worklet';
      const newScale = Math.min(Math.max(savedScale.value * e.scale, scaleMin.value), SCALE_MAX);
      const ratio = newScale / savedScale.value;
      // Use initial focal to find the anchored map coordinate, current focal to place it.
      // Using e.focalX for both would drift the map when fingers translate while pinching.
      const newTx = e.focalX - ratio * (savedFocalX.value - savedTx.value);
      const newTy = e.focalY - ratio * (savedFocalY.value - savedTy.value);
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
      const newScale = Math.min(Math.max(scale.value * 2, scaleMin.value), SCALE_MAX);
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

  useEffect(() => {
    scaleMin.value = fitScale;
    scale.value = withTiming(fitScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    tx.value = withTiming(fitTx, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(fitTy, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasWidth, canvasHeight, svgW, svgH]);

  const focusOnBbox = useCallback((bbox: { x: number; y: number; width: number; height: number }) => {
    const minSide = Math.min(canvasWidth, canvasHeight);
    const bboxScale = Math.min(Math.max((minSide * 0.6) / Math.max(bbox.width, bbox.height), scaleMin.value), SCALE_MAX);
    const centerX = bbox.x + bbox.width / 2;
    const centerY = bbox.y + bbox.height / 2;
    const newTx = canvasWidth / 2 - centerX * bboxScale;
    const newTy = canvasHeight / 2 - centerY * bboxScale;
    const clamped = clampTranslation(newTx, newTy, bboxScale);
    scale.value = withTiming(bboxScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    tx.value = withTiming(clamped.tx, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(clamped.ty, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
  }, [canvasWidth, canvasHeight, clampTranslation, scale, scaleMin, tx, ty]);

  const reset = useCallback(() => {
    scale.value = withTiming(fitScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    tx.value = withTiming(fitTx, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(fitTy, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
  }, [fitScale, fitTx, fitTy, scale, tx, ty]);

  function stepZoom(factor: number) {
    const newScale = Math.min(Math.max(scale.value * factor, scaleMin.value), SCALE_MAX);
    const ratio = newScale / scale.value;
    const cx = canvasWidth / 2;
    const cy = canvasHeight / 2;
    const newTx = cx - ratio * (cx - tx.value);
    const newTy = cy - ratio * (cy - ty.value);
    const clamped = clampTranslation(newTx, newTy, newScale);
    scale.value = withTiming(newScale, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    tx.value = withTiming(clamped.tx, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
    ty.value = withTiming(clamped.ty, { duration: ANIM_DURATION, easing: Easing.out(Easing.cubic) });
  }

  function handleWheel(deltaY: number, focalX: number, focalY: number) {
    const factor = deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(scale.value * factor, scaleMin.value), SCALE_MAX);
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
