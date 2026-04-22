import authenticatedRepository from './authenticatedRepository';

const domainUrl = 'api/notifications';

export interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_urgent?: boolean;
    image?: string | null;
}

export interface UserNotification {
    id: number;
    is_read: boolean;
    notification: Notification;
}

async function fetchMyNotifications(): Promise<UserNotification[]> {
    const response = await authenticatedRepository.get(`${domainUrl}/my_notifications`);
    return response as UserNotification[];
}

async function markNotificationAsRead(userNotificationId: number): Promise<UserNotification> {
    const response = await authenticatedRepository.post(
        `${domainUrl}/${userNotificationId}/mark_as_read`,
        {},
    );
    return response as UserNotification;
}

async function deleteNotification(userNotificationId: number): Promise<void> {
    await authenticatedRepository.deleteMethod(
        `${domainUrl}/${userNotificationId}/delete_for_me`,
        {},
    );
}

export default {
    fetchMyNotifications,
    markNotificationAsRead,
    deleteNotification,
};
