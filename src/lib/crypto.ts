import { writable } from 'svelte/store';

export const encryptionKey = writable<CryptoKey | null>(null);

/**
 * Generates a random salt for key derivation.
 * @returns A 16-byte random salt as Uint8Array
 */
export function generateSalt(): Uint8Array<ArrayBuffer> {
	return window.crypto.getRandomValues(new Uint8Array(16));
}

/**
 * Encodes a buffer to Base64 string.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
	let binary = '';
	const bytes = new Uint8Array(buffer);
	const len = bytes.byteLength;
	for (let i = 0; i < len; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}

/**
 * Decodes a Base64 string to Uint8Array.
 */
export function base64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
	return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)) as Uint8Array<ArrayBuffer>;
}

/**
 * Derives a cryptographic key from the password and salt using PBKDF2.
 * @param password - The user's password
 * @param salt - The random salt (should be fetched from DB)
 * @returns A CryptoKey suitable for AES-GCM encryption/decryption
 */
export async function deriveKey(
	password: string,
	salt: Uint8Array<ArrayBuffer>
): Promise<CryptoKey> {
	const enc = new TextEncoder();
	const keyMaterial = await window.crypto.subtle.importKey(
		'raw',
		enc.encode(password),
		{ name: 'PBKDF2' },
		false,
		['deriveBits', 'deriveKey']
	);

	return window.crypto.subtle.deriveKey(
		{
			name: 'PBKDF2',
			salt: salt,
			iterations: 600000,
			hash: 'SHA-256'
		},
		keyMaterial,
		{ name: 'AES-GCM', length: 256 },
		true,
		['encrypt', 'decrypt']
	);
}

/**
 * Encrypts data using AES-GCM.
 * @param data - The data to encrypt (will be JSON stringified)
 * @param key - The derived CryptoKey
 * @returns A string containing the IV and the ciphertext, separated by a colon
 */
export async function encryptData(data: unknown, key: CryptoKey): Promise<string> {
	const enc = new TextEncoder();
	const encoded = enc.encode(JSON.stringify(data));

	const iv = window.crypto.getRandomValues(new Uint8Array(12));
	const ciphertext = await window.crypto.subtle.encrypt(
		{
			name: 'AES-GCM',
			iv: iv
		},
		key,
		encoded
	);

	const ivBase64 = arrayBufferToBase64(iv);
	const ciphertextBase64 = arrayBufferToBase64(ciphertext);

	return `${ivBase64}:${ciphertextBase64}`;
}

/**
 * Decrypts data using AES-GCM.
 * Optimized clean code version.
 * @param encryptedString - The string containing IV and ciphertext (format: "iv:ciphertext")
 * @param key - The derived CryptoKey
 * @returns The original data object
 */
export async function decryptData(encryptedString: string, key: CryptoKey): Promise<unknown> {
	const [ivBase64, ciphertextBase64] = encryptedString.split(':');

	if (!ivBase64 || !ciphertextBase64) throw new Error('Format invalide');

	const iv = base64ToUint8Array(ivBase64);
	const ciphertext = base64ToUint8Array(ciphertextBase64);

	try {
		const decrypted = await window.crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: iv },
			key,
			ciphertext
		);
		return JSON.parse(new TextDecoder().decode(decrypted));
	} catch {
		throw new Error('Échec du déchiffrement (clé erronée ?)');
	}
}
