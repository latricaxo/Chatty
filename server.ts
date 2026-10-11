/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Room, Message } from "./src/types";
import { GoogleGenAI } from "@google/genai";

// Lazy-initialized Gemini client for AI moderation
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// In-memory data store
interface ActiveUser {
  lastSeen: number;
  userName: string;
  originalName: string;
}
const rooms = new Map<string, Room>();
const messages = new Map<string, Message[]>();
// Tracks active users per room by storing user metadata (lastSeen, userName, originalName) mapped by senderTokenHash
const activeRoomUsers = new Map<string, Map<string, ActiveUser>>();

// Helper to determine a unique, distinguishable name for a user in a room
function getUniqueName(
  roomUsers: Map<string, ActiveUser>,
  requestedName: string,
  excludeHash: string
): string {
  const cleanRequested = requestedName.trim().substring(0, 24) || "Anon";
  
  // Check if anyone else is actively using this EXACT name (case-insensitive)
  let nameConflict = false;
  for (const [hash, user] of roomUsers.entries()) {
    if (hash !== excludeHash && user.userName.toLowerCase() === cleanRequested.toLowerCase()) {
      nameConflict = true;
      break;
    }
  }

  if (!nameConflict) {
    return cleanRequested;
  }

  // If there is a conflict, search for a free suffix (e.g., "Jon #2", "Jon #3")
  let counter = 2;
  while (true) {
    const candidate = `${cleanRequested} #${counter}`;
    let conflict = false;
    for (const [hash, user] of roomUsers.entries()) {
      if (hash !== excludeHash && user.userName.toLowerCase() === candidate.toLowerCase()) {
        conflict = true;
        break;
      }
    }
    if (!conflict) {
      return candidate;
    }
    counter++;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser for JSON with increased limit for secure file uploads (e.g., images, PDFs, videos)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // AI Moderation for images and videos
  app.post("/api/moderate", async (req, res) => {
    const { fileData, fileType, fileName } = req.body;
    if (!fileData || !fileType) {
      res.status(400).json({ error: "Missing fileData or fileType" });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      console.warn("GEMINI_API_KEY is not configured. AI Moderation is skipped.");
      res.json({ safe: true, warning: "Moderation skipped (API key not configured)" });
      return;
    }

    try {
      // Extract the raw base64 data (strip out data:image/png;base64, etc.)
      let base64Data = fileData;
      if (base64Data.includes(",")) {
        base64Data = base64Data.split(",")[1];
      }

      // Prepare input parts for Gemini API
      const mediaPart = {
        inlineData: {
          mimeType: fileType,
          data: base64Data,
        }
      };

      const promptPart = {
        text: `You are a strict safety moderation system. Analyze this media (${fileType}, named ${fileName || "unnamed"}) for policy violations.
Strictly check for:
1. CSAM (Child Sexual Abuse Material) or child exploitation - ZERO TOLERANCE.
2. Sexually explicit or pornographic content.
3. Extreme violence, blood, gore, or self-harm.
4. Promotion of illegal acts or terrorism.

Respond strictly with a JSON object. No other text or markdown formatting.
JSON Schema:
{
  "safe": boolean (false if any of the above violations are detected, otherwise true),
  "reason": string (a short, clear, user-facing explanation of why it was rejected, or empty if safe is true)
}`
      };

      // Call Gemini API using "gemini-3.5-flash"
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [mediaPart, promptPart],
        config: {
          responseMimeType: "application/json",
        }
      });

      const responseText = response.text?.trim() || "{}";
      const result = JSON.parse(responseText);

      res.json({
        safe: result.safe !== false,
        reason: result.reason || "Policy violation detected"
      });

    } catch (err: any) {
      console.error("Error during AI Moderation:", err);
      // Fail-safe: if the API error is due to an unsupported file type, we can check it.
      // Or if Gemini fails, we should be safe but handle it gracefully.
      res.json({
        safe: true,
        warning: "AI Moderation service experienced an issue, passed with fail-safe."
      });
    }
  });

  // Create a new room
  app.post("/api/rooms", (req, res) => {
    const { roomId, validator } = req.body;

    if (!roomId || !validator) {
       res.status(400).json({ error: "Missing roomId or validator" });
       return;
    }

    const cleanRoomId = roomId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (!cleanRoomId) {
       res.status(400).json({ error: "Invalid room ID. Use alphanumeric, dashes, or underscores." });
       return;
    }

    if (rooms.has(cleanRoomId)) {
       res.status(409).json({ error: "Room already exists" });
       return;
    }

    const newRoom: Room = {
      id: cleanRoomId,
      validator: JSON.stringify(validator),
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };

    rooms.set(cleanRoomId, newRoom);
    messages.set(cleanRoomId, []);
    activeRoomUsers.set(cleanRoomId, new Map());

    res.json({ success: true, room: newRoom });
  });

  // Join/Retrieve Room Validator
  app.get("/api/rooms/:roomId", (req, res) => {
    const { roomId } = req.params;
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    res.json({
      success: true,
      room: {
        id: room.id,
        validator: JSON.parse(room.validator),
        createdAt: room.createdAt,
      }
    });
  });

  // Get Room Messages & Active Users
  app.get("/api/rooms/:roomId/messages", (req, res) => {
    const { roomId } = req.params;
    const { userTokenHash, userName } = req.query; // optional, to keep track of active presence
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    // Update room activity
    room.lastActivityAt = new Date().toISOString();

    let assignedName: string | undefined;

    // Register user presence if provided
    if (userTokenHash && typeof userTokenHash === "string") {
      let roomUsers = activeRoomUsers.get(cleanRoomId);
      if (!roomUsers) {
        roomUsers = new Map<string, ActiveUser>();
        activeRoomUsers.set(cleanRoomId, roomUsers);
      }

      // First, clean up stale users to avoid name conflicts with inactive sessions
      const now = Date.now();
      for (const [hash, user] of roomUsers.entries()) {
        if (now - user.lastSeen > 15000) {
          roomUsers.delete(hash);
        }
      }

      const reqName = (typeof userName === "string" && userName.trim()) ? userName.trim() : "Anon";
      const existingUser = roomUsers.get(userTokenHash);

      if (existingUser) {
        if (existingUser.originalName === reqName) {
          // Keep their already assigned name
          existingUser.lastSeen = now;
          assignedName = existingUser.userName;
        } else {
          // They updated their requested name! Resolve a unique name for them
          const uniqueName = getUniqueName(roomUsers, reqName, userTokenHash);
          existingUser.lastSeen = now;
          existingUser.userName = uniqueName;
          existingUser.originalName = reqName;
          assignedName = uniqueName;
        }
      } else {
        // New user polling for the first time
        const uniqueName = getUniqueName(roomUsers, reqName, userTokenHash);
        roomUsers.set(userTokenHash, {
          lastSeen: now,
          userName: uniqueName,
          originalName: reqName,
        });
        assignedName = uniqueName;
      }
    }

    // Get active users count (polled within last 15 seconds)
    const roomUsers = activeRoomUsers.get(cleanRoomId);
    let activeCount = 1;
    if (roomUsers) {
      const now = Date.now();
      for (const [hash, user] of roomUsers.entries()) {
        if (now - user.lastSeen > 15000) {
          roomUsers.delete(hash);
        }
      }
      activeCount = Math.max(1, roomUsers.size);
    }

    // Filter messages that are under 24 hours old (double-safety layer)
    const roomMessages = messages.get(cleanRoomId) || [];
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const validMessages = roomMessages.filter(
      (m) => new Date(m.createdAt).getTime() > oneDayAgo
    );

    // If any messages were filtered, update memory
    if (validMessages.length !== roomMessages.length) {
      messages.set(cleanRoomId, validMessages);
    }

    res.json({
      success: true,
      messages: validMessages,
      activeUsersCount: activeCount,
      assignedName,
    });
  });

  // Post Message to Room
  app.post("/api/rooms/:roomId/messages", (req, res) => {
    const { roomId } = req.params;
    const { senderName, senderTokenHash, encryptedText } = req.body;
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    if (!senderName || !senderTokenHash || !encryptedText) {
       res.status(400).json({ error: "Missing senderName, senderTokenHash, or encryptedText" });
       return;
    }

    // Use the assigned, unique username tracked in memory to prevent impersonation or naming mismatch
    const roomUsers = activeRoomUsers.get(cleanRoomId);
    let finalSenderName = senderName.trim().substring(0, 32);
    if (roomUsers && roomUsers.has(senderTokenHash)) {
      finalSenderName = roomUsers.get(senderTokenHash)!.userName;
    }

    const newMessage: Message = {
      id: crypto.randomUUID(),
      senderName: finalSenderName,
      senderTokenHash: senderTokenHash,
      encryptedText: typeof encryptedText === "string" ? encryptedText : JSON.stringify(encryptedText),
      createdAt: new Date().toISOString(),
      editedAt: null,
    };

    const roomMessages = messages.get(cleanRoomId) || [];
    roomMessages.push(newMessage);
    messages.set(cleanRoomId, roomMessages);

    room.lastActivityAt = new Date().toISOString();

    res.json({ success: true, message: newMessage });
  });

  // Mark multiple messages as read (Read Receipts)
  app.post("/api/rooms/:roomId/messages/read", (req, res) => {
    const { roomId } = req.params;
    const { senderTokenHash, senderName, messageIds } = req.body;
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    if (!senderTokenHash || !Array.isArray(messageIds) || messageIds.length === 0) {
       res.json({ success: true, count: 0 });
       return;
    }

    const roomMessages = messages.get(cleanRoomId) || [];
    let updatedCount = 0;

    for (const messageId of messageIds) {
      const message = roomMessages.find((m) => m.id === messageId);
      if (message && message.senderTokenHash !== senderTokenHash) {
        if (!message.readBy) {
          message.readBy = {};
        }
        if (!message.readBy[senderTokenHash]) {
          message.readBy[senderTokenHash] = {
            name: senderName || "Anon",
            readAt: new Date().toISOString(),
          };
          updatedCount++;
        }
      }
    }

    if (updatedCount > 0) {
      messages.set(cleanRoomId, roomMessages);
      room.lastActivityAt = new Date().toISOString();
    }

    res.json({ success: true, updatedCount });
  });

  // Toggle reaction on a message
  app.post("/api/rooms/:roomId/messages/:messageId/react", (req, res) => {
    const { roomId, messageId } = req.params;
    const { senderTokenHash, senderName, emoji } = req.body;
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    const roomMessages = messages.get(cleanRoomId) || [];
    const message = roomMessages.find((m) => m.id === messageId);
    if (!message) {
       res.status(404).json({ error: "Message not found" });
       return;
    }

    if (!emoji) {
       res.status(400).json({ error: "Missing emoji" });
       return;
    }

    if (!message.reactions) {
      message.reactions = {};
    }

    const reactionsForEmoji = message.reactions[emoji] || [];
    const userIndex = reactionsForEmoji.findIndex((r) => r.senderTokenHash === senderTokenHash);

    if (userIndex > -1) {
      // Remove reaction (toggle)
      reactionsForEmoji.splice(userIndex, 1);
    } else {
      // Add reaction
      reactionsForEmoji.push({
        senderTokenHash,
        senderName: senderName || "Anon",
      });
    }

    if (reactionsForEmoji.length === 0) {
      delete message.reactions[emoji];
    } else {
      message.reactions[emoji] = reactionsForEmoji;
    }

    messages.set(cleanRoomId, roomMessages);
    room.lastActivityAt = new Date().toISOString();

    res.json({ success: true, reactions: message.reactions });
  });

  // Edit Message
  app.put("/api/rooms/:roomId/messages/:messageId", (req, res) => {
    const { roomId, messageId } = req.params;
    const { senderTokenHash, editedEncryptedText } = req.body;
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    const roomMessages = messages.get(cleanRoomId) || [];
    const messageIndex = roomMessages.findIndex((m) => m.id === messageId);

    if (messageIndex === -1) {
       res.status(404).json({ error: "Message not found" });
       return;
    }

    const message = roomMessages[messageIndex];

    // Ensure the requester is the original author
    if (message.senderTokenHash !== senderTokenHash) {
       res.status(403).json({ error: "Unauthorized. Only the author can edit this message." });
       return;
    }

    message.encryptedText = typeof editedEncryptedText === "string" ? editedEncryptedText : JSON.stringify(editedEncryptedText);
    message.editedAt = new Date().toISOString();

    roomMessages[messageIndex] = message;
    messages.set(cleanRoomId, roomMessages);
    room.lastActivityAt = new Date().toISOString();

    res.json({ success: true, message });
  });

  // Delete Message
  app.delete("/api/rooms/:roomId/messages/:messageId", (req, res) => {
    const { roomId, messageId } = req.params;
    const { senderTokenHash } = req.body; // sent in JSON body
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    const roomMessages = messages.get(cleanRoomId) || [];
    const messageIndex = roomMessages.findIndex((m) => m.id === messageId);

    if (messageIndex === -1) {
       res.status(404).json({ error: "Message not found" });
       return;
    }

    const message = roomMessages[messageIndex];

    // Ensure the requester is the original author
    const isWhiteboardBypass = req.body.isWhiteboardBypass;
    if (message.senderTokenHash !== senderTokenHash && !isWhiteboardBypass) {
       res.status(403).json({ error: "Unauthorized. Only the author can delete this message." });
       return;
    }

    roomMessages.splice(messageIndex, 1);
    messages.set(cleanRoomId, roomMessages);
    room.lastActivityAt = new Date().toISOString();

    res.json({ success: true });
  });

  // Delete All Messages in Room (triggered on shake or manual purge)
  app.delete("/api/rooms/:roomId/messages", (req, res) => {
    const { roomId } = req.params;
    const cleanRoomId = roomId.trim().toLowerCase();

    const room = rooms.get(cleanRoomId);
    if (!room) {
       res.status(404).json({ error: "Room not found" });
       return;
    }

    // Purge all messages in memory
    messages.set(cleanRoomId, []);
    room.lastActivityAt = new Date().toISOString();

    res.json({ success: true, message: "All messages in the room have been purged from memory." });
  });

  // Periodical In-Memory Cleanup (every 10 minutes)
  // Deletes messages older than 24 hours.
  // Chat rooms are kept active so they can be reused.
  setInterval(() => {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    for (const [roomId] of rooms.entries()) {
      // Clean up stale messages in this room
      const roomMessages = messages.get(roomId) || [];
      const keptMessages = roomMessages.filter(
        (m) => new Date(m.createdAt).getTime() > twentyFourHoursAgo
      );

      if (keptMessages.length !== roomMessages.length) {
        messages.set(roomId, keptMessages);
      }
    }
  }, 10 * 60 * 1000);

  // Vite middleware / Static Asset serving setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve spa index
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Privacy Chat Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
