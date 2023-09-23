import React, { Component } from 'react';
import QRScannerConfiguration from '../final_exam_configuration';
import TakePictureStep from '../../../image_recognition/takePictureStep';

interface Props {
  navigation: any
}

export default function Vote({ navigation }: Props) {
  const initialProps = { configuration: new QRScannerConfiguration('Escaneá el QR de la mesa de votación') };

  return <TakePictureStep key='Vote' {...initialProps} />
}
