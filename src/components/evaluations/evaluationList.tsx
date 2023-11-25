import React, { useState, useEffect, FC } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import EvaluationCard from './evaluationCard';
import Loading from '../loading';
import { finalExamList as style } from '../../styles';
import { Evaluation } from '../../models';

interface EvaluationListProps {
  fetch: () => Promise<Evaluation[]>;
  emptyMessage: string;
}

const EvaluationList: FC<EvaluationListProps> = ({ fetch, emptyMessage }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async (refreshing = false) => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setEvaluations([]);
    }

    try {
      const fetchedEvaluations = await fetch();
      if (refreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      setEvaluations(fetchedEvaluations);
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
      {!loading && !evaluations.length && (
        <View style={style().textContainer}>
          <Text style={style().text}>{emptyMessage}</Text>
        </View>
      )}
      {!loading && (
        <FlatList
          contentContainerStyle={style().listView}
          data={evaluations}
          onRefresh={() => fetchData(true)}
          refreshing={refreshing}
          keyExtractor={evaluation => `${evaluation.id}`}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => {
              navigation.navigate('ViewEvaluationDetails', { evaluation: item });
            }}>
              <EvaluationCard evaluation={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default EvaluationList;
