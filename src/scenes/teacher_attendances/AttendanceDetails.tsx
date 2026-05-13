import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { MaterialIcon } from '../../components';
import moment from 'moment';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchSemesterAttendances, selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';
import { StudentAttendance } from '../../models/StudentAttendance';
import { AttendanceDetailsHeaderRight } from './AttendanceDetailsHeaderRight';
import { ClassAttendance } from '../../models/ClassAttendance';
import { TeacherStudent } from '../../models/TeacherStudent';
import { teacherSemestersRepository } from '../../repositories';
import QRCode from 'react-native-qrcode-svg';
import { getQrAttendanceStringFromQrId } from '../../utils/qrCodeStringFactory';

interface RouteParams {
    classAttendance: ClassAttendance;
}

const AttendanceDetails: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
    const semesterData = useAppSelector(selectSemesterData)!;
    const { classAttendance } = route.params;

    const [presentStudents, setPresentStudents] = useState<TeacherStudent[]>([]);
    const [absentStudents, setAbsentStudents] = useState<TeacherStudent[]>([]);
    const [showQRModal, setShowQRModal] = useState(false);

    const setNavOptions = useCallback(() => {
        navigation.setOptions({
            title: 'Detalles de la clase',
            headerRight: () => {
                const now = new Date();
                const lowerLimit = new Date(classAttendance.createdAt);
                const upperLimit = new Date(classAttendance.expiresAt);
                if (now >= lowerLimit && now <= upperLimit) {
                    return <AttendanceDetailsHeaderRight onPress={() => setShowQRModal(true)} />;
                }
                return null;
            },
        });
    }, [navigation, classAttendance.createdAt, classAttendance.expiresAt]);

    useEffect(() => {
        const focusUnsubscribe = navigation.addListener('focus', () => {
            setNavOptions();
        });
        return focusUnsubscribe;
    }, [navigation, setNavOptions]);

    useEffect(() => {
        const present = semesterData.students.filter((student: TeacherStudent) =>
            classAttendance.attendances.find((attendance: StudentAttendance) => attendance.student.padron === student.padron)
        );

        const absent = semesterData.students.filter((student: TeacherStudent) =>
            !classAttendance.attendances.find((attendance: StudentAttendance) => attendance.student.padron === student.padron)
        );

        setPresentStudents(present);
        setAbsentStudents(absent);
    }, [semesterData, classAttendance]);

    const getLocationValid = (student: TeacherStudent): boolean | null => {
        if (classAttendance.mode !== 'qr_location') return null;
        const studentAttendance = classAttendance.attendances.find(
            (a) => a.student.padron === student.padron
        );
        return studentAttendance ? (studentAttendance as any).locationValid ?? null : null;
    };

    const renderAttendance = ({ item }: { item: TeacherStudent }, isPresent: boolean) => {
        const locationValid = isPresent ? getLocationValid(item) : null;
        return (
            <View style={styles.attendanceRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.attendanceText}>
                        {item.firstName} {item.lastName} ({item.padron})
                    </Text>
                    {isPresent && locationValid === false && (
                        <Text style={styles.locationWarning}>⚠️ Fuera del radio GPS</Text>
                    )}
                </View>
                {isPresent ? (
                    <TouchableOpacity style={styles.attendanceButton} onPress={() => handleConfirmRemoveAttendance(item)}>
                        <MaterialIcon
                            name={locationValid === false ? 'map-marker-off' : 'check-circle'}
                            fontSize={24}
                            color={locationValid === false ? '#856404' : 'green'}
                        />
                        <Text style={styles.attendanceButtonText}>
                            {locationValid === false ? 'Fuera de ubicación' : 'Presente'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.attendanceButton} onPress={() => handleConfirmAttendance(item)}>
                        <MaterialIcon name="plus-circle" fontSize={24} color="orange" />
                        <Text style={styles.attendanceButtonText}>Agregar Asistencia</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const handleConfirmAttendance = (student: TeacherStudent) => {
        Alert.alert(
            'Confirmar asistencia',
            `¿Está seguro de que desea agregar asistencia para ${student.firstName} ${student.lastName}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => handleAddManualAttendance(student) },
            ]
        );
    };

    const handleAddManualAttendance = async (student: TeacherStudent) => {
        const data = await teacherSemestersRepository.updatedPresentStateToStudent(student.id, classAttendance.qrid);
        if (data) {
            setPresentStudents(prevState => [...prevState, student]);
            setAbsentStudents(prevState => prevState.filter(s => s.id !== student.id));
            dispatch(fetchSemesterAttendances(semesterData.id));
        } else {
            Alert.alert('Error', 'No se pudo agregar la asistencia');
        }
    };

    const handleConfirmRemoveAttendance = (student: TeacherStudent) => {
        Alert.alert(
            'Confirmar remover asistencia',
            `¿Está seguro de que desea remover la asistencia para ${student.firstName} ${student.lastName}?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Confirmar', onPress: () => handleRemoveAttendance(student) },
            ]
        );
    };

    const handleRemoveAttendance = async (student: TeacherStudent) => {
        const data = await teacherSemestersRepository.removePresentStateFromStudent(student.id, classAttendance.qrid);
        if (data) {
            setPresentStudents(prevState => prevState.filter(s => s.id !== student.id));
            setAbsentStudents(prevState => [...prevState, student]);
            dispatch(fetchSemesterAttendances(semesterData.id));
        } else {
            Alert.alert('Error', 'No se pudo remover la asistencia');
        }
    };

    const attendanceData = [
        { key: 'present', header: 'Estudiantes Presentes', data: presentStudents },
        { key: 'absent', header: 'Estudiantes Ausentes', data: absentStudents }
    ];

    const qrValue = getQrAttendanceStringFromQrId(classAttendance.qrid);

    return (
        <View style={styles.container}>
            <Modal
                visible={showQRModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowQRModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>QR de la sesión</Text>
                        <Text style={styles.modalSubtitle}>
                            {moment(new Date(classAttendance.createdAt)).format('DD/MM/YYYY HH:mm')}
                        </Text>
                        <QRCode value={qrValue} size={220} quietZone={16} />
                        <TouchableOpacity style={styles.closeButton} onPress={() => setShowQRModal(false)}>
                            <Text style={styles.closeButtonText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Text style={styles.sessionHeader}>
                Fecha: {moment(new Date(classAttendance.createdAt)).format('DD/MM/YYYY')}
            </Text>
            <Text style={styles.subHeader}>
                Horario: {moment(new Date(classAttendance.createdAt)).format('HH:mm')} - {moment(new Date(classAttendance.expiresAt)).format('HH:mm')}
            </Text>
            {semesterData?.students?.length > 0 ? (
                <FlatList
                    data={attendanceData}
                    renderItem={({ item }) => (
                        <View>
                            <Text style={styles.listHeader}>{item.header}</Text>
                            {item.data.length > 0 ? (
                                item.data.map((student: TeacherStudent) => (
                                    <React.Fragment key={student.padron}>
                                        {renderAttendance({ item: student }, item.key === 'present')}
                                    </React.Fragment>
                                ))
                            ) : (
                                <Text style={styles.emptyListText}>
                                    {item.key === 'present'
                                        ? 'No hay estudiantes presentes.'
                                        : 'No hay estudiantes ausentes.'}
                                </Text>
                            )}
                        </View>
                    )}
                    keyExtractor={(item) => item.key}
                />
            ) : (
                <Text style={styles.noAttendanceText}>No hay estudiantes para este cuatrimestre</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    sessionHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
        textAlign: 'center',
    },
    listHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    attendanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
        borderRadius: 5,
        marginBottom: 5,
    },
    attendanceText: {
        fontSize: 16,
        flex: 1,
    },
    noAttendanceText: {
        fontStyle: 'italic',
        color: '#666',
        textAlign: 'center',
        marginTop: 20,
    },
    emptyListText: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
        marginVertical: 5,
    },
    attendanceButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e0e0e0',
        padding: 8,
        borderRadius: 5,
    },
    attendanceButtonText: {
        marginLeft: 8,
        fontSize: 16,
    },
    locationWarning: {
        fontSize: 12,
        color: '#856404',
        marginTop: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 28,
        alignItems: 'center',
        gap: 16,
        maxWidth: 320,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: -8,
    },
    closeButton: {
        marginTop: 4,
        paddingVertical: 10,
        paddingHorizontal: 32,
        backgroundColor: '#007AFF',
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AttendanceDetails;
