import React, { FC } from 'react';
// import { ActionSheetOptions } from 'react-native-actionsheet';
import ApprovedSubjectsScreen from '../../approved_subjects';
import FilterNavBarButton from '../filterNavBarButton';

interface ApprovedSubjectsProps {
  navigation: any;
  showActionSheet: (options: any, callback: (i: number) => void) => void;
  // showActionSheet: (options: ActionSheetOptions, callback: (i: number) => void) => void;
  currentProps: object;
  onChildPropsChanged: (props: object) => void;
}

const ApprovedSubjects: FC<ApprovedSubjectsProps> = ({ navigation, showActionSheet, currentProps, onChildPropsChanged }) => {
  const initialComponentProps = () => {
    return {};
  };

  const component = (props: object) => {
    return <ApprovedSubjectsScreen {...props} />;
  };

  // const headerButton = () => {
  //   return <FilterNavBarButton onChildPropsChanged={onChildPropsChanged} showActionSheetWithOptions={} />;
  // };

  return (
    <>
      {component(initialComponentProps())}
      {/* {headerButton()} */}
    </>
  );
};

export default ApprovedSubjects;
