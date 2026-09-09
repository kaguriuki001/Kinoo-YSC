export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'event' | 'transaction' | 'member' | 'minutes' | 'general';
  userId?: string;
  timestamp: Date;
  read: boolean;
}

// In-memory store (replace with DB later)
const notifications: Notification[] = [];

export function broadcastNotification(title: string, message: string, type: string) {
  const notif: Notification = {
    id: Date.now().toString(),
    title,
    message,
    type: type as any,
    timestamp: new Date(),
    read: false
  };
  notifications.push(notif);
  return notif;
}

export function sendUserNotification(userId: string, title: string, message: string, type: string) {
  const notif: Notification = {
    id: Date.now().toString(),
    title,
    message,
    type: type as any,
    userId,
    timestamp: new Date(),
    read: false
  };
  notifications.push(notif);
  return notif;
}

export function getNotifications(userId?: string): Notification[] {
  return notifications.filter(n => !n.userId || n.userId === userId);
}

export function markAsRead(notificationId: string) {
  const notif = notifications.find(n => n.id === notificationId);
  if (notif) notif.read = true;
}

// Specialized helpers
export const notifyEventCreated = (eventTitle: string) => 
  broadcastNotification("New Event", `${eventTitle} has been created!`, "event");

export const notifyTransactionApproved = (amount: number) => 
  broadcastNotification("Transaction Approved", `KES ${amount} has been verified.`, "transaction");

export const notifyMemberApproved = (memberName: string) => 
  broadcastNotification("Member Approved", `${memberName} has been approved.`, "member");

export const notifyMinutesUploaded = () => 
  broadcastNotification("Minutes Uploaded", "New meeting minutes are available.", "minutes");