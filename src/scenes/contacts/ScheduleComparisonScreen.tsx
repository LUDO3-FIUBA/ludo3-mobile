import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { lightModeColors } from '../../styles/colorPalette';
import { contactsRepository } from '../../repositories';
import type { Contact, ScheduleBlock } from '../../repositories/contacts';

const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

type Block = ScheduleBlock & { subject_name: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function overlaps(a: Block, b: Block): boolean {
  return parseMinutes(a.start_time) < parseMinutes(b.end_time) &&
         parseMinutes(b.start_time) < parseMinutes(a.end_time);
}

function groupByDay(blocks: Block[]): Record<number, Block[]> {
  const result: Record<number, Block[]> = {};
  for (const b of blocks) {
    (result[b.day_of_week] ??= []).push(b);
  }
  return result;
}

// ─── Day Column ───────────────────────────────────────────────────────────────

const BlockRow: React.FC<{ block: Block; conflict: boolean; mine: boolean }> = ({ block, conflict, mine }) => (
  <View style={[styles.block, mine ? styles.blockMine : styles.blockTheirs, conflict && styles.blockConflict]}>
    <Text style={styles.blockTime}>{block.start_time}–{block.end_time}</Text>
    <Text style={styles.blockName} numberOfLines={2}>{block.subject_name}</Text>
    {conflict && <Icon name="alert" size={12} color="#856404" style={styles.blockAlert} />}
  </View>
);

const DaySection: React.FC<{ day: number; mine: Block[]; theirs: Block[] }> = ({ day, mine, theirs }) => {
  const allBlocks = [...mine, ...theirs].sort(
    (a, b) => parseMinutes(a.start_time) - parseMinutes(b.start_time)
  );
  if (allBlocks.length === 0) return null;

  const conflictSet = new Set<Block>();
  for (const a of mine) {
    for (const b of theirs) {
      if (overlaps(a, b)) { conflictSet.add(a); conflictSet.add(b); }
    }
  }

  return (
    <View style={styles.daySection}>
      <Text style={styles.dayLabel}>{DAYS[day]}</Text>
      {mine.map((b, i) => (
        <BlockRow key={`m${i}`} block={b} conflict={conflictSet.has(b)} mine />
      ))}
      {theirs.map((b, i) => (
        <BlockRow key={`t${i}`} block={b} conflict={conflictSet.has(b)} mine={false} />
      ))}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ScheduleComparisonScreen: React.FC<any> = ({ route }) => {
  const contact = route?.params?.contact as Contact | undefined;
  const [loading, setLoading] = useState(true);
  const [mine, setMine] = useState<Block[]>([]);
  const [theirs, setTheirs] = useState<Block[]>([]);
  const [gaps, setGaps] = useState<ScheduleBlock[]>([]);

  useEffect(() => {
    if (!contact?.id) { setLoading(false); return; }
    contactsRepository.fetchScheduleComparison(contact.id)
      .then(data => { setMine(data.mine); setTheirs(data.theirs); setGaps(data.free_gaps); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [contact.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={lightModeColors.mainColor} style={{ flex: 1 }} />
      </SafeAreaView>
    );
  }

  const myByDay = groupByDay(mine);
  const theirsByDay = groupByDay(theirs);
  const activeDays = [...new Set([...Object.keys(myByDay), ...Object.keys(theirsByDay)])].map(Number).sort();

  const hasConflict = activeDays.some(day => {
    const m = myByDay[day] ?? [];
    const t = theirsByDay[day] ?? [];
    return m.some(a => t.some(b => overlaps(a, b)));
  });

  return (
    <SafeAreaView style={styles.container} accessibilityLabel="schedule-comparison-screen">
      <View style={styles.header}>
        <View style={styles.legendRow}>
          <View style={[styles.dot, styles.dotMine]} />
          <Text style={styles.legendText}>Yo</Text>
          <View style={[styles.dot, styles.dotTheirs]} />
          <Text style={styles.legendText}>{contact.contact.full_name}</Text>
          {hasConflict && (
            <>
              <Icon name="alert" size={14} color="#856404" style={{ marginLeft: 12 }} />
              <Text style={[styles.legendText, { color: '#856404' }]}>Superposición</Text>
            </>
          )}
        </View>
      </View>

      {gaps.length > 0 && (
        <View style={styles.gapsSection}>
          <Text style={styles.gapsSectionTitle}>Franjas libres en común</Text>
          {gaps.map((g, i) => (
            <View key={i} style={styles.gapRow}>
              <Icon name="clock-outline" size={14} color="#198754" style={{ marginRight: 6 }} />
              <Text style={styles.gapDay}>{DAYS[g.day_of_week]}</Text>
              <Text style={styles.gapTime}>{g.start_time}–{g.end_time}</Text>
            </View>
          ))}
        </View>
      )}

      {activeDays.length === 0 ? (
        <View style={styles.empty}>
          <Icon name="calendar-blank-outline" size={48} color={lightModeColors.lightGray} />
          <Text style={styles.emptyText}>Ninguno de los dos está cursando materias actualmente.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {activeDays.map(day => (
            <DaySection
              key={day}
              day={day}
              mine={myByDay[day] ?? []}
              theirs={theirsByDay[day] ?? []}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotMine: { backgroundColor: lightModeColors.mainColor },
  dotTheirs: { backgroundColor: lightModeColors.careers },
  legendText: { fontSize: 13, color: lightModeColors.darkGray },
  scroll: { padding: 12 },
  daySection: { marginBottom: 16 },
  dayLabel: { fontSize: 14, fontWeight: '700', color: lightModeColors.darkGray, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  block: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginBottom: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
  blockMine: { backgroundColor: `${lightModeColors.mainColor}18`, borderLeftWidth: 3, borderLeftColor: lightModeColors.mainColor },
  blockTheirs: { backgroundColor: `${lightModeColors.careers}18`, borderLeftWidth: 3, borderLeftColor: lightModeColors.careers },
  blockConflict: { backgroundColor: '#fff3cd', borderLeftColor: '#ffc107' },
  blockTime: { fontSize: 12, color: lightModeColors.darkGray, minWidth: 90 },
  blockName: { flex: 1, fontSize: 13, color: '#000' },
  blockAlert: { marginLeft: 4 },
  gapsSection: { margin: 12, padding: 12, backgroundColor: '#d1e7dd', borderRadius: 10, borderLeftWidth: 3, borderLeftColor: '#198754' },
  gapsSectionTitle: { fontSize: 13, fontWeight: '700', color: '#198754', marginBottom: 8, textTransform: 'uppercase' as const, letterSpacing: 0.4 },
  gapRow: { flexDirection: 'row' as const, alignItems: 'center' as const, marginBottom: 4 },
  gapDay: { fontSize: 13, fontWeight: '600' as const, color: '#198754', marginRight: 8 },
  gapTime: { fontSize: 13, color: '#0f5132' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { marginTop: 12, fontSize: 14, color: lightModeColors.darkGray, textAlign: 'center', padding: 20 },
});

export default ScheduleComparisonScreen;
