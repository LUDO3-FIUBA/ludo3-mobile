import React from 'react';

// Uses @mdi/font CSS already loaded in public/index.html
// Class name pattern: mdi mdi-{icon-name}
// MaterialCommunityIcons names map 1:1 to MDI CSS classes — no manual mapping needed.
const Icon = ({ name, size = 24, color = '#000', style, ...props }) => {
  const { width, height, ...restStyle } = style || {};
  return React.createElement('i', {
    className: `mdi mdi-${name}`,
    style: {
      fontSize: size,
      color: color || restStyle?.color,
      lineHeight: 1,
      display: 'inline-flex',
      alignItems: 'center',
      ...restStyle,
    },
  });
};

Icon.loadFont = () => {};

export default Icon;
