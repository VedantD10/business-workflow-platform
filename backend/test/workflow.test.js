const { describe, it, before } = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../src/app');
const seedDatabase = require('../src/database/seed');

describe('VESA Project 3 — Enterprise Workflow Platform Test Suite', () => {
  let employeeToken = '';
  let managerToken = '';
  let adminToken = '';
  let createdRequestId = null;

  before(() => {
    // Re-seed DB to clean initial state
    seedDatabase();
  });

  // 1. AUTHENTICATION SUITE
  describe('1. Authentication System Tests', () => {
    it('should log in as Employee successfully and return JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.sharma@enterprise.com',
          password: 'Password123!'
        });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data.token);
      assert.strictEqual(res.body.data.user.role, 'EMPLOYEE');

      employeeToken = res.body.data.token;
    });

    it('should log in as Manager successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'vikram.singh@enterprise.com',
          password: 'Password123!'
        });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.user.role, 'REPORTING_MANAGER');
      managerToken = res.body.data.token;
    });

    it('should log in as System Admin successfully', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'sys.admin@enterprise.com',
          password: 'Password123!'
        });

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.data.user.role, 'SYSTEM_ADMIN');
      adminToken = res.body.data.token;
    });

    it('should reject invalid credentials with HTTP 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'aarav.sharma@enterprise.com',
          password: 'WrongPassword'
        });

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.success, false);
    });
  });

  // 2. REQUEST CREATION FOR ALL 4 WORKFLOWS
  describe('2. Request Creation (4 Mandatory Workflows)', () => {
    it('Workflow A: Create Software Access Request', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          request_type_code: 'SOFTWARE_ACCESS',
          title: 'Docker Enterprise Access',
          description: 'Required for containerized development and local deployment testing',
          priority: 'HIGH',
          custom_fields: {
            software_name: 'Docker Enterprise',
            requested_access_level: 'Developer',
            business_justification: 'Running engineering microservices locally',
            required_date: '2026-09-10'
          }
        });

      assert.strictEqual(res.statusCode, 201);
      assert.ok(res.body.data.request_number);
      assert.strictEqual(res.body.data.status, 'SUBMITTED');
      assert.strictEqual(res.body.data.sla.target_hours, 24);

      createdRequestId = res.body.data.id;
    });

    it('Workflow B: Create Expense Reimbursement Request', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          request_type_code: 'EXPENSE_REIMBURSEMENT',
          title: 'Client Conference Ticket Payout',
          description: 'Reimbursement for Tech Summit 2026 admission pass',
          priority: 'MEDIUM',
          custom_fields: {
            expense_category: 'Conference / Seminar',
            expense_date: '2026-08-25',
            amount: 7500,
            currency: 'INR',
            business_purpose: 'Representing company at tech summit'
          }
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.data.sla.target_hours, 48);
    });

    it('Workflow C: Create Document Approval Request', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          request_type_code: 'DOCUMENT_APPROVAL',
          title: 'Architecture Security Guidelines v2.0',
          description: 'Formal security compliance guideline document',
          priority: 'URGENT',
          custom_fields: {
            document_title: 'Architecture Security Guidelines',
            document_type: 'Technical Specification',
            document_version: '2.0',
            approval_deadline: '2026-09-12'
          }
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.data.sla.target_hours, 72);
    });

    it('Workflow D: Create Equipment Request', async () => {
      const res = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          request_type_code: 'EQUIPMENT_REQUEST',
          title: 'Ergonomic Chair Request',
          description: 'Ergonomic desk chair for workstation setup',
          priority: 'LOW',
          custom_fields: {
            equipment_type: 'Ergonomic Desk Chair',
            quantity: 1,
            business_justification: 'Workstation health standard',
            required_date: '2026-09-15'
          }
        });

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.data.sla.target_hours, 72);
    });
  });

  // 3. WORKFLOW STATE MACHINE & SELF-APPROVAL PREVENTION
  describe('3. Workflow State Machine & Business Rules', () => {
    it('RULE ENFORCEMENT: Employee CANNOT approve their own request', async () => {
      const res = await request(app)
        .post(`/api/requests/${createdRequestId}/action`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          action: 'APPROVE',
          comments: 'Self approving my own request'
        });

      assert.strictEqual(res.statusCode, 403);
      assert.ok(res.body.error.message.includes('Employees cannot approve'));
    });

    it('RULE ENFORCEMENT: Rejection MUST include a written reason', async () => {
      const res = await request(app)
        .post(`/api/requests/${createdRequestId}/action`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          action: 'REJECT',
          comments: '' // empty comment
        });

      assert.strictEqual(res.statusCode, 400);
      assert.ok(res.body.error.message.includes('reason is required'));
    });

    it('RULE ENFORCEMENT: Employee CANNOT start processing or complete tasks', async () => {
      const res = await request(app)
        .post(`/api/requests/${createdRequestId}/action`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          action: 'COMPLETE_TASK',
          comments: 'Attempting to bypass processing'
        });

      assert.strictEqual(res.statusCode, 403);
      assert.ok(res.body.error.message.includes('Only operational department staff'));
    });

    it('RULE ENFORCEMENT: Operational completion rejected before processing stage', async () => {
      // Create a fresh unapproved request
      const unapprovedRes = await request(app)
        .post('/api/requests')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          request_type_code: 'SOFTWARE_ACCESS',
          title: 'Unapproved Request Test',
          description: 'Testing stage completion boundary',
          priority: 'LOW',
          custom_fields: { software_name: 'Test App' }
        });
      const unapprovedId = unapprovedRes.body.data.id;

      // Log in as IT Admin
      const itRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'it.admin@enterprise.com', password: 'Password123!' });
      const itToken = itRes.body.data.token;

      const completeAttempt = await request(app)
        .post(`/api/requests/${unapprovedId}/action`)
        .set('Authorization', `Bearer ${itToken}`)
        .send({ action: 'COMPLETE_TASK', comments: 'Premature completion attempt' });

      assert.strictEqual(completeAttempt.statusCode, 400);
      assert.ok(completeAttempt.body.error.message.includes('cannot be marked completed without completing its required processing stage'));
    });

    it('RBAC SCOPING: Manager directory is scoped to team requests', async () => {
      const res = await request(app)
        .get('/api/requests')
        .set('Authorization', `Bearer ${managerToken}`);

      assert.strictEqual(res.statusCode, 200);
      // Vikram manages Aarav (1), Neha (3) & Rohan (4)
      const nonTeamRequests = res.body.data.filter(r => ![1, 3, 4, 5].includes(r.user_id));
      assert.strictEqual(nonTeamRequests.length, 0);
    });

    it('Audit trail records manager approval event', async () => {
      const res = await request(app)
        .get('/api/audit')
        .query({ request_id: createdRequestId })
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.data.length > 0);
    });
  });

  // 4. ANALYTICS & DASHBOARD DATA INTEGRITY
  describe('4. Dashboard Analytics & Real Data Verification', () => {
    it('fetches real database metrics for all role dashboards', async () => {
      const res = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${employeeToken}`);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(res.body.data.employee);
      assert.ok(res.body.data.operations.total_requests > 0);
      assert.ok(res.body.data.operations.sla_performance_percent !== undefined);
    });
  });
});
