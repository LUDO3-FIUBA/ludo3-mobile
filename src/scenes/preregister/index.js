import React, {Component} from 'react';
import {View, SafeAreaView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {preregister as style} from '../../styles';
import {RoundedButton, FormInput} from '../../components';
import FacePictureConfiguration from './face_recognition';

export default class PreRegister extends Component {
  constructor(props) {
    super(props);
    this.state = {
      firstValid: false,
      secondValid: false,
    };
  }

  shouldEnableSignUp() {
    return this.state.firstValid && this.state.secondValid;
  }

  render() {
    const {navigation} = this.props;
    return (
      <View style={style().view}>
        <SafeAreaView style={style().view}>
          <KeyboardAwareScrollView
            keyboardShouldPersistTaps="handled"
            vertical
            contentContainerStyle={style().scrollView}>
            <View>
              <FormInput
                ref={input => {
                  this.firstTextInput = input;
                }}
                style={style().textInput}
                placeholderColor={style().textInputPlaceholder.color}
                errorStyle={style().errorInInput}
                keyboardType="numeric"
                returnKeyType="next"
                nextField={() => this.secondTextInput}
                placeholder="DNI"
                blurOnSubmit={false}
                onTextChanged={(text, isValid) =>
                  this.setState({firstValid: isValid})
                }
                validation={{
                  presence: {
                    allowEmpty: false,
                    message: 'DNI necesario.',
                  },
                  length: {
                    is: 8,
                    message: 'DNI inválido',
                  },
                }}
              />
              <FormInput
                ref={input => {
                  this.secondTextInput = input;
                }}
                style={style().textInput}
                placeholderColor={style().textInputPlaceholder.color}
                errorStyle={style().errorInInput}
                keyboardType="email-address"
                placeholder="Email"
                onTextChanged={(text, isValid) =>
                  this.setState({secondValid: isValid})
                }
                validation={{
                  presence: {
                    allowEmpty: false,
                    message: 'Email necesario.',
                  },
                  email: {
                    message: 'Email inválido.',
                  },
                }}
              />
            </View>
            <RoundedButton
              text="LISTO"
              enabled={this.shouldEnableSignUp()}
              style={style().button}
              onPress={() => {
                const dni = this.firstTextInput.state.value;
                const email = this.secondTextInput.state.value;
                navigation.navigate('TakePicture', {
                  configuration: new FacePictureConfiguration(
                    ['Tomate una foto de frente'],
                    dni,
                    email,
                  ).toObject(),
                  title: 'Pre-registro',
                });
              }}
            />
          </KeyboardAwareScrollView>
        </SafeAreaView>
      </View>
    );
  }
}
