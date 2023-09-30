import React, { useState, useRef } from 'react';
import { View, TouchableHighlight, Animated, Image, LayoutChangeEvent, TouchableOpacity, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { RadialMenu } from '../../components';
import { home as style } from '../../styles';
import { SessionManager } from '../../managers';
import VerifyIdentity from './subsections/HomeOptions/VerifyIdentity';

Icon.loadFont();


const Home: React.FC<any> = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const menuOpenerAnimator = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];
  const radialMenuLayoutRef = useRef(null);
  const menuOpenerLayoutRef = useRef(null);
  const navigation = useNavigation();

  const openMenu = () => {
    if (radialMenuLayoutRef.current) { // check if radialMenuLayoutRef.current exists
      const { x, y, width, height } = radialMenuLayoutRef.current;
      const menuOpenerLayout: { width: number, height: number, x: number, y: number } = menuOpenerLayoutRef.current || { width: 0, height: 0, x: 0, y: 0 };

      if (menuOpenerLayout) {
        const expectedX = x + width / 2 - menuOpenerLayout.width / 2;
        const expectedY = y + height / 2 - menuOpenerLayout.height / 2;

        Animated.timing(menuOpenerAnimator, {
          toValue: { x: expectedX - menuOpenerLayout.x, y: expectedY - menuOpenerLayout.y },
          duration: 200,
          easing: Easing.quad, // use Easing.quad
          useNativeDriver: true, // add useNativeDriver property
        }).start(() => {
          setMenuOpened(true);
        });
      }
    }
  };

  const closeMenu = () => {
    setMenuOpened(false);
    Animated.timing(menuOpenerAnimator, {
      toValue: { x: 0, y: 0 },
      duration: 200,
      easing: Easing.quad,
      useNativeDriver: false
    }).start();
  };

  const handleLayout = (event: LayoutChangeEvent, ref: React.MutableRefObject<any>) => {
    ref.current = event.nativeEvent.layout;
  };

  return (
    <View style={style().view}>
      {!menuOpened && (
        <View
          onLayout={(event) => handleLayout(event, radialMenuLayoutRef)}
          style={style().menu}
        />
      )}
      <View style={style().mainView}>
        <VerifyIdentity navigation={navigation} />
      </View>
      {menuOpened && (
        <RadialMenu
          // onLayout={(event: any) => handleLayout(event, radialMenuLayoutRef)}
          opened
          onClosed={() => {
            closeMenu();
          }}
          style={style().menu}
        >
          <TouchableOpacity style={style().menuRootImageItem}>
            
            <Image
              style={style().itemImage}
              source={require('./img/logo_fiuba.png')}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={style().menuItem}
            onPress={() => {
              navigation.navigate('VerifyIdentity')
            }}>
            <Icon style={style().itemIcon} name="face-recognition"/>
          </TouchableOpacity>

          <TouchableOpacity
            style={style().menuItem}
            onPress={() => {
              navigation.navigate('DeliverFinalExam')
            }}>
            <Icon style={style().itemIcon} name="qrcode-scan"/>
          </TouchableOpacity>

          <TouchableOpacity
            style={style().menuItem}
            onPress={() => {
              navigation.navigate('PendingSubjects')
            }}>
            <Icon style={style().itemIcon} name="file-question"/>

          </TouchableOpacity>

          <TouchableOpacity
            style={style().menuItem}
            onPress={() => {
              navigation.navigate('ApprovedSubjects')
            }}>
            <Icon style={style().itemIcon} name="file-check"/>

          </TouchableOpacity>

          <TouchableOpacity
            style={style().menuItem}
            onPress={async () => {
              await SessionManager.getInstance()?.clearCredentials();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Landing' }],
              });
            }}>
            <Icon style={style().itemIcon} name="logout"/>
          </TouchableOpacity>
        </RadialMenu>
      )}
      {!menuOpened && (
        <Animated.View
          style={[
            style().menuOpenerContainer,
            {
              transform: menuOpenerAnimator.getTranslateTransform(),
            },
          ]}
          onLayout={(event) => handleLayout(event, menuOpenerLayoutRef)}
        >
          <TouchableHighlight
            style={style().menuImageOpener}
            onPress={() => {
              openMenu();
            }}
          >
            <Image
              style={style().itemImage}
              source={require('./img/logo_fiuba.png')}
            />
          </TouchableHighlight>
        </Animated.View>
      )}
    </View>
  );
};

export default Home;