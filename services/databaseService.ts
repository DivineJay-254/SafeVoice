
import { Report, ReportStatus, EducationModule, Hotline, SupportCentre, CaseUpdate, Attachment, Caseworker, ChatSession, ChatMessage } from '../types';
import { db, auth, storage } from '../firebaseConfig';
import { collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, getDoc, getDocs, arrayUnion, deleteDoc, getDocFromServer, limit, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const OFFLINE_REPORTS_KEY = 'safevoice_offline_reports';

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
            handleFirestoreError(error, OperationType.CREATE, 'reports');
            throw error;
        }
    },

    async getReportByCode(code: string): Promise<Report | null> {
        const path = 'reports';
        try {
            const q = query(collection(db, path), where('trackingCode', '==', code), limit(1));
            const snapshot = await getDocs(q);
            if (snapshot.empty) return null;
            const d = snapshot.docs[0];
            return { id: d.id, ...d.data() } as Report;
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            throw error;
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
            if (snapshot.empty) {
                const modules = [
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
                for (const m of modules) {
                    await addDoc(collection(db, path), m);
                }
                return modules;
            }
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as EducationModule));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            throw error;
        }
    },

    async getHotlines(): Promise<Hotline[]> {
        const path = 'hotlines';
        try {
            const q = query(collection(db, path));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                const hotlines = [
                    { id: '1', name: 'National GBV Helpline', number: '1195', category: 'Emergency' },
                    { id: '2', name: 'UNHCR Kakuma Helpline', number: '1517', category: 'Emergency' },
                    { id: '3', name: 'DRC Toll-free (Kakuma)', number: '0800720414', category: 'Emergency' },
                    { id: '4', name: 'Police Emergency', number: '999', category: 'Emergency' }
                ];
                for (const h of hotlines) {
                    await addDoc(collection(db, path), h);
                }
                return hotlines;
            }
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Hotline));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            throw error;
        }
    },

    async getSupportCentres(lat: number, lng: number): Promise<SupportCentre[]> {
        const path = 'support_centres';
        try {
            const q = query(collection(db, path));
            const snapshot = await getDocs(q);
            if (snapshot.empty) {
                const centres = [
                    { id: '1', name: 'IRC Kalobeyei Super Clinic', address: 'Kalobeyei Settlement, Village 1', type: 'Medical', distance: 'Nearby', lat: 3.7, lng: 34.8 },
                    { id: '2', name: 'DRC Kalobeyei Protection Desk', address: 'Kalobeyei Reception Centre', type: 'Protection', distance: 'Nearby', lat: 3.71, lng: 34.81 }
                ];
                for (const c of centres) {
                    await addDoc(collection(db, path), c);
                }
                return centres as SupportCentre[];
            }
            return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SupportCentre));
        } catch (error) {
            handleFirestoreError(error, OperationType.GET, path);
            throw error;
        }
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
        const history = JSON.parse(localStorage.getItem('sv_hist') || '[]');
        if (!history.includes(code)) { history.unshift(code); localStorage.setItem('sv_hist', JSON.stringify(history.slice(0, 10))); }
    },
    getHistory(): string[] { return JSON.parse(localStorage.getItem('sv_hist') || '[]'); },
    async checkConnection() { 
        try {
            // Test connection with a server-side fetch
            await getDocFromServer(doc(db, 'system', 'health'));
            return { success: true, message: 'Connected' }; 
        } catch (error: any) {
            if (error.message?.includes('client is offline')) {
                return { success: false, message: 'Firebase client is offline. Check configuration.' };
            }
            // Other errors are fine, as long as it's not a connection error
            return { success: true, message: 'Connected' };
        }
    }
};

