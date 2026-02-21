import { View, StyleSheet } from 'react-native'
import React from 'react'
import { RoundedButton } from '../../components'
import { finalExamSubmissions as style } from '../../styles';
import { TeacherFinal } from '../../models/TeacherFinal';
import { useNavigation } from '@react-navigation/native';
import FacePictureConfiguration from './face_recognition';
import { FinalStatus } from '../../models/FinalStatus';

interface Props {
  final: TeacherFinal;
  canCloseAct: boolean;
}

const FinalExamSubmissionsListFooter = ({ final, canCloseAct }: Props) => {
  const navigation = useNavigation()

  const closeAct = async () => {
    const configuration = new FacePictureConfiguration(final.id);

    navigation.navigate('TakePicture', {
      configuration: configuration.toObject(),
    });
  }

  return (
    <View style={style().listHeaderFooter}>
      <View style={{ marginTop: 10 }}>
        { final.status === FinalStatus.Grading &&
          <RoundedButton
            enabled={canCloseAct}
            onPress={closeAct}
            text="Cerrar el Acta"
            style={style().button}
          />
        }
      </View>
    </View>
  )
}

export default FinalExamSubmissionsListFooter


const styles = StyleSheet.create({});
