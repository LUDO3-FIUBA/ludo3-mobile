import React, { Component } from 'react';
import MenuOption from './base.ts';
import TakePictureScreen from '../../image_recognition/takePictureStep';
import FacePictureConfiguration from './verify_identity_configuration';

export default class VerifyIdentity extends MenuOption {
  title(): string {
    return 'Verificar Identidad';
  }

  initialComponentProps(): object {
    const props = {
      configuration: new FacePictureConfiguration('Sacate una foto para poder identificarte')
    };
    return props;
  }

  component(props: object): Component {
    return <TakePictureScreen key='Identity' {...props} />;
  }

  headerButton(
    navigation: object,
    showActionSheet: (options: ActionSheetOptions, callback: (i: number) => void) => void,
    currentProps: object,
    onChildPropsChanged: (props: object) => void
  ): Component {
    return null;
  }
}
