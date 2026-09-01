# Security Architecture & Safeguards

## Key Security Measures

1. **Authentication & Password Hashing**:
   - Industry-standard `bcryptjs` password hashing with 10 salt rounds. Plaintext passwords are never stored.
   - JWT tokens signed with secure secrets and expiring after 24 hours.

2. **Backend Authorization (RBAC)**:
   - Independent server-side enforcement on every API route.
   - Self-approval prevention checks performed prior to state transition.

3. **Confidential File Attachment Protection**:
   - File uploads stored outside web root with safe randomized filenames (`${timestamp}_${uuid}_${sanitized_name}`).
   - Direct download endpoint (`/api/attachments/download/:id`) requires ownership or department role authorization before serving files via stream.

4. **Web Security Headers & Rate Limiting**:
   - Helmet HTTP headers enabled to mitigate XSS, Clickjacking, and MIME-sniffing.
   - Rate limiting middleware applied on authentication routes (max 100 requests per 15 min).
   - Strict Zod schema input validation to prevent SQL/JSON injection.
