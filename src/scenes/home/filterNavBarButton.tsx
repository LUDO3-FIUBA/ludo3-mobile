import React, {Component} from 'react';
import {TouchableHighlight, Alert} from 'react-native';
import {connectActionSheet} from '@expo/react-native-action-sheet';
import prompt from 'react-native-prompt-android';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {home as style} from '../../styles';
import {
  YearFilter,
  NameFilter,
  CorrelativeFilter,
} from '../approved_subjects/filters.ts';

Icon.loadFont();

interface FilterNavBarButtonProps {
  navigation: object;
  onChildPropsChanged: (props: object) => void;
}

class FilterNavBarButton extends Component<FilterNavBarButtonProps> {
  render() {
    const {
      navigation,
      onChildPropsChanged,
      showActionSheetWithOptions,
    } = this.props;
    return (
      <TouchableHighlight
        style={style().filterButton}
        onPress={() => {
          const options = ['por Año', 'por Nombre', 'Correlativas', 'Cancelar'];
          const cancelButtonIndex = 3;
          showActionSheetWithOptions(
            {
              options,
              cancelButtonIndex,
            },
            buttonIndex => {
              if (buttonIndex == 0) {
                prompt(
                  'Año de aprobación',
                  'Ingrese el año en el que aprobó la materia que busca',
                  [
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                    {
                      text: 'Buscar',
                      onPress: year => {
                        const currentYear = new Date().getFullYear();
                        const intYear = parseInt(year);
                        if (intYear >= 0 && intYear <= currentYear) {
                          onChildPropsChanged({
                            filter: new YearFilter(intYear),
                          });
                        } else {
                          Alert.alert('Ese no es un año válido');
                        }
                      },
                    },
                  ],
                  {
                    type: 'plain-text',
                    cancelable: false,
                    keyboardType: 'number-pad',
                    defaultValue: '',
                  },
                );
              } else if (buttonIndex == 1) {
                prompt(
                  'Nombre',
                  'Ingrese el nombre completo de la materia que busca',
                  [
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                    {
                      text: 'Buscar',
                      onPress: name =>
                        onChildPropsChanged({filter: new NameFilter(name)}),
                    },
                  ],
                  {
                    type: 'plain-text',
                    cancelable: false,
                    keyboardType: 'default',
                    defaultValue: '',
                  },
                );
              } else if (buttonIndex == 2) {
                prompt(
                  'Código',
                  'Ingrese el código de la materia cuyas correlativas busca\nEjemplo: 62.02',
                  [
                    {
                      text: 'Cancelar',
                      style: 'cancel',
                    },
                    {
                      text: 'Buscar',
                      onPress: code =>
                        onChildPropsChanged({
                          filter: new CorrelativeFilter(code),
                        }),
                    },
                  ],
                  {
                    type: 'plain-text',
                    cancelable: false,
                    defaultValue: '',
                    keyboardType: 'default',
                    defaultValue: '',
                  },
                );
              }
            },
          );
        }}>
        <Icon style={style().filterButtonIcon} name="filter" />
      </TouchableHighlight>
    );
  }
}

const ActionSheetButton = connectActionSheet(FilterNavBarButton);

export default ActionSheetButton;
