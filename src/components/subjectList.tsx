import React, { useState, useEffect, FC } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
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
}

const SubjectList: FC<SubjectListProps> = ({ filter, fetch, emptyMessage, navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

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
          keyExtractor={finalExam => finalExam.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SubjectHistoryScreen', {
                  subject: item.toObject(),
                });
              }}
            >
              <SubjectCard subject={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default SubjectList;
