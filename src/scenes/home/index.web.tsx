import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Appearance,
} from 'react-native';
import { FinalExamOverviewList, MaterialIcon, UpcomingEventsCard } from '../../components';
import { useNavigation } from '@react-navigation/native';
import {
  commissionInscriptionsRepository,
  evaluationsRepository,
  finalExamsRepository,
} from '../../repositories';
import CommissionInscriptionOverviewList from '../../components/commission_inscriptions/commissionInscriptionOverviewList';
import { NotificationManager } from '../../managers';
import { CommissionInscription, Evaluation, FinalExam } from '../../models';
import { lightModeColors, darkModeColors } from '../../styles/colorPalette';

const Home: React.FC<any> = () => {
  const navigation = useNavigation();
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [finalExams, setFinalExams] = useState<FinalExam[]>([]);
  const [commissionInscriptions, setCommissionInscriptions] = useState<CommissionInscription[]>([]);

  const isDark = Appearance.getColorScheme() === 'dark';
  const colors = isDark ? darkModeColors : lightModeColors;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      fetchEvaluations(),
      fetchFinalExams(),
      fetchCommissionInscriptions(),
    ]);
    setRefreshing(false);
  };

  const fetchEvaluations = async () => {
    const evals = await evaluationsRepository.fetchMisExamenes();
    setEvaluations(evals.slice(0, 3));
  };

  const fetchFinalExams = async () => {
    const exams = await finalExamsRepository.fetchApproved();
    setFinalExams(exams.slice(0, 3));
  };

  const fetchCommissionInscriptions = async () => {
    const inscriptions = await commissionInscriptionsRepository.fetchCurrentInscriptions();
    setCommissionInscriptions(inscriptions);
  };

  useEffect(() => {
    NotificationManager.getInstance().registerCallbacks();
    onRefresh();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Eventos próximos */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 8 }}>
          <MaterialIcon name="calendar-clock" fontSize={24} color={colors.black} />
          <Text style={[styles.header1, { color: colors.black }]}>Eventos próximos</Text>
        </View>
        <UpcomingEventsCard evaluations={evaluations} />
        <VerMasButton onPress={() => navigation.navigate('Calendar')} colors={colors} />

        {/* Materias en curso */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 8 }}>
          <MaterialIcon name="text-box-multiple" fontSize={24} color={colors.black} />
          <Text style={[styles.header1, { color: colors.black }]}>Materias en curso</Text>
        </View>
        <CommissionInscriptionOverviewList commissionInscriptions={commissionInscriptions} />
        <VerMasButton onPress={() => navigation.navigate('CurrentCommissionInscriptions')} colors={colors} />

        {/* Materias aprobadas */}
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginVertical: 8 }}>
          <MaterialIcon name="text-box-check" fontSize={24} color={colors.black} />
          <Text style={[styles.header1, { color: colors.black }]}>Materias aprobadas</Text>
        </View>
        <FinalExamOverviewList
          finalExams={finalExams}
          emptyMessage={`No tenés materias aprobadas aún.\nNo te olvides de rendir los finales.`}
        />
        <VerMasButton onPress={() => navigation.navigate('ApprovedSubjects')} colors={colors} />
      </ScrollView>
    </SafeAreaView>
  );
};

type VerMasProps = { onPress: () => void; colors: typeof lightModeColors };

const VerMasButton = ({ onPress, colors }: VerMasProps) => (
  <TouchableOpacity
    style={styles.verMas}
    onPress={onPress}
  >
    <Text style={[styles.verMasText, { color: colors.mainContrastColor }]}>Ver más</Text>
    <MaterialIcon name="arrow-right" fontSize={24} color={colors.mainContrastColor} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  colLeft: {
    flex: 2,
  },
  colRight: {
    flex: 1,
  },
  header1: {
    fontSize: 24,
    fontWeight: '600',
  },
  verMas: {
    flexDirection: 'row-reverse',
    marginLeft: 10,
    marginVertical: 4,
    alignItems: 'center',
  },
  verMasText: {
    fontSize: 18,
  },
});

export default Home;
