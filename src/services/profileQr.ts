import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

const PROFILE_QR_KEY = "catchya:publicProfileCode";

// Keep the QR token opaque: it must never contain an email, phone number, or coordinates.
export async function getProfileQrPayload(): Promise<string> {
  let profileCode = await AsyncStorage.getItem(PROFILE_QR_KEY);
  if (!profileCode) {
    profileCode = Crypto.randomUUID();
    await AsyncStorage.setItem(PROFILE_QR_KEY, profileCode);
  }
  return `catchya://profile/${profileCode}`;
}

export function getProfileCodeFromQr(value: string): string | null {
  const match = value.match(/^catchya:\/\/profile\/([0-9a-f-]{36})$/i);
  return match?.[1] ?? null;
}
