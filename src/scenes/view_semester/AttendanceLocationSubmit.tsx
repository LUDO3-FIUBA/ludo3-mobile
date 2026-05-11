import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RoundedButton } from '../../components';
import { attendanceRepository } from '../../repositories';
import { makeRequest } from '../../networking/makeRequest';
import { StatusCodeError } from '../../networking';

interface RouteParams {
    qrid: string;
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
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
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

const isOutsideCampusError = (error: unknown): boolean =>
    error instanceof StatusCodeError && error.code === 422;

type ScreenState = 'verifying' | 'outside_campus' | 'confirmed';

const AttendanceLocationSubmitScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const { qrid } = route.params;

    const [screenState, setScreenState] = useState<ScreenState>('verifying');

    useEffect(() => {
        navigation.setOptions({ title: 'Verificando ubicación' });
    }, [navigation]);

    const attemptSubmit = async () => {
        setScreenState('verifying');
        try {
            const coordinates = await getCurrentCoordinates();
            await makeRequest(
                () => attendanceRepository.submitAttendance(qrid, coordinates.latitude, coordinates.longitude),
                navigation,
            );
            setScreenState('confirmed');
        } catch (error) {
            console.log('Error submitting location attendance', error);
            if (error instanceof LocationAccessError) {
                Alert.alert(error.title, error.message);
                navigation.goBack();
                return;
            }
            if (isOutsideCampusError(error)) {
                setScreenState('outside_campus');
                return;
            }
            Alert.alert('Error', 'No pudimos registrar tu asistencia. Intentá nuevamente.');
            navigation.goBack();
        }
    };

    useEffect(() => {
        attemptSubmit();
    }, []);

    if (screenState === 'verifying') {
        return (
            <View style={styles.container}>
                <Text style={styles.icon}>📍</Text>
                <Text style={styles.title}>Verificando ubicación...</Text>
                <Text style={styles.info}>
                    Estamos obteniendo tu posición GPS para confirmar que estás en la sede.
                </Text>
            </View>
        );
    }

    if (screenState === 'outside_campus') {
        return (
            <View style={styles.container}>
                <View style={[styles.resultContainer, styles.resultInvalid]}>
                    <Text style={styles.resultIcon}>⚠️</Text>
                    <Text style={styles.resultTitle}>Fuera del radio de la sede</Text>
                    <Text style={styles.resultDescription}>
                        Tu ubicación está fuera del radio permitido. Acercate más a la sede y volvé a intentar.
                    </Text>
                    <RoundedButton
                        text="Reintentar"
                        style={{ MainContainer: styles.retryButton }}
                        enabled={true}
                        onPress={attemptSubmit}
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.resultContainer, styles.resultValid]}>
                <Text style={styles.resultIcon}>✅</Text>
                <Text style={styles.resultTitle}>Presencia confirmada</Text>
                <Text style={styles.resultDescription}>
                    Tu asistencia fue registrada correctamente.
                </Text>
            </View>
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
    info: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 8,
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
    retryButton: {
        width: '100%',
        marginTop: 16,
    },
});

export default AttendanceLocationSubmitScreen;
