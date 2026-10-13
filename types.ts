
export enum AppView {
  HOME = 'home',
  REPORT = 'report',
  TRACK = 'track',
  EDUCATION = 'education',
  HOTLINES = 'hotlines',
  CHAT = 'chat',
  HUMAN_CHAT = 'human_chat',
  SAFETY_PLAN = 'safety_plan',
  PEP_EMERGENCY = 'pep_emergency',
  CAMOUFLAGE = 'camouflage',
  ADMIN_LOGIN = 'admin_login',
  ADMIN_DASHBOARD = 'admin_dashboard',
}

export type Language = 'en' | 'sw' | 'fr' | 'lg' | 'so' | 'am' | 'om' | 'rw' | 'ar' | 'rn' | 'ti' | 'tu' | 'din' | 'ar_juba';

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

export interface Attachment {
  id?: string;
  name: string;
  type: string;
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
  track: string;
  level: 'Foundational' | 'Practitioner' | 'Advanced';
  estimatedMinutes: number;
  description: string;
  content: string;
  imageUrl: string;
  organizationSources: string[];
  learningObjectives: string[];
  keyTakeaways: string[];
  protocols?: { title: string; steps: string[] }[];
  officialDocuments?: { title: string; publisher: string; year: string; summary: string }[];
  scenarioCase?: {
    title: string;
    narrative: string;
    dilemma: string;
    options: { text: string; correct: boolean; explanation: string }[];
  };
  quiz?: (QuizQuestion & { explanation?: string })[];
}

export interface OfficialDocumentReference {
  id: string;
  title: string;
  organization: 'UNHCR' | 'DRC' | 'WHO' | 'IASC' | 'UNFPA' | 'UNICEF' | 'Panzi Foundation' | 'Government of Kenya';
  year: string;
  category: 'Policy' | 'Clinical Guideline' | 'Legal Framework' | 'Field SOP' | 'PSEA Standards';
  summary: string;
  corePrinciples: string[];
  fieldActionChecklist: string[];
  relevanceToKakumaDRC: string;
}

export interface PocketCard {
  id: string;
  title: string;
  subtitle: string;
  organization: string;
  urgency: 'critical' | 'standard' | 'high';
  steps: string[];
  goldenRule: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Hotline {
  id: string;
  name: string;
  number: string;
  category: string;
  location?: { lat: number; lng: number };
}

export interface SupportCentre {
  id: string;
  name: string;
  address: string;
  distance: string;
  type: string;
  campZone?: 'Kakuma 1' | 'Kakuma 2' | 'Kakuma 3' | 'Kakuma 4' | 'Kalobeyei' | 'All';
  hours?: string;
  emergencyPhone?: string;
  isVerifiedWGSS?: boolean;
  walkingDirections?: string;
  lat?: number;
  lng?: number;
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
