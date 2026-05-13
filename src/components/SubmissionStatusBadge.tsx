import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FormSubmissionStatusValue } from '../models/FormSubmission';

interface Props {
  value: FormSubmissionStatusValue;
}

const STATUS_META: Record<FormSubmissionStatusValue, { label: string; color: string; bg: string }> = {
  sent: { label: 'Enviada', color: '#1565C0', bg: '#E3F2FD' },
  pending_approval: { label: 'Pendiente', color: '#EF6C00', bg: '#FFF3E0' },
  approved: { label: 'Aprobada', color: '#1B5E20', bg: '#E8F5E9' },
  denied: { label: 'Rechazada', color: '#B71C1C', bg: '#FFEBEE' },
};

const SubmissionStatusBadge: React.FC<Props> = ({ value }) => {
  const meta = STATUS_META[value] ?? { label: value, color: '#555', bg: '#eee' };
  return (
    <View style={[styles.badge, { backgroundColor: meta.bg, borderColor: meta.color }]}>
      <Text style={[styles.text, { color: meta.color }]}>{meta.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  text: { fontSize: 11, fontWeight: '700' },
});

export default SubmissionStatusBadge;
