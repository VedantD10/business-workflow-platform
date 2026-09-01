const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long and contain uppercase, lowercase, and numbers'),
  full_name: z.string().min(2, 'Full name is required'),
  role: z.enum(['EMPLOYEE', 'REPORTING_MANAGER', 'DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN', 'OPERATIONS_MANAGER']).optional().default('EMPLOYEE'),
  department_id: z.number().int().positive('Department ID is required'),
  manager_id: z.number().int().positive().nullable().optional()
});

const createRequestSchema = z.object({
  request_type_code: z.enum(['SOFTWARE_ACCESS', 'EXPENSE_REIMBURSEMENT', 'DOCUMENT_APPROVAL', 'EQUIPMENT_REQUEST']),
  title: z.string().min(3, 'Request title must be at least 3 characters long'),
  description: z.string().min(5, 'Request description must be at least 5 characters long'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  department_id: z.number().int().positive().optional(),
  custom_fields: z.object({}).passthrough()
});

const workflowActionSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'REQUEST_CHANGES', 'START_PROCESSING', 'COMPLETE_TASK', 'CANCEL', 'RESUBMIT']),
  comments: z.string().optional(),
  payload: z.object({}).passthrough().optional()
});

const createCommentSchema = z.object({
  comment_text: z.string().min(1, 'Comment text cannot be empty')
});

module.exports = {
  loginSchema,
  registerSchema,
  createRequestSchema,
  workflowActionSchema,
  createCommentSchema
};
