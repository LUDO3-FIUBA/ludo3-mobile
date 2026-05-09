import { Appearance, StyleSheet } from 'react-native';

const sharedStyles = {
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row' as const,
    alignItems: 'flex-end' as const,
    gap: 8,
    marginBottom: 4,
    marginTop: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  headerSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    marginTop: 4,
  },
  card: {
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: 16,
    gap: 14,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 3,
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardUrl: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500' as const,
  },
};

const lightMode = StyleSheet.create({
  ...sharedStyles,
  container: {
    ...sharedStyles.container,
    backgroundColor: '#f5f7fa',
  },
  headerTitle: {
    ...sharedStyles.headerTitle,
    color: '#111827',
  },
  headerSubtitle: {
    ...sharedStyles.headerSubtitle,
    color: '#6b7280',
  },
  card: {
    ...sharedStyles.card,
    backgroundColor: '#ffffff',
    shadowColor: '#000000',
  },
  cardTitle: {
    ...sharedStyles.cardTitle,
    color: '#111827',
  },
  cardDescription: {
    ...sharedStyles.cardDescription,
    color: '#4b5563',
  },
  cardUrl: {
    ...sharedStyles.cardUrl,
    color: '#9ca3af',
  },
});

const darkMode = StyleSheet.create({
  ...sharedStyles,
  container: {
    ...sharedStyles.container,
    backgroundColor: '#1a1a2e',
  },
  headerTitle: {
    ...sharedStyles.headerTitle,
    color: '#f9fafb',
  },
  headerSubtitle: {
    ...sharedStyles.headerSubtitle,
    color: '#9ca3af',
  },
  card: {
    ...sharedStyles.card,
    backgroundColor: '#16213e',
    shadowColor: '#000000',
  },
  cardTitle: {
    ...sharedStyles.cardTitle,
    color: '#f9fafb',
  },
  cardDescription: {
    ...sharedStyles.cardDescription,
    color: '#d1d5db',
  },
  cardUrl: {
    ...sharedStyles.cardUrl,
    color: '#6b7280',
  },
});

export function getUsefulLinksStyles() {
  return Appearance.getColorScheme() === 'dark' ? darkMode : lightMode;
}
