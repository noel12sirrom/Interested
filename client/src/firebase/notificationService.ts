import { db } from './config';
import { collection, addDoc, updateDoc, doc, serverTimestamp, deleteDoc } from 'firebase/firestore';

export interface Notification {
  id: string;
  type: 'linkRequest';
  eventId: string;
  eventTitle: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
  read: boolean;
}

export const createNotification = async (
  eventId: string,
  eventTitle: string,
  fromUserId: string,
  fromUserName: string,
  toUserId: string
) => {
  try {
    const notificationData = {
      type: 'linkRequest',
      eventId,
      eventTitle,
      fromUserId,
      fromUserName,
      toUserId,
      status: 'pending',
      timestamp: serverTimestamp(),
      read: false
    };

    await addDoc(collection(db, 'notifications'), notificationData);
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

export const updateNotificationStatus = async (
  notificationId: string,
  status: 'accepted' | 'rejected'
) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { status });
  } catch (error) {
    console.error('Error updating notification status:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    await deleteDoc(doc(db, 'notifications', notificationId));
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}; 