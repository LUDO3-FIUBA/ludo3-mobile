import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CommissionInscription } from '../../models';
import { finalExamCard as style } from '../../styles';
import { useNavigation } from '@react-navigation/native';

interface CommissionInscriptionCardProps {
  commissionInscription: CommissionInscription;
}

const CommissionInscriptionCard: FC<CommissionInscriptionCardProps> = ({ commissionInscription }) => {
  const semester = commissionInscription.semester
  const commission = semester.commission
  const navigation = useNavigation()
  return (
    <View style={style().view}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('ViewSemester', {
            semester: semester,
          });
        }}
        style={{ padding: 15 }}
      >
        <Text style={style().subjectName}>
          {commission.subject_name}
        </Text>
        <Text style={style().professor}>
          {commission.chief_teacher.first_name} {commission.chief_teacher.last_name}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default CommissionInscriptionCard;
