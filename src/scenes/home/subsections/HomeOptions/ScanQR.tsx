import React, { Component } from 'react';
import TakePictureScreen from '../../../image_recognition/takePictureStep';
import QRScannerConfiguration from '../scan_qr_configuration';

interface Props {
  navigation: any
}

export function ScanQR({ navigation }: Props) {
  const initialProps = { configuration: new QRScannerConfiguration('Escaneá el QR para entregar tu examen o marcar asistencia.') }

  return <TakePictureScreen key='FinalExam' {...initialProps} />;
}

export default ScanQR;
