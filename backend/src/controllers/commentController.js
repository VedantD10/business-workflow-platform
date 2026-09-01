const db = require('../database/db');
const { successResponse } = require('../utils/response');
const { NotFoundError, BadRequestError } = require('../utils/errors');

async function addComment(req, res, next) {
  try {
    const requestId = Number(req.params.requestId);
    const { comment_text } = req.body;

    const request = db.findById('requests', requestId);
    if (!request) {
      throw new NotFoundError(`Request REQ-#${requestId} not found.`);
    }

    if (!comment_text || !comment_text.trim()) {
      throw new BadRequestError('Comment text cannot be empty.');
    }

    const newComment = db.insert('comments', {
      request_id: requestId,
      user_id: req.user.id,
      comment_text: comment_text.trim(),
      attachment_id: null
    });

    // Audit log
    db.insert('audit_logs', {
      request_id: requestId,
      actor_id: req.user.id,
      action: 'COMMENT_ADDED',
      previous_state: request.status,
      new_state: request.status,
      details: `Comment added by ${req.user.full_name}: "${comment_text.substring(0, 50)}..."`,
      created_at: new Date().toISOString()
    });

    // Notify request owner or manager
    const recipientId = request.user_id === req.user.id ? req.user.manager_id : request.user_id;
    if (recipientId) {
      db.insert('notifications', {
        user_id: recipientId,
        title: `New Comment on ${request.request_number}`,
        message: `${req.user.full_name} commented: "${comment_text.substring(0, 60)}"`,
        link: `/requests/${request.id}`,
        is_read: 0,
        created_at: new Date().toISOString()
      });
    }

    const author = db.findById('users', req.user.id);
    return successResponse(res, {
      ...newComment,
      author_name: author ? author.full_name : 'Unknown User',
      author_role: author ? author.role : null
    }, 'Comment added successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function getComments(req, res, next) {
  try {
    const requestId = Number(req.params.requestId);
    const comments = db.find('comments', c => c.request_id === requestId);
    const formatted = comments.map(c => {
      const author = db.findById('users', c.user_id);
      return {
        ...c,
        author_name: author ? author.full_name : 'Unknown User',
        author_role: author ? author.role : null
      };
    }).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return successResponse(res, formatted);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addComment,
  getComments
};
