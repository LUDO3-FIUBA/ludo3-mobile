import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton } from '../../components';
import { CAMPUS_NAMES, Campus } from '../../models/ClassAttendance';
import { attendanceRepository } from '../../repositories';
import { makeRequest } from '../../networking/makeRequest';

interface RouteParams {
    sessionId: string;
    campus: Campus;
}

interface Coordinates {
    latitude: number;
    longitude: number;
}

class LocationAccessError extends Error {
    title: string;

    constructor(title: string, message: string) {
        super(message);
        this.title = title;
    }
}

const permissionDeniedError = new LocationAccessError(
    'Permiso denegado',
    'Necesitamos acceso a tu ubicación para confirmar tu asistencia. Habilitalo en la configuración del dispositivo.',
);

const getWebCurrentPosition = (): Promise<Coordinates> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
        return Promise.reject(new LocationAccessError(
            'Ubicación no disponible',
            'Tu navegador no permite obtener la ubicación. Usá un navegador compatible o marcá asistencia desde la app móvil.',
        ));
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
            }),
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    reject(permissionDeniedError);
                    return;
                }

                reject(new LocationAccessError(
                    'Ubicación no disponible',
                    'No pudimos obtener tu ubicación. Revisá que el GPS esté activo y volvé a intentar.',
                ));
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0,
            },
        );
    });
};

const getCurrentCoordinates = async (): Promise<Coordinates> => {
    if (Platform.OS === 'web') {
        return getWebCurrentPosition();
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw permissionDeniedError;
    }

    const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
    });

    return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
    };
};

const AttendanceLocationSubmitScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { sessionId, campus } = route.params;

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [locationValid, setLocationValid] = useState<boolean | null>(null);

    const handleMarkPresence = async () => {
        if (loading || submitted) return;
        setLoading(true);

        try {
            const coordinates = await getCurrentCoordinates();

            const attendance = await makeRequest(
                () => attendanceRepository.submitLocationAttendance(
                    sessionId,
                    coordinates.latitude,
                    coordinates.longitude,
                ),
                navigation,
            ) as { location_valid: boolean };

            setLocationValid(attendance.location_valid);
            setSubmitted(true);
        } catch (error) {
            console.log('Error submitting location attendance', error);
            if (error instanceof LocationAccessError) {
                Alert.alert(error.title, error.message);
                return;
            }

            Alert.alert('Error', 'No pudimos registrar tu asistencia. Intentá nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.title}>Asistencia por ubicación</Text>
            <Text style={styles.subtitle}>
                Sede: <Text style={styles.campusName}>{CAMPUS_NAMES[campus]}</Text>
            </Text>
            <Text style={styles.info}>
                Presioná el botón para que la app capture tu ubicación y confirme que estás en la sede.
            </Text>

            {!submitted ? (
                <RoundedButton
                    text={loading ? 'Obteniendo ubicación...' : 'Marcar presencia'}
                    style={{ MainContainer: [styles.button, loading && styles.buttonDisabled] }}
                    enabled={!loading}
                    onPress={handleMarkPresence}
                />
            ) : (
                <View style={[styles.resultContainer, locationValid ? styles.resultValid : styles.resultInvalid]}>
                    <Text style={styles.resultIcon}>{locationValid ? '✅' : '⚠️'}</Text>
                    <Text style={styles.resultTitle}>
                        {locationValid ? 'Presencia confirmada' : 'Fuera del radio de la sede'}
                    </Text>
                    <Text style={styles.resultDescription}>
                        {locationValid
                            ? 'Tu asistencia fue registrada correctamente.'
                            : 'Tu ubicación está fuera del radio permitido. Tu asistencia quedó registrada pero marcada como inválida. Consultá con tu docente.'}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
    },
    icon: {
        fontSize: 64,
        marginBottom: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: '#555',
        marginBottom: 16,
    },
    campusName: {
        fontWeight: 'bold',
        color: '#007AFF',
    },
    info: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 32,
        paddingHorizontal: 8,
    },
    button: {
        width: '100%',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    resultContainer: {
        width: '100%',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    resultValid: {
        backgroundColor: '#d4edda',
        borderColor: '#28a745',
        borderWidth: 1,
    },
    resultInvalid: {
        backgroundColor: '#fff3cd',
        borderColor: '#ffc107',
        borderWidth: 1,
    },
    resultIcon: {
        fontSize: 40,
        marginBottom: 8,
    },
    resultTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    resultDescription: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default AttendanceLocationSubmitScreen;
