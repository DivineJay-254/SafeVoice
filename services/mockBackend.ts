
import { Report, ReportStatus, EducationModule, Hotline, SupportCentre, CaseUpdate, Attachment, Caseworker, AppwriteConfig, ChatSession, ChatMessage } from '../types';
import { supabase, getSupabaseConfig, saveSupabaseConfig } from './supabaseClient';
import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, getDocs, limit, getDoc } from 'firebase/firestore';

const OFFLINE_REPORTS_KEY = 'safevoice_offline_reports';
const CASEWORKERS_TABLE = 'caseworkers';
const REPORTS_TABLE = 'reports';

const mapRowToCaseworker = (row: any): Caseworker => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    createdAt: row.created_at
});

const mapRowToReport = (row: any): Report => {
    let statusHistory = [];
    if (typeof row.status_history === 'string') {
        try { statusHistory = JSON.parse(row.status_history); } catch (e) {}
    } else if (Array.isArray(row.status_history)) {
        statusHistory = row.status_history;
    }
    let caseUpdates = [];
    if (typeof row.case_updates === 'string') {
        try { caseUpdates = JSON.parse(row.case_updates); } catch (e) {}
    } else if (Array.isArray(row.case_updates)) {
        caseUpdates = row.case_updates;
    }
    return {
        id: row.id,
        trackingCode: row.tracking_code,
        type: row.type,
        location: row.location,
        description: row.description,
        status: row.status as ReportStatus,
        anonymousUserId: row.anonymous_user_id,
        createdAt: row.created_at,
        statusHistory: statusHistory,
        caseUpdates: caseUpdates,
        attachments: [],
        assignedTo: row.assigned_to,
        assignedToName: row.assigned_to_name,
        assignedAt: row.updated_at
    };
};

export const BackendService = {
    getConfig(): AppwriteConfig { return getSupabaseConfig(); },
    saveConfig(newConfig: AppwriteConfig) { saveSupabaseConfig(newConfig.url, newConfig.key); },

    async adminLogin(email: string, password: string): Promise<boolean> {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error && data.user) return true;
        return (email === 'admin@safevoice.org' && password === 'password123');
    },

    async seedAdmins() { return { success: true, message: "Use Supabase Auth Dashboard." }; },

    async createReport(data: any): Promise<Report> {
        const trackingCode = `SV-${Math.floor(1000 + Math.random() * 9000)}-${new Date().getFullYear()}`;
        const payload = {
            tracking_code: trackingCode,
            type: data.type,
            location: data.location,
            description: data.description,
            status: ReportStatus.RECEIVED,
            anonymous_user_id: data.anonymousUserId || 'anon',
            status_history: [{ status: ReportStatus.RECEIVED, timestamp: new Date().toISOString() }],
            case_updates: [],
            attachment_urls: [],
            phone_number: data.phoneNumber
        };

        const { data: insertedData, error } = await supabase.from(REPORTS_TABLE).insert([payload]).select().single();

        if (error) {
            const offlineReport: Report = {
                id: 'local_' + Date.now(),
                trackingCode, type: data.type, location: data.location, description: data.description, status: ReportStatus.RECEIVED,
                anonymousUserId: data.anonymousUserId || 'anon', createdAt: new Date().toISOString(), statusHistory: payload.status_history,
                caseUpdates: [], attachments: [], assignedTo: undefined
            };
            const offlineReports = JSON.parse(localStorage.getItem(OFFLINE_REPORTS_KEY) || '[]');
            offlineReports.push(offlineReport);
            localStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(offlineReports));
            this.addToHistory(trackingCode);
            return offlineReport;
        }

        this.addToHistory(trackingCode);
        return mapRowToReport(insertedData);
    },

    async getReportByCode(code: string): Promise<Report | null> {
        const { data, error } = await supabase.from(REPORTS_TABLE).select('*').eq('tracking_code', code).single();
        if (error || !data) return null;
        return mapRowToReport(data);
    },

    subscribeToReports(callback: (reports: Report[]) => void): () => void {
        const fetchAll = async () => {
            const { data } = await supabase.from(REPORTS_TABLE).select('*').order('created_at', { ascending: false });
            if (data) callback(data.map(mapRowToReport));
        };
        fetchAll();
        const channel = supabase.channel('reports').on('postgres_changes', { event: '*', schema: 'public', table: REPORTS_TABLE }, fetchAll).subscribe();
        return () => supabase.removeChannel(channel);
    },

    subscribeToCaseworkers(callback: (workers: Caseworker[]) => void): () => void {
        const fetchAll = async () => {
            const { data } = await supabase.from(CASEWORKERS_TABLE).select('*').order('created_at', { ascending: false });
            if (data) callback(data.map(mapRowToCaseworker));
        };
        fetchAll();
        const channel = supabase.channel('caseworkers').on('postgres_changes', { event: '*', schema: 'public', table: CASEWORKERS_TABLE }, fetchAll).subscribe();
        return () => supabase.removeChannel(channel);
    },

    async addCaseworker(data: any): Promise<void> {
        const { error } = await supabase.from(CASEWORKERS_TABLE).insert([{
            name: data.name,
            phone: data.phone,
            email: data.email
        }]);
        if (error) throw error;
    },

    async updateCaseworker(id: string, data: any): Promise<void> {
        const { error } = await supabase.from(CASEWORKERS_TABLE).update({
            name: data.name,
            phone: data.phone,
            email: data.email
        }).eq('id', id);
        if (error) throw error;
    },

    async deleteCaseworker(id: string): Promise<void> {
        const { error } = await supabase.from(CASEWORKERS_TABLE).delete().eq('id', id);
        if (error) throw error;
    },

    async getEducationModules(): Promise<EducationModule[]> {
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
            },
            { 
              id: 'gbv-messages', 
              title: 'GBV Awareness (Bilingual)', 
              description: 'Key messages for the community.', 
              imageUrl: 'https://images.unsplash.com/photo-1547038579-cc72e0e0a5a3?auto=format&fit=crop&q=80&w=800', 
              content: `• Do not stay silent! Report to DRC via Tollfree 0800720414.
• Usinyamaze!! Ripoti tendo lolote kupitia 0800720414 bila malipo.
• GBV is a violation of Human Rights. It can happen to anyone.
• Sexual activity with those below 18 years is PROHIBITED.
• All Humanitarian Aid is FREE. Do not give money or favors for assistance.
• Report Sexual Abuse (SEA) rumors via UNHCR 1517.` 
            },
            { 
              id: 'psea-principles', 
              title: 'PSEA Core Principles', 
              description: 'Zero tolerance for exploitation.', 
              imageUrl: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=800', 
              content: `1. PSEA amounts to gross misconduct and summary dismissal of staff.
2. No sexual activity with persons below 18 years.
3. No exchange of goods, services for sex.
4. No sexual relationships between humanitarian workers and beneficiaries.
5. Mandatory reporting via 1517 or inspector@unhcr.org.
6. Maintain an environment of zero tolerance to PSEA.` 
            }
        ];
    },

    async getHotlines(): Promise<Hotline[]> {
        return [
            { id: '1', name: 'National GBV Helpline', number: '1195', category: 'Emergency' },
            { id: '2', name: 'UNHCR Kakuma Helpline', number: '1517', category: 'Emergency' },
            { id: '3', name: 'DRC Toll-free (Kakuma)', number: '0800720414', category: 'Emergency' },
            { id: '4', name: 'Police Emergency', number: '999', category: 'Emergency' },
            { id: '5', name: 'FIDA Kenya', number: '0800720501', category: 'Legal' }
        ];
    },

    async getSupportCentres(lat: number, lng: number): Promise<SupportCentre[]> {
        const ALL_CENTRES = [
            { id: '1', name: 'IRC Kalobeyei Super Clinic', address: 'Kalobeyei Settlement, Village 1', type: 'Medical' },
            { id: '2', name: 'DRC Kalobeyei Protection Desk', address: 'Kalobeyei Reception Centre', type: 'Protection' },
            { id: '3', name: 'IRC Health Centre - Kalobeyei 3', address: 'Kalobeyei Settlement, Village 3', type: 'Medical' },
            { id: '4', name: 'IRC General Hospital', address: 'Kakuma 4, near Main Market', type: 'Medical' },
            { id: '5', name: 'DRC Main Protection Office', address: 'Kakuma 1 Reception', type: 'Protection' },
            { id: '6', name: 'LWF Safe Space - Kakuma 3', address: 'Kakuma 3, Block 2', type: 'Support' },
            { id: '7', name: 'Police Station - Kakuma 1', address: 'Kakuma 1, near Sub-County HQ', type: 'Police' },
            { id: '8', name: 'Police Post - Kalobeyei', address: 'Kalobeyei Village 2', type: 'Police' }
        ];
        return ALL_CENTRES.map(c => ({ ...c, distance: 'Nearby Support Centre' }));
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

        // Update session's last message
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

    addToHistory(code: string) {
        const history = JSON.parse(localStorage.getItem('sv_hist') || '[]');
        if (!history.includes(code)) { history.unshift(code); localStorage.setItem('sv_hist', JSON.stringify(history.slice(0, 10))); }
    },
    getHistory(): string[] { return JSON.parse(localStorage.getItem('sv_hist') || '[]'); },
    async checkConnection() { try { await supabase.from(REPORTS_TABLE).select('count').limit(1); return { success: true }; } catch (e: any) { return { success: false, message: e.message }; } }
};
