import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import ImageComponent from '../../../components/ImageComponent';

type Props = {
  uri: string | null;
  onClose: () => void;
};

const FullScreenImageModal: React.FC<Props> = ({ uri, onClose }) => (
  <Modal visible={uri !== null} transparent={false} animationType="fade" onRequestClose={onClose}>
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <ImageComponent
        uri={uri}
        imageStyle={styles.image}
        resizeMode="contain"
        showFallbackWhenMissing
        fallbackIconSize={40}
        fallbackIconColor="#d1d5db"
        fallbackContainerStyle={styles.imageFallback}
      />
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  closeButton: { position: 'absolute', top: 48, right: 16, zIndex: 1, padding: 8 },
  closeText: { color: '#fff', fontSize: 24, fontWeight: '700' },
  image: { width: '100%', height: '100%' },
  imageFallback: { backgroundColor: 'transparent' },
});

export default FullScreenImageModal;
