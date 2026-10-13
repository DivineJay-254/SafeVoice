import { GBVType, Hotline, SupportCentre, EducationModule } from '../types';
import { COMPREHENSIVE_CURRICULUM_MODULES } from './curriculumData';

export interface ReportTemplate {
  id: string;
  title: string;
  category: GBVType;
  description: string;
  defaultLocation: string;
  defaultDetails: string;
  urgency: 'high' | 'medium' | 'critical';
  requiresImmediateMedical: boolean;
  suggestedSteps: string[];
}

export interface OfflineSafetyPlan {
  id: string;
  title: string;
  livingSituation: string;
  hasChildren: boolean;
  accessToMoney: string;
  trustedContact: boolean;
  planContent: string;
}

export interface QueuedOfflineReport {
  id: string;
  localCode: string;
  timestamp: string;
  data: {
    type: GBVType;
    location: string;
    phoneNumber?: string;
    incidentDate?: string;
    description: string;
    anonymousUserId?: string;
    templateId?: string;
  };
  synced: boolean;
  syncError?: string;
}

// Storage Keys
const STORAGE_KEYS = {
  TEMPLATES: 'juasafety_cached_templates',
  HOTLINES: 'juasafety_cached_hotlines',
  CENTRES: 'juasafety_cached_centres',
  EDUCATION: 'juasafety_cached_education',
  OFFLINE_REPORTS: 'juasafety_offline_reports',
  OFFLINE_SAFETY_PLANS: 'juasafety_cached_safety_plans',
  LAST_SYNC: 'juasafety_last_sync_timestamp'
};

// 1. Built-in Comprehensive Report Templates
export const DEFAULT_REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tmpl-physical-emergency',
    title: 'Emergency Physical Violence',
    category: GBVType.PHYSICAL,
    description: 'Use for active or recent physical assault requiring immediate safety intervention.',
    defaultLocation: 'Kakuma Camp / Kalobeyei Settlement (Specify block/compound)',
    defaultDetails: 'Physical assault occurred. Medical care needed. Perpetrator location known/unknown. Victim in immediate need of safe escort or shelter.',
    urgency: 'critical',
    requiresImmediateMedical: true,
    suggestedSteps: [
      'Find a safe, well-lit public space or trusted neighbor immediately.',
      'Seek clinical triage at the nearest clinic within 2 hours if injured.',
      'Do not wash clothing or change garments if physical evidence is present.'
    ]
  },
  {
    id: 'tmpl-sexual-assault-72h',
    title: 'Clinical GBV / Sexual Assault (72h Window)',
    category: GBVType.SEXUAL,
    description: 'Time-critical protocol for Post-Exposure Prophylaxis (PEP) and emergency contraception within 72 hours.',
    defaultLocation: 'Kakuma / Kalobeyei Super Clinic area',
    defaultDetails: 'Sexual violence incident. Urgent medical assistance required within 72 hours for HIV PEP prophylaxis, STI prevention, and emergency contraception.',
    urgency: 'critical',
    requiresImmediateMedical: true,
    suggestedSteps: [
      'CRITICAL: Medical treatment (PEP) must start within 72 hours to prevent HIV.',
      'Do not bathe, change clothes, or comb hair prior to medical exam if possible.',
      'Call GBV Helpline 1195 or 1517 for confidential clinical ambulance dispatch.'
    ]
  },
  {
    id: 'tmpl-domestic-violence',
    title: 'Intimate Partner / Domestic Threat',
    category: GBVType.PHYSICAL,
    description: 'For ongoing domestic hostility, coercion, or home displacement threat.',
    defaultLocation: 'Residential compound / family shelter',
    defaultDetails: 'Ongoing domestic violence/coercion by partner or family member. Need confidential mediation, protective shelter assessment, or safe relocation.',
    urgency: 'high',
    requiresImmediateMedical: false,
    suggestedSteps: [
      'Pack essential documents (manifest, ration card, IDs) in a secure, hidden bag.',
      'Agree on a secret signal word with a trusted friend or neighbor.',
      'Identify an exit route and nearest protection desk.'
    ]
  },
  {
    id: 'tmpl-emotional-threat',
    title: 'Stalking, Blackmail & Emotional Abuse',
    category: GBVType.EMOTIONAL,
    description: 'Verbal threats, harassment, intimidation, or digital stalking in camp or community.',
    defaultLocation: 'Marketplace / School / Water point / Digital messaging',
    defaultDetails: 'Victim facing repeated threats, intimidation, or non-physical harassment disrupting daily movements and psychological safety.',
    urgency: 'medium',
    requiresImmediateMedical: false,
    suggestedSteps: [
      'Document dates, times, witnesses, and phone numbers involved in the incidents.',
      'Limit lone travel after dark through unlit camp corridors.',
      'Report to DRC or UNHCR Community Protection Desk for psychosocial counselling.'
    ]
  },
  {
    id: 'tmpl-economic-deprivation',
    title: 'Resource Denial & Economic Abuse',
    category: GBVType.ECONOMIC,
    description: 'Withholding ration cards, food assistance, water tokens, or financial sabotage.',
    defaultLocation: 'Food distribution point / Household shelter',
    defaultDetails: 'Denial of basic life necessities, ration card confiscation, or economic exploitation preventing access to sustenance.',
    urgency: 'medium',
    requiresImmediateMedical: false,
    suggestedSteps: [
      'Report ration card confiscation directly to WFP/UNHCR Help Desk.',
      'Request individual food assistance verification.',
      'Connect with refugee welfare committee representatives.'
    ]
  }
];

// 2. Built-in Safety Resources (Hotlines, Shelters, Education)
export const DEFAULT_HOTLINES: Hotline[] = [
  { id: '1', name: 'National GBV Helpline (Toll-Free 24/7)', number: '1195', category: 'Emergency' },
  { id: '2', name: 'UNHCR Kakuma Protection Helpline', number: '1517', category: 'Emergency' },
  { id: '3', name: 'DRC Toll-Free Legal & Protection (Kakuma)', number: '0800720414', category: 'Emergency' },
  { id: '4', name: 'National Police Emergency', number: '999', category: 'Emergency' },
  { id: '5', name: 'National Child Helpline Kenya', number: '116', category: 'Support' },
  { id: '6', name: 'Kenya Red Cross Emergency Dispatch', number: '1199', category: 'Emergency' },
  { id: '7', name: 'Kakuma General Mission Hospital', number: '+254712345678', category: 'Support' }
];

export const DEFAULT_SUPPORT_CENTRES: SupportCentre[] = [
  {
    id: 'centre-1',
    name: 'IRC Kalobeyei Super Clinic (24/7 Medical & PEP Triage)',
    address: 'Kalobeyei Settlement, Village 1 (Near Main Market)',
    type: 'Medical',
    campZone: 'Kalobeyei',
    hours: '24 Hours / 7 Days a Week',
    emergencyPhone: '1195',
    isVerifiedWGSS: true,
    walkingDirections: 'From Village 1 market: Head 200m north towards the primary healthcare compound with the green cross sign. Direct triage triage tent on the right.',
    distance: 'Immediate Walk',
    lat: 3.7042,
    lng: 34.8051
  },
  {
    id: 'centre-2',
    name: 'DRC Legal & Protection Desk (Kalobeyei Safe Space)',
    address: 'Kalobeyei Reception Centre, Admin Compound',
    type: 'Protection',
    campZone: 'Kalobeyei',
    hours: 'Mon - Fri: 08:00 - 17:00 (Emergency calls 24/7)',
    emergencyPhone: '0800720414',
    isVerifiedWGSS: true,
    walkingDirections: 'Located adjacent to UNHCR Reception gate. Enter through the confidential women consultation gate on the east wing.',
    distance: 'Nearby',
    lat: 3.7121,
    lng: 34.8142
  },
  {
    id: 'centre-3',
    name: 'IRC Clinic 1 & CMR Emergency Suite (Kakuma 1)',
    address: 'Kakuma 1, Zone 1, Main Camp Avenue',
    type: 'Medical',
    campZone: 'Kakuma 1',
    hours: '24 Hours / 7 Days a Week',
    emergencyPhone: '+254712345678',
    isVerifiedWGSS: true,
    walkingDirections: 'From Kakuma 1 Peace Primary School: Proceed 400m along the main murram road towards Hospital Gate 2.',
    distance: 'Accessible by Foot / Boda',
    lat: 3.7180,
    lng: 34.8620
  },
  {
    id: 'centre-4',
    name: 'UNHCR / DRC Women & Girls Safe Space (WGSS Kakuma 1)',
    address: 'Kakuma 1, Block 3 (Community Hall Annex)',
    type: 'Safe Space',
    campZone: 'Kakuma 1',
    hours: 'Mon - Sat: 08:30 - 16:30',
    emergencyPhone: '1517',
    isVerifiedWGSS: true,
    walkingDirections: 'Behind Block 3 Community Food Distribution Point. Purple gate with confidential private counseling rooms.',
    distance: '5 min walk',
    lat: 3.7210,
    lng: 34.8645
  },
  {
    id: 'centre-5',
    name: 'LWF Community Psycho-Social Safe Haven (Kakuma 2)',
    address: 'Kakuma 2, Block 4 Community Pavilion',
    type: 'Protection',
    campZone: 'Kakuma 2',
    hours: 'Mon - Fri: 08:00 - 16:30',
    emergencyPhone: '1517',
    isVerifiedWGSS: true,
    walkingDirections: 'Inside the LWF Community Center compound. Follow the shaded pathway to the psychosocial counseling offices.',
    distance: 'Central Camp',
    lat: 3.7250,
    lng: 34.8710
  },
  {
    id: 'centre-6',
    name: 'IRC Clinic 4 & Youth Safe Space (Kakuma 3)',
    address: 'Kakuma 3, Zone 3, Near Somali Community Market',
    type: 'Medical',
    campZone: 'Kakuma 3',
    hours: '24 Hours Emergency Triage',
    emergencyPhone: '1195',
    isVerifiedWGSS: true,
    walkingDirections: 'From Kakuma 3 Market: Walk 250m west toward the water tower. The IRC medical triage unit is directly opposite.',
    distance: '8 min walk',
    lat: 3.7310,
    lng: 34.8790
  },
  {
    id: 'centre-7',
    name: 'DRC Women Protection Safe Space (Kakuma 4)',
    address: 'Kakuma 4, Zone 1, Multi-purpose Centre',
    type: 'Safe Space',
    campZone: 'Kakuma 4',
    hours: 'Mon - Sat: 08:00 - 17:00',
    emergencyPhone: '0800720414',
    isVerifiedWGSS: true,
    walkingDirections: 'Located at the Kakuma 4 Multi-purpose social hall. Dedicated private entrance on north corridor.',
    distance: 'Direct Access',
    lat: 3.7380,
    lng: 34.8870
  },
  {
    id: 'centre-8',
    name: 'Kakuma Police Station / Dedicated Gender Desk',
    address: 'Kakuma Town Center, Off Lokichogio Highway',
    type: 'Police',
    campZone: 'Kakuma 1',
    hours: '24 Hours / 7 Days a Week',
    emergencyPhone: '999',
    isVerifiedWGSS: false,
    walkingDirections: 'Main highway intersection opposite Sub-County administration. Ask for the designated Female Police Gender Officer.',
    distance: 'Town Center',
    lat: 3.7155,
    lng: 34.8589
  }
];

export const DEFAULT_EDUCATION_MODULES: EducationModule[] = COMPREHENSIVE_CURRICULUM_MODULES;

export const DEFAULT_OFFLINE_SAFETY_PLANS: OfflineSafetyPlan[] = [
  {
    id: 'plan-evacuation',
    title: 'Urgent Evacuation & Departure Plan',
    livingSituation: 'Living with abuser',
    hasChildren: true,
    accessToMoney: 'No access',
    trustedContact: true,
    planContent: `### Step 1: Emergency Go-Bag Essentials
- Hide your Manifest/Alien ID card, ration token, and child clinic cards with a trusted friend or in an easily grabbed plastic pouch.
- Keep comfortable walking shoes and one spare shawl/cloth near the exit.

### Step 2: Secret Code & Safety Signal
- Agree on a specific word (e.g. "Kesho Asubuhi") with your trusted contact. When texted or spoken, they know to call the GBV Helpline 1195 or alert the neighborhood committee immediately.

### Step 3: Evacuation Route
- In Kakuma/Kalobeyei, head directly towards the nearest clinic (IRC Super Clinic) or community pavilion where guards and medical personnel are stationed 24/7.
- Avoid dead-end alleys or unlit riverbed (lagga) crossings at night.`
  },
  {
    id: 'plan-deescalation',
    title: 'In-House Protection & Conflict De-escalation',
    livingSituation: 'Living with abuser',
    hasChildren: false,
    accessToMoney: 'Personal savings',
    trustedContact: false,
    planContent: `### Step 1: Physical Positioning
- If an argument begins, move away from confined spaces (kitchens, storage areas) where sharp objects or blunt implements are within reach.
- Position yourself closest to the door or main exit of the shelter.

### Step 2: Emergency Contact Readiness
- Keep your phone charged and program 1195 and 1517 onto speed-dial.
- Use Juasafety Yako's Incognito / Panic mode to quickly switch screens if someone enters unexpectedly.`
  }
];

// Helper Functions
export const CacheService = {
  // Initialize default cache in localStorage if missing
  initCache(): void {
    if (!localStorage.getItem(STORAGE_KEYS.TEMPLATES)) {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(DEFAULT_REPORT_TEMPLATES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HOTLINES)) {
      localStorage.setItem(STORAGE_KEYS.HOTLINES, JSON.stringify(DEFAULT_HOTLINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CENTRES)) {
      localStorage.setItem(STORAGE_KEYS.CENTRES, JSON.stringify(DEFAULT_SUPPORT_CENTRES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EDUCATION)) {
      localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(DEFAULT_EDUCATION_MODULES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_SAFETY_PLANS)) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_SAFETY_PLANS, JSON.stringify(DEFAULT_OFFLINE_SAFETY_PLANS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFLINE_REPORTS)) {
      localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify([]));
    }
  },

  // Templates
  getTemplates(): ReportTemplate[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading cached templates:', e);
    }
    return DEFAULT_REPORT_TEMPLATES;
  },

  saveCustomTemplate(template: ReportTemplate): void {
    const templates = this.getTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },

  // Hotlines
  getCachedHotlines(): Hotline[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HOTLINES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading cached hotlines:', e);
    }
    return DEFAULT_HOTLINES;
  },

  setCachedHotlines(hotlines: Hotline[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HOTLINES, JSON.stringify(hotlines));
    } catch (e) {
      console.warn('Failed storing hotlines:', e);
    }
  },

  // Support Centres
  getCachedCentres(): SupportCentre[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CENTRES);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading cached centres:', e);
    }
    return DEFAULT_SUPPORT_CENTRES;
  },

  setCachedCentres(centres: SupportCentre[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CENTRES, JSON.stringify(centres));
    } catch (e) {
      console.warn('Failed storing centres:', e);
    }
  },

  // Education Modules
  getCachedEducation(): EducationModule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EDUCATION);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed reading cached education:', e);
    }
    return DEFAULT_EDUCATION_MODULES;
  },

  setCachedEducation(modules: EducationModule[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EDUCATION, JSON.stringify(modules));
    } catch (e) {
      console.warn('Failed storing education:', e);
    }
  },

  // Offline Safety Plans
  getOfflineSafetyPlan(situation: string, hasChildren: boolean): string {
    const plans: OfflineSafetyPlan[] = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.OFFLINE_SAFETY_PLANS) || JSON.stringify(DEFAULT_OFFLINE_SAFETY_PLANS)
    );
    const matched = plans.find(p => p.livingSituation === situation && p.hasChildren === hasChildren) || plans[0];
    return matched.planContent;
  },

  // Offline Queued Reports
  getQueuedReports(): QueuedOfflineReport[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_REPORTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Failed reading queued reports:', e);
    }
    return [];
  },

  queueReportOffline(data: any): QueuedOfflineReport {
    const reports = this.getQueuedReports();
    const localCode = `OFFLINE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newReport: QueuedOfflineReport = {
      id: `off-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      localCode,
      timestamp: new Date().toISOString(),
      data: {
        type: data.type,
        location: data.location,
        phoneNumber: data.phoneNumber || '',
        incidentDate: data.incidentDate || new Date().toISOString(),
        description: data.description || '',
        anonymousUserId: data.anonymousUserId || 'anon_offline',
        templateId: data.templateId
      },
      synced: false
    };

    reports.unshift(newReport);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(reports));

    // Also register tracking code in user history so tracking tab can look it up
    const history = JSON.parse(localStorage.getItem('jy_hist') || '[]');
    if (!history.includes(localCode)) {
      history.unshift(localCode);
      localStorage.setItem('jy_hist', JSON.stringify(history.slice(0, 10)));
    }

    return newReport;
  },

  markReportSynced(id: string): void {
    const reports = this.getQueuedReports();
    const index = reports.findIndex(r => r.id === id);
    if (index >= 0) {
      reports[index].synced = true;
      localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(reports));
    }
  },

  removeQueuedReport(id: string): void {
    const reports = this.getQueuedReports().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(reports));
  },

  clearSyncedReports(): void {
    const unsynced = this.getQueuedReports().filter(r => !r.synced);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_REPORTS, JSON.stringify(unsynced));
  }
};

// Initialize cache immediately when imported
CacheService.initCache();
