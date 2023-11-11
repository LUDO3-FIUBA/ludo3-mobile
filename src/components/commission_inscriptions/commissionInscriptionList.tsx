import React, { useState, useEffect, FC } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation()

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
          // keyExtractor={commissionInscription => commissionInscription.id} // TODO get ID from backend
          keyExtractor={commissionInscription => `${commissionInscription.semester.commission.subject_siu_id}`} // TODO get ID from backend
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('ViewSemester', {
                  semester: item.semester,
                });
              }}
            >
              <CommissionInscriptionCard commissionInscription={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default CommissionInscriptionList;
