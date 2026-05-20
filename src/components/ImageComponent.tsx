import React, { useEffect, useMemo, useState } from 'react';
import {
  Image,
  ImageResizeMode,
  ImageStyle,
  Modal,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
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
  expandOnPress?: boolean;
};

const ImageComponent: React.FC<ImageComponentProps> = ({
  uri,
  imageStyle,
  resizeMode = 'cover',
  fallbackContainerStyle,
  fallbackIconSize = 22,
  fallbackIconColor = '#9ca3af',
  showFallbackWhenMissing = false,
  expandOnPress = false,
}) => {
  const normalizedUri = useMemo(() => uri?.trim() ?? '', [uri]);
  const hasUri = normalizedUri.length > 0;
  const [hasError, setHasError] = useState(false);
  const [fullScreenVisible, setFullScreenVisible] = useState(false);

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

  const imageElement = (
    <Image
      source={{ uri: normalizedUri }}
      style={imageStyle}
      resizeMode={resizeMode}
      onError={() => setHasError(true)}
    />
  );

  if (!expandOnPress) {
    return imageElement;
  }

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} onPress={() => setFullScreenVisible(true)}>
        {imageElement}
      </TouchableOpacity>

      <Modal
        visible={fullScreenVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenVisible(false)}
      >
        <View style={styles.fullScreenBackdrop}>
          <TouchableOpacity
            style={styles.fullScreenClose}
            onPress={() => setFullScreenVisible(false)}
          >
            <MaterialIcon name="close" fontSize={28} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fullScreenTouchableArea}
            activeOpacity={1}
            onPress={() => setFullScreenVisible(false)}
          >
            <Image
              source={{ uri: normalizedUri }}
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fallbackBase: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
  },
  fullScreenBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenClose: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  fullScreenTouchableArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
});

export default ImageComponent;