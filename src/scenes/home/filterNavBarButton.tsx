import React, { Dispatch, FC, SetStateAction } from 'react';
import { TouchableHighlight, Alert } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import prompt from 'react-native-prompt-android';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { home as style } from '../../styles';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Filter } from '../approved_subjects/IFilter';
import { FiltersEnum } from '../approved_subjects/FiltersEnum';
import { useAppDispatch } from '../../redux/hooks';
import { setFilter, setFilterToCorrelative, setFilterToName, setFilterToYear } from '../../redux/reducers/filterSlice';

Icon.loadFont();

interface FilterNavBarButtonProps {
}

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
                onPress: (year: string) => {
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
                onPress: (name) => {
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
                onPress: (code) => {
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
    <TouchableHighlight style={style().filterButton} onPress={handlePress}>
      <Icon style={style().filterButtonIcon} name="filter" />
    </TouchableHighlight>
  );
};


export default FilterNavBarButton;
