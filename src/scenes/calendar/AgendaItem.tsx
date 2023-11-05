import React, { useCallback } from "react";
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { EvaluationInstance } from "../../models";
import moment from "moment";
import { calendarAgendaItem as style } from "../../styles";

interface IProps {
    item: EvaluationInstance;
}

const AgendaItem = (props: IProps) => {
    const { item } = props;
    const date = moment(item.date)

    const buttonPressed = useCallback(() => {
        Alert.alert('Show me more');
    }, []);

    const itemPressed = useCallback(() => {
        Alert.alert(item.type_name);
    }, []);
    console.log(item);

    return (
        <View style={style().item}>
            <Text style={style().itemHourText}>{date.format('hh:mm a')}</Text>
            <View>
                <Text style={style().itemTitleText}>{item.type_name}</Text>
                <Text style={style().itemFooterText}>{item.semester.commission.subject_name}</Text>
            </View>
            <View style={style().itemButtonContainer}>
                <Button color={'grey'} title={'Info'} onPress={buttonPressed} />
            </View>
        </View>
    );
};

export default AgendaItem;
