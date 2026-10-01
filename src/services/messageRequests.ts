import AsyncStorage from "@react-native-async-storage/async-storage";

const OUTBOX_KEY = "catchya:outgoingMessageRequests";

export interface OutgoingMessageRequest {
  profileId: string;
  displayName: string;
  createdAt: string;
}

export async function createMessageRequest(profileId: string, displayName: string): Promise<boolean> {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  const requests: OutgoingMessageRequest[] = raw ? JSON.parse(raw) : [];
  if (requests.some((request) => request.profileId === profileId)) return false;
  requests.unshift({ profileId, displayName, createdAt: new Date().toISOString() });
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(requests));
  return true;
}
