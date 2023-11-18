import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { home as style } from '../../styles';
import { FinalExamOverviewList, UpcomingEventsCard } from '../../components';
import { useNavigation } from '@react-navigation/native';
import { commissionInscriptionsRepository, finalExamsRepository } from '../../repositories';
import CommissionInscriptionOverviewList from '../../components/commission_inscriptions/commissionInscriptionOverviewList';
import { NotificationManager } from '../../managers';

Icon.loadFont();


const Home: React.FC<any> = () => {
  const navigation = useNavigation()
  
  useEffect(() => {
    NotificationManager.getInstance().registerCallbacks()
  }, [])
  
  return (
    <SafeAreaView style={style().view}>
      <ScrollView>
        <View style={style().mainView}>
          <Text style={style().header1}>Eventos próximos</Text>
          <UpcomingEventsCard />
          <VerMasButton
            onPress={() => navigation.navigate("Calendar")}
          />
          <Text style={style().header1}>Materias en curso</Text>
          <CommissionInscriptionOverviewList
            key="Materias en curso"
            fetch={() => commissionInscriptionsRepository.fetchCurrentInscriptions()}
          />
          <VerMasButton
            onPress={() => navigation.navigate("CurrentCommissionInscriptions")}
          />
          <Text style={{ ...style().header1, marginTop: 12 }}>Materias aprobadas</Text>
          <FinalExamOverviewList
            key={`ApprovedSubjects-index`}
            navigation={navigation}
            fetch={async () => await finalExamsRepository.fetchApproved()}
            emptyMessage={`No tenés materias aprobadas aún.${'\n'}No te olvides de rendir los finales.`}
          />
          <VerMasButton
            onPress={() => navigation.navigate("ApprovedSubjects")}
          />
        </View>
      </ScrollView>
      {/* <ScanQRIcon navigation={navigation} /> */}
    </SafeAreaView>
  );
};

type onPressHandler = () => void

const VerMasButton = ({ onPress }: { onPress: onPressHandler }) => {
  return (
    <TouchableOpacity
      style={{ flex: 1, flexDirection: "row-reverse", marginLeft: 10, marginVertical: 4, alignItems: "center" }}
      onPress={onPress}
    >
      <Icon style={style().itemIcon} name='arrow-right' />
      <Text style={style().text}>Ver mas</Text>
    </TouchableOpacity>
  )
}

export default Home;