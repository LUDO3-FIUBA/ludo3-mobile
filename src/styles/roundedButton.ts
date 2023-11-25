import {StyleSheet} from 'react-native';
import basic from './basic';
import { lightModeColors } from './colorPalette';

const BasicSubmitButtonStyle = {
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 30,
  paddingRight: 30,
};

export default StyleSheet.create({
  MainContainer: {
    justifyContent: 'center',
    elevation: 3,
    backgroundColor: lightModeColors.institutional,
    borderRadius: 35,
    width: '100%'
  },

  EnabledSubmitButtonStyle: {
    ...BasicSubmitButtonStyle,
    opacity: 1,
  },
  DisabledSubmitButtonStyle: {
    ...BasicSubmitButtonStyle,
    opacity: 0.5,
  },

  TextStyle: {
    ...basic().text,
    textAlign: 'center',
    fontSize: 18,
    color: 'white'
  },

  DefaultPropStyle: {
    fontSize: 15,
    fontWeight: 'bold',
    width: '50%',
    height: 70,
    borderRadius: 35,
    backgroundColor: 'red',
    tintColor: 'white',
  },
});
