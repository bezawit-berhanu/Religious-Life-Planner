
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  PRAYERS = 'PRAYERS',
  JOURNAL = 'JOURNAL',
  LEARN = 'LEARN',
  FOCUS = 'FOCUS',
  SETTINGS = 'SETTINGS',
  COMMUNITY = 'COMMUNITY',
  AUTH = 'AUTH',
  BIBLE = 'BIBLE',
  FASTING = 'FASTING'
}

export type Language = 'English' | 'Amharic';
export type Gender = 'Male' | 'Female';

export interface User {
  id: string;
  name: string;
  username: string; 
  email: string;
  password?: string; // For local auth simulation
  passcode?: string; // 4-digit PIN for quick access
  age: number;
  gender: Gender;
  avatarUrl?: string;
  isRegistered: boolean;
  bio?: string;
  followers?: number;
  following?: number;
  followingIds?: string[]; // List of user IDs this user follows
  lastActive: number; // Timestamp for session timeout
  hasSeenOnboarding: boolean; // Track if intro has been shown
}

export interface Prayer {
  id: string;
  title: string;
  timeOfDay: 'Morning' | 'Noon' | 'Evening' | 'Night';
  completed: boolean;
  durationMinutes: number;
}

export interface FastingRule {
  isFastingDay: boolean;
  type: 'Strict' | 'Wine & Oil' | 'Fish' | 'None';
  description: string;
  feastName?: string;
  status: 'Current' | 'Upcoming' | 'None';
}

export interface FastingLog {
    id: string;
    fastName: string;
    date: string; // ISO date
    mood: 'Peaceful' | 'Neutral' | 'Struggle';
    rating: number; // 1-5 stars
    notes?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  date: string; // ISO date
  content: string; // HTML string for Rich Text
  tags: string[];
  isLocked: boolean;
  // Styling metadata is now largely handled by the HTML content, 
  // but we keep pageColor for the container background.
  pageColor: string; 
  updatedAt: number;
}

export interface Resource {
  id: string;
  title: string;
  type: 'Article' | 'Video' | 'Book' | 'Audio';
  author: string;
  category: string;
  imageUrl: string;
  description?: string;
  url: string;
}

export interface Story {
    id: string;
    userId: string;
    user: string;
    avatar: string;
    type: 'image' | 'video' | 'text';
    content: string; // URL or Text
    isViewed: boolean;
    timestamp: number;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string; // Initials or Image URL
  authorImage?: string; // Actual profile picture URL
  timeAgo: string;
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  likedByUser: boolean;
  timestamp: number;
}

export interface UserPreferences {
  privacyMode: boolean;
  notifications: boolean;
  communityEnabled: boolean;
  language: Language;
  journalPin?: string;
  focusSound: 'Bell' | 'Chime' | 'Silence'; 
  theme: 'light' | 'dark' | 'black' | 'brown' | 'pink' | 'lavender' | 'cream';
}

export interface BibleChapter {
    book: string;
    chapter: number;
    text: string[]; 
}

export interface Holiday {
    day: number;
    month: number;
    name: string;
    type: 'Religious' | 'National';
}
