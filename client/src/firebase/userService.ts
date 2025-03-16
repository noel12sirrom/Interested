import { db } from './config';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';

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

export interface UserProfile {
  uid: string;
  name: string;
  location: string;
  interests: string[];
  bio?: string;
  profilePicture?: string;
}

export interface MatchedUser extends UserProfile {
  commonInterests: string[];
  matchScore: number;
}

/**
 * Find users with similar interests
 * @param userId - Current user's ID
 * @param limit - Maximum number of users to return (default: 10)
 * @param minCommonInterests - Minimum number of common interests required (default: 1)
 * @returns Array of matched users with their common interests and match scores
 */
export async function findUsersByInterests(
  userId: string,
  limit: number = 10,
  minCommonInterests: number = 1
): Promise<MatchedUser[]> {
  try {
    // Get current user's profile
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentUser = userDoc.data() as UserProfile;
    const currentUserInterests = new Set(currentUser.interests);

    // Get all users
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(usersRef);
    
    const matchedUsers: MatchedUser[] = [];

    // Calculate matches for each user
    usersSnapshot.forEach((doc) => {
      const user = doc.data() as UserProfile;
      user.uid = doc.id;

      // Skip current user
      if (user.uid === userId) return;

      // Find common interests
      const commonInterests = user.interests?.filter(interest => 
        currentUserInterests.has(interest)
      ) || [];

      // Only include users with minimum number of common interests
      if (commonInterests.length >= minCommonInterests) {
        // Calculate match score (can be customized based on your requirements)
        const matchScore = calculateMatchScore(commonInterests, currentUser, user);

        matchedUsers.push({
          ...user,
          commonInterests,
          matchScore
        });
      }
    });

    // Sort by match score and limit results
    return matchedUsers
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

  } catch (error) {
    console.error('Error finding users by interests:', error);
    throw error;
  }
}

/**
 * Calculate match score between two users
 * This is a basic implementation that can be enhanced based on your requirements
 */
function calculateMatchScore(
  commonInterests: string[],
  currentUser: UserProfile,
  otherUser: UserProfile
): number {
  let score = 0;

  // Base score from number of common interests
  score += commonInterests.length * 10;

  // Bonus for high percentage of common interests
  const interestOverlapPercentage = 
    commonInterests.length / Math.max(currentUser.interests.length, otherUser.interests.length);
  score += interestOverlapPercentage * 20;

  // Location bonus (if they're in the same location)
  if (currentUser.location === otherUser.location) {
    score += 15;
  }

  return Math.round(score);
}

/**
 * Get user recommendations based on interests and activity
 * @param userId - Current user's ID
 * @param limit - Maximum number of recommendations to return
 */
export async function getUserRecommendations(
  userId: string,
  limit: number = 5
): Promise<MatchedUser[]> {
  try {
    // Get matches with at least 2 common interests
    const matches = await findUsersByInterests(userId, limit, 2);
    
    // Here you could add additional filtering or sorting based on:
    // - User activity
    // - Location proximity
    // - Mutual connections
    // - Event participation
    // etc.

    return matches;
  } catch (error) {
    console.error('Error getting user recommendations:', error);
    throw error;
  }
}

/**
 * Get detailed match information between two users
 */
export async function getMatchDetails(
  userId1: string,
  userId2: string
): Promise<{ 
  commonInterests: string[];
  matchScore: number;
  user1: UserProfile;
  user2: UserProfile;
}> {
  try {
    const [user1Doc, user2Doc] = await Promise.all([
      getDoc(doc(db, 'users', userId1)),
      getDoc(doc(db, 'users', userId2))
    ]);

    if (!user1Doc.exists() || !user2Doc.exists()) {
      throw new Error('One or both users not found');
    }

    const user1 = { ...user1Doc.data(), uid: userId1 } as UserProfile;
    const user2 = { ...user2Doc.data(), uid: userId2 } as UserProfile;

    const commonInterests = user1.interests.filter(
      interest => user2.interests.includes(interest)
    );

    const matchScore = calculateMatchScore(commonInterests, user1, user2);

    return {
      commonInterests,
      matchScore,
      user1,
      user2
    };
  } catch (error) {
    console.error('Error getting match details:', error);
    throw error;
  }
} 