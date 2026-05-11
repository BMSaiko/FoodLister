# Implementation Plan

[Overview]
Implement a robust email verification system for user accounts in the FoodLister application, expanding the existing Supabase Auth integration to include email verification status, verification flow, and enhanced security features like login attempt tracking and account lockout.

[Types]
We will add new TypeScript interfaces and update existing database types to support email verification functionality.

New interfaces in libs/types.ts:
- VerificationStatus: { isVerified: boolean; emailConfirmed: boolean; verifiedAt: string | null; verificationMethod: 'email' | null }
- AccountSecurity: { twoFactorEnabled: boolean; lastPasswordChange: string | null; activeSessions: number; lastLogin: string | null; loginAttempts: number; lockedUntil: string | null }
- UserAccount: extends User with verification: VerificationStatus and security: AccountSecurity
- VerificationRequest: { userId: string; method: 'email'; token: string; expiresAt: string; used: boolean }

Updated database types in types/database.ts for the profiles table:
- Add fields: is_verified (boolean), verified_at (string), verification_method (string), login_attempts (number), locked_until (string)

[Files]
New files to create:
1. app/auth/verify/email/page.tsx - Email verification page handling token verification from URL
2. app/auth/verify/success/page.tsx - Success page shown after email verification
3. components/auth/EmailVerification.tsx - Component for email verification form and status
4. components/auth/VerificationStatus.tsx - Component displaying user's verification status
5. hooks/auth/useVerification.ts - Custom hook managing email verification state and functions
6. libs/verification.ts - Utility functions for sending and verifying email tokens
7. supabase/migrations/20240509000000_add_verification_fields.sql - Migration adding verification fields to profiles table

Existing files to modify:
1. contexts/AuthContext.tsx - Add verification status state and functions, update AuthContextValue interface
2. types/database.ts - Add new columns to profiles table definition
3. libs/types.ts - Add new verification and security interfaces
4. app/auth/layout.js - Add links to verification pages in auth layout (if exists)
5. components/layouts/Navbar.jsx - Add verification status indicator and link to security page
6. libs/auth.ts - Modify signUp to trigger email verification, modify signIn to check login attempts and lockout

[Functions]
New functions:
1. sendVerificationEmail(userId: string): Promise<{error: any}> in libs/verification.ts - Sends email verification token
2. verifyEmailToken(token: string): Promise<{success: boolean, error: any}> in libs/verification.ts - Verifies email token
3. checkVerificationStatus(userId: string): Promise<VerificationStatus> in libs/verification.ts - Checks user's verification status
4. useVerification() hook in hooks/auth/useVerification.ts - Returns { sendEmail, verifyEmail, status, loading, error }
5. useAccountSecurity() hook[Functions]
New functions:
1. sendVerificationEmail(userId: string): Promise<{error: any}> in libs/verification.ts - Sends email verification token
2. verifyEmailToken(token: string): Promise<{success: boolean, error: any}> in libs/verification.ts - Verifies email token
3. checkVerificationStatus(userId: string): Promise<VerificationStatus> in libs/verification.ts - Checks user's verification status
4. useVerification() hook in hooks/auth/useVerification.ts - Returns { sendEmail, verifyEmail, status, loading, error }
5. useAccountSecurity() hook in hooks/auth/useAccountSecurity.ts - Returns { security, updateSettings, loading, error }

Modified functions:
1. AuthContext.tsx - AuthProvider: Add verificationStatus state, checkVerification and sendVerification functions, update user object to include verification status
2. libs/auth.ts - signUp: Modify to send verification email after successful registration
3. libs/auth.ts - signIn: Modify to check locked_until status, increment loginAttempts on failure, reset on success
4. libs/auth.ts - signOut: Add clearing of verification-related session data if needed

[Classes]
No new or modified classes (project uses functional components and hooks)

[Dependencies]
New optional packages:
- nodemailer (if implementing custom email service, but we'll use Supabase built-in email verification)
- No new mandatory packages; we'll use existing Supabase Auth email verification feature

[Testing]
New test files:
1. __tests__/components/auth/EmailVerification.test.tsx - Test EmailVerification component
2. __tests__/components/auth/VerificationStatus.test.tsx - Test VerificationStatus component
3. __tests__/hooks/auth/useVerification.test.ts - Test useVerification hook
4. __tests__/libs/verification.test.ts - Test verification utility functions

Existing test modifications:
- Update AuthContext tests to include verification status
- Update signUp and signIn tests to cover new verification and security logic

[Implementation Order]
1. Create database migration: supabase/migrations/20240509000000_add_verification_fields.sql
2. Update types/database.ts with new profile fields
3. Update libs/types.ts with new verification and security interfaces
4. Create libs/verification.ts with email verification utility functions
5. Create hooks/auth/useVerification.ts and hooks/auth/useAccountSecurity.ts
6. Update contexts/AuthContext.tsx with verification state and functions
7. Modify libs/auth.ts to integrate verification flow in signUp and signIn
8. Create UI components: components/auth/EmailVerification.tsx and components/auth/VerificationStatus.tsx
9. Create verification pages: app/auth/verify/email/page.tsx and app/auth/verify/success/page.tsx
10. Update navigation: components/layouts/Navbar.jsx to show verification status
11. Write tests for new components, hooks, and utilities
12. Run lint, build, and test to verify implementation