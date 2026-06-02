import React, { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { usersRepository } from '../repositories';
import { User } from '../models';
import { profileOverview as style } from '../styles';
import { SessionManager } from '../managers';
import { useNavigation } from '@react-navigation/native';
import { makeRequest } from '../scenes/authenticatedComponent';
import UserAvatar from './UserAvatar';
import { useAppSelector } from '../redux/hooks';
import { selectCurrentUserProfilePhoto } from '../redux/reducers/currentUserSlice';


export default function ProfileOverview() {
    const [user, setUser] = useState<User | null>(null);
    const isLoggedIn = SessionManager.getInstance()?.isLoggedIn();
    const navigation = useNavigation();
    const storedPhoto = useAppSelector(selectCurrentUserProfilePhoto);
    const photoUrl = storedPhoto !== undefined ? storedPhoto : user?.profilePhoto;

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
            <UserAvatar photoUrl={photoUrl} size={80} />
            <Text style={s.text}>{user?.firstName}</Text>
            <Text style={s.text}>{user?.lastName}</Text>
        </View>
    )
}
