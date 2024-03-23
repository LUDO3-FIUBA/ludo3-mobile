import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { basicList as style } from '../styles'

interface IProps {
    items: IBasicListItem[]
}

interface IBasicListItem {
    name: string
    onPress?: () => void
    materialIcon: React.ReactNode
}

const BasicList: React.FC<IProps> = ({ items }: IProps) => {
    return (
        <View style={style().view}>
            {items.map((item, index) => (
                <React.Fragment key={item.name}>
                    <TouchableOpacity onPress={item.onPress} style={style().touchableOpacity}>
                        {item.materialIcon}
                        <Text style={style().itemText}>{item.name}</Text>
                    </TouchableOpacity >
                    {index !== items.length - 1 && <View style={style().separator} />}
                </React.Fragment>
            ))}
        </View>
    );
};

export default BasicList;
