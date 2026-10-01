import type { PublicProfile } from "@/types";
import type { MeetingOption } from "@/services/aboutYouPreferences";

export type DistanceRange = "Within 1 km" | "1–3 km" | "3–5 km" | "5+ km";

export interface NearbyProfile extends PublicProfile {
  distanceRange: DistanceRange;
  interests: string[];
  discoverable: boolean;
  /** Backend-computed for the signed-in user's private audience choices; never shown publicly. */
  audienceMatch?: boolean;
}

// Connected to the app UI now; replace this empty result with profiles fetched
// from a backend that returns only people who explicitly opted in.
export const nearbyProfiles: NearbyProfile[] = [];

export function getDiscoverableProfiles(profiles: NearbyProfile[]) {
  return profiles.filter((profile) => profile.discoverable);
}

export function filterProfilesByAudience(profiles: NearbyProfile[], preferences: MeetingOption[]) {
  if (preferences.length === 0 || preferences.includes("Everyone")) return profiles;
  return profiles.filter((profile) => profile.audienceMatch === true);
}
