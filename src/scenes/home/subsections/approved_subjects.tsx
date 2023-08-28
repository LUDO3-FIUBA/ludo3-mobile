import React, {Component} from 'react';
import MenuOption from './base.ts';
import FilterNavBarButton from '../filterNavBarButton.tsx';
import ApprovedSubjectsScreen from '../../approved_subjects';

export default class ApprovedSubjects extends MenuOption {
  title(): string {
    return 'Materias aprobadas';
  }

  initialComponentProps(): object {
    return {};
  }

  component(props: object): Component {
    return <ApprovedSubjectsScreen {...props} />;
  }

  headerButton(
    navigation: object,
    showActionSheet: (
      options: ActionSheetOptions,
      callback: (i: number) => void,
    ) => void,
    currentProps: object,
    onChildPropsChanged: (props: object) => void,
  ): Component {
    return <FilterNavBarButton onChildPropsChanged={onChildPropsChanged} />;
  }
}
