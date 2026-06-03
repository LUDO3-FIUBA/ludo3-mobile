import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useRoute } from '@react-navigation/native';
import { UserAvatar } from '../../components';
import { lightModeColors } from '../../styles/colorPalette';
import { teachersRepository } from '../../repositories';
import type { TeacherProfile } from '../../repositories/teachers';

type TeacherProfileRoute = { params: { teacherUserId: number; role?: string } };

const TeacherProfileScreen: React.FC = () => {
  const route = useRoute() as unknown as TeacherProfileRoute;
  const teacherUserId = route.params?.teacherUserId;
  const role = route.params?.role;

  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (teacherUserId === undefined) {
      setError('Falta el id del docente.');
      setLoading(false);
      return;
    }
    teachersRepository.fetchTeacherProfile(teacherUserId)
      .then(setProfile)
      .catch(() => setError('No se pudo cargar el perfil del docente.'))
      .finally(() => setLoading(false));
  }, [teacherUserId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={lightModeColors.mainColor} />
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.center}>
        <Icon name="account-off" size={48} color={lightModeColors.darkGray} />
        <Text style={styles.errorText}>{error ?? 'Perfil no disponible.'}</Text>
      </SafeAreaView>
    );
  }

  const linkedin = profile.linkedin_url?.trim();
  const github = profile.github_url?.trim();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <UserAvatar photoUrl={profile.profile_photo} size={96} />
          <Text style={styles.name}>{profile.first_name} {profile.last_name}</Text>
          {role ? <Text style={styles.role}>{role}</Text> : null}
          <Text style={styles.email}>{profile.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes</Text>

          {linkedin ? (
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(linkedin)}>
              <Icon name="linkedin" size={22} color="#0a66c2" />
              <Text style={[styles.linkText, { color: '#0a66c2' }]} numberOfLines={1}>{linkedin}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.linkRow}>
              <Icon name="linkedin" size={22} color={lightModeColors.darkGray} />
              <Text style={[styles.linkText, styles.disabled]}>Sin LinkedIn</Text>
            </View>
          )}

          {github ? (
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(github)}>
              <Icon name="github" size={22} color="#0d1117" />
              <Text style={[styles.linkText, { color: '#0d1117' }]} numberOfLines={1}>{github}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.linkRow}>
              <Icon name="github" size={22} color={lightModeColors.darkGray} />
              <Text style={[styles.linkText, styles.disabled]}>Sin GitHub</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  scroll: { padding: 20 },
  errorText: { marginTop: 12, color: lightModeColors.darkGray, textAlign: 'center' },
  header: { alignItems: 'center', marginBottom: 24 },
  name: { fontSize: 20, fontWeight: '600', color: '#111', marginTop: 12 },
  role: { fontSize: 14, color: '#666', marginTop: 4 },
  email: { fontSize: 14, color: '#555', marginTop: 4 },
  section: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#222', marginBottom: 12 },
  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  linkText: { fontSize: 14, flex: 1 },
  disabled: { color: lightModeColors.darkGray, fontStyle: 'italic' },
});

export default TeacherProfileScreen;
