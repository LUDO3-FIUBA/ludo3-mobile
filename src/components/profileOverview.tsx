import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { usersRepository } from '../repositories';
import { User } from '../models';
import { profileOverview as style } from '../styles';
import { SessionManager } from '../managers';
import { useNavigation } from '@react-navigation/native';
import { makeRequest } from '../scenes/authenticatedComponent';
import UserAvatar from './UserAvatar';


export default function ProfileOverview() {
    const [user, setUser] = useState<User | null>(null);
    const isLoggedIn = SessionManager.getInstance()?.isLoggedIn();
    const navigation = useNavigation();

    useEffect(() => {
        async function getUser() {
            try {
                const fetchedUser = await makeRequest(usersRepository.getInfo, navigation);
                setUser(fetchedUser);
            }
            catch (e) {
                console.log(`ProfileOverview: Failed to retrieve user info with error ${e}`)
            }
        }
        getUser();
    }, [isLoggedIn])

    const s = style();
    return (
        <View style={s.view}>
            <UserAvatar photoUrl={user?.profilePhoto} size={80} />
            <Text style={s.text}>{user?.firstName}</Text>
            <Text style={s.text}>{user?.lastName}</Text>
        </View>
    )
}
