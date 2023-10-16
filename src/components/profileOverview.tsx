import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usersRepository } from '../repositories';
import { User } from '../models';
import { profileOverview as style } from '../styles';
import { SessionManager } from '../managers';

Icon.loadFont()

export default function ProfileOverview() {
    const [user, setUser] = useState<User | null>(null);
    const isLoggedIn = SessionManager.getInstance()?.isLoggedIn()

    useEffect(() => {
        async function getUser() {
            try {
                const fetchedUser = await usersRepository.getInfo();
                setUser(fetchedUser);
            }
            catch (e) {
                console.log(`ProfileOverview: Failed to retrieve user info with error ${e}`)
            }
        }
        getUser();
    }, [isLoggedIn])

    return (
        <View style={style().view}>
            <Icon name='account-circle' style={style().icon} />
            <Text style={style().text}>{user?.firstName}</Text>
            <Text style={style().text}>{user?.lastName}</Text>
        </View>
    )
}
