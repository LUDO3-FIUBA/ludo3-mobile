import React, { FC } from 'react';
import { View, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { filterDescriptor as style } from '../styles';


interface FilterDescriptorProps {
  filter: {
    title: string;
    value: string;
  };
  onClose: () => void;
}

const FilterDescriptor: FC<FilterDescriptorProps> = ({ filter, onClose = () => {} }) => {
  return (
    <View style={style().view}>
      <View style={style().textContainer}>
        <Text style={style().filterName}>{filter.title}:</Text>
        <Text style={style().filterValue}>{filter.value}</Text>
      </View>
      <Icon
        name="close"
        style={style().closeButton}
        onPress={onClose}
      />
    </View>
  );
};

export default FilterDescriptor;
