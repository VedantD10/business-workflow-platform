const bcrypt = require('bcryptjs');

function seedDatabase(dbInstance) {
  const db = dbInstance || require('./db');
  console.log('Seeding Database with enterprise initial data...');

  db.reset();

  const passwordHash = bcrypt.hashSync('Password123!', 10);

  // 1. Roles
  const roles = [
    { id: 1, code: 'EMPLOYEE', name: 'Employee', description: 'Standard organizational employee' },
    { id: 2, code: 'REPORTING_MANAGER', name: 'Reporting Manager', description: 'Direct team manager with first-stage approval authority' },
    { id: 3, code: 'DEPARTMENT_STAFF', name: 'Department Staff', description: 'Operational staff in IT, Finance, Procurement or Admin' },
    { id: 4, code: 'DEPARTMENT_HEAD', name: 'Department Head / Director', description: 'Executive department director with high-level approval authority' },
    { id: 5, code: 'SYSTEM_ADMIN', name: 'System Administrator', description: 'Administrator with full system configuration permissions' },
    { id: 6, code: 'OPERATIONS_MANAGER', name: 'Operations Manager', description: 'Manager with organization-wide analytics and SLA monitoring rights' }
  ];
  roles.forEach(r => db.insert('roles', r));

  // 2. Departments
  const departments = [
    { id: 1, code: 'ENG', name: 'Product Engineering', description: 'Software engineering, product development, QA' },
    { id: 2, code: 'IT', name: 'Information Technology', description: 'IT infrastructure, systems, software access, hardware' },
    { id: 3, code: 'FIN', name: 'Finance & Accounting', description: 'Payroll, reimbursements, expense auditing, budgets' },
    { id: 4, code: 'OPS', name: 'Operations & Administration', description: 'Facilities, general admin, procurement, logistics' },
    { id: 5, code: 'MKT', name: 'Marketing & Sales', description: 'Brand management, sales operations, customer acquisition' },
    { id: 6, code: 'HR', name: 'Human Resources', description: 'Talent management, employee relations, onboarding' }
  ];
  departments.forEach(d => db.insert('departments', d));

  // 3. Request Types & SLA Configurations
  const requestTypes = [
    {
      id: 1,
      code: 'SOFTWARE_ACCESS',
      name: 'Software Access Request',
      description: 'Request access to organizational software applications and systems',
      sla_hours: 24,
      department_id: 2 // IT
    },
    {
      id: 2,
      code: 'EXPENSE_REIMBURSEMENT',
      name: 'Expense Reimbursement',
      description: 'Request reimbursement for eligible out-of-pocket business expenses',
      sla_hours: 48,
      department_id: 3 // Finance
    },
    {
      id: 3,
      code: 'DOCUMENT_APPROVAL',
      name: 'Document Approval',
      description: 'Submit internal policies, specifications, proposals, or contracts for formal review',
      sla_hours: 72,
      department_id: 4 // Operations
    },
    {
      id: 4,
      code: 'EQUIPMENT_REQUEST',
      name: 'Equipment Request',
      description: 'Request company hardware, laptops, monitors, accessories, or equipment',
      sla_hours: 72,
      department_id: 2 // IT/Admin
    }
  ];
  requestTypes.forEach(rt => {
    db.insert('request_types', rt);
    db.insert('sla_configurations', {
      request_type_id: rt.id,
      request_type_code: rt.code,
      target_hours: rt.sla_hours,
      warning_threshold_percent: 75
    });
  });

  // 4. Workflow Stages Configuration
  const workflowStages = [
    // Software Access
    { id: 1, request_type_code: 'SOFTWARE_ACCESS', stage_order: 1, stage_name: 'Reporting Manager Approval', required_role: 'REPORTING_MANAGER' },
    { id: 2, request_type_code: 'SOFTWARE_ACCESS', stage_order: 2, stage_name: 'IT Administrator Provisioning', required_role: 'DEPARTMENT_STAFF' },

    // Expense Reimbursement
    { id: 3, request_type_code: 'EXPENSE_REIMBURSEMENT', stage_order: 1, stage_name: 'Reporting Manager Review', required_role: 'REPORTING_MANAGER' },
    { id: 4, request_type_code: 'EXPENSE_REIMBURSEMENT', stage_order: 2, stage_name: 'Finance Audit & Verification', required_role: 'DEPARTMENT_STAFF' },
    { id: 5, request_type_code: 'EXPENSE_REIMBURSEMENT', stage_order: 3, stage_name: 'Reimbursement Payout Processing', required_role: 'DEPARTMENT_STAFF' },

    // Document Approval
    { id: 6, request_type_code: 'DOCUMENT_APPROVAL', stage_order: 1, stage_name: 'Department Manager Review', required_role: 'REPORTING_MANAGER' },
    { id: 7, request_type_code: 'DOCUMENT_APPROVAL', stage_order: 2, stage_name: 'Department Director Approval', required_role: 'DEPARTMENT_HEAD' },
    { id: 8, request_type_code: 'DOCUMENT_APPROVAL', stage_order: 3, stage_name: 'Final Governance Sign-off', required_role: 'DEPARTMENT_HEAD' },

    // Equipment Request
    { id: 9, request_type_code: 'EQUIPMENT_REQUEST', stage_order: 1, stage_name: 'Reporting Manager Approval', required_role: 'REPORTING_MANAGER' },
    { id: 10, request_type_code: 'EQUIPMENT_REQUEST', stage_order: 2, stage_name: 'IT Availability Check', required_role: 'DEPARTMENT_STAFF' },
    { id: 11, request_type_code: 'EQUIPMENT_REQUEST', stage_order: 3, stage_name: 'Inventory Allocation / Procurement', required_role: 'DEPARTMENT_STAFF' }
  ];
  workflowStages.forEach(ws => db.insert('workflow_stages', ws));

  // 5. Users
  const users = [
    // Employees
    { id: 1, email: 'aarav.sharma@enterprise.com', password_hash: passwordHash, full_name: 'Aarav Sharma', role: 'EMPLOYEE', department_id: 1, manager_id: 5 },
    { id: 2, email: 'priya.mehta@enterprise.com', password_hash: passwordHash, full_name: 'Priya Mehta', role: 'EMPLOYEE', department_id: 5, manager_id: 6 },
    { id: 3, email: 'neha.verma@enterprise.com', password_hash: passwordHash, full_name: 'Neha Verma', role: 'EMPLOYEE', department_id: 4, manager_id: 5 },
    { id: 4, email: 'rohan.patil@enterprise.com', password_hash: passwordHash, full_name: 'Rohan Patil', role: 'EMPLOYEE', department_id: 1, manager_id: 5 },

    // Reporting Managers
    { id: 5, email: 'vikram.singh@enterprise.com', password_hash: passwordHash, full_name: 'Vikram Singh (Eng Mgr)', role: 'REPORTING_MANAGER', department_id: 1, manager_id: 7 },
    { id: 6, email: 'ananya.rao@enterprise.com', password_hash: passwordHash, full_name: 'Ananya Rao (Mkt Mgr)', role: 'REPORTING_MANAGER', department_id: 5, manager_id: 8 },

    // Department Staff (IT, Finance, Admin)
    { id: 7, email: 'it.admin@enterprise.com', password_hash: passwordHash, full_name: 'Karan Patel (IT Admin)', role: 'DEPARTMENT_STAFF', department_id: 2, manager_id: 9 },
    { id: 8, email: 'finance.officer@enterprise.com', password_hash: passwordHash, full_name: 'Sunita Joshi (Finance Officer)', role: 'DEPARTMENT_STAFF', department_id: 3, manager_id: 10 },
    { id: 9, email: 'procurement.officer@enterprise.com', password_hash: passwordHash, full_name: 'Amit Deshmukh (Procurement Officer)', role: 'DEPARTMENT_STAFF', department_id: 4, manager_id: 11 },

    // Department Directors / Heads
    { id: 10, email: 'director.eng@enterprise.com', password_hash: passwordHash, full_name: 'Dr. Rajesh Iyer (Eng Director)', role: 'DEPARTMENT_HEAD', department_id: 1, manager_id: null },
    { id: 11, email: 'director.ops@enterprise.com', password_hash: passwordHash, full_name: 'Meera Nair (Ops Director)', role: 'DEPARTMENT_HEAD', department_id: 4, manager_id: null },

    // Operations Manager & System Administrator
    { id: 12, email: 'ops.manager@enterprise.com', password_hash: passwordHash, full_name: 'Siddharth Malhotra (Ops Manager)', role: 'OPERATIONS_MANAGER', department_id: 4, manager_id: null },
    { id: 13, email: 'sys.admin@enterprise.com', password_hash: passwordHash, full_name: 'System Admin User', role: 'SYSTEM_ADMIN', department_id: 2, manager_id: null }
  ];
  users.forEach(u => db.insert('users', u));

  // 6. Sample Requests covering all 4 workflows and different states
  const now = new Date();
  const pastHours = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

  const requests = [
    // Request 1: Software Access
    {
      id: 1,
      request_number: 'REQ-2026-00001',
      request_type_code: 'SOFTWARE_ACCESS',
      user_id: 1, // Aarav Sharma
      department_id: 1, // Engineering
      current_stage: 'IT Administrator Provisioning',
      status: 'APPROVED',
      priority: 'HIGH',
      title: 'Access Request: Project Management System (Jira Enterprise)',
      description: 'Required for project coordination and engineering workflow tracking',
      custom_fields: JSON.stringify({
        software_name: 'Project Management System (Jira)',
        requested_access_level: 'Standard User',
        business_justification: 'Required for project coordination across engineering teams',
        required_date: '2026-09-05',
        additional_comments: 'Urgent setup needed for sprint planning'
      }),
      created_at: pastHours(10),
      updated_at: pastHours(2),
      completed_at: null
    },

    // Request 2: Expense Reimbursement
    {
      id: 2,
      request_number: 'REQ-2026-00002',
      request_type_code: 'EXPENSE_REIMBURSEMENT',
      user_id: 2, // Priya Mehta
      department_id: 5, // Marketing
      current_stage: 'Finance Audit & Verification',
      status: 'UNDER_REVIEW',
      priority: 'MEDIUM',
      title: 'Client Lunch & Travel Expense Reimbursement',
      description: 'Reimbursement for client dinner meeting and local taxi fare',
      custom_fields: JSON.stringify({
        expense_category: 'Client Meeting',
        expense_date: '2026-08-28',
        amount: 4850,
        currency: 'INR',
        business_purpose: 'Client meeting and strategic partnership travel',
        submission_date: '2026-08-29'
      }),
      created_at: pastHours(30),
      updated_at: pastHours(5),
      completed_at: null
    },

    // Request 3: Document Approval
    {
      id: 3,
      request_number: 'REQ-2026-00003',
      request_type_code: 'DOCUMENT_APPROVAL',
      user_id: 3, // Neha Verma
      department_id: 4, // Operations
      current_stage: 'Department Director Approval',
      status: 'APPROVAL_PENDING',
      priority: 'HIGH',
      title: 'Customer Data Handling Procedure v1.0',
      description: 'Updated standard operating procedure for handling customer PII',
      custom_fields: JSON.stringify({
        document_title: 'Customer Data Handling Procedure',
        document_type: 'Internal Policy',
        document_version: '1.0',
        approval_deadline: '2026-09-10'
      }),
      created_at: pastHours(60),
      updated_at: pastHours(12),
      completed_at: null
    },

    // Request 4: Equipment Request
    {
      id: 4,
      request_number: 'REQ-2026-00004',
      request_type_code: 'EQUIPMENT_REQUEST',
      user_id: 4, // Rohan Patil
      department_id: 1, // Engineering
      current_stage: 'Reporting Manager Approval',
      status: 'SUBMITTED',
      priority: 'URGENT',
      title: 'External 4K Monitor for Engineering Workbench',
      description: 'Dell 27-inch 4K USB-C monitor required for software testing and debugging',
      custom_fields: JSON.stringify({
        equipment_type: 'External Monitor',
        quantity: 1,
        business_justification: 'Required for development, high-DPI testing and multi-window debugging',
        required_date: '2026-09-08',
        additional_info: 'Needs USB-C hub built-in if available'
      }),
      created_at: pastHours(80),
      updated_at: pastHours(80),
      completed_at: null
    },

    // Request 5: Completed Expense Reimbursement
    {
      id: 5,
      request_number: 'REQ-2026-00005',
      request_type_code: 'EXPENSE_REIMBURSEMENT',
      user_id: 1, // Aarav Sharma
      department_id: 1, // Engineering
      current_stage: 'Completed',
      status: 'COMPLETED',
      priority: 'MEDIUM',
      title: 'Cloud Certification Exam Fee Reimbursement',
      description: 'AWS Certified Solutions Architect Exam registration fee',
      custom_fields: JSON.stringify({
        expense_category: 'Professional Development',
        expense_date: '2026-08-15',
        amount: 12500,
        currency: 'INR',
        business_purpose: 'Required AWS Cloud Architecture Certification',
        submission_date: '2026-08-16'
      }),
      created_at: pastHours(120),
      updated_at: pastHours(96),
      completed_at: pastHours(96)
    }
  ];
  requests.forEach(req => db.insert('requests', req));

  // 7. Initial Approvals & Audit Trail entries
  const approvals = [
    {
      id: 1,
      request_id: 1,
      stage_name: 'Reporting Manager Approval',
      approver_id: 5, // Vikram Singh
      action: 'APPROVED',
      comments: 'Verified business justification for Jira Enterprise access. Approved.',
      decided_at: pastHours(4)
    },
    {
      id: 2,
      request_id: 2,
      stage_name: 'Reporting Manager Review',
      approver_id: 6, // Ananya Rao
      action: 'APPROVED',
      comments: 'Client lunch expense verified against travel policy. Approved for Finance payout.',
      decided_at: pastHours(18)
    },
    {
      id: 3,
      request_id: 3,
      stage_name: 'Department Manager Review',
      approver_id: 5, // Vikram Singh
      action: 'APPROVED',
      comments: 'SOP draft reviewed thoroughly. Forwarded to Director for final sign-off.',
      decided_at: pastHours(24)
    }
  ];
  approvals.forEach(app => db.insert('approvals', app));

  // Audit Logs
  const auditLogs = [
    {
      request_id: 1,
      actor_id: 1,
      action: 'SUBMITTED',
      previous_state: null,
      new_state: 'SUBMITTED',
      details: 'Request REQ-2026-00001 submitted by Aarav Sharma',
      created_at: pastHours(10)
    },
    {
      request_id: 1,
      actor_id: 5,
      action: 'APPROVED',
      previous_state: 'SUBMITTED',
      new_state: 'APPROVED',
      details: 'Manager Vikram Singh approved request at stage Reporting Manager Approval',
      created_at: pastHours(4)
    },
    {
      request_id: 4,
      actor_id: 4,
      action: 'SUBMITTED',
      previous_state: null,
      new_state: 'SUBMITTED',
      details: 'Equipment request REQ-2026-00004 submitted by Rohan Patil',
      created_at: pastHours(80)
    }
  ];
  auditLogs.forEach(al => db.insert('audit_logs', al));

  // Comments
  const comments = [
    {
      request_id: 2,
      user_id: 8, // Finance Officer
      comment_text: 'Please upload the original itemized taxi receipt to complete audit verification.',
      created_at: pastHours(10)
    },
    {
      request_id: 2,
      user_id: 2, // Priya Mehta
      comment_text: 'Uploaded the itemized Uber business receipt PDF.',
      created_at: pastHours(5)
    }
  ];
  comments.forEach(c => db.insert('comments', c));

  // Notifications
  const notifications = [
    {
      user_id: 5,
      title: 'Approval Required',
      message: 'New Software Access Request REQ-2026-00001 submitted by Aarav Sharma requires your review.',
      link: '/requests/1',
      is_read: 1,
      created_at: pastHours(10)
    },
    {
      user_id: 7,
      title: 'Action Required',
      message: 'Request REQ-2026-00001 approved by Manager. Provisioning required by IT.',
      link: '/requests/1',
      is_read: 0,
      created_at: pastHours(4)
    },
    {
      user_id: 5,
      title: 'SLA Overdue Warning',
      message: 'Equipment Request REQ-2026-00004 has exceeded its 72-hour SLA deadline!',
      link: '/requests/4',
      is_read: 0,
      created_at: pastHours(8)
    }
  ];
  notifications.forEach(n => db.insert('notifications', n));

  console.log('Database seeded successfully!');
}

if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
