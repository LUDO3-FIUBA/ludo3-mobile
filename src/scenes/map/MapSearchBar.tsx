import React, { useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  FlatList,
  Platform,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import type { RoomCategory } from './floors/types';
import type { RoomResult } from './searchRooms';
import { lightModeColors } from '../../styles/colorPalette';

const categoryIcon: Record<RoomCategory, string> = {
  aula: 'school',
  bano: 'human-male-female',
  laboratorio: 'flask',
  oficina: 'briefcase',
  instituto: 'domain',
  departamento: 'office-building',
  deposito: 'package-variant-closed',
  sala: 'door',
  otro: 'map-marker',
};

type Props = {
  query: string;
  results: RoomResult[];
  onChange: (q: string) => void;
  onSelect: (room: RoomResult) => void;
  onClear: () => void;
};

export default function MapSearchBar({ query, results, onChange, onSelect, onClear }: Props) {
  const inputRef = useRef<TextInput>(null);
  const [dismissed, setDismissed] = React.useState(false);
  const showSuggestions = query.length > 0 && results.length > 0 && !dismissed;

  return (
    <View pointerEvents="box-none" style={styles.wrapper}>
      <View style={styles.bar}>
        <MaterialCommunityIcons name="magnify" size={20} color={lightModeColors.darkGray} style={styles.searchIcon} />
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Buscar aula, oficina, laboratorio…"
          placeholderTextColor="#888"
          value={query}
          onChangeText={(text) => { setDismissed(false); onChange(text); }}
          returnKeyType="search"
          clearButtonMode="never"
          autoCorrect={false}
          autoCapitalize="none"
          onKeyPress={Platform.OS === 'web' ? (e: any) => {
            if (e.nativeEvent.key === 'Escape') onClear();
          } : undefined}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => { setDismissed(false); onClear(); }} style={styles.clearBtn}>
            <MaterialCommunityIcons name="close" size={18} color={lightModeColors.darkGray} />
          </TouchableOpacity>
        )}
      </View>
      {showSuggestions && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(r) => r.id}
            keyboardShouldPersistTaps="always"
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.suggestion} onPress={() => { setDismissed(true); inputRef.current?.blur(); onSelect(item); }}>
                <MaterialCommunityIcons
                  name={categoryIcon[item.category as RoomCategory]}
                  size={18}
                  color={lightModeColors.institutional}
                  style={styles.catIcon}
                />
                <Text style={styles.suggestionText}>{item.label}</Text>
                <Text style={styles.floorBadge}>{item.floorLabel}</Text>
              </TouchableOpacity>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightModeColors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    paddingHorizontal: 10,
    height: 44,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: lightModeColors.darkGray,
  },
  clearBtn: {
    padding: 4,
    marginLeft: 4,
  },
  dropdown: {
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: lightModeColors.lightGray,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    overflow: 'hidden',
    maxHeight: 320,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  catIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 14,
    color: lightModeColors.darkGray,
    flexShrink: 1,
  },
  separator: {
    height: 1,
    backgroundColor: lightModeColors.lightGray,
    marginHorizontal: 14,
  },
  floorBadge: {
    fontSize: 11,
    color: '#888',
    marginLeft: 8,
  },
});
