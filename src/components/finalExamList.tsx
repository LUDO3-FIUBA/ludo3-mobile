import React, { useState, useEffect, FC } from 'react';
import { View, Text, FlatList } from 'react-native';
import AlertDialog from './AlertDialog';
import FinalExamCard from './finalExamCard';
import Loading from './loading';
import { finalExamList as style } from '../styles';
import { FinalExam } from '../models';
import { Filter } from '../scenes/approved_subjects/IFilter';

interface FinalExamListProps {
  filter: Filter;
  fetch: () => Promise<FinalExam[]>;
  emptyMessage: string;
  navigation: any; // You can replace 'any' with the actual navigation prop type if available
}

const FinalExamList: FC<FinalExamListProps> = ({ filter, fetch, emptyMessage, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [finalExams, setFinalExams] = useState<FinalExam[]>([]);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [filter.type, filter.value]); // Re-fetch data when id changes

  const fetchData = async (refreshing = false) => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setFinalExams([]);
    }

    try {
      const fetchedFinalExams = await fetch();
      if (refreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      setFinalExams(fetchedFinalExams);
    } catch (error) {
      if (refreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      console.log('Error', error);
      setAlertDialog({ title: '¿Qué pasó?', message: 'No sabemos pero no pudimos buscar tu información. Volvé a intentar en unos minutos.' });
    }
  };

  return (
    <View style={style().view}>
      <AlertDialog
        visible={alertDialog !== null}
        title={alertDialog?.title ?? ''}
        message={alertDialog?.message ?? ''}
        mode="info"
        confirmLabel="Aceptar"
        onConfirm={() => setAlertDialog(null)}
      />
      {loading && <Loading />}
      {!loading && !finalExams.length && (
        <View style={style().textContainer}>
          <Text style={style().text}>{emptyMessage}</Text>
        </View>
      )}
      {!loading && (
        <FlatList
          contentContainerStyle={style().listView}
          data={finalExams}
          onRefresh={() => fetchData(true)}
          refreshing={refreshing}
          keyExtractor={finalExam => finalExam.id.toString()}
          renderItem={({ item }) => <FinalExamCard finalExam={item} />}
        />
      )}
    </View>
  );
};

export default FinalExamList;
