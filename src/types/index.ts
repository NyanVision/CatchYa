export type SocialPlatform = "facebook" | "telegram" | "x" | "tiktok" | "instagram" | "line" | "whatsapp" | "wechat";

export interface SocialLink {
  platform: SocialPlatform;
  handle: string;
  hidden: boolean;
}

export interface CurrentUser {
  id: string;
  name: string;
  bio: string;
  photoUri: string | null;
  links: SocialLink[];
  discoveryEnabled: boolean;
}

export interface Person {
  id: string;
  name: string;
  initials: string;
  color: string;
  distanceLabel: string; // rounded, never exact — e.g. "~1.2 km away"
  bio: string;
  tags: string[];
  links: SocialLink[];
}

export interface MessageRequest {
  id: string;
  name: string;
  initials: string;
  color: string;
  preview: string;
  time: string;
}

export interface ChatMessage {
  id: string;
  from: "me" | "them";
  text: string;
  createdAt?: string;
}

export interface Chat {
  id: string;
  name: string;
  initials: string;
  color: string;
  unread: boolean;
  messages: ChatMessage[];
}

export type ContactPlatform = SocialPlatform;

export interface PublicContactLink {
  platform: ContactPlatform;
  value: string;
  visible: boolean;
}

export interface PublicProfile {
  id: string;
  displayName: string;
  photoUrl: string;
  distanceRange: string;
  contactLinks: PublicContactLink[];
  /** Present only when the profile owner explicitly chose to show their gender. */
  genderLabel?: string;
}

export type InboxStatus = "chat" | "request";

export interface InboxConversation {
  id: string;
  profileId: string;
  displayName: string;
  photoUri: string | null;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  status: InboxStatus;
  messages: ChatMessage[];
  firstMessage?: string;
  profilePreview?: { bio?: string; distanceRange?: string; interests?: string[] };
}
