import React, { FC } from 'react';
import { View, Text } from 'react-native';
import { finalExamList as style } from '../../styles';
import { CommissionInscription } from '../../models';
import CommissionInscriptionCard from './commissionInscriptionCard';

/**
 * This OVERVIEW component is mostly equal to the normal CommissionInscriptionList
 * But it does not use a FlatList, so that it can be embedded
 * in screens with ScrollView
 */

interface CommissionInscriptionOverviewListProps {
  commissionInscriptions: CommissionInscription[];
}

const CommissionInscriptionOverviewList: FC<CommissionInscriptionOverviewListProps> = ({ commissionInscriptions }) => {
  return (
    <View style={style().view}>
      {!commissionInscriptions.length && (
        <View style={style().textContainer}>
          <Text style={style().emptyMessageText}>No tenés inscripciones actualmente.</Text>
        </View>
      )}
      {commissionInscriptions.map((item) => (
        <CommissionInscriptionCard
          commissionInscription={item}
          key={`suboverview-${item.semester.id}`}
        />
      ))}
    </View>
  );
};

export default CommissionInscriptionOverviewList;
