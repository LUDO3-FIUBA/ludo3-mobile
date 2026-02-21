import React, { FC } from 'react';
import { View, Text } from 'react-native';
import moment from 'moment';
import { Subject, FinalExam } from '../models';
import { finalExamCard as style } from '../styles';

interface FinalExamCardProps {
  finalExam: FinalExam;
}

const FinalExamCard: FC<FinalExamCardProps> = ({ finalExam }) => {
  const fechaExamen = moment(finalExam.date).format('D [de] MMMM, YYYY');
  return (
    <View style={style().view}>
      <Text style={style().subjectName}>
        {finalExam.subject.code} {finalExam.subject.name}
      </Text>
      <Text style={style().professor}>
        {finalExam.subject.professor}
      </Text>
      {finalExam.grade && (
        <View style={style().container}>
          <Text style={style().grade}>
            {`Nota: ${finalExam.grade}`}
          </Text>
          <Text style={style().act}>
            {finalExam.act != null
              ? `(Acta #${finalExam.act})`
              : 'Acta pendiente'}
          </Text>
        </View>
      )}
      {finalExam.date && (
        <Text style={style().date}>
          {fechaExamen}
        </Text>
      )}
    </View>
  );
};

export default FinalExamCard;
