import { baseUrl } from '../networking';
import SessionManager from '../managers/sessionManager';
import { convertSnakeToCamelCase } from '../utils/convertSnakeToCamelCase';
import AdminNotification from '../models/AdminNotification';

const BASE_URL = 'api/admin/notifications';

async function authHeaders(): Promise<Record<string, string>> {
    const token = SessionManager.getInstance()?.getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchAll(): Promise<AdminNotification[]> {
    const headers = await authHeaders();
    const response = await fetch(`${baseUrl}/${BASE_URL}/`, { headers });
    const data = await response.json();
    return (data as any[]).map(item => convertSnakeToCamelCase(item) as AdminNotification);
}

export interface CreateNotificationPayload {
    title: string;
    message: string;
    isUrgent: boolean;
    sendPush: boolean;
    sendEmail: boolean;
    recipientGroups: string[];
    image?: { uri: string; type: string; name: string } | null;
}

export async function createNotification(payload: CreateNotificationPayload): Promise<AdminNotification> {
    const headers = await authHeaders();
    const formData = new FormData();

    formData.append('title', payload.title);
    formData.append('message', payload.message);
    formData.append('is_urgent', String(payload.isUrgent));
    formData.append('send_push', String(payload.sendPush));
    formData.append('send_email', String(payload.sendEmail));
    payload.recipientGroups.forEach(g => formData.append('recipient_groups', g));

    if (payload.image) {
        formData.append('image', payload.image as any);
    }

    const response = await fetch(`${baseUrl}/${BASE_URL}/`, {
        method: 'POST',
        headers,
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(JSON.stringify(data));
    }
    return convertSnakeToCamelCase(data) as AdminNotification;
}

export default { fetchAll, createNotification };
