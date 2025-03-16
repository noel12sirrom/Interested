import { collection, query, where, getDocs, orderBy, limit, Query, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  locationCoordinates: {
    lat: number;
    lng: number;
  };
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
  locationCoordinates: {
    lat: number;
    lng: number;
  };
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
    console.log('getEvents called with:', { location, userId, filter });
    let eventsQuery: Query = collection(db, 'events');
    
    if (location) {
      eventsQuery = query(eventsQuery, where('location', '>=', location), where('location', '<=', location + '\uf8ff'));
    }
    
    // Order by location first, then by creation date
    eventsQuery = query(eventsQuery, orderBy('location'), orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(eventsQuery);
    console.log('Query snapshot size:', querySnapshot.size);
    
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      date: doc.data().date?.toDate()
    })) as Event[];

    console.log('Events from collection:', events);

    // If userId is provided, also fetch events from user's document
    if (userId) {
      console.log('Fetching user events for userId:', userId);
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const userEvents = userDoc.data().events || [];
        console.log('User events array:', userEvents);
        
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
        
        console.log('User events data:', userEventsData);
        
        // Combine and remove duplicates
        const allEvents = [...events, ...userEventsData.filter(Boolean)];
        const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());

        // Apply filters
        if (filter === 'my' && userId) {
          const myEvents = uniqueEvents.filter(event => event.hostId === userId);
          console.log('Filtered my events:', myEvents);
          return myEvents;
        }
        console.log('Returning all unique events:', uniqueEvents);
        return uniqueEvents;
      }
    }

    console.log('Returning events from collection:', events);
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

export const deleteEvent = async (eventId: string, userId: string): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    if (eventDoc.data().hostId !== userId) {
      throw new Error('Unauthorized to delete this event');
    }

    // Delete the event
    await deleteDoc(eventRef);

    // Remove event from user's events array
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      const userEvents = userDoc.data().events || [];
      await updateDoc(userRef, {
        events: userEvents.filter((id: string) => id !== eventId)
      });
    }
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

export const updateEvent = async (eventId: string, userId: string, eventData: Partial<CreateEventData>): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    if (eventDoc.data().hostId !== userId) {
      throw new Error('Unauthorized to update this event');
    }

    await updateDoc(eventRef, {
      ...eventData,
      date: eventData.date || eventDoc.data().date
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}; 