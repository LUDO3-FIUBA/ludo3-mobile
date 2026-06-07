import React from 'react';
import { Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { MaterialIcon } from '../../components';
import { getUsefulLinksStyles } from '../../styles/usefulLinks';

interface UsefulLink {
  title: string;
  description: string;
  url: string;
  icon: string;
  color: string;
}

const LINKS: UsefulLink[] = [
  {
    title: 'Bolsa de Trabajo',
    description: 'Ofertas laborales para estudiantes y graduados de la FIUBA',
    url: 'https://bolsadetrabajo.fi.uba.ar/#/iniciar-sesion',
    icon: 'briefcase-search',
    color: '#0088cc',
  },
  {
    title: 'RPL',
    description: 'Plataforma de ejercicios y práctica de programación',
    url: 'https://myrpl.ar/login',
    icon: 'code-braces',
    color: '#6640ff',
  },
  {
    title: 'Campus Grado',
    description: 'Aula virtual, material de cursada y recursos académicos',
    url: 'https://campusgrado.fi.uba.ar/?redirect=0',
    icon: 'school',
    color: '#ff9900',
  },
  {
    title: 'Programas de asignaturas',
    description: 'Planificaciones y programas de cada asignatura',
    url: 'https://sites.google.com/fi.uba.ar/academica/docentes/planificaciones?authuser=0',
    icon: 'book-open-page-variant',
    color: '#0f766e',
  },
  {
    title: 'SIU Guaraní',
    description: 'Gestión académica: inscripciones, trámites y certificados',
    url: 'https://guaraniautogestion.fi.uba.ar/g3w/acceso/login?ref=http://guaraniautogestion.fi.uba.ar/g3w/inicio_alumno/',
    icon: 'clipboard-list-outline',
    color: '#800000',
  },
  {
    title: 'Página de Tesis',
    description: 'Portal de trabajos finales y proyectos de graduación',
    url: 'https://fiubatpf.github.io/#/',
    icon: 'file-document-edit-outline',
    color: '#2e7d32',
  },
];

const openLink = async (url: string) => {
  try {
    await Linking.openURL(url);
  } catch (error) {
    console.error('No se pudo abrir el enlace.', error);
  }
};

const hexToRgba = (hex: string, alpha: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const webContentStyle = Platform.OS === 'web'
  ? { maxWidth: 720, width: '100%' as any, alignSelf: 'center' as const }
  : {};

const UsefulLinksScreen = () => {
  const styles = getUsefulLinksStyles();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={[styles.scrollContent, webContentStyle]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <MaterialIcon name="link-variant" fontSize={24} color="#111827" />
          <Text style={styles.headerTitle}>Enlaces Útiles</Text>
        </View>
        <Text style={styles.headerSubtitle}>
          Acceso rápido a los servicios y plataformas de la FIUBA
        </Text>

        {LINKS.map((link) => (
          <TouchableOpacity
            key={link.url}
            style={[styles.card, { borderLeftColor: link.color }]}
            onPress={() => openLink(link.url)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconContainer, { backgroundColor: hexToRgba(link.color, 0.12) }]}>
              <MaterialIcon name={link.icon} fontSize={26} color={link.color} />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{link.title}</Text>
              <Text style={styles.cardDescription}>{link.description}</Text>
            </View>
            <MaterialIcon name="chevron-right" fontSize={22} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default UsefulLinksScreen;
