const db = require('../database/db');
const { successResponse } = require('../utils/response');

async function getAuditLogs(req, res, next) {
  try {
    const { request_id, actor_id, action, limit = 50 } = req.query;
    let logs = db.find('audit_logs');

    if (request_id) {
      logs = logs.filter(l => l.request_id === Number(request_id));
    }
    if (actor_id) {
      logs = logs.filter(l => l.actor_id === Number(actor_id));
    }
    if (action) {
      logs = logs.filter(l => l.action === action);
    }

    logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const paginated = logs.slice(0, Number(limit));

    const enriched = paginated.map(l => {
      const actor = db.findById('users', l.actor_id);
      const reqRecord = db.findById('requests', l.request_id);
      return {
        ...l,
        actor_name: actor ? actor.full_name : 'System',
        actor_email: actor ? actor.email : null,
        request_number: reqRecord ? reqRecord.request_number : `REQ-#${l.request_id}`
      };
    });

    return successResponse(res, enriched);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAuditLogs
};
