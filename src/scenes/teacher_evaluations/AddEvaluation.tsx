import React, { useState } from 'react';
import {
  Alert,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Loading, RoundedButton } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import { TeacherSemester } from '../../models/TeacherSemester';
import { teacherEvaluationsRepository } from '../../repositories';
import { useAppSelector } from '../../redux/hooks';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';

interface Props {

}

const AddEvaluation: React.FC<Props> = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const [finishDate, setFinishDate] = useState<Date | null>(null);
  const [finishTime, setFinishTime] = useState<Date | null>(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const [showFinishDatePicker, setShowFinishDatePicker] = useState(false);
  const [showFinishTimePicker, setShowFinishTimePicker] = useState(false);

  const [minimumPassingGrade, setMinimumPassingGrade] = useState<string>('')
  const [creating, setCreating] = useState(false);

  const navigation = useNavigation();
  const semester: TeacherSemester = useAppSelector(selectSemesterData)!

  const onStartDateChange = (event: any, selectedDate: any) => {
    setShowStartDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setStartDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
      setFinishDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()))
    }
  };

  const onStartTimeChange = (event: any, selectedTime: any) => {
    setShowStartTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      // Just update the startTime state
      setStartTime(new Date(selectedTime));
      const timeAfterThreeHours = new Date(selectedTime).setHours(new Date(selectedTime).getHours() + 3);
      setFinishTime(new Date(timeAfterThreeHours));
    }
  };

  const onFinishDateChange = (event: any, selectedDate: any) => {
    setShowFinishDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setFinishDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()));
    }
  };

  const onFinishTimeChange = (event: any, selectedTime: any) => {
    setShowFinishTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setFinishTime(new Date(selectedTime));
    }
  };

  const combineDateAndTime = (date: Date, time: Date) => {
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      time.getHours(),
      time.getMinutes()
    );
  };

  const isFinishAfterStart = (startDate: Date, startTime: Date, finishDate: Date, finishTime: Date) => {
    const startFullDate = combineDateAndTime(startDate, startTime);
    const finishFullDate = combineDateAndTime(finishDate, finishTime);
    return finishFullDate > startFullDate;
  };

  const [evaluationName, setEvaluationName] = useState('')
  return (
    <ScrollView style={style().containerView}>
      <View style={{ marginBottom: 100 }}>
        <View style={style().dateButtonInputs}>
          <Text style={{ ...style().text, color: 'black', }}>
            Nombre de la instancia evaluatoria
          </Text>
        </View>
        <TextInput
          style={{
            height: 40,
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: 'grey',
            marginBottom: 10
          }}
          onChangeText={setEvaluationName}
          value={evaluationName}
          placeholder="Por ejemplo: Primer Parcial"
        />

        <View style={style().dateButtonInputs}>
          <Text style={{ ...style().text, color: 'black', }}>
            Nota mínima de aprobación
          </Text>
        </View>

        <TextInput
          style={{
            height: 40,
            borderWidth: 1,
            padding: 10,
            borderRadius: 5,
            borderColor: 'grey',
          }}
          onChangeText={setMinimumPassingGrade}
          value={minimumPassingGrade}
          placeholder="Por ejemplo: 4"
        />

        <View style={style().dateButtonInputs}>
          <Text style={{ ...style().text, color: 'black', marginTop: 10 }}>
            Fecha de Inicio
          </Text>
        </View>
        {showStartDatePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            onChange={onStartDateChange}
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
          onPress={() => setShowStartDatePicker(true)}
        >
          {
            startDate ? (<Text>
              {moment(startDate).format('dddd D MMMM YYYY')}
            </Text>) : (<Text>
              Por ejemplo: lunes 01 enero 2024
            </Text>)
          }
        </TouchableOpacity>

        <View style={{ ...style().dateButtonInputs }}>
          <Text style={{ ...style().text, marginTop: 10 }}>
            Horario de inicio
          </Text>
        </View>
        {showStartTimePicker && (
          <DateTimePicker
            value={startDate || new Date()}
            mode="time"
            onChange={onStartTimeChange}
            minuteInterval={30}
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
          onPress={() => setShowStartTimePicker(true)}
        >
          {
            startTime ? (<Text>
              {moment(startTime).format('hh:mm A') + ' (' + moment(startTime).format('HH:mm') + ')'}
            </Text>) : (<Text>
              Por ejemplo: 7:00 PM (19:00)
            </Text>)
          }
        </TouchableOpacity>
        <Text style={{ color: 'grey', fontSize: 12, marginTop: 3 }}> Los horarios están restringidos a intervalos de 30 minutos</Text>


        {/* Fecha de finalización */}
        <View style={style().dateButtonInputs}>
          <Text style={{ ...style().text, color: 'black', marginTop: 10 }}>
            Fecha de finalización
          </Text>
        </View>
        {showFinishDatePicker && (
          <DateTimePicker
            value={finishDate || new Date()}
            mode="date"
            onChange={onFinishDateChange}
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
          onPress={() => setShowFinishDatePicker(true)}
        >
          {
            finishDate ? (<Text>
              {moment(finishDate).format('dddd D MMMM YYYY')}
            </Text>) : (<Text>
              Por ejemplo: lunes 01 enero 2024
            </Text>)
          }
        </TouchableOpacity>

        <View style={{ ...style().dateButtonInputs }}>
          <Text style={{ ...style().text, marginTop: 10 }}>
            Horario de finalización
          </Text>
        </View>
        {showFinishTimePicker && (
          <DateTimePicker
            value={finishDate || new Date()}
            mode="time"
            onChange={onFinishTimeChange}
            minuteInterval={30}
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
          onPress={() => setShowFinishTimePicker(true)}
        >
          {
            finishTime ? (<Text>
              {moment(finishTime).format('hh:mm A') + ' (' + moment(finishTime).format('HH:mm') + ')'}
            </Text>) : (<Text>
              Por ejemplo: 10 PM (22:00)
            </Text>)
          }
        </TouchableOpacity>
        <Text style={{ color: 'grey', fontSize: 12, marginTop: 3, marginBottom: 25 }}> Los horarios están restringidos a intervalos de 30 minutos</Text>

        <RoundedButton
          text="Agregar evaluación"
          style={{ ...style().button }}
          enabled={!!evaluationName && !!evaluationName && !!startDate && !!finishDate && !!startTime && !!finishTime && !creating && !!minimumPassingGrade}
          onPress={() => {
            if (startDate && finishDate && startTime && finishTime) {
              if (isFinishAfterStart(startDate, startTime, finishDate, finishTime)) {
                setCreating(true);

                const startFullDate = combineDateAndTime(startDate, startTime);
                const finishFullDate = combineDateAndTime(finishDate, finishTime);

                teacherEvaluationsRepository.create(semester, evaluationName, startFullDate, finishFullDate, minimumPassingGrade)
                  .then(() => {
                    setCreating(false);
                    navigation.goBack();
                  })
                  .catch((error: any) => {
                    setCreating(false);
                    Alert.alert(
                      'Te fallamos',
                      'No pudimos crear este final. ' +
                      'Volvé a intentar en unos minutos.',
                    );
                  });
              } else {
                Alert.alert('Error', 'La fecha y hora de finalización no pueden ser anteriores a la fecha y hora de inicio.');
              }
            } else {
              throw ('Date or Time is null');
            }
          }}
        />
        {creating && <Loading />}
      </View>
    </ScrollView>
  );
};

export default AddEvaluation;
