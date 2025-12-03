import { Report, ReportStatus, GBVType, Attachment, EducationModule, Hotline, SupportCentre } from '../types';

const API_BASE_URL = 'http://localhost:3000/api';

// Static Data (Mocked for now as requested, but can be moved to DB later)
const MOCK_EDUCATION: EducationModule[] = [
  {
    id: '1',
    title: 'What is GBV?',
    description: 'Understanding the basics of Gender-Based Violence.',
    imageUrl: 'https://picsum.photos/400/200?random=1',
    content: `Gender-Based Violence (GBV) refers to harmful acts directed at an individual based on their gender. It is rooted in gender inequality, the abuse of power and harmful norms.

    GBV includes sexual, physical, mental and economic harm inflicted in public or in private. It also includes threats of violence, coercion and manipulation.`,
  },
  {
    id: '2',
    title: 'Warning Signs',
    description: 'How to spot the early signs of abusive behavior.',
    imageUrl: 'https://picsum.photos/400/200?random=2',
    content: `Abuse isn't always physical. Look out for these signs:
    
    1. **Isolation:** Keeping you away from friends and family.
    2. **Control:** Monitoring your phone, money, or movements.
    3. **Jealousy:** Accusing you of cheating without evidence.
    4. **Gaslighting:** Making you doubt your own sanity or memory.`,
  },
  {
    id: '3',
    title: 'Legal Rights in Kenya',
    description: 'Know your protection under the law.',
    imageUrl: 'https://picsum.photos/400/200?random=3',
    content: `The Sexual Offences Act and the Protection Against Domestic Violence Act provide strong legal frameworks. You have the right to:
    - Police protection orders.
    - Free medical care at public facilities.
    - Legal representation.`,
  }
];

const MOCK_HOTLINES: Hotline[] = [
  { id: '1', name: 'National GBV Helpline', number: '1195', category: 'Emergency' },
  { id: '2', name: 'Police Emergency', number: '999', category: 'Emergency' },
  { id: '3', name: 'FIDA Kenya (Legal Aid)', number: '0800720501', category: 'Legal' },
  { id: '4', name: 'LVCT Health', number: '1190', category: 'Medical' },
];

const MOCK_CENTRES: SupportCentre[] = [
  { id: '1', name: 'GVRC - Nairobi Women\'s Hospital', address: 'Hurlingham, Nairobi', distance: '2.5 km', type: 'Medical & Psychosocial' },
  { id: '2', name: 'Politecare Hospital', address: 'Ngong Road', distance: '4.1 km', type: 'Medical' },
  { id: '3', name: 'Kenyatta National Hospital GBV Center', address: 'Upper Hill', distance: '5.0 km', type: 'Comprehensive Care' },
];

const STORAGE_KEY_HISTORY = 'safevoice_report_history';
const STORAGE_KEY_ADMIN_TOKEN = 'safevoice_admin_token';

export const BackendService = {
  
  // --- REAL API CALLS ---

  async createReport(data: Omit<Report, 'id' | 'trackingCode' | 'status' | 'statusHistory' | 'createdAt'>): Promise<Report> {
    const formData = new FormData();
    formData.append('type', data.type);
    formData.append('location', data.location);
    formData.append('description', data.description);
    if (data.anonymousUserId) {
      formData.append('anonymousUserId', data.anonymousUserId);
    }

    if (data.attachments) {
      // In a real browser env, attachments need to be File objects. 
      // For this demo, we are mocking the File objects in ReportView, so we skip actual append 
      // or we need to convert the logic.
      // Assuming ReportView passes valid objects or we just send metadata for now to keep it simple.
    }

    try {
      const response = await fetch(`${API_BASE_URL}/gbv-report`, {
        method: 'POST',
        body: formData, // fetch handles multipart/form-data headers automatically
      });

      if (!response.ok) throw new Error('Network response was not ok');
      
      const result = await response.json(); // Returns { message, trackingCode }

      // Construct a report object to return to UI (frontend optimism)
      const newReport: Report = {
        id: 'server-generated',
        trackingCode: result.trackingCode,
        ...data,
        status: ReportStatus.RECEIVED,
        statusHistory: [],
        createdAt: new Date().toISOString(),
      };

      // Save tracking code to local history
      this.addToHistory(result.trackingCode);

      return newReport;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  async getReportByCode(code: string): Promise<Report | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/gbv-report/${code}`);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error('Network Error');
      return await response.json();
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  },

  // --- ADMIN API CALLS ---

  async adminLogin(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(STORAGE_KEY_ADMIN_TOKEN, data.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Admin Login Error:", error);
      return false;
    }
  },

  async getAllReports(): Promise<Report[]> {
    const token = localStorage.getItem(STORAGE_KEY_ADMIN_TOKEN);
    if (!token) return [];
    try {
      const response = await fetch(`${API_BASE_URL}/admin/reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        return await response.json();
      }
      return [];
    } catch (error) {
      console.error("Fetch Reports Error:", error);
      return [];
    }
  },

  async updateReportStatus(id: string, status: ReportStatus): Promise<void> {
    const token = localStorage.getItem(STORAGE_KEY_ADMIN_TOKEN);
    if (!token) throw new Error("Unauthorized");
    
    const response = await fetch(`${API_BASE_URL}/admin/reports/${id}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    if (!response.ok) throw new Error("Failed to update status");
  },

  // --- LOCAL HELPERS ---

  addToHistory(code: string) {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
    if (!history.includes(code)) {
      history.unshift(code);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    }
  },

  getHistory(): string[] {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
  },

  // --- STATIC DATA ---

  async getEducationModules(): Promise<EducationModule[]> {
    return MOCK_EDUCATION;
  },

  async getHotlines(): Promise<Hotline[]> {
    return MOCK_HOTLINES;
  },

  async getSupportCentres(lat: number, lng: number): Promise<SupportCentre[]> {
    return MOCK_CENTRES;
  }
};