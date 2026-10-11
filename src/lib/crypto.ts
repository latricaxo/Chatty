/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EncryptedPayload } from "../types";

/**
 * Derives a cryptographic key from a password using SHA-256.
 * The derived key is suitable for AES-GCM encryption.
 */
export async function deriveKeyFromPassword(password: string, salt: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  // Mix password with a salt to avoid rainbow table attacks on weak passwords
  const keyMaterial = encoder.encode(password + "::" + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", keyMaterial);
  
  return crypto.subtle.importKey(
    "raw",
    hashBuffer,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Converts a Uint8Array to a Base64 string in a stack-safe, chunked manner.
 * This prevents Maximum Call Stack Exceeded errors when processing large file bytes.
 */
export function uint8ArrayToBase64(arr: Uint8Array): string {
  const chunks: string[] = [];
  const chunkSize = 8192;
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.subarray(i, i + chunkSize);
    const numbers = Array.from(chunk);
    chunks.push(String.fromCharCode.apply(null, numbers));
  }
  return btoa(chunks.join(""));
}

/**
 * Converts a Base64 string back to a Uint8Array in an efficient, stack-safe manner.
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encrypts cleartext using an AES-GCM CryptoKey.
 * Returns an EncryptedPayload with Base64 encoded IV and ciphertext.
 */
export async function encryptText(text: string, key: CryptoKey): Promise<EncryptedPayload> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12-byte IV for AES-GCM
  
  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    encoder.encode(text)
  );

  // Convert to Base64 strings safely
  const ivBase64 = uint8ArrayToBase64(iv);
  const ciphertextBase64 = uint8ArrayToBase64(new Uint8Array(encrypted));

  return {
    iv: ivBase64,
    ciphertext: ciphertextBase64,
  };
}

/**
 * Decrypts an EncryptedPayload using an AES-GCM CryptoKey.
 * Returns the cleartext.
 */
export async function decryptText(payload: EncryptedPayload, key: CryptoKey): Promise<string> {
  const decoder = new TextDecoder();
  
  const iv = base64ToUint8Array(payload.iv);
  const ciphertext = base64ToUint8Array(payload.ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    key,
    ciphertext
  );

  return decoder.decode(decrypted);
}

/**
 * Computes a secure SHA-256 hash of a string.
 * Used for creating sender tokens that prove authorship without exposing the token itself.
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(str));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Generates a verification block.
 * When a room is created, the client encrypts a standard phrase ("privacy-chat-v1").
 * When a guest joins, they must encrypt the same phrase with their candidate password.
 * If the resulting ciphertext can be decrypted or if their validator is accepted, the server can confirm access.
 * To avoid exposing plaintext keys, we verify access on the server by letting the client supply a signed payload
 * or we can perform verification purely by checking if the client can successfully decrypt the room's stored validator.
 */
export const VALIDATOR_PHRASE = "privacy-chat-validator-token-v1";
