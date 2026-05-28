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
        else if (item.type === 'catedra') {
            navigation.navigate('ViewCatedraDetails', {
                entry: item.data,
                classOccurrence: item.classOccurrence
                    ? { ...item.classOccurrence, date: item.classOccurrence.date.toISOString() }
                    : undefined,
                inscription: item.inscription,
            });
        }
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

    if (item.type === 'catedra') {
        const { data, classOccurrence, inscription } = item;
        const schedules = inscription?.semester?.schedules ?? [];
        const fallbackSchedule = schedules.find(s => {
            const [y, m, d] = data.date.split('-').map(Number);
            const jsDay = new Date(y, m - 1, d).getDay();
            const backendDay = jsDay === 0 ? 6 : jsDay - 1;
            return s.day_of_week === backendDay;
        }) ?? schedules[0];
        const startTime = classOccurrence?.startTime.slice(0, 5) ?? fallbackSchedule?.start_time.slice(0, 5);
        const endTime   = classOccurrence?.endTime.slice(0, 5)   ?? fallbackSchedule?.end_time.slice(0, 5);
        const subjectName = classOccurrence?.subjectName;
        const label = data.class_number ? `Clase ${data.class_number}` : null;
        return (
            <TouchableOpacity style={[style().item, { borderLeftWidth: 4, borderLeftColor: classColor }]} onPress={onPress}>
                <Text style={style().itemHourText}>{startTime ?? '—'}</Text>
                <View style={{ flex: 1, paddingLeft: 10 }}>
                    <Text style={style().itemTitleText}>
                        {label ? `${label} — ` : ''}{data.topic}
                    </Text>
                    {subjectName && (
                        <Text style={style().itemFooterText}>{subjectName}{startTime ? ` · ${startTime}–${endTime}` : ''}</Text>
                    )}
                    {data.notes.length > 0 && (
                        <Text style={[style().itemFooterText, { color: '#666', marginTop: 2 }]} numberOfLines={2}>{data.notes}</Text>
                    )}
                </View>
                {data.links.length > 0 ? (
                    <Icon name='link-variant' size={16} color={classColor} style={{ marginLeft: 6 }} />
                ) : (
                    <View style={style().itemButtonContainer}>
                        <Icon style={[style().itemButton, { color: classColor }]} name='chevron-right' />
                    </View>
                )}
            </TouchableOpacity>
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
