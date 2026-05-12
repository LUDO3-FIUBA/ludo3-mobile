import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Appearance,
} from 'react-native';
import { FinalExamOverviewList, UpcomingEventsCard } from '../../components';
import HomeSection from '../root_drawer/web/HomeSection';
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingEvals = evals.filter((evaluation) => {
      const evaluationDate = new Date(evaluation.end_date);
      return evaluationDate >= today;
    });

    setEvaluations(upcomingEvals.slice(0, 3));
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
        <HomeSection icon="calendar-clock" title="Eventos próximos" onVerMas={() => navigation.navigate('Calendar')} colors={colors}>
          <UpcomingEventsCard evaluations={evaluations} />
        </HomeSection>

        <HomeSection icon="text-box-multiple" title="Materias en curso" onVerMas={() => navigation.navigate('CurrentCommissionInscriptions')} colors={colors}>
          <CommissionInscriptionOverviewList commissionInscriptions={commissionInscriptions} />
        </HomeSection>

        <HomeSection icon="text-box-check" title="Materias aprobadas" onVerMas={() => navigation.navigate('ApprovedSubjects')} colors={colors}>
          <FinalExamOverviewList
            finalExams={finalExams}
            emptyMessage={`No tenés materias aprobadas aún.\nNo te olvides de rendir los finales.`}
          />
        </HomeSection>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
});

export default Home;
