import React, { useState } from 'react';
import { ActivityIndicator, View, Text, TextInput, Button, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AlertDialog from '../../components/AlertDialog';
import { useNavigation } from '@react-navigation/native';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { teacherSemestersRepository } from '../../repositories';
import moment from 'moment';
import { UpdateSemesterDetails } from '../../models/UpdateSemesterDetails';
import { modifySemesterDetails } from '../../redux/reducers/teacherSemesterSlice';
import SquaredButton from '../../components/SquaredButton';
import { RoundedButton } from '../../components';

const SemesterEditScreen: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation();
    const semesterData = useAppSelector(state => state.teacherSemester.data)!;

    const [totalClasses, setTotalClasses] = useState<string>(semesterData.classesAmount.toString());
    const [minAttendance, setMinAttendance] = useState<string>(semesterData.minimumAttendance.toString());
    const [attendanceError, setAttendanceError] = useState<string | null>(null);
    const [calendarUrl, setCalendarUrl] = useState<string>(semesterData.calendarSourceUrl ?? '');
    const [syncing, setSyncing] = useState(false);
    const [syncResult, setSyncResult] = useState<{ ok: boolean; message: string } | null>(null);
    const [alertDialog, setAlertDialog] = useState<{ title: string; message: string; onConfirm?: () => void } | null>(null);

    const dataNotValid = (): boolean => {
        const parsedMinAttendance = parseFloat(minAttendance);
        return parsedMinAttendance < 0 || parsedMinAttendance > 100;
    };

    const handleUpdateSemester = async () => {
        try {
            const parsedTotalClasses = parseInt(totalClasses);
            const parsedMinAttendance = parseFloat(minAttendance);
            setAttendanceError(null);

            const formattedDate = moment(semesterData.startDate).toISOString(true);
            console.log("Formatted date", formattedDate);

            const response: UpdateSemesterDetails = await teacherSemestersRepository.updateSemesterDetails(
                semesterData.commission.id,
                semesterData.yearMoment,
                formattedDate,
                parsedTotalClasses,
                parsedMinAttendance
            );

            dispatch(modifySemesterDetails({ classesAmount: response.classesAmount, minimumAttendance: response.minimumAttendance }));
            setAlertDialog({ title: 'Éxito', message: 'Cuatrimestre actualizado correctamente', onConfirm: () => navigation.navigate("SemesterCard") });
        } catch (error) {
            setAlertDialog({ title: 'Error', message: 'Hubo un error al actualizar los datos del cuatrimestre. Por favor intente de nuevo.' });
        }
    };

    const handleMinAttendanceChange = (value: string) => {
        setMinAttendance(value);
        const attendance = parseFloat(value);
        if (attendance < 0 || attendance > 100) {
            setAttendanceError('El porcentaje de asistencia debe estar entre 0 y 100');
        } else {
            setAttendanceError(null);
        }
    };

    const handleSyncCalendar = async () => {
        if (!calendarUrl.trim()) {
            setSyncResult({ ok: false, message: 'Ingresá un link de Google Sheets primero.' });
            return;
        }
        setSyncing(true);
        setSyncResult(null);
        try {
            await teacherSemestersRepository.setCalendarSourceUrl(semesterData.id, calendarUrl.trim());
            const result = await teacherSemestersRepository.syncCatedraCalendar(semesterData.id);
            setSyncResult({ ok: true, message: `Se importaron ${result.synced} entradas del calendario.` });
        } catch {
            setSyncResult({ ok: false, message: 'No se pudo sincronizar el calendario. Verificá que el link sea un Google Sheets publicado.' });
        } finally {
            setSyncing(false);
        }
    };

    return (
        <View style={styles.container}>
            <AlertDialog
                visible={alertDialog !== null}
                title={alertDialog?.title ?? ''}
                message={alertDialog?.message ?? ''}
                mode="info"
                confirmLabel="Aceptar"
                onConfirm={() => { alertDialog?.onConfirm?.(); setAlertDialog(null); }}
            />
            <Text style={styles.label}>Cantidad de Clases Totales</Text>
            <TextInput
                style={styles.input}
                value={totalClasses}
                onChangeText={setTotalClasses}
                keyboardType="numeric"
            />
            <Text style={styles.label}>Porcentaje de Asistencia Mínimo</Text>
            <TextInput
                style={styles.input}
                value={minAttendance}
                onChangeText={handleMinAttendanceChange}
                keyboardType="numeric"
            />
            {attendanceError && <Text style={styles.errorText}>{attendanceError}</Text>}
            <RoundedButton
                text='Guardar Cambios'
                onPress={handleUpdateSemester}
                style={{}}
            />

            <Text style={[styles.label, { marginTop: 30 }]}>Calendario de cátedra</Text>
            <Text style={styles.hint}>
                Pegá el link de tu Google Sheets publicado. Los alumnos verán el tema de cada clase en su calendario.
            </Text>
            <TextInput
                style={styles.input}
                value={calendarUrl}
                onChangeText={setCalendarUrl}
                placeholder="https://docs.google.com/spreadsheets/d/..."
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
            />
            <View style={styles.calendarStatus}>
                <Icon
                    name={semesterData.calendarSourceUrl ? 'check-circle' : 'close-circle-outline'}
                    size={16}
                    color={semesterData.calendarSourceUrl ? '#2ecc71' : '#999'}
                />
                <Text style={[styles.calendarStatusText, { color: semesterData.calendarSourceUrl ? '#2ecc71' : '#999' }]}>
                    {semesterData.calendarSourceUrl ? 'Calendario configurado' : 'Sin calendario'}
                </Text>
            </View>
            {syncing
                ? <ActivityIndicator style={{ marginTop: 8 }} />
                : (
                    <RoundedButton
                        text='Sincronizar calendario'
                        onPress={handleSyncCalendar}
                        style={{}}
                    />
                )
            }
            {syncResult && (
                <View style={[styles.syncBanner, { backgroundColor: syncResult.ok ? '#d4edda' : '#f8d7da' }]}>
                    <Icon
                        name={syncResult.ok ? 'check-circle' : 'alert-circle'}
                        size={16}
                        color={syncResult.ok ? '#155724' : '#721c24'}
                    />
                    <Text style={[styles.syncBannerText, { color: syncResult.ok ? '#155724' : '#721c24' }]}>
                        {syncResult.message}
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f0f0f0',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    input: {
        height: 55,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        marginBottom: 20,
    },
    hint: {
        fontSize: 13,
        color: '#666',
        marginBottom: 10,
    },
    calendarStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 6,
    },
    calendarStatusText: {
        fontSize: 13,
    },
    syncBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    syncBannerText: {
        fontSize: 13,
        flex: 1,
    },
});

export default SemesterEditScreen;
