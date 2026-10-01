import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

/**
 * Device-only credentials for UI testing. This is not production authentication:
 * accounts are stored in AsyncStorage and are not verified by a server.
 */
const STORAGE_KEY = "catchya:localTestAccounts";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
interface LocalTestAccount { email: string; userId: string; salt: string; passwordHash: string; }

function normalizeEmail(email: string) { return email.trim().toLowerCase(); }
function randomSalt() {
  return Array.from(Crypto.getRandomBytes(16), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
async function hashPassword(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}
async function loadAccounts(): Promise<LocalTestAccount[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value as LocalTestAccount[] : [];
  } catch { return []; }
}
function validate(email: string, password: string) {
  const normalized = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalized)) throw new Error("Enter a valid email address.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");
  return normalized;
}

export async function createLocalTestAccount(email: string, password: string) {
  const normalized = validate(email, password);
  const accounts = await loadAccounts();
  if (accounts.some((account) => account.email === normalized)) throw new Error("A local test account already exists for this email. Sign in instead.");
  const salt = randomSalt();
  const account: LocalTestAccount = {
    email: normalized,
    userId: `local-test:${encodeURIComponent(normalized)}`,
    salt,
    passwordHash: await hashPassword(password, salt),
  };
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...accounts, account]));
  return account.userId;
}

export async function signInLocalTestAccount(email: string, password: string) {
  const normalized = normalizeEmail(email);
  if (!EMAIL_PATTERN.test(normalized) || !password) throw new Error("Enter a valid email and password.");
  const account = (await loadAccounts()).find((item) => item.email === normalized);
  if (!account || (await hashPassword(password, account.salt)) !== account.passwordHash) {
    throw new Error("No matching local test account. Create an account on this device first, then sign in with the same email and password.");
  }
  return account.userId;
}

export async function removeLocalTestAccount(userId: string) {
  const accounts = await loadAccounts();
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts.filter((account) => account.userId !== userId)));
}
