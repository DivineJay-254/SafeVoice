
import { Report, ReportStatus, EducationModule, Hotline, SupportCentre, CaseUpdate, Attachment, Caseworker, AppwriteConfig, ChatSession, ChatMessage } from '../types';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc } from 'firebase/firestore';

const OFFLINE_REPORTS_KEY = 'safevoice_offline_reports';
const API_BASE = '/api';

export const BackendService = {
    getConfig(): AppwriteConfig { 
        return { url: window.location.origin, key: 'local' }; 
    },
    saveConfig(newConfig: AppwriteConfig) { 
        console.log("Config saved locally", newConfig);
    },

    async adminLogin(email: string, password: string): Promise<boolean> {
        try {
            const res = await fetch(`${API_BASE}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (res.ok) {
                const { token } = await res.json();
                localStorage.setItem('sv_admin_token', token);
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    },

    async seedAdmins() { return { success: true, message: "Admins are pre-configured in server." }; },

    async createReport(data: any): Promise<Report> {
        const formData = new FormData();
        formData.append('type', data.type);
        formData.append('location', data.location);
        formData.append('description', data.description);
        formData.append('anonymousUserId', data.anonymousUserId || 'anon');
        if (data.phoneNumber) formData.append('phoneNumber', data.phoneNumber);
        
        if (data.attachments) {
            data.attachments.forEach((att: any) => {
                if (att.file) formData.append('attachments', att.file);
            });
        }

        const res = await fetch(`${API_BASE}/gbv-report`, {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            throw new Error('Failed to submit report');
        }

        const { trackingCode } = await res.json();
        this.addToHistory(trackingCode);
        
        // Return a partial report object as the real one is on the server
        return {
            id: 'temp',
            trackingCode,
            type: data.type,
            location: data.location,
            description: data.description,
            status: ReportStatus.RECEIVED,
            anonymousUserId: data.anonymousUserId || 'anon',
            createdAt: new Date().toISOString(),
            statusHistory: [{ status: ReportStatus.RECEIVED, timestamp: new Date().toISOString() }],
            caseUpdates: [],
            attachments: []
        };
    },

    async getReportByCode(code: string): Promise<Report | null> {
        try {
            const res = await fetch(`${API_BASE}/gbv-report/${code}`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    },

    subscribeToReports(callback: (reports: Report[]) => void): () => void {
        const token = localStorage.getItem('sv_admin_token');
        const fetchAll = async () => {
            try {
                const res = await fetch(`${API_BASE}/admin/reports`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    callback(data);
                }
            } catch (e) {
                console.error("Failed to fetch reports", e);
            }
        };
        fetchAll();
        const interval = setInterval(fetchAll, 5000); // Poll every 5s
        return () => clearInterval(interval);
    },

    subscribeToCaseworkers(callback: (workers: Caseworker[]) => void): () => void {
        const token = localStorage.getItem('sv_admin_token');
        const fetchAll = async () => {
            try {
                const res = await fetch(`${API_BASE}/admin/caseworkers`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    callback(data);
                }
            } catch (e) {
                console.error("Failed to fetch caseworkers", e);
            }
        };
        fetchAll();
        const interval = setInterval(fetchAll, 5000);
        return () => clearInterval(interval);
    },

    async addCaseworker(data: any): Promise<void> {
        const token = localStorage.getItem('sv_admin_token');
        const res = await fetch(`${API_BASE}/admin/caseworkers`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to add caseworker');
    },

    async updateCaseworker(id: string, data: any): Promise<void> {
        const token = localStorage.getItem('sv_admin_token');
        const res = await fetch(`${API_BASE}/admin/caseworkers/${id}`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Failed to update caseworker');
    },

    async deleteCaseworker(id: string): Promise<void> {
        const token = localStorage.getItem('sv_admin_token');
        const res = await fetch(`${API_BASE}/admin/caseworkers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete caseworker');
    },

    async getEducationModules(): Promise<EducationModule[]> {
        // Can be moved to server later
        return [
            { 
              id: 'kakuma-diversity', 
              title: 'Diversity & Inclusion (Kakuma)', 
              description: 'Peaceful coexistence in the camp.', 
              imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800', 
              content: `1. Diversity: The camp is composed of many diversities (gender, ethnicities, age, language, nationality, sexual orientation). It is normal to be different.
2. Peaceful Coexistence: Harmony is fundamental to well-being. We all have a responsibility to create an environment free from discrimination.
3. Non-Discrimination: UNHCR and partners do not tolerate discrimination. If you feel discriminated against, you have the right to report.
4. Human Rights: Rights are inherent and cannot be taken away. Everyone has a right to be safe.
5. Service Points: Report concerns to:
- DRC: 0800720414
- UNHCR: 1517` 
            },
            { 
              id: 'lgbtiq-protection', 
              title: 'LGBTIQ+ Protection (Kakuma)', 
              description: 'Inclusive services for all refugees.', 
              imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&q=80&w=800', 
              content: `Message 1: Commitment. UNHCR works to protect all LGBTIQ+ refugees. Reach out via Field posts, Protection email, help lines, or police.
Message 2: Freedom of Movement. Be aware of risks in secondary migration (trafficking, smuggling, GBV, arbitrary arrests).
Message 3: Efforts in Kakuma/Kalobeyei. Progress is being made in shelter relocation sensitivity, health services with sensitive workers, and linkage with child protection teams.
Message 4: Legal Environment. The Refugees Act 2021 reaffirms protection commitments. Advocacy continues for specialized counselling and inclusion.` 
            }
        ];
    },

    async getHotlines(): Promise<Hotline[]> {
        return [
            { id: '1', name: 'National GBV Helpline', number: '1195', category: 'Emergency' },
            { id: '2', name: 'UNHCR Kakuma Helpline', number: '1517', category: 'Emergency' },
            { id: '3', name: 'DRC Toll-free (Kakuma)', number: '0800720414', category: 'Emergency' },
            { id: '4', name: 'Police Emergency', number: '999', category: 'Emergency' }
        ];
    },

    async getSupportCentres(lat: number, lng: number): Promise<SupportCentre[]> {
        return [
            { id: '1', name: 'IRC Kalobeyei Super Clinic', address: 'Kalobeyei Settlement, Village 1', type: 'Medical', distance: 'Nearby' },
            { id: '2', name: 'DRC Kalobeyei Protection Desk', address: 'Kalobeyei Reception Centre', type: 'Protection', distance: 'Nearby' }
        ];
    },

    // --- REAL-TIME CHAT SERVICE (FIRESTORE) ---
    async startChatSession(anonId: string): Promise<string> {
        const sessionsRef = collection(db, 'chat_sessions');
        const docRef = await addDoc(sessionsRef, {
            anonymousUserId: anonId,
            status: 'active',
            createdAt: serverTimestamp(),
            lastUpdatedAt: serverTimestamp(),
            lastMessage: ''
        });
        return docRef.id;
    },

    async sendChatMessage(sessionId: string, senderId: string, senderType: 'user' | 'worker', text: string): Promise<void> {
        const messagesRef = collection(db, 'chat_messages');
        await addDoc(messagesRef, {
            sessionId,
            senderId,
            senderType,
            text,
            timestamp: serverTimestamp()
        });

        const sessionRef = doc(db, 'chat_sessions', sessionId);
        await updateDoc(sessionRef, {
            lastMessage: text,
            lastUpdatedAt: serverTimestamp()
        });
    },

    subscribeToChatMessages(sessionId: string, callback: (messages: ChatMessage[]) => void): () => void {
        const q = query(
            collection(db, 'chat_messages'),
            where('sessionId', '==', sessionId),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
            callback(messages);
        });
    },

    subscribeToActiveChatSessions(callback: (sessions: ChatSession[]) => void): () => void {
        const q = query(
            collection(db, 'chat_sessions'),
            where('status', '==', 'active'),
            orderBy('lastUpdatedAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession));
            callback(sessions);
        });
    },

    async closeChatSession(sessionId: string): Promise<void> {
        const sessionRef = doc(db, 'chat_sessions', sessionId);
        await updateDoc(sessionRef, {
            status: 'closed',
            lastUpdatedAt: serverTimestamp()
        });
    },

    async updateReportStatus(id: string, status: ReportStatus, note?: string): Promise<void> {
        const token = localStorage.getItem('sv_admin_token');
        const res = await fetch(`${API_BASE}/admin/reports/${id}/status`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status, note })
        });
        if (!res.ok) throw new Error('Failed to update report status');
    },

    async addCaseUpdate(reportId: string, content: string, author: string): Promise<void> {
        const token = localStorage.getItem('sv_admin_token');
        const res = await fetch(`${API_BASE}/admin/reports/${reportId}/updates`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ content, author })
        });
        if (!res.ok) throw new Error('Failed to add case update');
    },

    addToHistory(code: string) {
        const history = JSON.parse(localStorage.getItem('sv_hist') || '[]');
        if (!history.includes(code)) { history.unshift(code); localStorage.setItem('sv_hist', JSON.stringify(history.slice(0, 10))); }
    },
    getHistory(): string[] { return JSON.parse(localStorage.getItem('sv_hist') || '[]'); },
    async checkConnection() { 
        try { 
            const res = await fetch(`${API_BASE}/health`);
            return { success: res.ok }; 
        } catch (e: any) { 
            return { success: false, message: e.message }; 
        } 
    }
};
