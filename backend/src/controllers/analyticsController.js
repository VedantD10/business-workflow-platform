const db = require('../database/db');
const { successResponse } = require('../utils/response');
const { calculateSLAStatus } = require('../engine/slaEngine');

async function getDashboardMetrics(req, res, next) {
  try {
    const user = req.user;
    const allRequests = db.find('requests');
    const hydratedAll = allRequests.map(r => ({
      ...r,
      sla: calculateSLAStatus(r)
    }));

    // 1. EMPLOYEE METRICS
    const myRequests = hydratedAll.filter(r => r.user_id === user.id);
    const employeeMetrics = {
      active_requests: myRequests.filter(r => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)).length,
      awaiting_action: myRequests.filter(r => r.status === 'CHANGES_REQUESTED').length,
      recently_completed: myRequests.filter(r => r.status === 'COMPLETED').length,
      overdue_requests: myRequests.filter(r => r.sla && r.sla.is_overdue).length,
      status_summary: {
        submitted: myRequests.filter(r => r.status === 'SUBMITTED').length,
        under_review: myRequests.filter(r => r.status === 'UNDER_REVIEW').length,
        approval_pending: myRequests.filter(r => r.status === 'APPROVAL_PENDING').length,
        processing: myRequests.filter(r => r.status === 'PROCESSING').length,
        completed: myRequests.filter(r => r.status === 'COMPLETED').length,
        rejected: myRequests.filter(r => r.status === 'REJECTED').length
      }
    };

    // 2. MANAGER METRICS
    const teamUserIds = db.find('users', u => u.manager_id === user.id).map(u => u.id);
    const teamRequests = hydratedAll.filter(r => teamUserIds.includes(r.user_id));
    const managerMetrics = {
      pending_approvals: teamRequests.filter(r => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING'].includes(r.status)).length,
      team_total: teamRequests.length,
      urgent_requests: teamRequests.filter(r => r.priority === 'URGENT' || r.priority === 'HIGH').length,
      sla_warnings: teamRequests.filter(r => r.sla && (r.sla.is_overdue || r.sla.sla_status === 'APPROACHING_SLA')).length,
      recently_decided: db.count('approvals', a => a.approver_id === user.id)
    };

    // 3. DEPARTMENT METRICS
    const deptRequests = hydratedAll.filter(r => r.department_id === user.department_id);
    const departmentMetrics = {
      assigned_requests: deptRequests.filter(r => r.status === 'PROCESSING').length,
      pending_work: deptRequests.filter(r => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)).length,
      in_progress: deptRequests.filter(r => r.status === 'PROCESSING').length,
      overdue: deptRequests.filter(r => r.sla && r.sla.is_overdue).length,
      workload_by_type: {
        SOFTWARE_ACCESS: deptRequests.filter(r => r.request_type_code === 'SOFTWARE_ACCESS').length,
        EXPENSE_REIMBURSEMENT: deptRequests.filter(r => r.request_type_code === 'EXPENSE_REIMBURSEMENT').length,
        DOCUMENT_APPROVAL: deptRequests.filter(r => r.request_type_code === 'DOCUMENT_APPROVAL').length,
        EQUIPMENT_REQUEST: deptRequests.filter(r => r.request_type_code === 'EQUIPMENT_REQUEST').length
      }
    };

    // 4. OPERATIONS & ADMIN OVERALL METRICS
    const totalRequests = hydratedAll.length;
    const openRequests = hydratedAll.filter(r => !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)).length;
    const pendingApprovalsTotal = hydratedAll.filter(r => ['SUBMITTED', 'UNDER_REVIEW', 'APPROVAL_PENDING'].includes(r.status)).length;
    const processingTotal = hydratedAll.filter(r => r.status === 'PROCESSING').length;
    const completedTotal = hydratedAll.filter(r => r.status === 'COMPLETED').length;
    const overdueTotal = hydratedAll.filter(r => r.sla && r.sla.is_overdue).length;

    // Requests by Department
    const departments = db.find('departments');
    const requestsByDepartment = departments.map(d => ({
      department_code: d.code,
      department_name: d.name,
      total: hydratedAll.filter(r => r.department_id === d.id).length,
      open: hydratedAll.filter(r => r.department_id === d.id && !['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)).length,
      overdue: hydratedAll.filter(r => r.department_id === d.id && r.sla && r.sla.is_overdue).length
    }));

    // Requests by Category
    const requestTypes = db.find('request_types');
    const requestsByCategory = requestTypes.map(rt => ({
      category_code: rt.code,
      category_name: rt.name,
      sla_hours: rt.sla_hours,
      total: hydratedAll.filter(r => r.request_type_code === rt.code).length,
      completed: hydratedAll.filter(r => r.request_type_code === rt.code && r.status === 'COMPLETED').length,
      overdue: hydratedAll.filter(r => r.request_type_code === rt.code && r.sla && r.sla.is_overdue).length
    }));

    // SLA Performance Calculation
    const completedRequests = hydratedAll.filter(r => r.status === 'COMPLETED');
    const completedWithinSlaCount = completedRequests.filter(r => r.sla && r.sla.sla_status === 'COMPLETED_WITHIN_SLA').length;
    const slaPerformancePercent = completedRequests.length > 0
      ? Math.round((completedWithinSlaCount / completedRequests.length) * 100)
      : 100;

    // Average Processing Time (Hours)
    let totalElapsedHours = 0;
    completedRequests.forEach(r => {
      if (r.sla) totalElapsedHours += r.sla.elapsed_hours;
    });
    const avgProcessingTimeHours = completedRequests.length > 0
      ? Math.round((totalElapsedHours / completedRequests.length) * 10) / 10
      : 0;

    // Smart Bottleneck Analysis: Count open requests per workflow stage
    const stageCounts = {};
    hydratedAll.forEach(r => {
      if (!['COMPLETED', 'REJECTED', 'CANCELLED'].includes(r.status)) {
        stageCounts[r.current_stage] = (stageCounts[r.current_stage] || 0) + 1;
      }
    });

    const bottlenecks = Object.keys(stageCounts).map(stage => ({
      stage_name: stage,
      pending_count: stageCounts[stage]
    })).sort((a, b) => b.pending_count - a.pending_count);

    const operationsMetrics = {
      total_requests: totalRequests,
      open_requests: openRequests,
      pending_approvals: pendingApprovalsTotal,
      in_progress_requests: processingTotal,
      completed_requests: completedTotal,
      overdue_requests: overdueTotal,
      requests_by_department: requestsByDepartment,
      requests_by_category: requestsByCategory,
      sla_performance_percent: slaPerformancePercent,
      avg_processing_time_hours: avgProcessingTimeHours,
      bottleneck_analysis: bottlenecks
    };

    return successResponse(res, {
      employee: employeeMetrics,
      manager: managerMetrics,
      department: departmentMetrics,
      operations: operationsMetrics
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDashboardMetrics
};
