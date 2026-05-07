import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ProfileOverview } from '../../components';
import { SessionManager } from '../../managers';
import { lightModeColors } from '../../styles/colorPalette';
import type { DirectItem } from '../root_drawer/menu_config';

type SubmenuScreenParams = {
  submenuKey: string;
  title: string;
  items: DirectItem[];
  isMerged: boolean;
};

export default function SubmenuScreen(props: any) {
  const route: { params: SubmenuScreenParams } = props.route;
  const { submenuKey, items, isMerged } = route.params;
  const navigation = useNavigation<any>();

  const handlePress = async (item: DirectItem) => {
    if (item.action === 'logout') {
      await GoogleSignin.signOut();
      await SessionManager.getInstance()?.clearCredentials();
      navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
      return;
    }
    if (item.route) {
      navigation.navigate(item.route as never, item.params as never);
    }
  };

  const itemColor = (item: DirectItem): string => {
    if (isMerged && item.scope === 'teacher') {
      return lightModeColors.teacherAccent;
    }
    return lightModeColors.institutional;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {submenuKey === 'user' && (
        <View style={styles.profileHeader}>
          <ProfileOverview />
        </View>
      )}
      {items.map((item, index) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.row, index < items.length - 1 && styles.rowBorder]}
          onPress={() => handlePress(item)}
          accessibilityLabel={`${item.label}${isMerged && item.scope === 'teacher' ? ', sólo docente' : ''}`}
          activeOpacity={0.7}
        >
          <Icon
            name={item.icon}
            size={22}
            color={itemColor(item)}
            style={styles.rowIcon}
          />
          <Text style={[styles.rowLabel, { color: itemColor(item) }]}>{item.label}</Text>
          {isMerged && item.scope === 'teacher' && (
            <View style={styles.teacherPill}>
              <Text style={styles.teacherPillText}>Docente</Text>
            </View>
          )}
          <Icon name="chevron-right" size={20} color={lightModeColors.lightGray} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingBottom: 24,
  },
  profileHeader: {
    borderBottomWidth: 1,
    borderBottomColor: lightModeColors.lightGray,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: lightModeColors.lightGray,
  },
  rowIcon: {
    marginRight: 14,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  teacherPill: {
    backgroundColor: lightModeColors.teacherAccent,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  teacherPillText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
});
