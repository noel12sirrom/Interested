import { db } from './config';
import { doc, setDoc, getDoc, updateDoc, collection } from 'firebase/firestore';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  interests?: string[];
  bio?: string;
  profilePicture?: string;
  // Add any other user fields you need
}

export const createUserProfile = async (userData: UserData) => {
  try {
    const userRef = doc(db, 'users', userData.uid);
    await setDoc(userRef, {
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const getUserProfile = async (uid: string) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (uid: string, updateData: Partial<UserData>) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const updateUserInterests = async (uid: string, interests: string[]) => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      interests,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user interests:', error);
    throw error;
  }
}; 