import React, { useState, useEffect, FC } from 'react';
import { View, Alert, TouchableOpacity, Text } from 'react-native';
import { finalExamList as style } from '../../styles';
import { CommissionInscription } from '../../models';
import { useNavigation } from '@react-navigation/native';
import CommissionInscriptionCard from './commissionInscriptionCard';
import Loading from '../loading';

/**
 * This OVERVIEW component is mostly equal to the normal CommissionInscriptionList
 * But it does not use a FlatList, so that it can be embedded
 * in screens with ScrollView
 */

interface CommissionInscriptionOverviewListProps {
  fetch: () => Promise<CommissionInscription[]>;
}

const CommissionInscriptionOverviewList: FC<CommissionInscriptionOverviewListProps> = ({ fetch }) => {
  const [loading, setLoading] = useState(true);
  const [commissionInscriptions, setCommissionInscriptions] = useState<CommissionInscription[]>([]);
  const navigation = useNavigation()

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setCommissionInscriptions([]);

    try {
      const fetchedCommissionInscriptions = await fetch();
      setLoading(false);
      setCommissionInscriptions(fetchedCommissionInscriptions);
    } catch (error) {
      setLoading(false);
      console.log('Error', error);
      Alert.alert(
        '¿Qué pasó?',
        'No sabemos pero no pudimos buscar tu información. ' +
        'Volvé a intentar en unos minutos.'
      );
    }
  };

  return (
    <View style={style().view}>
      {loading && <Loading />}
      {!loading && !commissionInscriptions.length && (
        <View style={style().textContainer}>
          <Text style={style().text}>No tenés inscripciones actualmente.${'\n\n'}</Text>
        </View>
      )}
      {commissionInscriptions.map((item) =>
        <CommissionInscriptionCard
          commissionInscription={item}
          key={`suboverview-${item.semester.id}`}
        />
      )}
    </View>
  );
};

export default CommissionInscriptionOverviewList;
