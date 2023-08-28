import React, { Component } from 'react';

export default abstract class MenuOption {
  abstract title(): string;

  abstract initialComponentProps(): object;

  abstract component(props: object): Component;

  abstract headerButton(
    navigation: object,
    showActionSheet: (options: ActionSheetOptions, callback: (i: number) => void) => void,
    currentProps: object,
    onChildPropsChanged: (props: object) => void
  ): Component;
}
