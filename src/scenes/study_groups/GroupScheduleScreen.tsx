import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lightModeColors } from '../../styles/colorPalette';
import { studyGroupsRepository } from '../../repositories';
import type { StudyGroup, GroupBlock, GroupSchedule, RankedGap } from '../../repositories/studyGroups';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// One color per member (up to 8)
const MEMBER_COLORS = ['#0088cc', '#ff9900', '#28a745', '#dc3545', '#6f42c1', '#fd7e14', '#20c997', '#e83e8c'];

// Tramites-aligned color palette
const GAP_COLORS = {
  all:      { bg: '#E8F5E9', border: '#2E7D32', text: '#1B5E20', badge: '#2E7D32' },
  majority: { bg: '#FFF8E1', border: '#F9A825', text: '#E65100', badge: '#F9A825' },
  minority: { bg: '#FFEBEE', border: '#C62828', text: '#B71C1C', badge: '#C62828' },
};
const DAYS_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MAX_GAPS_VISIBLE = 4;

const GroupScheduleScreen: React.FC<any> = ({ route }) => {
  const { group } = route.params as { group: StudyGroup };
  const [schedule, setSchedule] = useState<GroupSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllGaps, setShowAllGaps] = useState(false);

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
        {/* Free gaps — ranked, compact */}
        {schedule.free_gaps.length > 0 && (
          <View style={s.gapsSection}>
            <Text style={s.gapsTitle}>Mejores franjas para reunirse</Text>
            {(showAllGaps ? schedule.free_gaps : schedule.free_gaps.slice(0, MAX_GAPS_VISIBLE)).map((g: RankedGap, i) => {
              const c = GAP_COLORS[g.type] ?? GAP_COLORS.minority;
              return (
                <View key={i} style={[s.gapRow, { backgroundColor: c.bg, borderColor: c.border }]}>
                  {/* Left: day + time */}
                  <View style={s.gapLeft}>
                    <Text style={[s.gapDay, { color: c.text }]}>{DAYS_SHORT[g.day_of_week]}</Text>
                    <Text style={[s.gapTime, { color: c.text }]}>{g.start_time}–{g.end_time}</Text>
                  </View>
                  {/* Middle: who can/cannot */}
                  <View style={s.gapMiddle}>
                    {g.free_members.length > 0 && (
                      <Text style={[s.gapNames, { color: '#1B5E20' }]} numberOfLines={1}>
                        ✓ {g.free_members.map(m => m.full_name.split(' ')[0]).join(', ')}
                      </Text>
                    )}
                    {g.busy_members.length > 0 && (
                      <Text style={[s.gapNames, { color: '#B71C1C' }]} numberOfLines={1}>
                        ✗ {g.busy_members.map(m => m.full_name.split(' ')[0]).join(', ')}
                      </Text>
                    )}
                  </View>
                  {/* Right: badge */}
                  <View style={[s.gapBadge, { backgroundColor: c.badge }]}>
                    <Text style={s.gapBadgeText}>{g.free_count}/{g.total_count}</Text>
                  </View>
                </View>
              );
            })}
            {schedule.free_gaps.length > MAX_GAPS_VISIBLE && (
              <TouchableOpacity style={s.verMasBtn} onPress={() => setShowAllGaps(v => !v)}>
                <Text style={s.verMasText}>
                  {showAllGaps ? 'Ver menos' : `Ver ${schedule.free_gaps.length - MAX_GAPS_VISIBLE} más`}
                </Text>
              </TouchableOpacity>
            )}
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
  gapsSection: { marginBottom: 16 },
  gapsTitle: { fontSize: 12, fontWeight: '700', color: lightModeColors.darkGray, marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  gapRow: { flexDirection: 'row' as const, alignItems: 'center' as const, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 4, gap: 8 },
  gapLeft: { alignItems: 'center' as const, minWidth: 38 },
  gapDay: { fontSize: 11, fontWeight: '700' as const },
  gapTime: { fontSize: 11 },
  gapMiddle: { flex: 1 },
  gapNames: { fontSize: 12 },
  gapBadge: { borderRadius: 10, paddingHorizontal: 7, paddingVertical: 3, alignItems: 'center' as const },
  gapBadgeText: { fontSize: 11, color: 'white', fontWeight: '700' as const },
  verMasBtn: { paddingVertical: 6 },
  verMasText: { fontSize: 13, color: lightModeColors.mainColor, fontWeight: '600' as const },
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
