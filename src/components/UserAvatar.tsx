import React, { useState, useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { baseUrl } from '../networking';

const PLACEHOLDER_COLOR = '#9ca3af';

type Props = {
  photoUrl?: string | null;
  size?: number;
};

function resolveUri(uri: string): string {
  if (uri.startsWith('/')) return `${baseUrl}${uri}`;
  return uri;
}

const UserAvatar: React.FC<Props> = ({ photoUrl, size = 32 }) => {
  const uri = photoUrl ? resolveUri(photoUrl.trim()) : '';
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
  }, [uri]);

  if (uri && !error) {
    return (
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        onError={() => setError(true)}
      />
    );
  }

  return <Icon name="account-circle" size={size} color={PLACEHOLDER_COLOR} />;
};

const styles = StyleSheet.create({
  image: { backgroundColor: '#e5e7eb' },
});

export default UserAvatar;
