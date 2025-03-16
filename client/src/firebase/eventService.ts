import { collection, query, where, getDocs, orderBy, limit, Query, addDoc, serverTimestamp, doc, updateDoc, arrayUnion, getDoc, deleteDoc, Timestamp, DocumentData, setDoc } from 'firebase/firestore';
import { db } from './config';

interface LinkRequest {
  userId: string;
  userName: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: Date;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  coordinates?: [number, number]; // latitude and longitude
  date: Date;
  time: string;
  hostId: string;
  hostName: string;
  interests: string[];
  createdAt: Date;
  linkRequests?: { [userId: string]: LinkRequest };
}

export type CreateEventData = Omit<Event, 'id' | 'createdAt'>;

export const createEvent = async (eventData: CreateEventData): Promise<string> => {
  try {
    const eventsRef = collection(db, 'events');
    const docRef = await addDoc(eventsRef, {
      ...eventData,
      date: Timestamp.fromDate(eventData.date),
      createdAt: Timestamp.now(),
      location: eventData.location.toLowerCase() // Store location in lowercase
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

export const getEvents = async (
  locationSearch: string = '',
  userId: string | undefined = undefined,
  filter: 'all' | 'my' | 'interests' = 'all'
): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    let eventsQuery = query(eventsRef, orderBy('date', 'asc'));

    // If filtering by user's events, only show events where the user is the host
    if (filter === 'my' && userId) {
      eventsQuery = query(
        eventsRef,
        where('hostId', '==', userId),
        orderBy('date', 'asc')
      );
    }

    const querySnapshot = await getDocs(eventsQuery);
    const events = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        date: data.date.toDate(),
        createdAt: data.createdAt.toDate()
      } as Event;
    });

    // Filter by location if search term is provided
    let filteredEvents = events;
    if (locationSearch) {
      const searchTerm = locationSearch.toLowerCase();
      filteredEvents = events.filter(event => 
        event.location.toLowerCase().includes(searchTerm)
      );
    }

    // Sort events: upcoming events first, then by creation date for same-day events
    return filteredEvents.sort((a, b) => {
      const dateComparison = a.date.getTime() - b.date.getTime();
      if (dateComparison === 0) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return dateComparison;
    });
  } catch (error) {
    console.error('Error getting events:', error);
    throw error;
  }
};

export const getEventsByInterests = async (
  interests: string[],
  userId: string | undefined = undefined
): Promise<Event[]> => {
  try {
    const eventsRef = collection(db, 'events');
    const eventsQuery = query(eventsRef, orderBy('date', 'asc'));
    const querySnapshot = await getDocs(eventsQuery);
    
    const events = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate(),
        createdAt: doc.data().createdAt.toDate()
      } as Event))
      .filter(event => 
        // Check if any of the event host's interests match the user's interests
        event.interests.some(eventInterest => 
          interests.some(userInterest => 
            eventInterest.toLowerCase() === userInterest.toLowerCase()
          )
        ) && 
        // Exclude events created by the current user
        event.hostId !== userId
      );

    return events.sort((a, b) => {
      const dateComparison = a.date.getTime() - b.date.getTime();
      if (dateComparison === 0) {
        return b.createdAt.getTime() - a.createdAt.getTime();
      }
      return dateComparison;
    });
  } catch (error) {
    console.error('Error getting events by interests:', error);
    throw error;
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

export const updateEvent = async (
  eventId: string,
  userId: string,
  eventData: Partial<Event>
): Promise<void> => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    if (eventDoc.data()?.hostId !== userId) {
      throw new Error('Unauthorized to update this event');
    }

    const updateData = {
      ...eventData,
      location: eventData.location?.toLowerCase(), // Store location in lowercase
      date: eventData.date ? Timestamp.fromDate(eventData.date) : undefined
    };

    await updateDoc(eventRef, updateData);
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const sendLinkRequest = async (eventId: string, userId: string, userName: string) => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const linkRequest: LinkRequest = {
      userId,
      userName,
      status: 'pending',
      timestamp: new Date()
    };

    // Create or update the linkRequests field
    await setDoc(eventRef, {
      linkRequests: {
        [userId]: linkRequest
      }
    }, { merge: true });

  } catch (error) {
    console.error('Error sending link request:', error);
    throw error;
  }
};

export const respondToLinkRequest = async (eventId: string, userId: string, status: 'accepted' | 'rejected') => {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const eventData = eventDoc.data();
    const linkRequest = eventData.linkRequests?.[userId];
    
    if (!linkRequest) {
      throw new Error('Link request not found');
    }

    // Update the link request status
    await updateDoc(eventRef, {
      [`linkRequests.${userId}.status`]: status
    });

    if (status === 'accepted') {
      // Add the event to the user's events array
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        events: arrayUnion(eventId)
      });
    }

  } catch (error) {
    console.error('Error responding to link request:', error);
    throw error;
  }
};

export const getLinkRequestStatus = async (eventId: string, userId: string): Promise<'none' | 'pending' | 'accepted' | 'rejected'> => {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    if (!eventDoc.exists()) {
      throw new Error('Event not found');
    }

    const data = eventDoc.data();
    const linkRequests = data.linkRequests || {};
    const request = linkRequests[userId];

    return request ? request.status : 'none';
  } catch (error) {
    console.error('Error getting link request status:', error);
    throw error;
  }
}; 