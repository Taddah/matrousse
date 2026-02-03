import { supabase } from '$lib/supabase';
import { importRawKey, decryptData, encryptData, base64ToUint8Array } from '$lib/crypto';
import type { Student } from '$lib/types';

export interface SharedSessionData {
    students: Student[];
    recipientName: string;
    shareKey: CryptoKey;
    originalEntryIds: Set<string>;
}

/**
 * Loads a shared session and its notes.
 *
 * The process involves several steps:
 * 1. Encrypted Data Retrieval: The encrypted blob and shared notes are retrieved from the database.
 * 2. Key Import: The decryption key is extracted from the hash key.
 * 3. Decryption: The payload is decrypted using the share key.
 * 4. Notes Loading: Shared notes are loaded and decrypted.
 * 5. Data Return: The data is returned with the loaded notes.
 *
 * @param id - The unique identifier of the shared session.
 * @param hash - The base64 encoded string containing the decryption key.
 */
export async function loadSharedSession(id: string, hash: string): Promise<SharedSessionData> {
    if (!id || !hash) {
        throw new Error('Lien invalide (identifiant ou clé manquante).');
    }

    const { data: sessionData, error: fetchError } = await supabase
        .from('shared_sessions')
        .select('encrypted_blob, expires_at')
        .eq('id', id)
        .single();

    if (fetchError || !sessionData) {
        throw new Error('Ce lien est expiré ou introuvable.');
    }

    const rawKey = base64ToUint8Array(hash);
    const shareKey = await importRawKey(rawKey);

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

    const { data: notesData } = await supabase
        .from('shared_journal_entries')
        .select('*')
        .eq('session_id', id);

    if (notesData) {
        for (const note of notesData) {
            try {
                const decryptedContent = (await decryptData(note.encrypted_content, shareKey)) as string;
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
