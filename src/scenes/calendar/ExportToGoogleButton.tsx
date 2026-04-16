import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { statusCodes } from '@react-native-google-signin/google-signin';
import { getCalendarAccessToken } from '../../auth/google_signin';
import { fetchCalendarList, exportAllEvents } from '../../repositories/googleCalendarRepository';
import { lightModeColors } from '../../styles/colorPalette';
import Evaluation from '../../models/Evaluation';
import FinalExam from '../../models/FinalExam';
import { CommissionInscription } from '../../models';

interface Props {
  evaluations: Evaluation[];
  finals: FinalExam[];
  inscriptions: CommissionInscription[];
}

const ExportToGoogleButton = ({ evaluations, finals, inscriptions }: Props) => {
  const [loading, setLoading] = useState(false);
  const { showActionSheetWithOptions } = useActionSheet();

  const handleExport = async () => {
    setLoading(true);
    try {
      const accessToken = await getCalendarAccessToken();
      const calendars = await fetchCalendarList(accessToken);

      setLoading(false);

      const options = [...calendars.map(c => c.summary), 'Cancelar'];
      const cancelButtonIndex = options.length - 1;

      showActionSheetWithOptions(
        { options, cancelButtonIndex, title: '¿A qué calendario exportar?' },
        async (selectedIndex) => {
          if (selectedIndex === undefined || selectedIndex === cancelButtonIndex) return;

          setLoading(true);
          try {
            const calendarId = calendars[selectedIndex].id;
            const { exported, total } = await exportAllEvents(
              accessToken, calendarId, evaluations, finals, inscriptions,
            );
            const msg =
              exported === total
                ? `Se exportaron ${exported} eventos a "${calendars[selectedIndex].summary}".`
                : `Se exportaron ${exported} de ${total} eventos. Algunos fallaron.`;
            Alert.alert('Google Calendar', msg);
          } catch (err: any) {
            Alert.alert('Error', 'No se pudo exportar. Intentá de nuevo.');
          } finally {
            setLoading(false);
          }
        },
      );
    } catch (err: any) {
      setLoading(false);
      if (err?.code === statusCodes.SIGN_IN_CANCELLED) return;
      Alert.alert('Error', 'No se pudo conectar con Google Calendar. Intentá de nuevo.');
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleExport}
      activeOpacity={0.7}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={lightModeColors.institutional} />
      ) : (
        <Icon name="calendar-export" size={15} color={lightModeColors.institutional} />
      )}
      <Text style={styles.label}>Exportar a Google Calendar</Text>
    </TouchableOpacity>
  );
};

export default ExportToGoogleButton;

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 9,
    backgroundColor: '#edf4fc',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#cce0f5',
  },
  label: {
    fontSize: 13,
    color: lightModeColors.institutional,
    fontWeight: '500',
  },
});
