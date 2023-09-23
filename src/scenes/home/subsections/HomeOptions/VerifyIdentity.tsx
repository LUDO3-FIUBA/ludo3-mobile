import React, { Component } from 'react';
import TakePictureScreen from '../../../image_recognition/takePictureStep';
import FacePictureConfiguration from '../verify_identity_configuration';

interface Props {
  navigation: any
}

export function VerifyIdentity({ navigation }: Props) {
  const localProperties = {
    configuration: new FacePictureConfiguration('Sacate una foto para poder identificarte')
  };

  return <TakePictureScreen key='Identity' {...localProperties} />;
};

export default VerifyIdentity;

