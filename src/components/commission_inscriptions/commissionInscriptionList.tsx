import React, { useState, useEffect, FC } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import CommissionInscriptionCard from './commissionInscriptionCard';
import Loading from '../loading';
import { finalExamList as style } from '../../styles';
import { CommissionInscription } from '../../models';

interface CommissionInscriptionListProps {
  fetch: () => Promise<CommissionInscription[]>;
  emptyMessage: string;
}

const CommissionInscriptionList: FC<CommissionInscriptionListProps> = ({ fetch, emptyMessage }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [commissionInscriptions, setCommissionInscriptions] = useState<CommissionInscription[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (refreshing = false) => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setCommissionInscriptions([]);
    }

    try {
      const fetchedCommissionInscriptions = await fetch();
      if (refreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      setCommissionInscriptions(fetchedCommissionInscriptions);
    } catch (error) {
      if (refreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
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
          <Text style={style().text}>{emptyMessage}</Text>
        </View>
      )}
      {!loading && (
        <FlatList
          contentContainerStyle={style().listView}
          data={commissionInscriptions}
          onRefresh={() => fetchData(true)}
          refreshing={refreshing}
          keyExtractor={commissionInscription => `${commissionInscription.semester.id}`}
          renderItem={({ item }) => (
              <CommissionInscriptionCard commissionInscription={item} />
          )}
        />
      )}
    </View>
  );
};

export default CommissionInscriptionList;
