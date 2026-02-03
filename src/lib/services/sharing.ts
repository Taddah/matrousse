import {
    arrayBufferToBase64,
    base64ToUint8Array,
    decryptData,
    encryptData,
    importRawKey
} from '$lib/crypto';
import { supabase } from '$lib/supabase';
import type { Student } from '$lib/types';

/**
 * Enriches a list of students with their guest notes (shared journal entries).
 * This ensures that the snapshot includes everything the owner currently sees.
 */
export async function enrichStudentsWithGuestNotes(
    students: Student[],
    masterKey: CryptoKey
): Promise<Student[]> {
    // Deep copy to avoid mutating original state
    const studentsToShare = JSON.parse(JSON.stringify(students)) as Student[];
    const studentIds = studentsToShare.map((s) => s.id);

    const { data: guestNotes } = await supabase
        .from('shared_journal_entries')
        .select(
            `
            *,
            shared_sessions (
                owner_recovery_token
            )
        `
        )
        .in('student_id', studentIds);

    if (!guestNotes || guestNotes.length === 0) {
        return studentsToShare;
    }

    const sessionKeys = new Map<string, CryptoKey>();

    for (const note of guestNotes) {
        try {
            // @ts-ignore - Supabase type reference
            const session = note.shared_sessions;
            if (!session?.owner_recovery_token) continue;

            let noteKey = sessionKeys.get(session.owner_recovery_token);
            if (!noteKey) {
                const recovered = (await decryptData(session.owner_recovery_token, masterKey)) as {
                    key: string;
                };
                if (recovered?.key) {
                    const rawNoteKey = base64ToUint8Array(recovered.key);
                    noteKey = await importRawKey(rawNoteKey);
                    sessionKeys.set(session.owner_recovery_token, noteKey);
                }
            }

            if (noteKey) {
                const content = (await decryptData(note.encrypted_content, noteKey)) as string;
                const student = studentsToShare.find((s) => s.id === note.student_id);
                if (student) {
                    if (!student.journalEntries) student.journalEntries = [];
                    student.journalEntries.push({
                        id: note.id,
                        content,
                        date: note.created_at,
                        updatedAt: note.created_at
                    });
                }
            }
        } catch (e) {
            console.warn('Skipping unrecoverable guest note', e);
        }
    }

    return studentsToShare;
}

export interface SharePayloadResult {
    rawKey: Uint8Array;
    encryptedBlob: string;
    ownerRecoveryToken: string | null;
}

/**
 * Prepares the encrypted payload for sharing.
 * Generates a fresh key, encrypts the data, and prepares the recovery token.
 */
export async function generateSecureSharePayload(
    data: unknown,
    masterKey: CryptoKey | null,
    type: 'student_share' | 'parent_share' = 'student_share',
    recipientName: string
): Promise<SharePayloadResult> {
    // 1. Generate a fresh random key for this share session
    const rawKey = window.crypto.getRandomValues(new Uint8Array(32));
    const shareKey = await importRawKey(rawKey);

    const payload = {
        type,
        data,
        source: 'Matrousse',
        timestamp: Date.now(),
        recipientName
    };

    // 2. Encrypt payload with Share Key
    const encryptedBlob = await encryptData(payload, shareKey);

    // 3. Encrypt Share Key with Owner's Master Key (Recovery Token)
    let ownerRecoveryToken = null;
    // If no master key (e.g. self-destruct mode or specific use case), we can't recover.
    if (masterKey) {
        const rawKeyBase64 = arrayBufferToBase64(rawKey);
        ownerRecoveryToken = await encryptData({ key: rawKeyBase64 }, masterKey);
    }

    return {
        rawKey,
        encryptedBlob,
        ownerRecoveryToken
    };
}
