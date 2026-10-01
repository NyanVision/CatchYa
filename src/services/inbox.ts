import AsyncStorage from "@react-native-async-storage/async-storage";
import type { InboxConversation, InboxStatus } from "@/types";

const INBOX_KEY = "catchya:inboxConversations";

export async function loadInbox(): Promise<InboxConversation[]> {
  const raw = await AsyncStorage.getItem(INBOX_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isConversation);
}

export async function loadInboxByStatus(status: InboxStatus): Promise<InboxConversation[]> {
  return (await loadInbox()).filter((conversation) => conversation.status === status);
}

export async function acceptInboxRequest(id: string): Promise<boolean> {
  const conversations = await loadInbox();
  const request = conversations.find((item) => item.id === id && item.status === "request");
  if (!request) return false;
  const initialMessage = request.firstMessage?.trim() || request.messages[0]?.text || request.lastMessage?.trim() || "";
  const messages = request.messages.length || !initialMessage
    ? request.messages
    : [{ id: `${id}-first`, from: "them" as const, text: initialMessage }];
  await storeInbox(conversations.map((item) => item.id === id ? {
    ...item,
    status: "chat" as const,
    unreadCount: 0,
    messages,
    lastMessage: item.lastMessage || initialMessage,
  } : item));
  return true;
}

export async function declineInboxRequest(id: string): Promise<void> {
  const conversations = await loadInbox();
  await storeInbox(conversations.filter((item) => item.id !== id));
}

export async function removeInboxConversation(id: string): Promise<void> {
  const conversations = await loadInbox();
  await storeInbox(conversations.filter((item) => item.id !== id));
}

export async function markInboxConversationRead(id: string): Promise<void> {
  const conversations = await loadInbox();
  await storeInbox(conversations.map((item) => item.id === id ? { ...item, unreadCount: 0 } : item));
}

export async function appendInboxMessage(id: string, text: string): Promise<InboxConversation["messages"][number] | false> {
  const conversations = await loadInbox();
  const chat = conversations.find((item) => item.id === id);
  if (!chat || chat.status !== "chat") return false;
  const now = new Date().toISOString();
  const message = { id: `${id}-${Date.now()}`, from: "me" as const, text, createdAt: now };
  await storeInbox(conversations.map((item) => item.id === id ? {
    ...item,
    lastMessage: text,
    updatedAt: now,
    unreadCount: 0,
    messages: [...item.messages, message],
  } : item));
  return message;
}

export async function storeInbox(conversations: InboxConversation[]): Promise<void> {
  await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(conversations));
}

function isConversation(value: unknown): value is InboxConversation {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<InboxConversation>;
  return typeof item.id === "string"
    && typeof item.profileId === "string"
    && typeof item.displayName === "string"
    && (item.status === "chat" || item.status === "request")
    && typeof item.lastMessage === "string"
    && typeof item.updatedAt === "string"
    && Array.isArray(item.messages);
}
