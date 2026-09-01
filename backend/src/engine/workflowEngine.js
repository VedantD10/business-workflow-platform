const db = require('../database/db');
const { ForbiddenError, BadRequestError, NotFoundError } = require('../utils/errors');
const { calculateSLAStatus } = require('./slaEngine');

/**
 * Enterprise Centralized Workflow Engine
 */

const STAGE_FLOWS = {
  SOFTWARE_ACCESS: [
    { stage_order: 1, stage_name: 'Reporting Manager Approval', required_role: 'REPORTING_MANAGER' },
    { stage_order: 2, stage_name: 'IT Administrator Provisioning', required_role: 'DEPARTMENT_STAFF' }
  ],
  EXPENSE_REIMBURSEMENT: [
    { stage_order: 1, stage_name: 'Reporting Manager Review', required_role: 'REPORTING_MANAGER' },
    { stage_order: 2, stage_name: 'Finance Audit & Verification', required_role: 'DEPARTMENT_STAFF' },
    { stage_order: 3, stage_name: 'Reimbursement Payout Processing', required_role: 'DEPARTMENT_STAFF' }
  ],
  DOCUMENT_APPROVAL: [
    { stage_order: 1, stage_name: 'Department Manager Review', required_role: 'REPORTING_MANAGER' },
    { stage_order: 2, stage_name: 'Department Director Approval', required_role: 'DEPARTMENT_HEAD' },
    { stage_order: 3, stage_name: 'Final Governance Sign-off', required_role: 'DEPARTMENT_HEAD' }
  ],
  EQUIPMENT_REQUEST: [
    { stage_order: 1, stage_name: 'Reporting Manager Approval', required_role: 'REPORTING_MANAGER' },
    { stage_order: 2, stage_name: 'IT Availability Check', required_role: 'DEPARTMENT_STAFF' },
    { stage_order: 3, stage_name: 'Inventory Allocation / Procurement', required_role: 'DEPARTMENT_STAFF' }
  ]
};

function getWorkflowStages(typeCode) {
  return STAGE_FLOWS[typeCode] || [];
}

/**
 * Core State Transition Processor
 */
function processWorkflowTransition({ requestId, actorUser, action, comments = '', payload = {} }) {
  const request = db.findById('requests', requestId);
  if (!request) {
    throw new NotFoundError(`Request REQ-#${requestId} not found.`);
  }

  // Prevent transitions on terminal states unless resubmitting
  if (['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status) && action !== 'RESUBMIT') {
    throw new BadRequestError(`Cannot modify request REQ-${request.request_number} because it is already in a terminal state (${request.status}).`);
  }

  // 1. SELF-APPROVAL PREVENTION RULE
  if (['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(action)) {
    if (request.user_id === actorUser.id && actorUser.role !== 'SYSTEM_ADMIN') {
      throw new ForbiddenError('Business Rule Violation: Employees cannot approve, reject, or request changes on their own request.');
    }
  }

  // 2. MANDATORY COMMENTS FOR REJECTION & CHANGES REQUESTED
  if (['REJECT', 'REQUEST_CHANGES'].includes(action) && (!comments || !comments.trim())) {
    throw new BadRequestError(`A written reason is required when executing action: ${action}`);
  }

  const previousState = request.status;
  const previousStage = request.current_stage;
  const stages = getWorkflowStages(request.request_type_code);
  const currentStageIndex = stages.findIndex(s => s.stage_name === request.current_stage);

  let newStatus = request.status;
  let newStage = request.current_stage;
  let completedAt = request.completed_at;

  switch (action) {
    case 'APPROVE': {
      // Advance stage or mark complete
      if (currentStageIndex === -1 || currentStageIndex >= stages.length - 1) {
        newStatus = 'APPROVED';
      } else {
        const nextStageObj = stages[currentStageIndex + 1];
        newStage = nextStageObj.stage_name;
        newStatus = currentStageIndex === 0 ? 'APPROVAL_PENDING' : 'PROCESSING';
      }
      break;
    }

    case 'REJECT': {
      newStatus = 'REJECTED';
      break;
    }

    case 'REQUEST_CHANGES': {
      newStatus = 'CHANGES_REQUESTED';
      // Return to stage 1 or previous stage
      newStage = stages[0] ? stages[0].stage_name : request.current_stage;
      break;
    }

    case 'START_PROCESSING': {
      if (!['DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(actorUser.role)) {
        throw new ForbiddenError('Business Rule Violation: Only operational department staff or system administrators can start processing requests.');
      }
      if (['SUBMITTED', 'UNDER_REVIEW'].includes(request.status)) {
        throw new BadRequestError('Business Rule Violation: Managerial approval is required before operational processing can begin.');
      }
      newStatus = 'PROCESSING';
      break;
    }

    case 'COMPLETE_TASK': {
      if (!['DEPARTMENT_STAFF', 'DEPARTMENT_HEAD', 'SYSTEM_ADMIN'].includes(actorUser.role)) {
        throw new ForbiddenError('Business Rule Violation: Only operational department staff or system administrators can mark requests completed.');
      }
      if (!['PROCESSING', 'APPROVED'].includes(request.status)) {
        throw new BadRequestError('Business Rule Violation: A request cannot be marked completed without completing its required processing stage.');
      }
      newStatus = 'COMPLETED';
      newStage = 'Completed';
      completedAt = new Date().toISOString();
      break;
    }

    case 'CANCEL': {
      if (request.user_id !== actorUser.id && actorUser.role !== 'SYSTEM_ADMIN') {
        throw new ForbiddenError('Only the request creator or System Administrator can cancel a request.');
      }
      newStatus = 'CANCELLED';
      newStage = 'Cancelled';
      break;
    }

    case 'RESUBMIT': {
      if (request.user_id !== actorUser.id) {
        throw new ForbiddenError('Only the request creator can resubmit a request requiring changes.');
      }
      newStatus = 'SUBMITTED';
      newStage = stages[0] ? stages[0].stage_name : 'Under Review';
      break;
    }

    default:
      throw new BadRequestError(`Unsupported workflow action: ${action}`);
  }

  // Update request record in DB
  const updatePayload = {
    status: newStatus,
    current_stage: newStage,
    completed_at: completedAt
  };

  // If payload contains updated custom fields (e.g. equipment availability / procurement choice)
  if (payload.custom_fields) {
    const existingFields = JSON.parse(request.custom_fields || '{}');
    updatePayload.custom_fields = JSON.stringify({ ...existingFields, ...payload.custom_fields });
  }

  const updatedRequest = db.updateById('requests', request.id, updatePayload);

  // Log Approval Record
  if (['APPROVE', 'REJECT', 'REQUEST_CHANGES'].includes(action)) {
    db.insert('approvals', {
      request_id: request.id,
      stage_name: previousStage,
      approver_id: actorUser.id,
      action: action,
      comments: comments.trim(),
      decided_at: new Date().toISOString()
    });
  }

  // Log Audit Event
  db.insert('audit_logs', {
    request_id: request.id,
    actor_id: actorUser.id,
    action: action,
    previous_state: `${previousState} (${previousStage})`,
    new_state: `${newStatus} (${newStage})`,
    details: comments ? `Action: ${action}. Comment: ${comments}` : `Action: ${action}`,
    created_at: new Date().toISOString()
  });

  // Notify Relevant Stakeholders
  // 1. Notify Request Creator
  db.insert('notifications', {
    user_id: request.user_id,
    title: `Request ${request.request_number} Updated`,
    message: `Your request status changed to ${newStatus} (${action} by ${actorUser.full_name}).`,
    link: `/requests/${request.id}`,
    is_read: 0,
    created_at: new Date().toISOString()
  });

  // Real-Time WebSocket Event Emission
  try {
    const { emitToUser } = require('../services/socketService');
    emitToUser(request.user_id, 'notification', {
      title: `Request ${request.request_number} Updated`,
      message: `Your request status changed to ${newStatus} (${action} by ${actorUser.full_name}).`,
      link: `/requests/${request.id}`
    });
  } catch (e) {
    // Socket emit optional
  }

  return {
    request: updatedRequest,
    sla: calculateSLAStatus(updatedRequest)
  };
}

module.exports = {
  getWorkflowStages,
  processWorkflowTransition
};
