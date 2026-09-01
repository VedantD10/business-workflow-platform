let ioInstance = null;

function setIO(io) {
  ioInstance = io;
}

function getIO() {
  return ioInstance;
}

function emitToUser(userId, event, data) {
  if (ioInstance) {
    ioInstance.to(`user_${userId}`).emit(event, data);
  }
}

function emitToDepartment(deptId, event, data) {
  if (ioInstance) {
    ioInstance.to(`dept_${deptId}`).emit(event, data);
  }
}

function emitToRole(role, event, data) {
  if (ioInstance) {
    ioInstance.to(`role_${role}`).emit(event, data);
  }
}

module.exports = {
  setIO,
  getIO,
  emitToUser,
  emitToDepartment,
  emitToRole
};
