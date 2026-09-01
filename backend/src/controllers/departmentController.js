const db = require('../database/db');
const { successResponse } = require('../utils/response');

async function getDepartments(req, res, next) {
  try {
    const departments = db.find('departments');
    const enriched = departments.map(d => {
      const userCount = db.count('users', u => u.department_id === d.id);
      const requestCount = db.count('requests', r => r.department_id === d.id);
      return {
        ...d,
        user_count: userCount,
        request_count: requestCount
      };
    });
    return successResponse(res, enriched);
  } catch (err) {
    next(err);
  }
}

async function getRequestTypes(req, res, next) {
  try {
    const types = db.find('request_types');
    const enriched = types.map(rt => {
      const stages = db.find('workflow_stages', ws => ws.request_type_code === rt.code);
      return {
        ...rt,
        stages: stages.sort((a, b) => a.stage_order - b.stage_order)
      };
    });
    return successResponse(res, enriched);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getDepartments,
  getRequestTypes
};
