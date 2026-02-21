import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, StyleSheet } from 'react-native';
import { Loading } from '../../components';
import { getStyleSheet as style } from '../../styles';
import { teacherFinalsRepository } from '../../repositories';
import { TeacherFinal } from '../../models/TeacherFinal';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { makeRequest } from '../../networking/makeRequest';
import FinalsListItem from './FinalsListItem';
import { FinalsListHeaderRight } from './FinalsListHeaderRight';
import { FontAwesome } from '@expo/vector-icons';
import { useAppSelector } from '../../redux/hooks';
import { selectUserData } from '../../redux/reducers/teacherUserDataSlice';
import { selectSemesterData } from '../../redux/reducers/teacherSemesterSlice';

interface FinalsListRouteParams {
  subjectId: number;
  subjectName: string;
}

const FinalsList: React.FC = () => {
  const [hasDoneFirstLoad, setHasDoneFirstLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [myFinals, setMyFinals] = useState<TeacherFinal[]>([]);
  const [otherTeachersFinals, setOtherTeachersFinals] = useState<TeacherFinal[]>([]);

  const route = useRoute();
  const subjectId = (route.params as FinalsListRouteParams).subjectId;
  const subjectName = (route.params as FinalsListRouteParams).subjectName;

  const userData = useAppSelector(selectUserData);
  const semesterData = useAppSelector(selectSemesterData);

  const isActualUserChiefTeacher = semesterData?.commission.chiefTeacher.id === userData?.id;

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: 'Finales',
      headerRight: () => isActualUserChiefTeacher ? <FinalsListHeaderRight subjectId={subjectId} subjectName={subjectName} /> : null,
    });
  }, [navigation, isActualUserChiefTeacher, subjectId, subjectName]);

  useFocusEffect(
    React.useCallback(() => {
      fetchData(hasDoneFirstLoad);
      return () => { };
    }, [])
  );

  const fetchData = async (refreshing: boolean = false) => {
    if (loading || refreshing) return;

    setRefreshing(refreshing);
    setLoading(!refreshing);
    setHasDoneFirstLoad(true);

    try {
      let retrievedFinals = await makeRequest(() => teacherFinalsRepository.fetchFromSubject(subjectId), navigation);
      console.log("Retrieved finals", retrievedFinals);
      const myFinals = retrievedFinals.filter((final: TeacherFinal) => final.teacher === userData?.id);
      const otherTeachersFinals = retrievedFinals.filter((final: TeacherFinal) => final.teacher !== userData?.id);
      setMyFinals(myFinals);
      setOtherTeachersFinals(otherTeachersFinals);
    } catch (error) {
      Alert.alert(
        'Te fallamos',
        'No pudimos encontrar los finales de esta materia. ' +
        'Volvé a intentar en unos minutos.',
      );
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  return (
    <View style={styles.view}>
      {(loading || !hasDoneFirstLoad) && <Loading />}
      {hasDoneFirstLoad && !loading && !myFinals.length && !otherTeachersFinals.length && (
        <View style={styles.emptyEvaluationsContainer}>
          <FontAwesome name="folder-open" size={50} color="#6c757d" style={styles.emptyEvaluationsIcon} />
          <Text style={styles.emptyEvaluationsText}>Esta comisión no tiene finales aún.</Text>
          <Text style={styles.emptyEvaluationsSecondText}>Podés agregar uno pulsando el '+' en la esquina superior derecha</Text>
        </View>
      )}
      {hasDoneFirstLoad && !loading && !!myFinals.length && (
        <View style={styles.listView}>
          <Text style={styles.listTitle}>Tus finales</Text>
          <FlatList
            contentContainerStyle={{ marginTop: 5 }}
            data={myFinals}
            onRefresh={() => fetchData(true)}
            refreshing={refreshing}
            keyExtractor={final => final.id.toString()}
            renderItem={({ item }) => (
              <FinalsListItem final={item} subjectId={subjectId} />
            )}
          />
        </View>
      )}
      {hasDoneFirstLoad && !loading && !!otherTeachersFinals.length && (
        <View style={styles.listView}>
          <Text style={styles.listTitle}>Finales de otros docentes</Text>
          <FlatList
            contentContainerStyle={{ marginTop: 5 }}
            data={otherTeachersFinals}
            onRefresh={() => fetchData(true)}
            refreshing={refreshing}
            keyExtractor={final => final.id.toString()}
            renderItem={({ item }) => (
              <FinalsListItem final={item} subjectId={subjectId} />
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  view: {
    flex: 1,
    flexDirection: 'column',
  },
  listView: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  emptyEvaluationsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  emptyEvaluationsText: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
  },
  emptyEvaluationsSecondText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyEvaluationsIcon: {
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
});

export default FinalsList;
