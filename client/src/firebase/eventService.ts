import { collection, query, where, getDocs, orderBy, limit, Query, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { db } from './config';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  hostId: string;
  hostName: string;
  interests: string[];
  createdAt: Date;
  date: Date;
  time: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  location: string;
  hostId: string;
  hostName: string;
  interests: string[];
  date: Date;
  time: string;
}

export const createEvent = async (eventData: CreateEventData): Promise<string> => {
  try {
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      createdAt: serverTimestamp(),
      date: eventData.date
    });

    // Update user's events array
    const userRef = doc(db, 'users', eventData.hostId);
    await updateDoc(userRef, {
      events: arrayUnion(docRef.id)
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const getEvents = async (location?: string, userId?: string, filter?: 'all' | 'my' | 'interests'): Promise<Event[]> => {
  try {
    let eventsQuery: Query = collection(db, 'events');
    
    if (location) {
      eventsQuery = query(eventsQuery, where('location', '>=', location), where('location', '<=', location + '\uf8ff'));
    }
    
    // Order by location first, then by creation date
    eventsQuery = query(eventsQuery, orderBy('location'), orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(eventsQuery);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      date: doc.data().date?.toDate()
    })) as Event[];

    // If userId is provided, also fetch events from user's document
    if (userId) {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userEvents = userDoc.data().events || [];
        const userEventsData = await Promise.all(
          userEvents.map(async (eventId: string) => {
            const eventDoc = await getDoc(doc(db, 'events', eventId));
            if (eventDoc.exists()) {
              return {
                id: eventDoc.id,
                ...eventDoc.data(),
                createdAt: eventDoc.data().createdAt?.toDate(),
                date: eventDoc.data().date?.toDate()
              } as Event;
            }
            return null;
          })
        );
        // Combine and remove duplicates
        const allEvents = [...events, ...userEventsData.filter(Boolean)];
        const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());

        // Apply filters
        if (filter === 'my' && userId) {
          return uniqueEvents.filter(event => event.hostId === userId);
        }
        return uniqueEvents;
      }
    }

    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const getEventsByInterests = async (interests: string[], userId?: string): Promise<Event[]> => {
  try {
    const eventsQuery = query(
      collection(db, 'events'),
      where('interests', 'array-contains-any', interests),
      orderBy('location'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(eventsQuery);
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      date: doc.data().date?.toDate()
    })) as Event[];

    // If userId is provided, also fetch user's events
    if (userId) {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userEvents = userDoc.data().events || [];
        const userEventsData = await Promise.all(
          userEvents.map(async (eventId: string) => {
            const eventDoc = await getDoc(doc(db, 'events', eventId));
            if (eventDoc.exists()) {
              return {
                id: eventDoc.id,
                ...eventDoc.data(),
                createdAt: eventDoc.data().createdAt?.toDate(),
                date: eventDoc.data().date?.toDate()
              } as Event;
            }
            return null;
          })
        );
        // Combine and remove duplicates
        const allEvents = [...events, ...userEventsData.filter(Boolean)];
        return Array.from(new Map(allEvents.map(event => [event.id, event])).values());
      }
    }

    return events;
  } catch (error) {
    console.error('Error fetching events by interests:', error);
    return [];
  }
}; 