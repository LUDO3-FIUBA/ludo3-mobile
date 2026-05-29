import React, { useState, useEffect, FC } from 'react';
import { View, Text, FlatList } from 'react-native';
import AlertDialog from './AlertDialog';
import SubjectCard from './subjectCard';
import Loading from './loading';
import { finalExamList as style } from '../styles';
import { Subject } from '../models';
import { Filter } from '../scenes/approved_subjects/IFilter';

interface SubjectListProps {
  filter?: Filter;
  fetch: () => Promise<Subject[]>;
  emptyMessage: string;
  navigation: any; // You can replace 'any' with the actual navigation prop type if available
  disableOnPress?: boolean
}

const SubjectList: FC<SubjectListProps> = ({ filter, fetch, emptyMessage, navigation, disableOnPress = false }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [alertDialog, setAlertDialog] = useState<{ title: string; message: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, [filter?.type, filter?.value]); // Re-fetch data when id changes

  const fetchData = async (refreshing = false) => {
    if (refreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setSubjects([]);
    }

    try {
      const fetchedSubjects = await fetch();
      if (refreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
      setSubjects(fetchedSubjects);
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
      {!loading && !subjects.length && (
        <View style={style().textContainer}>
          <Text style={style().text}>{emptyMessage}</Text>
        </View>
      )}
      {!loading && (
        <FlatList
          contentContainerStyle={style().listView}
          data={subjects}
          onRefresh={() => fetchData(true)}
          refreshing={refreshing}
          keyExtractor={subject => subject.id.toString()}
          renderItem={({ item }) => (
            <SubjectCard subject={item} />
          )}
        />
      )}
    </View>
  );
};

export default SubjectList;
