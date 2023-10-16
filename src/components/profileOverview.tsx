import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usersRepository } from '../repositories';
import { User } from '../models';
import { profileOverview as style } from '../styles';

Icon.loadFont()

export default function ProfileOverview() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        async function getUser() {
            const fetchedUser = await usersRepository.getInfo();
            setUser(fetchedUser);
        }
        getUser();
    }, [])

    return (
        <View style={style().view}>
            <Icon name='account-circle' style={style().icon} />
            <Text style={style().text}>{user?.firstName}</Text>
            <Text style={style().text}>{user?.lastName}</Text>
        </View>
    )
}
