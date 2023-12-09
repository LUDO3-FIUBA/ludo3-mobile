import React, { Component } from 'react';
import TakePictureScreen from '../../../image_recognition/takePictureStep';
import QRScannerConfiguration from '../scan_qr_configuration';

interface Props {
  navigation: any
}

export function DeliverFinalExam({ navigation }: Props) {
  const initialProps = { configuration: new QRScannerConfiguration('Escaneá el QR del final') }

  return <TakePictureScreen key='FinalExam' {...initialProps} />;
}

export default DeliverFinalExam;
