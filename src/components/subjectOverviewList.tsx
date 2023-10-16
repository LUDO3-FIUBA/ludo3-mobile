import React, { useState, useEffect, FC } from 'react';
import { View, Alert, TouchableOpacity } from 'react-native';
import SubjectCard from './subjectCard';
import { finalExamList as style } from '../styles';
import { Subject } from '../models';

interface SubjectOverviewListProps {
  fetch: () => Promise<Subject[]>;
  navigation: any; // You can replace 'any' with the actual navigation prop type if available
}

const SubjectOverviewList: FC<SubjectOverviewListProps> = ({ fetch, navigation }) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    fetchData();
  }, []); // Re-fetch data when id changes

  const fetchData = async () => {
    try {
      const fetchedSubjects = await fetch();
      setSubjects(fetchedSubjects);
    } catch (error) {
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
      {subjects.map((item) =>
        <TouchableOpacity
          key={`suboverview-${item.id}`}
          onPress={() => {
            navigation.navigate('ViewCommission', {
              subject: item.toObject(),
            });
          }}
        >
          <SubjectCard subject={item} />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SubjectOverviewList;
