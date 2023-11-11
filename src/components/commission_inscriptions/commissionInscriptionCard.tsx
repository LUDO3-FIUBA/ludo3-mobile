import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { CommissionInscription } from '../../models';
import { finalExamCard as style } from '../../styles';

interface CommissionInscriptionCardProps {
  commissionInscription: CommissionInscription;
}

const CommissionInscriptionCard: FC<CommissionInscriptionCardProps> = ({ commissionInscription }) => {
  const semester = commissionInscription.semester
  const commission = semester.commission
  return (
    <View style={style().view}>
      <Text style={style().subjectName}>
        {commission.subject_name}
      </Text>
      <Text style={style().professor}>
        {commission.chief_teacher.first_name} {commission.chief_teacher.last_name}
      </Text>
    </View>
  );
};

export default CommissionInscriptionCard;
