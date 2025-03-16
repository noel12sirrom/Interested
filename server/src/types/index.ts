export interface User {
  id: string;
  email: string;
  name: string;
  interests: string[];
  bio?: string;
  profilePicture?: string;
  connections: string[]; // Array of user IDs
}

export interface Interest {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Connection {
  id: string;
  users: [string, string]; // Two user IDs
  commonInterests: string[];
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
} 