import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RoundedButton } from '../../components';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { teacherSemestersRepository } from '../../repositories';
import { useAppSelector } from '../../redux/hooks';
import { selectTeacherCommissions } from '../../redux/reducers/teacherUserDataSlice';
import DropDownPicker from 'react-native-dropdown-picker';
import combineDateAndTime from '../../utils/combineDateAndTime';

import moment from 'moment';


const CreateSemester = () => {
  const commissions = useAppSelector(selectTeacherCommissions)
  const [numClasses, setNumClasses] = useState('');
  const [minAttendance, setMinAttendance] = useState('');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false)

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const navigation = useNavigation()

  // Commission Picker
  const [chosenCommission, setChosenCommission] = useState(null)
  const [openCommissionPicker, setOpenCommissionPicker] = useState(false);
  const [itemsToShowInCommissionPicker, setItemsToShowInCommissionPicker] = useState(commissions.map((actualCommission) => {
    return { label: actualCommission.subjectName, value: actualCommission.id }
  }))

  // Year moment picker
  const [yearMoment, setYearMoment] = useState('FS');
  const [openYearMomentPicker, setOpenYearMomentPicker] = useState(false);
  const [itemsToShowInYearMomentPicker, setItemsToShowInYearMomentPicker] = useState(
    [{ label: 'Primer Cuatrimestre', value: 'FS' }, { label: 'Segundo Cuatrimestre', value: 'SS' }])

  // Reset the values when navigation switches
  useFocusEffect(
    useCallback(() => {
      setYearMoment('FS');
      setNumClasses('');
      setMinAttendance('');
      setStartDate(null);
      setStartTime(null);
    }, [])
  );


  const onTimeChange = (event: any, selectedTime: any) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      const createdTime = new Date(selectedTime)
      console.log("Created time", createdTime);

      setStartTime(createdTime);
    }
  };

  const onDateChange = (event: any, selectedDate: any) => {
    setShowDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setStartDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
    }
  };

  const createSemester = async () => {
    try {
      let numberClasses = numClasses ? +numClasses : null
      let mininumAttendance = minAttendance ? +minAttendance : null
      if (chosenCommission && yearMoment && startDate && startTime) {
        const combinedStartDateAndTime = combineDateAndTime(startDate, startTime)

        console.log("About to create semester");
        const response = await teacherSemestersRepository.createSemester(chosenCommission, yearMoment, combinedStartDateAndTime, numberClasses, mininumAttendance)
        console.log("Response", response);

        navigation.navigate('Home');
      } else {
        Alert.alert(
          'Error',
          'No se completaron todos los campos antes de enviar el formulario.'
        );
      }
    } catch (error) {

    }
  }


  return (
    <ScrollView style={styles.container}>
      <View style={{ marginBottom: 100 }}>
        <Text style={{ ...styles.label, marginTop: -5 }}>Comisión</Text>
        <DropDownPicker
          open={openCommissionPicker}
          style={{ borderColor: 'gray' }}
          value={chosenCommission}
          placeholder='Elija una comisión a la qué agregar el cuatrimestre'
          items={itemsToShowInCommissionPicker}
          setOpen={setOpenCommissionPicker}
          setValue={setChosenCommission}
          setItems={setItemsToShowInCommissionPicker}
        />

        <Text style={{ ...styles.label, marginTop: 20 }}>Momento del año</Text>
        <DropDownPicker
          open={openYearMomentPicker}
          style={{ borderColor: 'gray', zIndex: openYearMomentPicker ? 1 : 0 }}
          value={yearMoment}
          placeholder='Elija el semester'
          items={itemsToShowInYearMomentPicker}
          setOpen={setOpenYearMomentPicker}
          setValue={setYearMoment}
          setItems={setItemsToShowInYearMomentPicker}
        />

        <Text style={{ ...styles.label, marginTop: 20 }}>Comienzo de clases</Text>

        <Text style={styles.subLabel}>Fecha de inicio de clases</Text>
        {showDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        <TouchableOpacity
          style={{
            height: 40,
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: 'grey'
          }}
          onPress={() => setShowDatePicker(true)}
        >
          {
            startDate ? (<Text>
              {moment(startDate).format('dddd D MMMM YYYY')}
            </Text>) : (<Text>
              Por ejemplo: lunes 01 enero 2024
            </Text>)
          }
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="time"
            onChange={onTimeChange}
            minuteInterval={30}
          />
        )}

        <Text style={styles.subLabel}>Horario de inicio de clases </Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowTimePicker(true)}
        >
          {
            startTime ? (<Text>
              {moment(startTime).format('hh:mm A') + ' (' + moment(startTime).format('HH:mm') + ')'}
            </Text>) : (<Text>
              Por ejemplo: 7:00 PM (19:00)
            </Text>)
          }
        </TouchableOpacity>

        <Text style={{ ...styles.label, marginTop: 15 }}>Cantidad de clases</Text>
        <TextInput
          style={styles.input}
          keyboardType='numeric'
          value={numClasses}
          onChangeText={setNumClasses}
          placeholder="Ingrese la cantidad de clases"
        />

        <Text style={styles.label}>Porcentaje mínimo de asistencia (del 1 al 100) </Text>
        <TextInput
          style={styles.input}
          keyboardType='numeric'
          value={minAttendance}
          onChangeText={(text) => {
            if (text) {
              const filteredText = text.replace(/[^0-9]/g, ''); // Allow only numbers
              if (parseInt(filteredText) <= 100) {
                setMinAttendance(filteredText);
              }
            } else {
              setMinAttendance('')
            }
          }}
          placeholder="Ingrese el porcentaje"
        />
        <View
          style={{ marginTop: 15 }}
        >
          <RoundedButton
            text="Crear cuatrimestre"
            enabled={(startDate !== null) && (startTime !== null)}
            onPress={createSemester}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
    color: 'black'
  },
  subLabel: {
    fontSize: 14,
    marginVertical: 5
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 5
  },
  datePicker: {
    marginBottom: 15,
  },
});

export default CreateSemester;
