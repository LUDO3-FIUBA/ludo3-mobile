import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import teacherRoles from '../models/TeacherRoles';
import { TeacherTuple } from '../models/TeacherTuple';
import { lightModeColors } from '../styles/colorPalette';
import MaterialIcon from './materialIcon';
import PercentageInput from './PercentageInput';

interface TeacherConfigurationCardProps {
    teacherTuple: TeacherTuple;
    teacherGraderWeightAsPercentage: string;
    handleRoleChange: (newRole: string, teacherDNI: string) => void;
    handleWeightChange: (newPercentageInput: number, teacherDNI: string) => void;
    isChiefTeacher?: boolean
}

const TeacherConfigurationCard: React.FC<TeacherConfigurationCardProps> = ({
    teacherTuple,
    teacherGraderWeightAsPercentage,
    handleRoleChange,
    handleWeightChange,
    isChiefTeacher = false
}) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    return (
        <View style={styles.card}>
            <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)} style={styles.cardItem}>
                <MaterialIcon name="account" fontSize={24} color={lightModeColors.institutional} style={{ marginRight: 10 }} />
                <Text style={styles.passingGradeText}>{teacherTuple.teacher.firstName} {teacherTuple.teacher.lastName}</Text>
                <MaterialIcon name={isExpanded ? "chevron-up" : "chevron-down"} fontSize={24} color='black' />
            </TouchableOpacity>
            {isExpanded && (
                <View>
                    <View style={styles.cardBlock}>
                        <Text style={styles.passingGradeLabel}>Rol</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                enabled={!isChiefTeacher}
                                selectedValue={teacherTuple.role}
                                onValueChange={(itemValue) => handleRoleChange(itemValue, teacherTuple.teacher.dni)}>
                                {teacherRoles.map(role => (
                                    <Picker.Item key={role.id} label={role.longVersion} value={role.shortVersion} />
                                ))}
                            </Picker>
                        </View>
                    </View>
                    <View style={styles.cardBlock}>
                        <Text style={styles.passingGradeLabel}>Ponderación (%) para correcciones</Text>
                        <PercentageInput
                            enabled={teacherGraderWeightAsPercentage !== '100.00'}
                            initialValue={teacherGraderWeightAsPercentage}
                            onBlur={(value) => handleWeightChange(value, teacherTuple.teacher.dni)}
                        />
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'column',
        marginBottom: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        elevation: 3,
    },
    cardItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        justifyContent: 'space-between'
    },
    cardBlock: { paddingHorizontal: 15, paddingBottom: 15 },
    passingGradeText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: lightModeColors.institutional,
    },
    passingGradeLabel: {
        fontSize: 14,
        color: 'black',
        marginBottom: 4,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: 'grey',
        borderRadius: 8,
        overflow: 'hidden',
    },
});

export default TeacherConfigurationCard;
