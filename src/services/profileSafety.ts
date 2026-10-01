import AsyncStorage from "@react-native-async-storage/async-storage";

const BLOCKED_KEY = "catchya:blockedProfiles";
const REPORTS_KEY = "catchya:profileReports";

export interface BlockedProfile {
  profileId: string;
  displayName: string;
}

export async function isProfileBlocked(profileId: string): Promise<boolean> {
  return (await loadBlockedProfiles()).some((profile) => profile.profileId === profileId);
}

export async function loadBlockedProfiles(): Promise<BlockedProfile[]> {
  const raw = await AsyncStorage.getItem(BLOCKED_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) return [];
  return parsed.flatMap((entry): BlockedProfile[] => {
    if (typeof entry === "string") return [{ profileId: entry, displayName: "Blocked account" }];
    if (!entry || typeof entry !== "object") return [];
    const value = entry as Partial<BlockedProfile>;
    return typeof value.profileId === "string"
      ? [{ profileId: value.profileId, displayName: typeof value.displayName === "string" && value.displayName ? value.displayName : "Blocked account" }]
      : [];
  });
}

export async function setProfileBlocked(profileId: string, blocked: boolean, displayName = "Blocked account"): Promise<void> {
  const profiles = await loadBlockedProfiles();
  const next = blocked
    ? [{ profileId, displayName }, ...profiles.filter((profile) => profile.profileId !== profileId)]
    : profiles.filter((profile) => profile.profileId !== profileId);
  await AsyncStorage.setItem(BLOCKED_KEY, JSON.stringify(next));
}

export async function recordProfileReport(profileId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(REPORTS_KEY);
  const reports: Array<{ profileId: string; createdAt: string }> = raw ? JSON.parse(raw) : [];
  reports.unshift({ profileId, createdAt: new Date().toISOString() });
  await AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
}
