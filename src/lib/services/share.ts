import { supabase } from '$lib/supabase';
import { importRawKey, decryptData, encryptData, base64ToUint8Array } from '$lib/crypto';
import type { Student } from '$lib/types';

export interface SharedSessionData {
    students: Student[];
    recipientName: string;
    shareKey: CryptoKey;
    originalEntryIds: Set<string>;
}

export async function loadSharedSession(id: string, hash: string): Promise<SharedSessionData> {
    if (!id || !hash) {
        throw new Error('Lien invalide (identifiant ou clé manquante).');
    }

    // 1. Fetch encrypted blob AND shared notes
    const { data: sessionData, error: fetchError } = await supabase
        .from('shared_sessions')
        .select('encrypted_blob, expires_at')
        .eq('id', id)
        .single();

    if (fetchError || !sessionData) {
        throw new Error('Ce lien est expiré ou introuvable.');
    }

    // 2. Import key from hash
    const rawKey = base64ToUint8Array(hash);
    const shareKey = await importRawKey(rawKey);

    // 3. Decrypt payload
    const payload = (await decryptData(sessionData.encrypted_blob, shareKey)) as {
        type: string;
        data: { students: Student[] };
        timestamp: number;
        recipientName?: string;
    };

    if (payload.type !== 'student_share' || !Array.isArray(payload.data?.students)) {
        throw new Error('Données corrompues.');
    }

    const loadedStudents = payload.data.students;
    const recipientName = payload.recipientName || '';
    const originalEntryIds = new Set<string>();

    // 4. Load Guest Notes
    const { data: notesData } = await supabase
        .from('shared_journal_entries')
        .select('*')
        .eq('session_id', id);

    if (notesData) {
        for (const note of notesData) {
            try {
                const decryptedContent = (await decryptData(note.encrypted_content, shareKey)) as string;
                // Find student
                const student = loadedStudents.find((s) => s.id === note.student_id);
                if (student) {
                    if (!student.journalEntries) student.journalEntries = [];
                    if (!student.journalEntries.some((e) => e.id === note.id)) {
                        student.journalEntries.push({
                            id: note.id,
                            content: decryptedContent,
                            date: note.created_at,
                            updatedAt: note.created_at
                        });
                    }
                }
            } catch (e) {
                console.error('Failed to decrypt note', e);
            }
        }
    }

    // Track original IDs to identify new ones later
    loadedStudents.forEach((s) => {
        (s.journalEntries || []).forEach((e) => originalEntryIds.add(e.id));
    });

    return {
        students: loadedStudents,
        recipientName,
        shareKey,
        originalEntryIds
    };
}

export async function saveGuestNote(
    sessionId: string,
    studentId: string,
    content: string,
    shareKey: CryptoKey,
    recipientName: string
): Promise<void> {
    const encryptedContent = await encryptData(content, shareKey);
    const { error } = await supabase.from('shared_journal_entries').insert({
        session_id: sessionId,
        student_id: studentId,
        encrypted_content: encryptedContent,
        author_name: recipientName // Stored in plain text for easy ID
    });

    if (error) throw error;
}
