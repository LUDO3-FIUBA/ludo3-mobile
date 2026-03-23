import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { calendarAgendaItem as style } from "../../styles";
import { useNavigation } from "@react-navigation/native";
import { CalendarEvent } from "./index";


interface IProps {
    item: CalendarEvent;
    evalColor: string;
    finalColor: string;
}

const AgendaItem = (props: IProps) => {
    const { item, evalColor, finalColor } = props;
    const navigation = useNavigation();

    const onPress = useCallback(() => {
        if (item.type === 'evaluation') {
            navigation.navigate('ViewEvaluationDetails', { evaluation: item.data });
        } else {
            navigation.navigate('ViewFinalDetails', { finalExam: item.data });
        }
    }, [item]);

    if (item.type === 'evaluation') {
        const date = moment(item.data.end_date);
        return (
            <TouchableOpacity style={[style().item, { borderLeftWidth: 4, borderLeftColor: evalColor }]} onPress={onPress}>
                <Text style={style().itemHourText}>{date.format('hh:mm a')}</Text>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={style().itemTitleText}>{item.data.evaluation_name}</Text>
                    <Text style={style().itemFooterText}>{item.data.semester.commission.subject_name}</Text>
                </View>
                <View style={style().itemButtonContainer}>
                    <Icon style={style().itemButton} name='chevron-right' />
                </View>
            </TouchableOpacity>
        );
    }

    const date = moment(item.data.date);
    return (
        <TouchableOpacity style={[style().item, { borderLeftWidth: 4, borderLeftColor: finalColor }]} onPress={onPress}>
            <Text style={style().itemHourText}>{date.format('hh:mm a')}</Text>
            <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={style().itemTitleText}>Final · {item.data.subject.name}</Text>
                <Text style={style().itemFooterText}>{item.data.subject.code}</Text>
            </View>
            <View style={style().itemButtonContainer}>
                <Icon style={[style().itemButton, { color: finalColor }]} name='school-outline' />
            </View>
        </TouchableOpacity>
    );
};

export default AgendaItem;
