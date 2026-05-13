import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageResizeMode,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import MaterialIcon from './materialIcon';

type ImageComponentProps = {
  uri?: string | null;
  imageStyle: StyleProp<ImageStyle>;
  resizeMode?: ImageResizeMode;
  fallbackContainerStyle?: StyleProp<ViewStyle>;
  fallbackIconSize?: number;
  fallbackIconColor?: string;
  showFallbackWhenMissing?: boolean;
};

const ImageComponent: React.FC<ImageComponentProps> = ({
  uri,
  imageStyle,
  resizeMode = 'cover',
  fallbackContainerStyle,
  fallbackIconSize = 22,
  fallbackIconColor = '#9ca3af',
  showFallbackWhenMissing = false,
}) => {
  const normalizedUri = useMemo(() => uri?.trim() ?? '', [uri]);
  const hasUri = normalizedUri.length > 0;
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [normalizedUri]);

  if (!hasUri) {
    if (!showFallbackWhenMissing) {
      return null;
    }

    return (
      <View
        style={[
          styles.fallbackBase,
          imageStyle as unknown as StyleProp<ViewStyle>,
          fallbackContainerStyle,
        ]}
      >
        <MaterialIcon
          name="image-broken-variant"
          fontSize={fallbackIconSize}
          color={fallbackIconColor}
        />
      </View>
    );
  }

  if (hasError) {
    return (
      <View
        style={[
          styles.fallbackBase,
          imageStyle as unknown as StyleProp<ViewStyle>,
          fallbackContainerStyle,
        ]}
      >
        <MaterialIcon
          name="image-broken-variant"
          fontSize={fallbackIconSize}
          color={fallbackIconColor}
        />
      </View>
    );
  }

  return (
    <Image
      source={{ uri: normalizedUri }}
      style={imageStyle}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );
};

const styles = StyleSheet.create({
  fallbackBase: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
});

export default ImageComponent;