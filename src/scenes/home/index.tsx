import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableHighlight, Animated, Image, LayoutChangeEvent } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { RadialMenu } from '../../components';
import { home as style } from '../../styles';

Icon.loadFont();

interface HomeProps {
  route: {
    params: {
      subsection: any;
    };
  };
}

const Home: React.FC<HomeProps> = ({ route }) => {
  const [selectedOption, setSelectedOption] = useState(route.params.subsection);
  const [childProps, setChildProps] = useState(route.params.subsection.initialComponentProps());
  const [menuOpened, setMenuOpened] = useState(false);
  const menuOpenerAnimator = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];
  const radialMenuLayoutRef = useRef(null);
  const menuOpenerLayoutRef = useRef(null);
  const navigation = useNavigation();


  useEffect(() => {
    setOptionProps(selectedOption);
  }, [selectedOption, childProps]);

  const setOptionProps = (option: any) => {
    const navOptions = {
      title: option.title(),
      headerRight: (navigation: any) => option.headerButton(navigation, undefined, childProps, onChildPropsChanged),
    };
    navigation.setOptions(navOptions);
  };

  const onChildPropsChanged = (newProps: any) => {
    setChildProps({ ...childProps, ...newProps });
  };

  const changeOption = (newOption: any) => {
    if (newOption !== selectedOption) {
      setSelectedOption(newOption);
      setChildProps(newOption.initialComponentProps());
    }
  };

  const openMenu = () => {
    if (radialMenuLayoutRef && radialMenuLayoutRef.current) {
      const { x, y, width, height } = radialMenuLayoutRef.current
      // const menuOpenerLayout = menuOpenerLayoutRef.current;
      
      // const expectedX = x + width / 2 - menuOpenerLayout.width / 2;
      // const expectedY = y + height / 2 - menuOpenerLayoutRef.current.height / 2;

      // Animated.timing(menuOpenerAnimator, {
      //   toValue: { x: expectedX - menuOpenerLayoutRef.current.x, y: expectedY - menuOpenerLayoutRef.current.y },
      //   duration: 200,
      //   easing: Easing.quad,
      // }).start(() => {
      //   setMenuOpened(true);
      // });
    }
  };

  const closeMenu = () => {
    setMenuOpened(false);
    // Animated.timing(menuOpenerAnimator, {
    //   toValue: { x: 0, y: 0 },
    //   duration: 200,
    //   easing: Easing.quad,
    // }).start();
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
        {selectedOption.component({ navigation, ...childProps })}
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
          {/* RadialMenu items go here */}
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