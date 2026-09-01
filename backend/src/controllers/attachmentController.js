const path = require('path');
const fs = require('fs');
const db = require('../database/db');
const config = require('../config/env');
const { successResponse } = require('../utils/response');
const { NotFoundError, ForbiddenError, BadRequestError } = require('../utils/errors');

async function uploadAttachment(req, res, next) {
  try {
    const requestId = Number(req.params.requestId);
    const request = db.findById('requests', requestId);

    if (!request) {
      throw new NotFoundError(`Request REQ-#${requestId} not found.`);
    }

    if (!req.file) {
      throw new BadRequestError('No file uploaded or file failed validation checks.');
    }

    const newAttachment = db.insert('attachments', {
      request_id: requestId,
      uploader_id: req.user.id,
      file_name: req.file.originalname,
      file_path: req.file.filename,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      uploaded_at: new Date().toISOString()
    });

    // Audit log
    db.insert('audit_logs', {
      request_id: requestId,
      actor_id: req.user.id,
      action: 'DOCUMENT_UPLOADED',
      previous_state: request.status,
      new_state: request.status,
      details: `Document uploaded: '${req.file.originalname}' (${(req.file.size / 1024).toFixed(1)} KB)`,
      created_at: new Date().toISOString()
    });

    return successResponse(res, newAttachment, 'File attached successfully', 201);
  } catch (err) {
    next(err);
  }
}

async function downloadAttachment(req, res, next) {
  try {
    const attachmentId = Number(req.params.id);
    const attachment = db.findById('attachments', attachmentId);

    if (!attachment) {
      throw new NotFoundError('Attachment record not found.');
    }

    const request = db.findById('requests', attachment.request_id);
    if (!request) {
      throw new NotFoundError('Associated request record not found.');
    }

    // Security Authorization Check: Ensure user has rights to access document
    const user = req.user;
    const creator = db.findById('users', request.user_id);
    const isOwner = request.user_id === user.id;
    const isAdminOrOps = ['SYSTEM_ADMIN', 'OPERATIONS_MANAGER'].includes(user.role);
    const isCreatorManager = creator && creator.manager_id === user.id;
    const isDeptStaff = ['REPORTING_MANAGER', 'DEPARTMENT_HEAD', 'DEPARTMENT_STAFF'].includes(user.role) &&
      (user.department_id === request.department_id || isCreatorManager);

    if (!isOwner && !isAdminOrOps && !isDeptStaff) {
      throw new ForbiddenError('Security Violation: You are not authorized to access or download this confidential attachment.');
    }

    const safeFilename = path.basename(attachment.file_path);
    const absolutePath = path.join(config.UPLOAD_DIR, safeFilename);

    if (!fs.existsSync(absolutePath)) {
      throw new NotFoundError('Physical file not found on disk storage.');
    }

    return res.download(absolutePath, attachment.file_name);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadAttachment,
  downloadAttachment
};
