# CatchYa authentication testing (no backend)

1. Start CatchYa and open **Sign in**.
2. Tap **Continue with email** to expand the email form.
3. For a new device, tap **Create one**, enter a valid email and a password with at least 8 characters, and confirm it.
4. The app creates a local test account and proceeds through onboarding.
5. Sign out from Settings, then sign in with the same email and password.

Test accounts are stored on this device only. Passwords are salted and SHA-256 hashed, but AsyncStorage is not suitable for production secrets. There is no email verification, password reset email, or server-side identity. Use test credentials only. Clearing app storage deletes the local accounts. Google sign-in is separate and requires OAuth configuration.

## Files

- `src/context/AuthContext.tsx` — auth screen state and local sign-in lifecycle
- `src/services/localTestAuth.ts` — local test account create, verify, and delete
- `src/screens/auth/SignInScreen.tsx`
- `src/screens/auth/CreateAccountScreen.tsx`
- `src/screens/auth/ResetPasswordScreen.tsx`
- `src/navigation/AuthNavigator.tsx`
- `src/components/Button.tsx`, `TextField.tsx`, `Banner.tsx`
- `src/theme/colors.ts`
