import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GroupMember } from '../models/FormOwnershipGroup';
import { lightModeColors } from '../styles/colorPalette';

interface RecipientSelectorProps {
  members: GroupMember[];
  selectedEntityType: string | null;
  selectedEntityId: number | null;
  onSelect: (entityType: string, entityId: number) => void;
  error?: string | null;
}

const RecipientSelector: React.FC<RecipientSelectorProps> = ({
  members,
  selectedEntityType,
  selectedEntityId,
  onSelect,
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        Destinatario <Text style={styles.required}>*</Text>
      </Text>
      <Text style={styles.hint}>
        Seleccioná a quién va dirigida tu solicitud.
      </Text>
      {members.map(member => {
        const isSelected =
          selectedEntityType === member.entity_type &&
          selectedEntityId === member.entity_id;
        const displayName = member.parent_secretary_name
          ? `${member.name} (${member.parent_secretary_name})`
          : member.name;
        return (
          <TouchableOpacity
            key={`${member.entity_type}-${member.entity_id}`}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(member.entity_type, member.entity_id)}
            activeOpacity={0.75}
          >
            <View style={[styles.radio, isSelected && styles.radioSelected]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
            <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
              {displayName}
            </Text>
          </TouchableOpacity>
        );
      })}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 14, fontWeight: '600', color: '#333' },
  required: { color: '#D32F2F' },
  hint: { fontSize: 13, color: '#666', fontStyle: 'italic' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fafafa',
  },
  optionSelected: {
    borderColor: lightModeColors.institutional,
    backgroundColor: '#EBF3FF',
  },
  optionText: { fontSize: 14, color: '#333', flex: 1 },
  optionTextSelected: { color: lightModeColors.institutional, fontWeight: '600' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: lightModeColors.institutional },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: lightModeColors.institutional,
  },
  errorText: { color: '#D32F2F', fontSize: 12, fontWeight: '600' },
});

export default RecipientSelector;
