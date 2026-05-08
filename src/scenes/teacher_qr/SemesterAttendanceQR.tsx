import React, { useState, useRef, useCallback } from 'react';
import { Alert, View, Text, TouchableOpacity, LayoutChangeEvent, StyleSheet } from 'react-native';
import RNFS from 'react-native-fs';
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { Loading, RoundedButton } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { useNavigation } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import { AttendanceMode, Campus, CAMPUS_NAMES } from '../../models/ClassAttendance';
import { QRAttendance } from '../../models/QRAttendance';
import { makeRequest } from '../../networking/makeRequest';
import { teacherQrAttendanceRepository } from '../../repositories';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchSemesterAttendances, selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { getQrAttendanceStringFromQrId } from '../../utils/qrCodeStringFactory';

const CAMPUSES: Campus[] = ['las_heras', 'paseo_colon'];

const SemesterAttendanceQR: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [qrSize, setQrSize] = useState<number>(300);
  const [qrValue, setQrValue] = useState<string>('');
  const [mode, setMode] = useState<AttendanceMode>('qr');
  const [campus, setCampus] = useState<Campus>('las_heras');
  const [sessionStarted, setSessionStarted] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<AttendanceMode>('qr');
  const [activeCampus, setActiveCampus] = useState<Campus | null>(null);
  const svgRef = useRef<any>(null);

  const navigation = useNavigation();
  const semesterData = useAppSelector(selectSemesterData)!;
  const semesterId = semesterData.id;

  const startSession = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const selectedCampus = mode === 'location' ? campus : undefined;
      const qrAttendanceData: QRAttendance = await makeRequest(
        () => teacherQrAttendanceRepository.generateAttendanceQR(semesterId, mode, selectedCampus),
        navigation,
      );
      dispatch(fetchSemesterAttendances(semesterId));
      setActiveMode(qrAttendanceData.mode);
      setActiveCampus(qrAttendanceData.campus);
      setSessionStarted(true);
      if (qrAttendanceData.mode === 'qr') {
        const qrAttendanceString = getQrAttendanceStringFromQrId(qrAttendanceData.qrid);
        setQrValue(qrAttendanceString);
      } else {
        setQrValue('');
      }
    } catch (error) {
      console.log("Error", error);
      Alert.alert(
        '¿Qué pasó?',
        'No pudimos iniciar la sesión de asistencia. Volvé a intentar en unos minutos.',
      );
    } finally {
      setLoading(false);
    }
  }, [loading, mode, campus, semesterId, dispatch, navigation]);

  async function downloadQR() {
    if (downloading) return;
    setDownloading(true);
    await svgRef.current?.toDataURL(async (data: string) => {
      try {
        const path = `${RNFS.CachesDirectoryPath}/${semesterId}.png`;
        await RNFS.writeFile(path, data, 'base64');
        await CameraRoll.save(path, { type: 'photo', album: 'QrCodes' });
        Alert.alert('Éxito', 'QR guardado en la galería.');
      } catch (error) {
        console.log("error", error);
        Alert.alert(
          'Te fallamos',
          'No pudimos descargar el QR. Usalo desde el teléfono o volvé a intentar en unos minutos.',
        );
      } finally {
        setDownloading(false);
      }
    });
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setQrSize(Math.min(width, height) * 0.8);
  };

  return (
    <View style={[style().view, { padding: 16 }]} onLayout={handleLayout}>
      {loading && <Loading />}

      {!sessionStarted ? (
        <>
          <Text style={localStyles.sectionTitle}>Modo de asistencia</Text>
          <View style={localStyles.modeRow}>
            {(['qr', 'location'] as AttendanceMode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[localStyles.modeButton, mode === m && localStyles.modeButtonActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[localStyles.modeButtonText, mode === m && localStyles.modeButtonTextActive]}>
                  {m === 'qr' ? 'QR' : 'Ubicación'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'location' && (
            <>
              <Text style={localStyles.sectionTitle}>Sede</Text>
              <View style={localStyles.modeRow}>
                {CAMPUSES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[localStyles.modeButton, campus === c && localStyles.modeButtonActive]}
                    onPress={() => setCampus(c)}
                  >
                    <Text style={[localStyles.modeButtonText, campus === c && localStyles.modeButtonTextActive]}>
                      {CAMPUS_NAMES[c]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          <RoundedButton
            text="Iniciar sesión de asistencia"
            style={{ MainContainer: [style().button, { marginTop: 24 }] }}
            enabled={!loading}
            onPress={startSession}
          />
        </>
      ) : (
        <>
          {activeMode === 'qr' && qrValue ? (
            <>
              <QRCode
                value={qrValue}
                size={qrSize}
                getRef={(c) => (svgRef.current = c)}
                quietZone={20}
              />
              <View style={style().containerView}>
                <RoundedButton
                  text="Descargar QR"
                  style={style().button}
                  enabled={!downloading}
                  onPress={downloadQR}
                />
              </View>
            </>
          ) : (
            <View style={localStyles.locationActiveContainer}>
              <Text style={localStyles.locationActiveIcon}>📍</Text>
              <Text style={localStyles.locationActiveTitle}>Sesión por ubicación activa</Text>
              <Text style={localStyles.locationActiveSede}>
                Sede: {activeCampus ? CAMPUS_NAMES[activeCampus] : ''}
              </Text>
              <Text style={localStyles.locationActiveInfo}>
                Los alumnos pueden marcar presencia desde la sección "Mis asistencias" usando su ubicación GPS.
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const localStyles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modeButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E8F0FE',
  },
  modeButtonText: {
    fontSize: 15,
    color: '#666',
  },
  modeButtonTextActive: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  locationActiveContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  locationActiveIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  locationActiveTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
    textAlign: 'center',
  },
  locationActiveSede: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
  },
  locationActiveInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SemesterAttendanceQR;
