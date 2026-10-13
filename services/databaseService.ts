
import { Report, ReportStatus, EducationModule, Hotline, SupportCentre, CaseUpdate, Attachment, Caseworker, ChatSession, ChatMessage } from '../types';
import { db, auth, storage } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, getDoc, getDocs, arrayUnion, deleteDoc, getDocFromServer, limit, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { CacheService } from './cacheService';

const OFFLINE_REPORTS_KEY = 'juasafety_yako_offline_reports';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const DatabaseService = {
    async createReport(data: any): Promise<Report> {
        // If device is offline, directly cache locally
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            const queued = CacheService.queueReportOffline(data);
            return {
                id: queued.id,
                trackingCode: queued.localCode,
                type: data.type,
                location: data.location,
                description: data.description || `Report of ${data.type} (Saved offline)`,
                phoneNumber: data.phoneNumber || '',
                anonymousUserId: data.anonymousUserId || 'anon_offline',
                status: ReportStatus.RECEIVED,
                createdAt: queued.timestamp,
                statusHistory: [{ 
                    status: ReportStatus.RECEIVED, 
                    timestamp: queued.timestamp, 
                    note: 'Saved in offline storage. Queued for automatic cloud sync.' 
                }],
                caseUpdates: [],
                attachments: []
            };
        }

        const trackingCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const attachments: Attachment[] = [];

        if (data.attachments && data.attachments.length > 0) {
            for (const att of data.attachments) {
                if (att.file) {
                    try {
                        const fileRef = ref(storage, `reports/${trackingCode}/${att.file.name}`);
                        await uploadBytes(fileRef, att.file);
                        const url = await getDownloadURL(fileRef);
                        attachments.push({
                            id: uuidv4(),
                            name: att.file.name,
                            url,
                            type: att.file.type
                        });
                    } catch (error) {
                        console.error('Storage upload error:', error);
                        // Continue without this attachment or handle error
                    }
                }
            }
        }

        const reportData: any = {
            trackingCode,
            type: data.type,
            location: data.location,
            description: data.description,
            phoneNumber: data.phoneNumber || '',
            anonymousUserId: data.anonymousUserId || 'anon',
            status: ReportStatus.RECEIVED,
            createdAt: new Date().toISOString(),
            statusHistory: [{ status: ReportStatus.RECEIVED, timestamp: new Date().toISOString() }],
            caseUpdates: [],
            attachments
        };

        try {
            const docRef = await addDoc(collection(db, 'reports'), reportData);
            this.addToHistory(trackingCode);
            return { id: docRef.id, ...reportData };
        } catch (error) {
            console.warn('Network / Firestore failure submitting report, saving to offline cache:', error);
            const queued = CacheService.queueReportOffline(data);
            return {
                id: queued.id,
                trackingCode: queued.localCode,
                type: data.type,
                location: data.location,
                description: data.description || `Report of ${data.type} (Saved offline)`,
                phoneNumber: data.phoneNumber || '',
                anonymousUserId: data.anonymousUserId || 'anon_offline',
                status: ReportStatus.RECEIVED,
                createdAt: queued.timestamp,
                statusHistory: [{ 
                    status: ReportStatus.RECEIVED, 
                    timestamp: queued.timestamp, 
                    note: 'Connection error persisted. Saved in offline storage and queued for sync.' 
                }],
                caseUpdates: [],
                attachments: []
            };
        }
    },

    async getReportByCode(code: string): Promise<Report | null> {
        // First check local offline queue
        const queuedReports = CacheService.getQueuedReports();
        const local = queuedReports.find(r => r.localCode.toUpperCase() === code.trim().toUpperCase());
        if (local) {
            return {
                id: local.id,
                trackingCode: local.localCode,
                type: local.data.type,
                location: local.data.location,
                description: local.data.description,
                phoneNumber: local.data.phoneNumber || '',
                anonymousUserId: local.data.anonymousUserId || 'anon',
                status: local.synced ? ReportStatus.IN_REVIEW : ReportStatus.RECEIVED,
                createdAt: local.timestamp,
                statusHistory: [
                    { 
                        status: ReportStatus.RECEIVED, 
                        timestamp: local.timestamp,
                        note: local.synced ? 'Synced to server' : 'Stored locally in device cache (queued for sync)' 
                    }
                ],
                caseUpdates: [],
                attachments: []
            };
        }

        const path = 'reports';
        try {
            const q = query(collection(db, path), where('trackingCode', '==', code.trim().toUpperCase()), limit(1));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() } as Report;
        } catch (error) {
            console.warn('Firestore getReportByCode failed, checking local cache:', error);
            return null;
        }
    },

    subscribeToReports(callback: (reports: Report[]) => void): () => void {
        const path = 'reports';
        const q = query(collection(db, path), orderBy('createdAt', 'desc'));
        return onSnapshot(q, (snapshot) => {
            const reports = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Report));
            callback(reports);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, path);
        });
    },

    subscribeToCaseworkers(callback: (workers: Caseworker[]) => void): () => void {
        const path = 'caseworkers';
        const q = query(collection(db, path), orderBy('name', 'asc'));
        return onSnapshot(q, (snapshot) => {
            const workers = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Caseworker));
            callback(workers);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, path);
        });
    },

    async addCaseworker(data: any): Promise<void> {
        const path = 'caseworkers';
        try {
            await addDoc(collection(db, path), {
                ...data,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
        }
    },

    async updateCaseworker(id: string, data: any): Promise<void> {
        const path = `caseworkers/${id}`;
        try {
            const workerRef = doc(db, 'caseworkers', id);
            await updateDoc(workerRef, data);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
        }
    },

    async deleteCaseworker(id: string): Promise<void> {
        const path = `caseworkers/${id}`;
        try {
            const workerRef = doc(db, 'caseworkers', id);
            await deleteDoc(workerRef);
        } catch (error) {
            handleFirestoreError(error, OperationType.DELETE, path);
        }
    },

    async getEducationModules(): Promise<EducationModule[]> {
        const path = 'education_modules';
        try {
            const q = query(collection(db, path));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const modules = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EducationModule));
                CacheService.setCachedEducation(modules);
                return modules;
            }
        } catch (error) {
            console.warn("Fetch education_modules failed, using cached modules:", error);
        }
        return CacheService.getCachedEducation();
    },

    async getHotlines(): Promise<Hotline[]> {
        const path = 'hotlines';
        try {
            const q = query(collection(db, path));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const hotlines = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Hotline));
                CacheService.setCachedHotlines(hotlines);
                return hotlines;
            }
        } catch (error) {
            console.warn("Fetch hotlines failed, using cached hotlines:", error);
        }
        return CacheService.getCachedHotlines();
    },

    async getSupportCentres(lat: number, lng: number): Promise<SupportCentre[]> {
        const path = 'support_centres';
        try {
            const q = query(collection(db, path));
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const centres = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SupportCentre));
                CacheService.setCachedCentres(centres);
                return centres;
            }
        } catch (error) {
            console.warn("Fetch support_centres failed, using cached centres:", error);
        }
        return CacheService.getCachedCentres();
    },

    async startChatSession(anonId: string): Promise<string> {
        const path = 'chat_sessions';
        try {
            const sessionsRef = collection(db, path);
            const docRef = await addDoc(sessionsRef, {
                anonymousUserId: anonId,
                status: 'active',
                createdAt: serverTimestamp(),
                lastUpdatedAt: serverTimestamp(),
                lastMessage: ''
            });
            return docRef.id;
        } catch (error) {
            handleFirestoreError(error, OperationType.CREATE, path);
            throw error;
        }
    },

    async sendChatMessage(sessionId: string, senderId: string, senderType: 'user' | 'worker', text: string): Promise<void> {
        const path = `chat_sessions/${sessionId}/messages`;
        try {
            const messagesRef = collection(db, 'chat_sessions', sessionId, 'messages');
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
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
        }
    },

    subscribeToChatMessages(sessionId: string, callback: (messages: ChatMessage[]) => void): () => void {
        const path = `chat_sessions/${sessionId}/messages`;
        const q = query(
            collection(db, 'chat_sessions', sessionId, 'messages'),
            orderBy('timestamp', 'asc')
        );

        return onSnapshot(q, (snapshot) => {
            const messages = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage));
            callback(messages);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, path);
        });
    },

    subscribeToActiveChatSessions(callback: (sessions: ChatSession[]) => void): () => void {
        const path = 'chat_sessions';
        const q = query(
            collection(db, path),
            where('status', '==', 'active'),
            orderBy('lastUpdatedAt', 'desc')
        );

        return onSnapshot(q, (snapshot) => {
            const sessions = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession));
            callback(sessions);
        }, (error) => {
            handleFirestoreError(error, OperationType.LIST, path);
        });
    },

    async closeChatSession(sessionId: string): Promise<void> {
        const path = `chat_sessions/${sessionId}`;
        try {
            const sessionRef = doc(db, 'chat_sessions', sessionId);
            await updateDoc(sessionRef, {
                status: 'closed',
                lastUpdatedAt: serverTimestamp()
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
        }
    },

    async updateReportStatus(id: string, status: ReportStatus, note?: string): Promise<void> {
        const path = `reports/${id}`;
        try {
            const reportRef = doc(db, 'reports', id);
            const update: any = {
                status,
                statusHistory: arrayUnion({ status, timestamp: new Date().toISOString(), note })
            };
            await updateDoc(reportRef, update);
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
        }
    },

    async addCaseUpdate(reportId: string, content: string, author: string): Promise<void> {
        const path = `reports/${reportId}`;
        try {
            const reportRef = doc(db, 'reports', reportId);
            const update: CaseUpdate = {
                id: uuidv4(),
                content,
                author,
                timestamp: new Date().toISOString()
            };
            await updateDoc(reportRef, {
                caseUpdates: arrayUnion(update)
            });
        } catch (error) {
            handleFirestoreError(error, OperationType.UPDATE, path);
        }
    },

    async getCurrentUserRole(): Promise<string | null> {
        if (!auth.currentUser) return null;
        
        // Check if the user is the default admin
        if (auth.currentUser.email === "divineakenak2@gmail.com" && auth.currentUser.emailVerified) {
            return 'admin';
        }

        const path = `users/${auth.currentUser.uid}`;
        try {
            const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
            if (userDoc.exists()) {
                return userDoc.data().role || 'user';
            }
            return 'user';
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            return null;
        }
    },

    async ensureUserDocument(): Promise<void> {
        if (!auth.currentUser) return;
        
        const userRef = doc(db, 'users', auth.currentUser.uid);
        const path = `users/${auth.currentUser.uid}`;
        try {
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    id: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    role: auth.currentUser.email === "divineakenak2@gmail.com" ? 'admin' : 'user',
                    name: auth.currentUser.displayName || '',
                    createdAt: new Date().toISOString()
                });
            }
        } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, path);
        }
    },

    addToHistory(code: string) {
        const history = JSON.parse(localStorage.getItem('jy_hist') || '[]');
        if (!history.includes(code)) { history.unshift(code); localStorage.setItem('jy_hist', JSON.stringify(history.slice(0, 10))); }
    },
    getHistory(): string[] { return JSON.parse(localStorage.getItem('jy_hist') || '[]'); },

    async syncOfflineReports(): Promise<{ synced: number; failed: number }> {
        const queuedReports = CacheService.getQueuedReports().filter(r => !r.synced);
        if (queuedReports.length === 0) return { synced: 0, failed: 0 };

        let synced = 0;
        let failed = 0;

        for (const r of queuedReports) {
            try {
                const reportData: any = {
                    trackingCode: r.localCode,
                    type: r.data.type,
                    location: r.data.location,
                    description: r.data.description,
                    phoneNumber: r.data.phoneNumber || '',
                    anonymousUserId: r.data.anonymousUserId || 'anon',
                    status: ReportStatus.RECEIVED,
                    createdAt: r.timestamp,
                    statusHistory: [
                        { status: ReportStatus.RECEIVED, timestamp: r.timestamp, note: 'Initially recorded offline' },
                        { status: ReportStatus.RECEIVED, timestamp: new Date().toISOString(), note: 'Synced from offline device cache to cloud database' }
                    ],
                    caseUpdates: [],
                    attachments: []
                };

                await addDoc(collection(db, 'reports'), reportData);
                CacheService.markReportSynced(r.id);
                this.addToHistory(r.localCode);
                synced++;
            } catch (err) {
                console.warn(`Sync failed for report ${r.localCode}:`, err);
                failed++;
            }
        }

        return { synced, failed };
    },

    async checkConnection() { 
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            return { 
                success: false, 
                isOffline: true,
                message: 'No internet connection detected. Offline mode and cached resources are active.' 
            };
        }
        try {
            // Test connection with a server-side fetch
            await getDocFromServer(doc(db, 'system', 'health'));
            return { success: true, message: 'Connected' }; 
        } catch (error: any) {
            const msg = error?.message || '';
            if (msg.includes('client is offline') || msg.includes('unavailable') || msg.includes('network')) {
                return { 
                    success: false, 
                    isOffline: true,
                    message: 'Cloud database unreachable. Cached report templates and safety resources are operational.' 
                };
            }
            // Other benign errors (e.g. missing doc or permission on health doc) mean network is reached
            return { success: true, message: 'Connected' };
        }
    }
};

