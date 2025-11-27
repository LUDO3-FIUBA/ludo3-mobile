import React, { Dispatch, FC, SetStateAction } from 'react';
import { TouchableOpacity, Alert, Platform } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { home as style } from '../../styles';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Filter } from '../approved_subjects/IFilter';
import { FiltersEnum } from '../approved_subjects/FiltersEnum';
import { useAppDispatch } from '../../redux/hooks';
import { setFilter, setFilterToCorrelative, setFilterToName, setFilterToYear } from '../../redux/reducers/filterSlice';

// Conditional import for Android only
let promptAndroid: any = null;
if (Platform.OS === 'android') {
  promptAndroid = require('react-native-prompt-android').default;
}

Icon.loadFont();

interface FilterNavBarButtonProps {
}

// Helper function for cross-platform prompt
const showPrompt = (
  title: string,
  message: string,
  buttons: Array<{text: string, onPress?: (text?: string) => void, style?: string}>,
  options?: {type?: string, cancelable?: boolean, defaultValue?: string}
) => {
  if (Platform.OS === 'ios') {
    // iOS has native Alert.prompt support
    Alert.prompt(
      title,
      message,
      buttons.map(btn => ({
        text: btn.text,
        onPress: btn.onPress,
        style: btn.style as any,
      })),
      options?.type as any || 'plain-text',
      options?.defaultValue || ''
    );
  } else {
    // Android uses react-native-prompt-android
    if (promptAndroid) {
      promptAndroid(title, message, buttons, options);
    }
  }
};

const FilterNavBarButton: FC<FilterNavBarButtonProps> = () => {
  const dispatch = useAppDispatch()
  const { showActionSheetWithOptions } = useActionSheet();

  const handlePress = () => {
    const options = ['por Año', 'por Nombre', 'Correlativas', 'Cancelar'];
    const cancelButtonIndex = 3;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex: number | undefined) => {
        if (buttonIndex == 0) {
          showPrompt(
            'Año de aprobación',
            'Ingrese el año en el que aprobó la materia que busca',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
              },
              {
                text: 'Buscar',
                onPress: (year?: string) => {
                  if (!year) return;
                  const currentYear = new Date().getFullYear();
                  const intYear = parseInt(year);
                  if (intYear >= 0 && intYear <= currentYear) {
                    dispatch(setFilterToYear(year))
                  } else {
                    Alert.alert('Ese no es un año válido');
                  }
                },
              },
            ],
            {
              type: 'plain-text',
              cancelable: false,
              defaultValue: '',
            },
          );
        } else if (buttonIndex == 1) {
          showPrompt(
            'Nombre',
            'Ingrese el nombre completo de la materia que busca',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
              },
              {
                text: 'Buscar',
                onPress: (name?: string) => {
                  if (!name) return;
                  dispatch(setFilterToName(name))
                }

              },
            ],
            {
              type: 'plain-text',
              cancelable: false,
              defaultValue: '',
            },
          );
        } else if (buttonIndex == 2) {
          showPrompt(
            'Código',
            'Ingrese el código de la materia cuyas correlativas busca\nEjemplo: 62.02',
            [
              {
                text: 'Cancelar',
                style: 'cancel',
              },
              {
                text: 'Buscar',
                onPress: (code?: string) => {
                  if (!code) return;
                  console.log("Buscar correlativas de la materia con código: " + code);
                  dispatch(setFilterToCorrelative(code))
                }
              },
            ],
            {
              type: 'plain-text',
              cancelable: false,
              defaultValue: '',
            },
          );
        }
      },
    );
  };

  return (
    <TouchableOpacity style={style().filterButton} onPress={handlePress}>
      <Icon style={style().filterButtonIcon} name="filter" />
    </TouchableOpacity>
  );
};


export default FilterNavBarButton;
