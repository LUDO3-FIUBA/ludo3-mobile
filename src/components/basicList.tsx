import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { basicList as style } from '../styles'

interface IProps {
    items: IBasicListItem[]
}

interface IBasicListItem {
    name: string
    onPress: () => void
}

const BasicList: React.FC<IProps> = ({ items }: IProps) => {
    return (
        <View style={style().view}>
            {items.map((item) => (
                <View key={item.name}>
                    <TouchableOpacity onPress={item.onPress} style={style().touchableOpacity}>
                        <Text style={style().itemText}>{item.name}</Text>
                    </TouchableOpacity >
                    <View style={style().separator} />
                </View>
            ))}
        </View>
    );
};

export default BasicList;
