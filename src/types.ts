/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface EncryptedPayload {
  iv: string; // Hex or Base64 encoded initialization vector
  ciphertext: string; // Hex or Base64 encoded encrypted text
}

export interface Message {
  id: string;
  senderName: string; // Plaintext or encrypted anonymous sender display name
  senderTokenHash: string; // Cryptographic hash of client-side secret token to verify authorship
  encryptedText: string; // Stringified EncryptedPayload containing the message body
  createdAt: string; // ISO timestamp
  editedAt: string | null; // ISO timestamp
  readBy?: { [senderTokenHash: string]: { name: string; readAt: string } };
  reactions?: { [emoji: string]: { senderTokenHash: string; senderName: string }[] };
}

export interface Room {
  id: string;
  validator: string; // Stringified EncryptedPayload of a known salt (e.g. "privacy-chat-v1")
  createdAt: string; // ISO timestamp
  lastActivityAt: string; // ISO timestamp for cleanup triggers
}

export interface RoomSession {
  roomId: string;
  anonymousName: string;
  senderToken: string; // Client-side unique string to prove identity for edits/deletes
}

export interface RoomStatus {
  activeUsersCount: number;
}
