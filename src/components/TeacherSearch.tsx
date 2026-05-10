import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import MaterialIcon from './materialIcon';
import { formsRepository } from '../repositories';
import { TeacherModelSnakeCase } from '../models/Teachers';
import { lightModeColors } from '../styles/colorPalette';

interface TeacherSearchProps {
  selected: TeacherModelSnakeCase | null;
  onSelect: (teacher: TeacherModelSnakeCase | null) => void;
  error?: string | null;
}

const TeacherSearch: React.FC<TeacherSearchProps> = ({ selected, onSelect, error }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TeacherModelSnakeCase[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await formsRepository.searchTeachers(query.trim());
        setResults(data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  if (selected) {
    return (
      <View style={styles.selectedChip}>
        <MaterialIcon name="account-check" fontSize={18} color="#1B5E20" />
        <Text style={styles.selectedName}>
          {selected.first_name} {selected.last_name}
        </Text>
        <TouchableOpacity onPress={() => onSelect(null)} hitSlop={8}>
          <MaterialIcon name="close-circle" fontSize={18} color="#D32F2F" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View>
      <View style={[styles.inputRow, error ? styles.inputRowError : null]}>
        <MaterialIcon name="magnify" fontSize={18} color="#888" />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar docente por nombre o legajo..."
          placeholderTextColor="#aaa"
          autoCapitalize="words"
        />
        {searching && <ActivityIndicator size="small" color={lightModeColors.institutional} />}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      {results.length > 0 && (
        <View style={styles.dropdown}>
          {results.map(t => (
            <TouchableOpacity
              key={t.id}
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(t);
                setQuery('');
                setResults([]);
              }}
            >
              <Text style={styles.dropdownName}>{t.first_name} {t.last_name}</Text>
              {t.legajo ? <Text style={styles.dropdownLegajo}>Legajo: {t.legajo}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      )}
      {query.trim().length >= 2 && !searching && results.length === 0 && (
        <Text style={styles.noResults}>Sin resultados para "{query}"</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: '#fafafa',
  },
  inputRowError: { borderColor: '#C62828', backgroundColor: '#FFF5F5' },
  input: { flex: 1, fontSize: 14, color: '#111' },
  errorText: { color: '#C62828', fontSize: 12, marginTop: 4, fontWeight: '600' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: 'white',
    marginTop: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  dropdownName: { fontSize: 14, fontWeight: '600', color: '#222' },
  dropdownLegajo: { fontSize: 12, color: '#888', marginTop: 2 },
  selectedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1B5E20',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedName: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1B5E20' },
  noResults: { fontSize: 13, color: '#aaa', fontStyle: 'italic', marginTop: 6 },
});

export default TeacherSearch;
