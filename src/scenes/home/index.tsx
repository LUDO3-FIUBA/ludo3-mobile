import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableHighlight, Animated, Image, LayoutChangeEvent, TouchableOpacity, Easing } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { RadialMenu } from '../../components';
import { home as style } from '../../styles';
import HomeOptions from './subsections'
import { SessionManager } from '../../managers';
import FacePictureConfiguration from './subsections/verify_identity_configuration';
import { HomeOptionsEnum } from './subsections/HomeOptions/HomeOptionsEnum';
import VerifyIdentity from './subsections/HomeOptions/VerifyIdentity';
import FilterNavBarButton from './filterNavBarButton';
import PendingSubjects from './subsections/HomeOptions/PendingSubjects';
import DeliverFinalExam from './subsections/HomeOptions/DeliverFinalExam';
import ApprovedSubjects from './subsections/HomeOptions/ApprovedSubjects';
import Vote from './subsections/HomeOptions/Vote';

Icon.loadFont();


const Home: React.FC<any> = () => {
  const initialProps = {
    configuration: new FacePictureConfiguration('Sacate una foto para poder identificarte')
  };

  const [selectedOption, setSelectedOption] = useState<HomeOptionsEnum>(HomeOptionsEnum.VerifyIdentity);
  const [childProps, setChildProps] = useState(initialProps);
  const [menuOpened, setMenuOpened] = useState(false);
  const menuOpenerAnimator = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];
  const radialMenuLayoutRef = useRef(null);
  const menuOpenerLayoutRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    setOptionProps(selectedOption);
  }, [selectedOption, childProps]);

  const getHeaderButton = (option: string) => {
    if (option === HomeOptionsEnum.ApprovedSubjects) 
      return <FilterNavBarButton showActionSheetWithOptions={() => ({})} onChildPropsChanged={onChildPropsChanged} />
    return null;
  }

  const setOptionProps = (option: any) => {
    const navOptions = {
      title: option,
      headerRight: (navigation: any) => getHeaderButton(option),
    };
    navigation.setOptions(navOptions);
  };

  const onChildPropsChanged = (newProps: any) => {
    setChildProps({ ...childProps, ...newProps });
  };

  const changeOption = (newOption: any) => {
    if (newOption !== selectedOption) {
      setSelectedOption(newOption);
      // Setchildprops was for the classes schema, we should do something similar with the hooks schema
      // setChildProps(newOption.initialComponentProps());
    }
  };

  const getOptionComponentFromSelectedOption = () => {
    switch(selectedOption) {
      case HomeOptionsEnum.VerifyIdentity:
        return <VerifyIdentity navigation={navigation}/>;
      case HomeOptionsEnum.DeliverFinalExam:
        return <DeliverFinalExam navigation={navigation}/>;
      case HomeOptionsEnum.PendingSubjects:
        return <PendingSubjects navigation={navigation}/>;
      case HomeOptionsEnum.ApprovedSubjects:
        return <ApprovedSubjects navigation={navigation}/>;
      case HomeOptionsEnum.Vote:
        return <Vote navigation={navigation}/>;
    }
  }


  const openMenu = () => {
    if (radialMenuLayoutRef.current) { // check if radialMenuLayoutRef.current exists
      const { x, y, width, height } = radialMenuLayoutRef.current;
      const menuOpenerLayout: { width: number, height: number, x: number, y: number} = menuOpenerLayoutRef.current || { width: 0, height: 0, x: 0, y: 0 };

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
        { getOptionComponentFromSelectedOption() }
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
          <View style={style().menuRootImageItem}>
              <Image
                style={style().itemImage}
                source={require('./img/logo_fiuba.png')}
              />
            </View>
            <TouchableOpacity
              style={style().menuItem}
              onPress={() => {
                // TODO: Change all this options to the new schema
                changeOption(HomeOptions.VerifyIdentity({navigation}));
              }}>
              <Icon style={style().itemIcon} name="face-recognition" />
            </TouchableOpacity>
            <TouchableOpacity
              style={style().menuItem}
              onPress={() => {
                // changeOption(HomeOptions.DeliverFinalExam());
              }}>
              <Icon style={style().itemIcon} name="qrcode-scan" />
            </TouchableOpacity>
            {/*
            <View
              style={style().menuItem}
              onSelect={() => {
                this.changeOption(new HomeOptions.Vote());
              }}>
              <Icon style={style().itemIcon} name="vote" />
            </View>
            */}
            <TouchableOpacity
              style={style().menuItem}
              onPress={() => {
                // changeOption(new HomeOptions.PendingSubjects());
              }}>
              <Icon style={style().itemIcon} name="file-question" />
            </TouchableOpacity>
            <TouchableOpacity
              style={style().menuItem}
              onPress={() => {
                // changeOption(new HomeOptions.ApprovedSubjects());
              }}>
              <Icon style={style().itemIcon} name="file-check" />
            </TouchableOpacity>
            <TouchableOpacity
              style={style().menuItem}
              onPress={async () => {
                await SessionManager.getInstance()?.clearCredentials();
                navigation.reset({
                  index: 0,
                  routes: [{name: 'Landing'}],
                });
              }}>
              <Icon style={style().itemIcon} name="logout" />
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