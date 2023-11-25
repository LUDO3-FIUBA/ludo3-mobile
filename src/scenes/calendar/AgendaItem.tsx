import React, { useCallback } from "react";
import { Alert, Button, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Evaluation } from "../../models";
import moment from "moment";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { calendarAgendaItem as style } from "../../styles";
import { useNavigation } from "@react-navigation/native";

Icon.loadFont()

interface IProps {
    item: Evaluation;
}

const AgendaItem = (props: IProps) => {
    const { item } = props;
    const date = moment(item.end_date);
    const navigation = useNavigation();

    const buttonPressed = useCallback(() => {
        navigation.navigate('ViewEvaluationDetails', { evaluation: item });
    }, []);

    const itemPressed = useCallback(() => {
        Alert.alert(item.evaluation_name);
    }, []);

    return (
        <View style={style().item}>
            <Text style={style().itemHourText}>{date.format('hh:mm a')}</Text>
            <View>
                <Text style={style().itemTitleText}>{item.evaluation_name}</Text>
                {/* <Text style={style().itemFooterText}>{item.semester.commission.subject_name}</Text>  TODO: Re-add semester info somehow */}
            </View>
            <TouchableOpacity onPress={buttonPressed} style={style().itemButtonContainer}>
                <Icon style={style().itemButton} name='arrow-right' />
            </TouchableOpacity>
        </View>
    );
};

export default AgendaItem;
