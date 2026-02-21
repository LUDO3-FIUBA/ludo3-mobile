import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { CommissionsList } from '../teacher_commissions';
import { home as style } from '../../styles';
import { NotificationManager } from '../../managers';

Icon.loadFont();

interface HomeProps {
  navigation: any;  // Specify a more accurate type if possible
}

const Home: React.FC<HomeProps> = ({ navigation }) => {
  const [focusUnsubscribe, setFocusUnsubscribe] = useState<any>(null);  // Specify a more accurate type if possible

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      NotificationManager.getInstance().requestPermissions();
      setFocusUnsubscribe(null);
    });
    setFocusUnsubscribe(unsubscribe);

    // Cleanup
    return () => {
      if (focusUnsubscribe) {
        focusUnsubscribe();
      }
    };
  }, [navigation, focusUnsubscribe]);

  return (
    <View style={style().view}>
      <View style={style().mainView}>
        <CommissionsList navigation={navigation} />
      </View>
    </View>
  );
};

export default Home;
