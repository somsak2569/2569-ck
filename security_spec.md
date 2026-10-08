# Security Specification: Chiang Klang Suicide Risk Screening System (2569-ck)

## 1. Data Invariants
1. **User Identity Isolation**: A user can only manage or mutate their own user record unless they possess Admin privileges.
2. **Immutability of Key Identity Fields**: Patient screening `id` and `surveyorUserId` cannot be forged or altered after creation.
3. **Role Boundary Enforcement**: Only authenticated users can access patient mental health screenings, strictly scoped to their health jurisdiction (admin, health officer, or assigning VHV).
4. **Data Sanitization & Limits**: All string inputs (names, IDs, addresses, notes) are bounded to prevent resource exhaustion / injection attacks.
5. **PII and Mental Health Protection**: Screening questionnaires (2Q Plus, 8Q, suicide risk assessments) contain highly sensitive psychological information and must never have public read/write access.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Read on Patients**: `GET /patients/{id}` with `auth: null` -> Expected: `PERMISSION_DENIED`
2. **Unauthenticated List on Users**: `LIST /users` with `auth: null` -> Expected: `PERMISSION_DENIED`
3. **Spoofed User Registration as Admin**: `CREATE /users/user-123` with `role: 'ADMIN'` from non-admin account -> Expected: `PERMISSION_DENIED`
4. **Shadow Field Injection**: `CREATE /patients/p-1` with extra unauthorized field `__backdoor: true` -> Expected: `PERMISSION_DENIED`
5. **Massive Payload Denial of Wallet**: `CREATE /patients/p-2` with `notes` exceeding 2000 characters -> Expected: `PERMISSION_DENIED`
6. **Path Traversal / Malformed Document ID**: `SET /patients/../../root` -> Expected: `PERMISSION_DENIED`
7. **Identity Theft on Screening**: Non-admin user creating a patient record with someone else's `surveyorUserId` -> Expected: `PERMISSION_DENIED`
8. **Tampering with Screening History**: Updating `surveyorUserId` or `id` during update operation -> Expected: `PERMISSION_DENIED`
9. **Fake Email Verified Admin**: Authenticated user with email `thaipasit5@gmail.com` but `email_verified: false` -> Expected: `PERMISSION_DENIED`
10. **Orphaned Write Attack**: Writing to non-existent subcollection `patients/p-1/unregistered` -> Expected: `PERMISSION_DENIED`
11. **Negative / NaN Patient Age**: Patient screening payload with `age: -50` -> Expected: `PERMISSION_DENIED`
12. **Unauthorized Patient Deletion**: Regular VHV deleting a patient screening recorded by a health officer -> Expected: `PERMISSION_DENIED`

## 3. Test Runner Invariant
Every request not explicitly satisfying authentication and validation predicates is rejected by the top-level catch-all `allow read, write: if false;` and hardened collection rules.
