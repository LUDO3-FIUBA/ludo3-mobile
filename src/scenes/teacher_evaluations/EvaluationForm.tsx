// src/scenes/teacher_evaluations/EvaluationForm.tsx
import React, { useEffect, useState } from 'react';
import { Alert, Text, View, TouchableOpacity, TextInput, ScrollView, Switch } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import moment from 'moment';
import { Loading, RoundedButton } from '../../components';
import { getStyleSheet as style } from '../../styles';
import DropDownPicker from 'react-native-dropdown-picker';
import { TeacherSemester } from '../../models/TeacherSemester';
import { TeacherEvaluation } from '../../models/TeacherEvaluation';
import { teacherEvaluationsRepository } from '../../repositories';

export type EvaluationFormValues = {
  evaluationName: string;
  minimumPassingGrade: string | null;
  startDate: Date | null;
  startTime: Date | null;
  finishDate: Date | null;
  finishTime: Date | null;
  requireIdentityVerification: boolean;
  requireQrScan: boolean;
  isGradeable: boolean;
  isMakeUp: boolean;
  parentEvaluation: TeacherEvaluation | null;
};

type Props = {
  titleButton: string;
  initialValues: EvaluationFormValues;
  submitting: boolean;
  onSubmit: (values: EvaluationFormValues) => Promise<void>;
  semester: TeacherSemester;
  extraBottomContent?: React.ReactNode;
  onDelete?: () => void;
  deleting?: boolean;
  deleteButtonText?: string;
};

const combineDateAndTime = (date: Date, time: Date) =>
  new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
  );

const isFinishAfterStart = (
  startDate: Date,
  startTime: Date,
  finishDate: Date,
  finishTime: Date,
) => combineDateAndTime(finishDate, finishTime) > combineDateAndTime(startDate, startTime);

export default function EvaluationForm({
  titleButton,
  initialValues,
  submitting,
  onSubmit,
  semester,
  extraBottomContent,
  onDelete,
  deleting = false,
  deleteButtonText = 'Eliminar evaluación',
}: Props) {
  const placeholderColor = '#808080';
  const pickerPlaceholderTextStyle = { color: placeholderColor };

  const [evaluationName, setEvaluationName] = useState(initialValues.evaluationName);
  const [minimumPassingGrade, setMinimumPassingGrade] = useState(initialValues.minimumPassingGrade);

  const [startDate, setStartDate] = useState<Date | null>(initialValues.startDate);
  const [startTime, setStartTime] = useState<Date | null>(initialValues.startTime);
  const [finishDate, setFinishDate] = useState<Date | null>(initialValues.finishDate);
  const [finishTime, setFinishTime] = useState<Date | null>(initialValues.finishTime);

  const [requireIdentityVerification, setRequireIdentityVerification] = useState(
    initialValues.requireIdentityVerification,
  );
  const [requireQrScan, setRequireQrScan] = useState(initialValues.requireQrScan);
  const [isGradeable, setIsGradeable] = useState(initialValues.isGradeable);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showFinishDatePicker, setShowFinishDatePicker] = useState(false);
  const [showFinishTimePicker, setShowFinishTimePicker] = useState(false);
  const [openGradeTypePicker, setOpenGradeTypePicker] = useState(false);
  const [gradeTypeItems, setGradeTypeItems] = useState([
    { label: 'Nota numérica', value: true },
    { label: 'Aprobado/Desaprobado', value: false },
  ]);
  const [isMakeUp, setIsMakeUp] = useState(initialValues.isMakeUp);
  const [parentEvaluation, setParentEvaluation] = useState<TeacherEvaluation | null>(initialValues.parentEvaluation);
  const [selectedParentEvaluationId, setSelectedParentEvaluationId] = useState<string | null>(
    initialValues.parentEvaluation ? String(initialValues.parentEvaluation.id) : null,
  );
  const [evaluations, setEvaluations] = useState<TeacherEvaluation[]>([]);
  const [evaluationsItems, setEvaluationsItems] = useState<Array<{ label: string; value: string }>>([]);
  const [openEvaluationsDropdown, setOpenEvaluationsDropdown] = useState(false);
  const [loadingEvaluations, setLoadingEvaluations] = useState(false);

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      const normalizedDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
      );
      setStartDate(normalizedDate);
      setFinishDate(normalizedDate);
    }
  };

  const onStartTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowStartTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setStartTime(new Date(selectedTime));
      const timeAfterThreeHours = new Date(selectedTime);
      timeAfterThreeHours.setHours(timeAfterThreeHours.getHours() + 3);
      setFinishTime(timeAfterThreeHours);
    }
  };

  const onFinishDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowFinishDatePicker(false);
    if (event.type === 'set' && selectedDate) {
      setFinishDate(
        new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate(),
        ),
      );
    }
  };

  const onFinishTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowFinishTimePicker(false);
    if (event.type === 'set' && selectedTime) {
      setFinishTime(new Date(selectedTime));
    }
  };

  useEffect(() => {
    if (initialValues.isMakeUp) {
      fetchEvaluations();
    }
  }, []);

  const fetchEvaluations = async () => {
    try {
      setLoadingEvaluations(true);
      const evaluations = await teacherEvaluationsRepository.getEvaluationsBySemester(semester.id);
      setEvaluations(evaluations);
      console.log('Fetched evaluations for makeup:', evaluations);
      const items = evaluations.map((evaluation) => ({
        label: evaluation.evaluationName,
        value: String(evaluation.id),
      }));
      setEvaluationsItems(items);
    } catch (error) {
      Alert.alert(
        'Error',
        'No pudimos cargar las evaluaciones. Volvé a intentar en unos minutos.',
      );
    } finally {
      setLoadingEvaluations(false);
    }
  };

  const handleIsMakeUpChange = (value: boolean) => {
    setIsMakeUp(value);
    if (value) {
      fetchEvaluations();
    } else {
      setParentEvaluation(null);
      setSelectedParentEvaluationId(null);
      setEvaluations([]);
      setEvaluationsItems([]);
    }
  };

  const handleParentEvaluationChange = (value: string | null) => {
    setSelectedParentEvaluationId(value);
    const selectedEvaluation = evaluations.find((evaluation) => String(evaluation.id) === value) || null;
    setParentEvaluation(selectedEvaluation);
  };

  const enabled =
    !!evaluationName &&
    (!isGradeable || !!minimumPassingGrade) &&
    !!startDate &&
    !!startTime &&
    !!finishDate &&
    !!finishTime &&
    (!isMakeUp || !!parentEvaluation) &&
    !submitting;

  const submit = async () => {
    if (!startDate || !startTime || !finishDate || !finishTime) return;

    if (!isFinishAfterStart(startDate, startTime, finishDate, finishTime)) {
      Alert.alert(
        'Error',
        'La fecha y hora de finalización no pueden ser anteriores a la fecha y hora de inicio.',
      );
      return;
    }

    await onSubmit({
      evaluationName,
      minimumPassingGrade,
      startDate,
      startTime,
      finishDate,
      finishTime,
      requireIdentityVerification,
      requireQrScan,
      isGradeable,
      isMakeUp,
      parentEvaluation: parentEvaluation,
    });
  };

  return (
    <ScrollView style={style().containerView}>
      <View style={{ marginBottom: 100 }}>
        <View style={style().dateButtonInputs}>
          <Text style={{ ...style().text, color: 'black' }}>
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
            marginBottom: 10,
          }}
          onChangeText={setEvaluationName}
          value={evaluationName}
          placeholder="Por ejemplo: Primer Parcial"
          placeholderTextColor={placeholderColor}
        />

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
            marginTop: 12,
          }}
        >
          <Text style={{ ...style().text, color: 'black' }}>Es recuperatorio</Text>
          <Switch
            value={isMakeUp}
            onValueChange={handleIsMakeUpChange}
            trackColor={{ false: '#d3d3d3', true: '#4CAF50' }}
            thumbColor={isMakeUp ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        {isMakeUp && (
          <View style={{ marginTop: 12, zIndex: openEvaluationsDropdown ? 1000 : 0, marginBottom: 12 }}>
            <Text style={{ ...style().text, color: 'black', marginBottom: 8 }}>
              Evaluación a recuperar
            </Text>
            {loadingEvaluations ? (
              <Text style={{ ...style().text, color: 'grey' }}>Cargando evaluaciones...</Text>
            ) : (
              <DropDownPicker
                listMode="SCROLLVIEW"
                open={openEvaluationsDropdown}
                value={selectedParentEvaluationId}
                items={evaluationsItems}
                setOpen={setOpenEvaluationsDropdown}
                setValue={(callback) => {
                  const nextValue = callback(selectedParentEvaluationId);
                  handleParentEvaluationChange(nextValue);
                }}
                setItems={setEvaluationsItems}
                placeholder="Seleccione una evaluación"
              />
            )}
          </View>
        )}

        <View style={{ marginTop: 12, zIndex: openGradeTypePicker ? 1000 : 0 }}>
          <Text style={{ ...style().text, color: 'black', marginBottom: 8 }}>
            Tipo de calificación
          </Text>
          <DropDownPicker
            listMode="SCROLLVIEW"
            open={openGradeTypePicker}
            value={isGradeable}
            items={gradeTypeItems}
            setOpen={setOpenGradeTypePicker}
            setValue={(callback) => {
              const next = callback(isGradeable);
              setIsGradeable(next);
              if (!next) setMinimumPassingGrade(null);
            }}
            setItems={setGradeTypeItems}
            placeholder="Seleccione un tipo"
          />
        </View>

        {isGradeable && (
          <>
            <View style={style().dateButtonInputs}>
              <Text style={{ ...style().text, color: 'black' }}>Nota mínima de aprobación</Text>
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
              value={minimumPassingGrade ?? ''}
              placeholder="Por ejemplo: 4"
              placeholderTextColor={placeholderColor}
              keyboardType="numeric"
            />
          </>
        )}

        <View style={style().dateButtonInputs}>
          <Text style={{ ...style().text, color: 'black', marginTop: 10 }}>Fecha de Inicio</Text>
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
            borderColor: 'grey',
          }}
          onPress={() => setShowStartDatePicker(true)}
        >
          {startDate ? (
            <Text>{moment(startDate).format('dddd D MMMM YYYY')}</Text>
          ) : (
            <Text style={pickerPlaceholderTextStyle}>Por ejemplo: lunes 01 enero 2024</Text>
          )}
        </TouchableOpacity>

        <View style={{ ...style().dateButtonInputs }}>
          <Text style={{ ...style().text, color: 'black', marginTop: 10 }}>Horario de inicio</Text>
        </View>
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime || new Date()}
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
            borderColor: 'grey',
          }}
          onPress={() => setShowStartTimePicker(true)}
        >
          {startTime ? (
            <Text>
              {moment(startTime).format('hh:mm A') + ' (' + moment(startTime).format('HH:mm') + ')'}
            </Text>
          ) : (
            <Text style={pickerPlaceholderTextStyle}>Por ejemplo: 7:00 PM (19:00)</Text>
          )}
        </TouchableOpacity>
        <Text style={{ color: 'grey', fontSize: 12, marginTop: 3 }}>
          {' '}
          Los horarios están restringidos a intervalos de 30 minutos
        </Text>

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
            borderColor: 'grey',
          }}
          onPress={() => setShowFinishDatePicker(true)}
        >
          {finishDate ? (
            <Text>{moment(finishDate).format('dddd D MMMM YYYY')}</Text>
          ) : (
            <Text style={pickerPlaceholderTextStyle}>Por ejemplo: lunes 01 enero 2024</Text>
          )}
        </TouchableOpacity>

        <View style={{ ...style().dateButtonInputs }}>
          <Text style={{ ...style().text, color: 'black', marginTop: 10 }}>Horario de finalización</Text>
        </View>
        {showFinishTimePicker && (
          <DateTimePicker
            value={finishTime || new Date()}
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
            borderColor: 'grey',
          }}
          onPress={() => setShowFinishTimePicker(true)}
        >
          {finishTime ? (
            <Text>
              {moment(finishTime).format('hh:mm A') + ' (' + moment(finishTime).format('HH:mm') + ')'}
            </Text>
          ) : (
            <Text style={pickerPlaceholderTextStyle}>Por ejemplo: 10 PM (22:00)</Text>
          )}
        </TouchableOpacity>
        <Text style={{ color: 'grey', fontSize: 12, marginTop: 3, marginBottom: 25 }}>
          {' '}
          Los horarios están restringidos a intervalos de 30 minutos
        </Text>

        <View style={{ marginBottom: 20 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <Text style={{ ...style().text, color: 'black' }}>
              Requerir verificación de identidad
            </Text>
            <Switch
              value={requireIdentityVerification}
              onValueChange={setRequireIdentityVerification}
              trackColor={{ false: '#d3d3d3', true: '#4CAF50' }}
              thumbColor={requireIdentityVerification ? '#ffffff' : '#f4f3f4'}
            />
          </View>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text style={{ ...style().text, color: 'black' }}>Requerir escaneo de QR</Text>
            <Switch
              value={requireQrScan}
              onValueChange={setRequireQrScan}
              trackColor={{ false: '#d3d3d3', true: '#4CAF50' }}
              thumbColor={requireQrScan ? '#ffffff' : '#f4f3f4'}
            />
          </View>
        </View>

        <RoundedButton text={titleButton} style={style().button} enabled={enabled} onPress={submit} />
        {onDelete && (
          <RoundedButton
            text={deleting ? 'Eliminando...' : deleteButtonText}
            style={{
              MainContainer: {
                marginTop: 12,
                backgroundColor: '#D32F2F',
              },
            }}
            enabled={!submitting}
            onPress={onDelete}
          />
        )}
        {extraBottomContent}
        {submitting && <Loading />}
      </View>
    </ScrollView>
  );
}