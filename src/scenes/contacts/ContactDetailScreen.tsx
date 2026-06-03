import React from 'react';
import {
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
import type { Contact } from '../../repositories/contacts';

type ContactDetailRoute = { params: { contact: Contact } };

const ContactDetailScreen: React.FC = () => {
  const route = useRoute() as unknown as ContactDetailRoute;
  const contact = route.params?.contact;
  const student = contact?.contact;

  if (!student) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.empty}>No se pudo cargar el contacto.</Text>
      </SafeAreaView>
    );
  }

  const linkedin = student.linkedin_url?.trim();
  const github = student.github_url?.trim();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <UserAvatar photoUrl={student.profile_photo ?? null} size={96} />
          <Text style={styles.name}>{student.full_name || 'Sin nombre'}</Text>
          <Text style={styles.padron}>Padrón: {student.padron}</Text>
          <Text style={styles.email}>{student.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes</Text>

          {linkedin ? (
            <TouchableOpacity style={styles.linkRow} onPress={() => Linking.openURL(linkedin)}>
              <Icon name="linkedin" size={22} color="#0a66c2" />
              <Text style={[styles.linkText, { color: '#0a66c2' }]} numberOfLines={1}>
                {linkedin}
              </Text>
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
              <Text style={[styles.linkText, { color: '#0d1117' }]} numberOfLines={1}>
                {github}
              </Text>
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
  scroll: { padding: 20 },
  empty: { padding: 24, textAlign: 'center', color: lightModeColors.darkGray },
  header: { alignItems: 'center', marginBottom: 24 },
  name: { fontSize: 20, fontWeight: '600', color: '#111', marginTop: 12 },
  padron: { fontSize: 14, color: '#555', marginTop: 4 },
  email: { fontSize: 14, color: '#555', marginTop: 2 },
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
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  linkText: { fontSize: 14, flex: 1 },
  disabled: { color: lightModeColors.darkGray, fontStyle: 'italic' },
});

export default ContactDetailScreen;
