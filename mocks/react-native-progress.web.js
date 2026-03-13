// Mock for react-native-progress on web using plain SVG/CSS
import React from 'react';
import { View, Text } from 'react-native';

export const Circle = ({ progress = 0, size = 60, color = '#3498db', unfilledColor = '#eee', thickness = 4, showsText = false, formatText, textStyle, borderWidth = 1 }) => {
  const radius = (size - thickness * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - Math.min(Math.max(progress, 0), 1));
  const label = showsText ? (formatText ? formatText(progress) : `${Math.round(progress * 100)}%`) : null;

  return React.createElement(
    'div',
    { style: { width: size, height: size, position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' } },
    React.createElement(
      'svg',
      { width: size, height: size, style: { position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' } },
      React.createElement('circle', {
        cx: size / 2, cy: size / 2, r: radius,
        fill: 'none', stroke: unfilledColor, strokeWidth: thickness,
      }),
      React.createElement('circle', {
        cx: size / 2, cy: size / 2, r: radius,
        fill: 'none', stroke: color, strokeWidth: thickness,
        strokeDasharray: circumference,
        strokeDashoffset: strokeDashoffset,
        strokeLinecap: 'round',
        style: { transition: 'stroke-dashoffset 0.3s ease' },
      }),
    ),
    label && React.createElement(Text, { style: [{ fontSize: size * 0.18, fontWeight: 'bold', color }, textStyle] }, label),
  );
};

export const Bar = ({ progress = 0, width = 200, height = 6, color = '#3498db', unfilledColor = '#eee', borderRadius = 3 }) => {
  return React.createElement(
    'div',
    { style: { width, height, backgroundColor: unfilledColor, borderRadius, overflow: 'hidden' } },
    React.createElement('div', {
      style: {
        width: `${Math.min(Math.max(progress, 0), 1) * 100}%`,
        height: '100%',
        backgroundColor: color,
        borderRadius,
        transition: 'width 0.3s ease',
      }
    })
  );
};

export default { Circle, Bar };
