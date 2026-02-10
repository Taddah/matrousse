import { decryptData, importRawKey, base64ToUint8Array } from '$lib/crypto';
import type { Student, JournalEntry } from '$lib/types';
import { SvelteMap } from 'svelte/reactivity';

export async function loadStudentData(
    studentData: any,
    guestNotes: any[],
    masterKey: CryptoKey
): Promise<Student | null> {
    if (!masterKey || !studentData) return null;

    try {
        // 1. Decrypt main student data
        const decrypted = await decryptData(studentData.encrypted_data, masterKey);
        const decryptedData = decrypted as Omit<Student, 'id'>;

        let journalEntries = decryptedData.journalEntries || [];

        // 2. Process guest notes if any
        if (guestNotes && guestNotes.length > 0) {
            const sessionKeys = new SvelteMap<string, CryptoKey>();

            for (const note of guestNotes) {
                try {
                    const session = note.shared_sessions;
                    if (!session?.owner_recovery_token) continue;

                    let shareKey = sessionKeys.get(session.owner_recovery_token);
                    if (!shareKey) {
                        // Decrypt the recovery token with Master Key
                        const recovered = (await decryptData(session.owner_recovery_token, masterKey)) as {
                            key: string;
                        };
                        if (recovered?.key) {
                            const rawKey = base64ToUint8Array(recovered.key);
                            shareKey = await importRawKey(rawKey);
                            sessionKeys.set(session.owner_recovery_token, shareKey);
                        }
                    }

                    if (shareKey) {
                        // Decrypt the note content with Share Key
                        const content = (await decryptData(note.encrypted_content, shareKey)) as string;

                        if (!journalEntries.some((e) => e.id === note.id)) {
                            journalEntries.push({
                                id: note.id,
                                content,
                                date: note.created_at,
                                updatedAt: note.created_at
                            });
                        }
                    }
                } catch (e) {
                    console.error('Failed to recover guest note', e);
                }
            }
        }

        // 3. Deduplicate
        const uniqueEntries = new SvelteMap<string, JournalEntry>();
        journalEntries.forEach((e) => uniqueEntries.set(e.id, e));
        journalEntries = Array.from(uniqueEntries.values());

        return {
            id: studentData.id,
            ...decryptedData,
            generalInfo: decryptedData.generalInfo || '',
            journalEntries
        };
    } catch (e) {
        console.error('Decryption failed', e);
        return null;
    }
}
