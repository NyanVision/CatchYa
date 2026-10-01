import AsyncStorage from "@react-native-async-storage/async-storage";

export type VisibilityDuration = "15 minutes" | "1 hour" | "Until turned off";

export interface DiscoveryPreferences {
  enabled: boolean;
  duration: VisibilityDuration;
  expiresAt: number | null;
}

const DURATIONS: VisibilityDuration[] = ["15 minutes", "1 hour", "Until turned off"];

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
  const expired = !!saved.enabled && expiresAt !== null && expiresAt <= Date.now();
  const preferences: DiscoveryPreferences = {
    enabled: saved.enabled === true && !expired,
    duration,
    expiresAt: saved.enabled === true && !expired ? expiresAt : null,
  };
  if (expired) await AsyncStorage.setItem(keyFor(userId), JSON.stringify(preferences));
  return preferences;
}

export async function saveDiscoveryPreferences(
  userId: string | null,
  enabled: boolean,
  duration: VisibilityDuration,
): Promise<DiscoveryPreferences> {
  const expiresAt = enabled && duration !== "Until turned off"
    ? Date.now() + (duration === "15 minutes" ? 15 : 60) * 60 * 1000
    : null;
  const preferences = { enabled, duration, expiresAt };
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify(preferences));
  return preferences;
}
