import React, { Dispatch, FC, SetStateAction } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { connectActionSheet } from '@expo/react-native-action-sheet';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { home as style } from '../../styles';
import { useActionSheet } from '@expo/react-native-action-sheet';
import { Filter } from '../approved_subjects/IFilter';
import { FiltersEnum } from '../approved_subjects/FiltersEnum';
import { useAppDispatch } from '../../redux/hooks';
import { setFilter, setFilterToCorrelative, setFilterToName, setFilterToYear } from '../../redux/reducers/filterSlice';


interface FilterNavBarButtonProps {
}

// Web version - uses window.prompt instead of react-native-prompt-android
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
          const year = window.prompt('Ingrese el año en el que aprobó la materia que busca', '');
          if (year !== null && year !== '') {
            const currentYear = new Date().getFullYear();
            const intYear = parseInt(year);
            if (intYear >= 0 && intYear <= currentYear) {
              dispatch(setFilterToYear(year))
            } else {
              Alert.alert('Ese no es un año válido');
            }
          }
        } else if (buttonIndex == 1) {
          const name = window.prompt('Ingrese el nombre completo de la materia que busca', '');
          if (name !== null && name !== '') {
            dispatch(setFilterToName(name))
          }
        } else if (buttonIndex == 2) {
          const code = window.prompt('Ingrese el código de la materia cuyas correlativas busca\nEjemplo: 62.02', '');
          if (code !== null && code !== '') {
            console.log("Buscar correlativas de la materia con código: " + code);
            dispatch(setFilterToCorrelative(code))
          }
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


