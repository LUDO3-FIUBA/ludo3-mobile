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
import { teacherFinalsRepository } from '../../repositories';
import combineDateAndTime from '../../utils/combineDateAndTime';


interface Props {

}

interface AddFinalRouteParams {
  subjectId: number;
  subjectName: string;
}

const AddFinal: React.FC<Props> = () => {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const [finishDate, setFinishDate] = useState<Date | null>(null);
  const [finishTime, setFinishTime] = useState<Date | null>(null);

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  const [showFinishDatePicker, setShowFinishDatePicker] = useState(false);
  const [showFinishTimePicker, setShowFinishTimePicker] = useState(false);
  const [creating, setCreating] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  const subjectId: number = (route.params as AddFinalRouteParams).subjectId
  const subjectName: string = (route.params as AddFinalRouteParams).subjectName

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

  const isFinishAfterStart = (startDate: Date, startTime: Date, finishDate: Date, finishTime: Date) => {
    const startFullDate = combineDateAndTime(startDate, startTime);
    const finishFullDate = combineDateAndTime(finishDate, finishTime);
    return finishFullDate > startFullDate;
  };

  const [finalName, setFinalName] = useState('')
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
            borderColor: 'grey'
          }}
          onChangeText={setFinalName}
          value={finalName}
          placeholder="Por ejemplo: Primera instancia de final"
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
        <Text style={{ color: 'grey', fontSize: 12, marginTop: 3, marginBottom: 20 }}> Los horarios están restringidos a intervalos de 30 minutos</Text>

        <RoundedButton
          text="Agregar instancia de final"
          style={style().button}
          enabled={finalName !== null && finalName !== '' && startDate !== null && finishDate !== null && startTime !== null && finishTime !== null && !creating}
          onPress={() => {
            if (startDate && finishDate && startTime && finishTime) {
              if (isFinishAfterStart(startDate, startTime, finishDate, finishTime)) {
                setCreating(true);

                const startFullDate = combineDateAndTime(startDate, startTime);
                const finishFullDate = combineDateAndTime(finishDate, finishTime);

                // TODO: resolve this, endpoint not working from backend
                teacherFinalsRepository.createFinal(subjectId, subjectName, startFullDate)
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


export default AddFinal;
