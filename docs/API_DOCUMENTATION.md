# REST API Specification & Endpoint Documentation

## Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Request Body | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user and issue JWT token | `{ email, password }` | No |
| `POST` | `/api/auth/register` | Register new employee user | `{ email, password, full_name, department_id, role }` | No |
| `GET` | `/api/auth/me` | Fetch active user session | None | Yes |
| `POST` | `/api/auth/logout` | Terminate session | None | Yes |

## Request Operations (`/api/requests`)

| Method | Endpoint | Description | Query / Body Params | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/requests` | Submit new workflow request | `{ request_type_code, title, description, priority, custom_fields }` | Yes |
| `GET` | `/api/requests` | List requests with search & filters | `search`, `status`, `priority`, `request_type_code`, `sla_status`, `page`, `limit` | Yes |
| `GET` | `/api/requests/:id` | Get single request details | None | Yes (Access Control) |
| `POST` | `/api/requests/:id/action` | Execute workflow state transition | `{ action, comments, payload }` | Yes (Access Control) |

## Comments & Attachments (`/api/comments`, `/api/attachments`)

| Method | Endpoint | Description | Body / Payload |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/comments/request/:requestId` | Fetch comment thread | None |
| `POST` | `/api/comments/request/:requestId` | Post comment / clarification | `{ comment_text }` |
| `POST` | `/api/attachments/upload/request/:requestId` | Upload file attachment | Multipart FormData (`file`) |
| `GET` | `/api/attachments/download/:id` | Download secure file attachment | None (RBAC Protected) |

## Analytics & Audit (`/api/analytics`, `/api/audit`)

| Method | Endpoint | Description | Access Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/analytics/dashboard` | Role-tailored metrics & SLA stats | All Roles |
| `GET` | `/api/audit` | Query immutable system audit log | Admin, Ops, Dept Head |
