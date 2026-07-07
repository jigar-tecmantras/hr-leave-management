const { db } = require('../db');

function getUsedDays(userId, leaveTypeId, statuses = ['approved']) {
  if (!Array.isArray(statuses) || statuses.length === 0) {
    throw new Error('Statuses array cannot be empty');
  }

  const placeholder = statuses.map(() => '?').join(', ');
  const stmt = db.prepare(
    `SELECT COALESCE(SUM(days_requested), 0) as used
     FROM leave_requests
     WHERE user_id = ?
       AND leave_type_id = ?
       AND status IN (${placeholder})`
  );
  const params = [userId, leaveTypeId, ...statuses];
  const row = stmt.get(...params);
  return row?.used || 0;
}

function getRemainingDays(userId, leaveType, includePending = true) {
  const statuses = includePending ? ['approved', 'pending'] : ['approved'];
  const used = getUsedDays(userId, leaveType.id, statuses);
  const remaining = Math.max(leaveType.days_per_year - used, 0);
  return {
    used,
    remaining
  };
}

module.exports = {
  getUsedDays,
  getRemainingDays
};
