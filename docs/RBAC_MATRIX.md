# Role-Based Access Control (RBAC) Matrix

## Permission Matrix

| Capability / API Endpoint | Employee | Reporting Manager | Department Staff | Department Head | Operations Manager | System Admin |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| `POST /api/requests` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/requests` (Own) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `GET /api/requests` (Team) | ❌ | ✅ | ❌ | ✅ | ✅ | ✅ |
| `GET /api/requests` (Dept) | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |
| `POST /api/requests/:id/action` (Approve/Reject) | ❌ | ✅ (Non-Self) | ❌ | ✅ (Non-Self) | ❌ | ✅ |
| `POST /api/requests/:id/action` (Process/Complete) | ❌ | ❌ | ✅ | ❌ | ❌ | ✅ |
| `GET /api/analytics/dashboard` | ✅ (User) | ✅ (Team) | ✅ (Dept) | ✅ (Executive) | ✅ (Full) | ✅ (Full) |
| `GET /api/audit` | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ |
| `GET /api/attachments/download/:id` | ✅ (Owned) | ✅ (Team) | ✅ (Dept) | ✅ (Dept) | ✅ (Org) | ✅ (Org) |

## Security Business Rule Rules
1. **Self-Approval Prohibition**: The state engine explicitly prevents any user from approving, rejecting, or modifying their own request, returning HTTP `403 Forbidden`.
2. **Independent Backend Middleware Enforcement**: Hiding frontend UI buttons is treated only as a UX convenience. All API routes enforce RBAC checks directly on the server.
