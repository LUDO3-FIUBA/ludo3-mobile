export default interface AdminNotification {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  isUrgent: boolean;
  sendPush: boolean;
  sendEmail: boolean;
  image: string | null;
  recipientCount: number;
}
