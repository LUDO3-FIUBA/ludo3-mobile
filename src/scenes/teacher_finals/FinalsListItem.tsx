import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import AlertDialog from '../../components/AlertDialog';
import { TeacherFinal } from '../../models/TeacherFinal';
import { useNavigation } from '@react-navigation/native';
import moment from 'moment';
import { lightModeColors } from '../../styles/colorPalette';
import { calculateFinalCurrentStatus } from '../../models/TeacherFinal';
import { FinalStatus } from '../../models/FinalStatus';


interface FinalsListItemProps {
  final: TeacherFinal;
  subjectId: number;
}

const FinalsListItem: React.FC<FinalsListItemProps> = ({ final, subjectId }) => {
  const navigation = useNavigation();
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  const onPressItem = () => {
    const currentStatus = calculateFinalCurrentStatus(final)
    if (currentStatus === FinalStatus.Draft) {
      setAlertDialog({ title: 'Este final todavía no fue aprobado', message: 'Por favor espere a que se apruebe para poder ver los detalles.' });
      return;
    } else if (currentStatus === FinalStatus.Rejected) {
      setAlertDialog({ title: 'Este final fue rechazado', message: 'Por favor consulte al departamento para obtener mas información.' });
      return;
    } else if (currentStatus === FinalStatus.Future) {
      setAlertDialog({ title: 'Este final aún no ha comenzado', message: 'Por favor espere a que comience para poder ver los detalles.' });
      return;
    } else if (currentStatus === FinalStatus.Closed) {
      console.log('Final status: Closed', final);
      navigation.navigate('FinalExamSubmissions', {
        final: final,
        editable: false,
      });
    } else if (currentStatus === FinalStatus.Grading) {
      console.log('Final status: Grading');
      console.log("Final to be sent", final);

      navigation.navigate('FinalExamSubmissions', {
        final: final,
      });
    } else {
      navigation.navigate('FinalExamQR', {
        final: final,
      });
    }
  };

  const getStatusText = () => {
    const finalCurrentStatus = calculateFinalCurrentStatus(final)

    console.log('Final', final, ' status:', finalCurrentStatus);


    switch (finalCurrentStatus) {
      case FinalStatus.Future:
        return 'Pronto';
      case FinalStatus.SoonToStart:
        return 'Pronto';
      case FinalStatus.Open:
        return 'Ver QR';
      case FinalStatus.Grading:
        return 'Poner notas';
      case FinalStatus.Closed:
        return final.act != null ? `Acta cerrada (#${final.act})` : 'Acta cerrada';
      case FinalStatus.Draft:
        return 'Esperando aprobación';
      case FinalStatus.Rejected:
        return 'Rechazado';
      default:
        return '';
    }
  };

  return (
    <>
    <AlertDialog
      visible={alertDialog !== null}
      title={alertDialog?.title ?? ''}
      message={alertDialog?.message ?? ''}
      mode="info"
      confirmLabel="Aceptar"
      onConfirm={() => setAlertDialog(null)}
    />
    <TouchableOpacity onPress={onPressItem}>
      <View style={styles.view}>
        <Text style={styles.date}>
          {moment(final.date).format('dddd Do MMMM, YYYY')}
        </Text>
        <Text style={styles.hour}>{moment(final.date).format('HH:mm')}</Text>
        <Text style={styles.status}>{getStatusText()}</Text>
      </View>
    </TouchableOpacity>
    </>
  );
};


const styles = StyleSheet.create({
  view: {
    backgroundColor: lightModeColors.institutional,
    borderRadius: 10,
    alignItems: 'stretch',
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 5,
    marginHorizontal: 10,
    padding: 15,
  },
  date: {
    fontSize: 25,
    color: 'white',
  },
  hour: {
    fontSize: 20,
    paddingVertical: 5,
    color: 'white',
  },
  status: {
    fontSize: 13,
    color: 'white',
  },
});

export default FinalsListItem;
