import React from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { viewCommission as style } from '../../styles';
import { BasicList } from '../../components';
import { Subject } from '../../models';
import { useNavigation } from '@react-navigation/native';

Icon.loadFont();

const ViewCommissionScreen: React.FC<any> = ({ route }) => {
  const navigation = useNavigation()
  const subject = route.params.subject as Subject;

  const listItems = [
    { name: "Ver Examenes", onPress: () => { } },
    { name: "Cuerpo Docente", onPress: () => { } },
    {
      name: "Ver Correlativas", onPress: () => {
        navigation.navigate('CorrelativeSubjects', {
          id: subject.id,
        });
      }
    },
  ]

  return (
    <SafeAreaView style={style().view}>
      <ScrollView>
        <View style={style().mainView}>
          <View style={{ margin: 25 }}>
            <Text style={style().centeredHeader1}>{subject.code} {subject.name}</Text>
            <Text style={style().centeredText}>{subject.professor}</Text>
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

export default ViewCommissionScreen;
