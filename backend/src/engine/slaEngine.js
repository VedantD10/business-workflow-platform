const db = require('../database/db');

/**
 * Calculates dynamic SLA status for any request based on real timestamps.
 * 
 * SLA Target Hours by Request Type:
 * - SOFTWARE_ACCESS: 24 hours
 * - EXPENSE_REIMBURSEMENT: 48 hours
 * - DOCUMENT_APPROVAL: 72 hours
 * - EQUIPMENT_REQUEST: 72 hours
 * 
 * SLA Statuses:
 * - WITHIN_SLA: Active request, elapsed time < 75% of target
 * - APPROACHING_SLA: Active request, elapsed time between 75% and 100% of target
 * - OVERDUE: Active request, elapsed time > target SLA
 * - COMPLETED_WITHIN_SLA: Completed request, total duration <= target SLA
 * - COMPLETED_AFTER_SLA: Completed request, total duration > target SLA
 */

function calculateSLAStatus(request) {
  if (!request) return null;

  const requestType = db.findOne('request_types', rt => rt.code === request.request_type_code);
  const targetHours = requestType ? requestType.sla_hours : 48;

  const createdAt = new Date(request.created_at).getTime();
  const targetMs = targetHours * 60 * 60 * 1000;
  const warningMs = targetMs * 0.75;

  const isCompleted = ['COMPLETED', 'REJECTED', 'CANCELLED'].includes(request.status);
  const endTime = isCompleted && request.completed_at
    ? new Date(request.completed_at).getTime()
    : Date.now();

  const elapsedMs = endTime - createdAt;
  const elapsedHours = Math.round((elapsedMs / (1000 * 60 * 60)) * 10) / 10;
  const remainingHours = Math.round(((targetMs - elapsedMs) / (1000 * 60 * 60)) * 10) / 10;

  let slaStatus = 'WITHIN_SLA';
  let badgeColor = 'green';

  if (isCompleted) {
    if (elapsedMs <= targetMs) {
      slaStatus = 'COMPLETED_WITHIN_SLA';
      badgeColor = 'emerald';
    } else {
      slaStatus = 'COMPLETED_AFTER_SLA';
      badgeColor = 'amber';
    }
  } else {
    if (elapsedMs > targetMs) {
      slaStatus = 'OVERDUE';
      badgeColor = 'red';
    } else if (elapsedMs >= warningMs) {
      slaStatus = 'APPROACHING_SLA';
      badgeColor = 'amber';
    } else {
      slaStatus = 'WITHIN_SLA';
      badgeColor = 'blue';
    }
  }

  return {
    sla_status: slaStatus,
    target_hours: targetHours,
    elapsed_hours: elapsedHours,
    remaining_hours: remainingHours,
    deadline: new Date(createdAt + targetMs).toISOString(),
    is_overdue: !isCompleted && elapsedMs > targetMs,
    badge_color: badgeColor
  };
}

module.exports = {
  calculateSLAStatus
};
