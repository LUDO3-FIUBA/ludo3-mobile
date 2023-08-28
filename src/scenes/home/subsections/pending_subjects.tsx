import React, { Component } from 'react';
import MenuOption from './base.ts';
import PendingSubjectsScreen from '../../pending_subjects';

export default class PendingSubjects extends MenuOption {
  title(): string {
    return 'Materias pendientes';
  }

  initialComponentProps(): object {
    return {};
  }

  component(props: object): Component {
    return <PendingSubjectsScreen {...props} />;
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
