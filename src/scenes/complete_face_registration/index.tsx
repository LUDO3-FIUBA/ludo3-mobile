import React from 'react';
import TakePictureScreen from '../image_recognition/takePictureStep';
import CompleteFaceRegistrationConfiguration from './configuration';

const CompleteFaceRegistrationScreen = () => {
  const configuration = new CompleteFaceRegistrationConfiguration(
    'Sacate una foto para completar tu registro facial',
  );
  return <TakePictureScreen key="CompleteFaceRegistration" configuration={configuration} />;
};

export default CompleteFaceRegistrationScreen;
