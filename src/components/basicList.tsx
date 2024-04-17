import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { basicList as style } from '../styles'

interface IProps {
    items: IBasicListItem[]
    showSeparator?: boolean
}

interface IBasicListItem {
    name: string
    onPress?: () => void
    materialIcon: React.ReactNode
    rightItem?: React.ReactNode
}

const BasicList: React.FC<IProps> = ({ items, showSeparator = true }: IProps) => {
    return (
        <View style={style().view}>
            {items.map((item, index) => (
                <React.Fragment key={item.name}>
                    <TouchableOpacity onPress={item.onPress} style={style().touchableOpacity}>
                        {item.materialIcon}
                        <View style={{ flex: 1 }}>
                            <Text style={style().itemText}>{item.name}</Text>
                        </View>
                        {item.rightItem}
                    </TouchableOpacity >
                    {showSeparator && index !== items.length - 1 && <View style={style().separator} />}
                </React.Fragment>
            ))}
        </View>
    );
};

export default BasicList;
