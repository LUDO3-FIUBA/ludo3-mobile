import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity } from 'react-native';
import { CommissionCard, Loading } from '../../components';
import { commissions as style } from '../../styles';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchTeacherCommissionsAsync, selectTeacherCommissions, selectTeacherLoading } from '../../redux/reducers/teacherUserDataSlice';
import { useFocusEffect } from '@react-navigation/native';

interface CommissionsListProps {
  navigation: any;  // Specify a more accurate type if possible
}

const CommissionsList: React.FC<CommissionsListProps> = ({ navigation }) => {
  const dispatch = useAppDispatch()
  const [hasDoneFirstLoad, setHasDoneFirstLoad] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const commissions = useAppSelector(selectTeacherCommissions)
  const loading = useAppSelector(selectTeacherLoading)

  useFocusEffect(
    useCallback(() => {
      dispatch(fetchTeacherCommissionsAsync())
        .unwrap()
        .catch((error: any) => {
          console.log("Error", error);
          Alert.alert(
            '¿Qué pasó?',
            'No sabemos pero no pudimos buscar tus comisiones. ' +
            'Volvé a intentar en unos minutos.',
          );
        })
        .finally(() => {
          setHasDoneFirstLoad(true);
        });
    }, [dispatch])
  );

  return (
    <View style={style().view}>
      {(loading || !hasDoneFirstLoad) && <Loading />}
      {hasDoneFirstLoad && !loading && !commissions.length && (
        <View style={style().containerView}>
          <Text style={style().text}>No tenés comisiones asignadas aún.</Text>
        </View>
      )}
      {hasDoneFirstLoad && !loading && (
        <FlatList
          contentContainerStyle={style().listView}
          data={commissions}
          onRefresh={() => {
            setRefreshing(true);
            dispatch(fetchTeacherCommissionsAsync())
              .unwrap()
              .catch(() => {})
              .finally(() => setRefreshing(false));
          }}
          keyExtractor={commission => commission.id.toString()}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                navigation.navigate('SemesterCard', {
                  commission: item,
                });
              }}>
              <CommissionCard commission={item} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default CommissionsList;
