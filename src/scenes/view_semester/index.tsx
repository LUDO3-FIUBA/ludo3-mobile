import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { viewCommission as style } from '../../styles';
import { BasicList } from '../../components';
import { Semester, Subject } from '../../models';
import { useNavigation } from '@react-navigation/native';

Icon.loadFont();

const ViewSemestercreen: React.FC<any> = ({ route }) => {
  const navigation = useNavigation()
  const semester: Semester = route.params.semester;
  const commission = semester.commission

  const listItems = [
    { name: "Ver Examenes", onPress: () => { } },
    { name: "Cuerpo Docente", onPress: () => { } },
    {
      name: "Ver Correlativas", onPress: () => {
        navigation.navigate('CorrelativeSubjects', {
          id: semester.commission.subject_siu_id,
        });
      }
    },
  ]

  return (
    <SafeAreaView style={style().view}>
      <ScrollView>
        <View style={style().mainView}>
          <View style={{ margin: 25 }}>
            <Text style={style().centeredHeader1}>{commission.subject_name}</Text>
            <Text style={style().centeredText}>{commission.chief_teacher.first_name} {commission.chief_teacher.last_name}</Text>
          </View>
          <View style={{ marginTop: 25 }}>
            <BasicList items={listItems} />
          </View>
        </View>
      </ScrollView>
      {/* <ScanQRIcon navigation={navigation} /> */}
    </SafeAreaView>
  );
};

export default ViewSemestercreen;
