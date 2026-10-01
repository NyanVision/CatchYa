import AsyncStorage from "@react-native-async-storage/async-storage";

export type VisibilityDuration = "15 minutes" | "30 minutes" | "1 hour";

export interface DiscoveryPreferences {
  enabled: boolean;
  duration: VisibilityDuration;
  expiresAt: number | null;
}

const DURATIONS: VisibilityDuration[] = ["15 minutes", "30 minutes", "1 hour"];

function keyFor(userId: string | null) {
  return `catchya:discovery:${userId ?? "local"}`;
}

export function defaultDiscoveryPreferences(): DiscoveryPreferences {
  return { enabled: false, duration: "15 minutes", expiresAt: null };
}

export async function loadDiscoveryPreferences(userId: string | null): Promise<DiscoveryPreferences> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return defaultDiscoveryPreferences();
  const saved = JSON.parse(raw) as Partial<DiscoveryPreferences>;
  const duration = DURATIONS.includes(saved.duration as VisibilityDuration) ? saved.duration as VisibilityDuration : "15 minutes";
  const expiresAt = typeof saved.expiresAt === "number" ? saved.expiresAt : null;
  // Discovery is always time limited. Turn off legacy indefinite/corrupt sessions.
  const expired = saved.enabled === true && (expiresAt === null || expiresAt <= Date.now());
  const preferences: DiscoveryPreferences = {
    enabled: saved.enabled === true && !expired,
    duration,
    expiresAt: saved.enabled === true && !expired ? expiresAt : null,
  };
  if (expired || (saved.enabled === true && !DURATIONS.includes(saved.duration as VisibilityDuration))) {
    await AsyncStorage.setItem(keyFor(userId), JSON.stringify(preferences));
  }
  return preferences;
}

export async function saveDiscoveryPreferences(
  userId: string | null,
  enabled: boolean,
  duration: VisibilityDuration,
): Promise<DiscoveryPreferences> {
  const durationMinutes = duration === "15 minutes" ? 15 : duration === "30 minutes" ? 30 : 60;
  const expiresAt = enabled
    ? Date.now() + durationMinutes * 60 * 1000
    : null;
  const preferences = { enabled, duration, expiresAt };
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(preferences));
  return preferences;
}
