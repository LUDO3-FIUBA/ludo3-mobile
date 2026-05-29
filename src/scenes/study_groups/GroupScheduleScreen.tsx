import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lightModeColors } from '../../styles/colorPalette';
import { studyGroupsRepository } from '../../repositories';
import type { StudyGroup, GroupBlock, GroupSchedule } from '../../repositories/studyGroups';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// One color per member (up to 8)
const MEMBER_COLORS = ['#0088cc', '#ff9900', '#28a745', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

const GroupScheduleScreen: React.FC<any> = ({ route }) => {
  const { group } = route.params as { group: StudyGroup };
  const [schedule, setSchedule] = useState<GroupSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studyGroupsRepository.fetchGroupSchedule(group.id)
      .then(setSchedule).catch(() => {}).finally(() => setLoading(false));
  }, [group.id]);

  if (loading) return <SafeAreaView style={s.container}><ActivityIndicator size="large" color={lightModeColors.mainColor} style={{ flex: 1 }} /></SafeAreaView>;
  if (!schedule) return <SafeAreaView style={s.container}><Text style={s.error}>No se pudo cargar el horario.</Text></SafeAreaView>;

  const memberColors: Record<string, string> = {};
  schedule.members.forEach((m, i) => { memberColors[m.padron] = MEMBER_COLORS[i % MEMBER_COLORS.length]; });

  const byDay: Record<number, GroupBlock[]> = {};
  for (const b of schedule.blocks) {
    (byDay[b.day_of_week] ??= []).push(b);
  }
  const activeDays = Object.keys(byDay).map(Number).sort();

  return (
    <SafeAreaView style={s.container} accessibilityLabel="group-schedule-screen">
      {/* Legend */}
      <View style={s.legend}>
        {schedule.members.map(m => (
          <View key={m.padron} style={s.legendItem}>
            <View style={[s.dot, { backgroundColor: memberColors[m.padron] }]} />
            <Text style={s.legendName}>{m.full_name || m.padron}</Text>
          </View>
        ))}
      </View>

      <ScrollView contentContainerStyle={s.scroll}>
        {/* Free gaps */}
        {schedule.free_gaps.length > 0 && (
          <View style={s.gapsSection}>
            <Text style={s.gapsTitle}>Franjas libres para todos</Text>
            {schedule.free_gaps.map((g, i) => (
              <View key={i} style={s.gapRow}>
                <Icon name="clock-outline" size={14} color="#198754" style={{ marginRight: 6 }} />
                <Text style={s.gapDay}>{DAYS[g.day_of_week]}</Text>
                <Text style={s.gapTime}>{g.start_time}–{g.end_time}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Schedule by day */}
        {activeDays.length === 0 ? (
          <View style={s.empty}>
            <Icon name="calendar-blank-outline" size={48} color={lightModeColors.lightGray} />
            <Text style={s.emptyText}>Ningún miembro está cursando materias actualmente.</Text>
          </View>
        ) : activeDays.map(day => (
          <View key={day} style={s.daySection}>
            <Text style={s.dayLabel}>{DAYS[day]}</Text>
            {byDay[day].sort((a, b) => a.start_time.localeCompare(b.start_time)).map((b, i) => (
              <View key={i} style={[s.block, { borderLeftColor: memberColors[b.padron], backgroundColor: `${memberColors[b.padron]}18` }]}>
                <Text style={s.blockTime}>{b.start_time}–{b.end_time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.blockSubject} numberOfLines={1}>{b.subject_name}</Text>
                  <Text style={s.blockMember}>{b.full_name}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { padding: 12 },
  error: { textAlign: 'center', marginTop: 40, color: lightModeColors.darkGray },
  legend: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', gap: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  legendName: { fontSize: 12, color: lightModeColors.darkGray },
  gapsSection: { backgroundColor: '#d1e7dd', borderRadius: 10, padding: 12, marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#198754' },
  gapsTitle: { fontSize: 13, fontWeight: '700', color: '#198754', marginBottom: 8, textTransform: 'uppercase' as const },
  gapRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  gapDay: { fontSize: 13, fontWeight: '600' as const, color: '#198754', marginRight: 8 },
  gapTime: { fontSize: 13, color: '#0f5132' },
  daySection: { marginBottom: 16 },
  dayLabel: { fontSize: 14, fontWeight: '700', color: lightModeColors.darkGray, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  block: { borderRadius: 8, borderLeftWidth: 3, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  blockTime: { fontSize: 12, color: lightModeColors.darkGray, width: 90 },
  blockSubject: { fontSize: 13, color: '#000' },
  blockMember: { fontSize: 11, color: lightModeColors.darkGray },
  empty: { alignItems: 'center', paddingTop: 40 },
  emptyText: { marginTop: 12, fontSize: 14, color: lightModeColors.darkGray, textAlign: 'center' },
});

export default GroupScheduleScreen;
