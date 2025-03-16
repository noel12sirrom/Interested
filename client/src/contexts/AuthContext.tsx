import * as React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { getUserProfile, UserProfile } from '../firebase/userService';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  hasProfile: boolean;
  signOut: () => Promise<void>;
  checkUserProfile: (userToCheck?: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  hasProfile: false,
  signOut: async () => {},
  checkUserProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  console.log('AuthProvider rendering, loading state:', loading);

  const checkUserProfile = async (userToCheck?: User | null) => {
    const currentUser = userToCheck || user;
    console.log('Checking user profile...', currentUser?.uid);
    
    if (!currentUser) {
      console.log('No user found, clearing profile');
      setUserProfile(null);
      setHasProfile(false);
      return;
    }

    try {
      const profile = await getUserProfile(currentUser.uid);
      console.log('Profile fetched:', profile);
      if (profile) {
        setUserProfile(profile);
        setHasProfile(true);
      } else {
        console.log('No profile found for user');
        setUserProfile(null);
        setHasProfile(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null);
      setHasProfile(false);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    const unsubscribe = onAuthStateChanged(auth, async (newUser) => {
      console.log('Auth state changed:', newUser?.uid);
      setUser(newUser);
      if (newUser) {
        await checkUserProfile(newUser);
      } else {
        setUserProfile(null);
        setHasProfile(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
      setHasProfile(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    hasProfile,
    signOut,
    checkUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 