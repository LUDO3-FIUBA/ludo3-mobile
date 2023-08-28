import React, { Component } from 'react';
import MenuOption from './base.ts';
import TakePictureScreen from '../../image_recognition/takePictureStep';
import QRScannerConfiguration from './final_exam_configuration';

export default class DeliverFinalExam extends MenuOption {
  title(): string {
    return 'Rendir final';
  }

  initialComponentProps(): object {
    return { configuration: new QRScannerConfiguration('Escaneá el QR del final') };
  }

  component(props: object): Component {
    return <TakePictureScreen key='FinalExam' {...props} />;
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
