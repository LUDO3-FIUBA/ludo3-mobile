import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
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
    const semesterData = useAppSelector(state => state.semester.data)!;

    const [totalClasses, setTotalClasses] = useState<string>(semesterData.classesAmount.toString());
    const [minAttendance, setMinAttendance] = useState<string>(semesterData.minimumAttendance.toString());
    const [attendanceError, setAttendanceError] = useState<string | null>(null);

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
            Alert.alert('Éxito', 'Cuatrimestre actualizado correctamente', [
                { text: 'OK', onPress: () => navigation.navigate("SemesterCard") },
            ]);
        } catch (error) {
            Alert.alert('Error', 'Hubo un error al actualizar los datos del cuatrimestre. Por favor intente de nuevo.');
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

    return (
        <View style={styles.container}>
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
            {/* <SquaredButton text="Guardar Cambios" disabled={dataNotValid()} onPress={handleUpdateSemester} /> */}
            <RoundedButton
                text='Guardar Cambios'
                onPress={handleUpdateSemester}
                style={{ }} // TODO: move this to the src/styles collection
            />
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
});

export default SemesterEditScreen;
