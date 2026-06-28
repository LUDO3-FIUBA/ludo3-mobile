import { Platform } from 'react-native';
import { baseUrl } from '../networking';
import SessionManager from '../managers/sessionManager';
import authenticatedRepository from './authenticatedRepository';

const domainUrl = 'api/notifications';
const teacherDomainUrl = 'api/teacher/notifications';

export interface SemesterInfo {
    subject_name: string;
    period_label: string;
}

export interface Notification {
    id: number;
    title: string;
    message: string;
    created_at: string;
    is_urgent?: boolean;
    image?: string | null;
    sender_name?: string | null;
    semester_info?: SemesterInfo | null;
    action_url?: string | null;
    department?: { id: number; name: string } | null;
}

export interface UserNotification {
    id: number;
    is_read: boolean;
    notification: Notification;
}

export interface TeacherSentNotification {
    id: number;
    title: string;
    message: string;
    sender: number;
    sender_name: string;
    created_at: string;
    is_urgent: boolean;
    image: string | null;
    recipient_count: number;
}

export interface SendCommissionNotificationPayload {
    semesterId: number;
    title: string;
    message: string;
    isUrgent: boolean;
    image?: { uri: string; type: string; name: string } | null;
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

async function sendCommissionNotification(
    payload: SendCommissionNotificationPayload,
): Promise<TeacherSentNotification> {
    const token = SessionManager.getInstance()?.getAuthToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

    const formData = new FormData();
    formData.append('semester_id', String(payload.semesterId));
    formData.append('title', payload.title);
    formData.append('message', payload.message);
    formData.append('is_urgent', String(payload.isUrgent));
    if (payload.image) {
        if (Platform.OS === 'web') {
            // Browsers require a real Blob/File — fetch the blob: or data: URI and wrap it
            const res = await fetch(payload.image.uri);
            const blob = await res.blob();
            formData.append('image', new File([blob], payload.image.name, { type: payload.image.type }));
        } else {
            // React Native's FormData polyfill handles { uri, type, name } natively
            formData.append('image', payload.image as any);
        }
    }

    console.log(`POST ${baseUrl}/${teacherDomainUrl}/ (FormData with title: ${payload.title}, message: ${payload.message}, isUrgent: ${payload.isUrgent})`);

    const response = await fetch(`${baseUrl}/${teacherDomainUrl}/`, {
        method: 'POST',
        headers,
        body: formData,
    });

    const data = await response.json();
    if (response.ok) {
        console.log(`RESPONSE\n${JSON.stringify(data)}`);
    } else {
        console.log(`RESPONSE: ${response.status}\n${JSON.stringify(data)}`);
    }
    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }
    return data as TeacherSentNotification;
}

async function fetchSemesterNotifications(semesterId: number): Promise<TeacherSentNotification[]> {
    const response = await authenticatedRepository.get(
        `${teacherDomainUrl}/by_semester`,
        [{ key: 'semester_id', value: semesterId }],
    );
    return response as TeacherSentNotification[];
}

async function fetchStudentSemesterNotifications(semesterId: number): Promise<Notification[]> {
    const response = await authenticatedRepository.get(
        `${domainUrl}/semester/${semesterId}`,
    );
    return response as Notification[];
}

export default {
    fetchMyNotifications,
    markNotificationAsRead,
    deleteNotification,
    sendCommissionNotification,
    fetchSemesterNotifications,
    fetchStudentSemesterNotifications,
};
