import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { home as style } from '../../styles';
import { FinalExamOverviewList, MaterialIcon, UpcomingEventsCard } from '../../components';
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
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 8 }}>
            <MaterialIcon name='calendar-clock' fontSize={24} color='black' />
            <Text style={style().header1}>Eventos próximos</Text>
          </View>
          <UpcomingEventsCard />
          <VerMasButton
            onPress={() => navigation.navigate("Calendar")}
          />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 8 }}>
            <MaterialIcon name='text-box-multiple' fontSize={24} color='black' />
            <Text style={style().header1}>Materias en curso</Text>
          </View>
          <CommissionInscriptionOverviewList
            key="Materias en curso"
            fetch={() => commissionInscriptionsRepository.fetchCurrentInscriptions()}
          />
          <VerMasButton
            onPress={() => navigation.navigate("CurrentCommissionInscriptions")}
          />

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 8 }}>
            <MaterialIcon name='text-box-check' fontSize={24} color='black' />
            <Text style={{ ...style().header1, marginTop: 12 }}>Materias aprobadas</Text>
          </View>
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
      <Text style={style().text}>Ver más</Text>
    </TouchableOpacity>
  )
}

export default Home;