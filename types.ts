export enum AppView {
  HOME = 'home',
  REPORT = 'report',
  TRACK = 'track',
  EDUCATION = 'education',
  HOTLINES = 'hotlines',
  CHAT = 'chat',
  SAFETY_PLAN = 'safety_plan', // New Feature
  ADMIN_LOGIN = 'admin_login',
  ADMIN_DASHBOARD = 'admin_dashboard',
}

export enum GBVType {
  PHYSICAL = 'Physical Violence',
  SEXUAL = 'Sexual Violence',
  EMOTIONAL = 'Emotional/Psychological',
  ECONOMIC = 'Economic Abuse',
  HARASSMENT = 'Sexual Harassment',
  OTHER = 'Other',
}

export enum ReportStatus {
  RECEIVED = 'Received',
  ASSIGNED = 'Assigned to Case Worker',
  IN_REVIEW = 'In Review',
  ACTION_TAKEN = 'Action Taken',
  RESOLVED = 'Resolved',
}

export interface Attachment {
  name: string;
  type: 'image' | 'video' | 'audio';
  url: string; // Base64 or mock URL
}

export interface Report {
  id: string;
  trackingCode: string;
  type: GBVType;
  location: string;
  description: string;
  attachments: Attachment[];
  status: ReportStatus;
  statusHistory: { status: ReportStatus; timestamp: string }[];
  createdAt: string;
  anonymousUserId: string;
}

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown or text
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
}