import * as React from 'react';
import { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChange, getCurrentUser } from '../firebase/authService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  hasProfile: boolean;
  checkUserProfile: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  hasProfile: false,
  checkUserProfile: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const checkUserProfile = async () => {
    if (!user) return false;
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      const hasCompleteProfile = userDoc.exists() && 
        userDoc.data()?.interests?.length > 0 && 
        userDoc.data()?.name && 
        userDoc.data()?.location;
      
      setHasProfile(hasCompleteProfile);
      return hasCompleteProfile;
    } catch (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
  };

  useEffect(() => {
    // Set initial user if already logged in
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      checkUserProfile();
    }

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        await checkUserProfile();
      } else {
        setHasProfile(false);
      }
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  const value = {
    user,
    loading,
    hasProfile,
    checkUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 