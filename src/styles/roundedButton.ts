import {StyleSheet} from 'react-native';
import basic from './basic';

const BasicSubmitButtonStyle = {
  paddingTop: 15,
  paddingBottom: 15,
  paddingLeft: 30,
  paddingRight: 30,
};

export default StyleSheet.create({
  MainContainer: {
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
    marginBottom: 20,
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
