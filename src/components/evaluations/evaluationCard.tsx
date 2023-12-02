import React, { FC } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Evaluation } from '../../models';
import { finalExamCard as style } from '../../styles';
import moment from 'moment';
import MaterialIcon from '../materialIcon';
import { useNavigation } from '@react-navigation/native';

interface EvaluationCardProps {
  evaluation: Evaluation;
}


const EvaluationCard: FC<EvaluationCardProps> = ({ evaluation }) => {
  const navigation = useNavigation();
  const endDate = moment(evaluation.end_date);
  return (
    <View style={style().view}>
      <TouchableOpacity style={{ elevation: 3, padding: 12 }} onPress={() => {
        navigation.navigate('ViewEvaluationDetails', { evaluation });
      }}
      >
        <Text style={style().subjectName}>
          {evaluation.evaluation_name}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <MaterialIcon name='calendar-clock' fontSize={22} color="white" />
          <Text style={style().professor}>
            {endDate.fromNow()} ({endDate.format('D [de] MMMM, YYYY')})
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default EvaluationCard;
