import React, { Component } from 'react';
import MenuOption from './base.ts';
import TakePictureScreen from '../../image_recognition/takePictureStep';
import QRScannerConfiguration from './vote_configuration';

export default class Vote extends MenuOption {
  title(): string {
    return 'Votar';
  }

  initialComponentProps(): object {
    return { configuration: new QRScannerConfiguration('Escaneá el QR de la mesa de votación') };
  }

  component(props: object): Component {
    return <TakePictureScreen key='Vote' {...props} />;
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
