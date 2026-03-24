
export enum AppView {
  HOME = 'home',
  REPORT = 'report',
  TRACK = 'track',
  EDUCATION = 'education',
  HOTLINES = 'hotlines',
  CHAT = 'chat',
  HUMAN_CHAT = 'human_chat',
  SAFETY_PLAN = 'safety_plan',
  ADMIN_LOGIN = 'admin_login',
  ADMIN_DASHBOARD = 'admin_dashboard',
}

export type Language = 'en' | 'sw' | 'fr' | 'lg' | 'so' | 'am' | 'om' | 'rw' | 'ar' | 'rn' | 'ti';

export enum GBVType {
  PHYSICAL = 'Physical Violence',
  SEXUAL = 'Sexual Violence',
  EMOTIONAL = 'Emotional/Psychological Abuse',
  ECONOMIC = 'Economic/Financial Abuse',
  HARMFUL_PRACTICES = 'Harmful Traditional Practices (FGM/Marriage)',
  HARASSMENT = 'Sexual Harassment & Stalking',
}

export enum ReportStatus {
  RECEIVED = 'RECEIVED',
  ASSIGNED = 'ASSIGNED',
  IN_REVIEW = 'IN_REVIEW',
  ACTION_TAKEN = 'ACTION_TAKEN',
  RESOLVED = 'RESOLVED',
}

export interface AppwriteConfig {
  url: string;
  key: string;
}

export interface Attachment {
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  file?: File;
}

export interface CaseUpdate {
  id: string;
  content: string;
  timestamp: string;
  author: string;
}

export interface Report {
  id: string;
  trackingCode: string;
  type: GBVType;
  location: string;
  phoneNumber?: string;
  description: string;
  attachments: Attachment[];
  status: ReportStatus;
  statusHistory: { status: ReportStatus; timestamp: string; note?: string }[];
  caseUpdates: CaseUpdate[];
  createdAt: string;
  anonymousUserId: string;
  
  assignedTo?: string; 
  assignedToName?: string; 
  assignedAt?: string; 
}

export interface Caseworker {
  id: string;
  name: string;
  phone: string;
  email: string;
  createdAt: string;
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  quiz?: QuizQuestion[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Hotline {
  id: string;
  name: string;
  number: string;
  category: 'Emergency' | 'Legal' | 'Medical' | 'Counseling';
  location?: { lat: number; lng: number };
}

export interface SupportCentre {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: string;
  mapUri?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  senderType: 'user' | 'worker';
  text: string;
  timestamp: any; // Firestore Timestamp
}

export interface ChatSession {
  id: string;
  anonymousUserId: string;
  status: 'active' | 'closed';
  createdAt: any;
  lastMessage?: string;
  lastUpdatedAt: any;
  assignedTo?: string;
}
