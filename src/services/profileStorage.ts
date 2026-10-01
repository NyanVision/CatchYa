import AsyncStorage from "@react-native-async-storage/async-storage";
import type { CurrentUser, SocialPlatform } from "@/types";

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  "facebook", "telegram", "x", "tiktok", "instagram", "line", "whatsapp", "wechat",
];

function storageKey(userId: string | null) {
  return `catchya:profile:${userId ?? "local"}`;
}

export function emptyProfile(userId: string | null): CurrentUser {
  return {
    id: userId ?? "",
    name: "",
    bio: "",
    photoUri: null,
    links: SOCIAL_PLATFORMS.map((platform) => ({ platform, handle: "", hidden: true })),
    discoveryEnabled: false,
  };
}

export async function loadProfile(userId: string | null): Promise<CurrentUser> {
  const raw = await AsyncStorage.getItem(storageKey(userId));
  if (!raw) return emptyProfile(userId);
  const saved = JSON.parse(raw) as Partial<CurrentUser>;
  const savedLinks = Array.isArray(saved.links) ? saved.links : [];
  const links = SOCIAL_PLATFORMS.map((platform) => {
    const entry = savedLinks.find((link) => link.platform === platform);
    const handle = typeof entry?.handle === "string" ? entry.handle : "";
    return { platform, handle, hidden: handle.trim() ? entry?.hidden !== false : true };
  });
  return {
    ...emptyProfile(userId),
    ...saved,
    id: userId ?? "",
    name: typeof saved.name === "string" ? saved.name : "",
    bio: typeof saved.bio === "string" ? saved.bio : "",
    photoUri: typeof saved.photoUri === "string" ? saved.photoUri : null,
    links,
  };
}

export async function saveProfile(profile: CurrentUser): Promise<void> {
  const links = SOCIAL_PLATFORMS.map((platform) => {
    const entry = profile.links.find((link) => link.platform === platform);
    const handle = entry?.handle?.trim() ?? "";
    return { platform, handle, hidden: handle.length === 0 || entry?.hidden !== false };
  });
  await AsyncStorage.setItem(storageKey(profile.id || null), JSON.stringify({ ...profile, links }));
}
