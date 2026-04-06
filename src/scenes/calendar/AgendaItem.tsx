import React, { useCallback } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import moment from "moment";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { calendarAgendaItem as style } from "../../styles";
import { useNavigation } from "@react-navigation/native";
import { CalendarEvent } from "./index";


const INSTITUTIONAL_COLOR = '#0077b6';

interface IProps {
    item: CalendarEvent;
    evalColor: string;
    finalColor: string;
    classColor: string;
}

const AgendaItem = (props: IProps) => {
    const { item, evalColor, finalColor, classColor } = props;
    const navigation = useNavigation<any>();

    const onPress = useCallback(() => {
        if (item.type === 'evaluation') {
            navigation.navigate('ViewEvaluationDetails', { evaluation: item.data });
        } else if (item.type === 'final') {
            const d = item.data.date;
            navigation.navigate('ViewFinalDetails', {
                finalExam: { ...item.data, date: d instanceof Date ? d.toISOString() : d },
            });
        } else if (item.type === 'class') {
            navigation.navigate('ViewClassDetails', {
                classOccurrence: { ...item.data, date: item.data.date.toISOString() },
            });
        }
        // institutional events are not navigable
    }, [item, navigation]);

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

    if (item.type === 'final') {
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
    }

    if (item.type === 'institutional') {
        return (
            <View style={[style().item, { borderLeftWidth: 4, borderLeftColor: INSTITUTIONAL_COLOR }]}>
                <Icon name='calendar-star' size={18} color={INSTITUTIONAL_COLOR} style={{ marginTop: 2 }} />
                <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={style().itemTitleText}>{item.data.name}</Text>
                    <Text style={style().itemFooterText}>
                        {item.data.start_date} – {item.data.end_date}
                    </Text>
                </View>
            </View>
        );
    }

    // type === 'class'
    const startTime = item.data.startTime.slice(0, 5); // "17:00"
    const endTime   = item.data.endTime.slice(0, 5);
    return (
        <TouchableOpacity style={[style().item, { borderLeftWidth: 4, borderLeftColor: classColor }]} onPress={onPress}>
            <Text style={style().itemHourText}>{startTime}</Text>
            <View style={{ flex: 1, paddingLeft: 10 }}>
                <Text style={style().itemTitleText}>{item.data.subjectName}</Text>
                <Text style={style().itemFooterText}>{startTime} – {endTime}</Text>
            </View>
            <View style={style().itemButtonContainer}>
                <Icon style={[style().itemButton, { color: classColor }]} name='chevron-right' />
            </View>
        </TouchableOpacity>
    );
};

export default AgendaItem;
