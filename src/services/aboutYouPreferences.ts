import AsyncStorage from "@react-native-async-storage/async-storage";

export type GenderOption = "Woman" | "Man" | "Non-binary" | "Self-describe" | "Prefer not to say";
export type MeetingOption = "Women" | "Men" | "Non-binary people" | "Everyone";

export interface AboutYouPreferences {
  gender: GenderOption | null;
  genderDescription: string;
  showGenderOnProfile: boolean;
  meeting: MeetingOption[];
}

const GENDERS: GenderOption[] = ["Woman", "Man", "Non-binary", "Self-describe", "Prefer not to say"];
const MEETING_OPTIONS: MeetingOption[] = ["Women", "Men", "Non-binary people", "Everyone"];

function keyFor(userId: string | null) {
  return `catchya:aboutYou:${userId ?? "local"}`;
}

export function emptyAboutYouPreferences(): AboutYouPreferences {
  return { gender: null, genderDescription: "", showGenderOnProfile: false, meeting: [] };
}

export async function loadAboutYouPreferences(userId: string | null): Promise<AboutYouPreferences> {
  const raw = await AsyncStorage.getItem(keyFor(userId));
  if (!raw) return emptyAboutYouPreferences();
  const saved = JSON.parse(raw) as Partial<AboutYouPreferences>;
  const gender = GENDERS.includes(saved.gender as GenderOption) ? saved.gender as GenderOption : null;
  const meeting = Array.isArray(saved.meeting)
    ? MEETING_OPTIONS.filter((option) => saved.meeting?.includes(option))
    : [];
  const genderDescription = typeof saved.genderDescription === "string" ? saved.genderDescription.trim().slice(0, 48) : "";
  const showGenderOnProfile = saved.showGenderOnProfile === true
    && gender !== null
    && gender !== "Prefer not to say"
    && (gender !== "Self-describe" || genderDescription.length > 0);
  return { gender, genderDescription, showGenderOnProfile, meeting };
}

export async function saveAboutYouPreferences(userId: string | null, value: AboutYouPreferences): Promise<void> {
  const gender = GENDERS.includes(value.gender as GenderOption) ? value.gender : null;
  const meeting = MEETING_OPTIONS.filter((option) => value.meeting.includes(option));
  const genderDescription = value.gender === "Self-describe" ? value.genderDescription.trim().slice(0, 48) : "";
  const showGenderOnProfile = value.showGenderOnProfile
    && gender !== null
    && gender !== "Prefer not to say"
    && (gender !== "Self-describe" || genderDescription.length > 0);
  await AsyncStorage.setItem(keyFor(userId), JSON.stringify({ gender, genderDescription, showGenderOnProfile, meeting }));
}

export function visibleGenderLabel(value: AboutYouPreferences): string | null {
  if (!value.showGenderOnProfile || !value.gender || value.gender === "Prefer not to say") return null;
  return value.gender === "Self-describe" ? value.genderDescription.trim() || null : value.gender;
}
