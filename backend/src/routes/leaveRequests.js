const express = require('express');
const dayjs = require('dayjs');
const { db } = require('../db');
const { requireHr } = require('../middleware/auth');
const { getUsedDays } = require('../utils/leaveBalance');

const router = express.Router();
const VALID_STATUSES = ['pending', 'approved', 'denied', 'cancelled'];

function createAudit(leaveRequestId, changedBy, fromStatus, toStatus, note = '') {
  const stmt = db.prepare(
    'INSERT INTO audit_logs (leave_request_id, changed_by, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)'
  );
  stmt.run(leaveRequestId, changedBy, fromStatus, toStatus, note);
}

router.get('/', (req, res) => {
  const baseQuery = `
    SELECT lr.*, lt.name AS leave_type_name, u.name AS employee_name, u.email AS employee_email
    FROM leave_requests lr
    JOIN leave_types lt ON lt.id = lr.leave_type_id
    JOIN users u ON u.id = lr.user_id
  `;

  const whereClause = req.user.role === 'hr' ? '' : 'WHERE lr.user_id = ?';
  const orderClause = 'ORDER BY lr.submitted_at DESC';
  const finalQuery = `${baseQuery} ${whereClause} ${orderClause}`;
  const rows = req.user.role === 'hr'
    ? db.prepare(finalQuery).all()
    : db.prepare(finalQuery).all(req.user.id);

  res.json(rows);
});

router.post('/', (req, res) => {
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can submit self-service requests' });
  }

  const { leave_type_id, start_date, end_date, reason } = req.body;
  if (!leave_type_id || !start_date || !end_date) {
    return res.status(400).json({ message: 'leave_type_id, start_date, and end_date are required' });
  }

  const leaveType = db
    .prepare('SELECT id, name, days_per_year FROM leave_types WHERE id = ?')
    .get(leave_type_id);
  if (!leaveType) {
    return res.status(404).json({ message: 'Leave type not found' });
  }

  const start = dayjs(start_date);
  const end = dayjs(end_date);
  if (!start.isValid() || !end.isValid()) {
    return res.status(400).json({ message: 'Invalid date format' });
  }
  if (end.isBefore(start, 'day')) {
    return res.status(400).json({ message: 'End date must be the same or after start date' });
  }

  const daysRequested = end.diff(start, 'day') + 1;
  const overlap = db
    .prepare(
      `SELECT 1 FROM leave_requests
       WHERE user_id = ?
         AND status IN ('pending', 'approved')
         AND NOT (end_date < ? OR start_date > ?)
       LIMIT 1`
    )
    .get(req.user.id, start.format('YYYY-MM-DD'), end.format('YYYY-MM-DD'));
  if (overlap) {
    return res.status(400).json({ message: 'There's already a pending or approved leave in the requested window' });
  }

  const used = getUsedDays(req.user.id, leaveType.id, ['approved', 'pending']);
  if (used + daysRequested > leaveType.days_per_year) {
    return res.status(400).json({ message: 'Insufficient leave balance for the selected type' });
  }

  const insert = db.prepare(
    `INSERT INTO leave_requests (user_id, leave_type_id, start_date, end_date, days_requested, reason)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  const result = insert.run(
    req.user.id,
    leaveType.id,
    start.format('YYYY-MM-DD'),
    end.format('YYYY-MM-DD'),
    daysRequested,
    reason || ''
  );

  createAudit(result.lastInsertRowid, req.user.id, null, 'pending', 'Created by employee');

  const payload = db
    .prepare(
      `SELECT lr.*, lt.name AS leave_type_name
       FROM leave_requests lr
       JOIN leave_types lt ON lt.id = lr.leave_type_id
       WHERE lr.id = ?`
    )
    .get(result.lastInsertRowid);

  res.status(201).json(payload);
});

router.patch('/:id', requireHr, (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Invalid status update' });
  }

  const existing = db
    .prepare('SELECT id, status FROM leave_requests WHERE id = ?')
    .get(id);
  if (!existing) {
    return res.status(404).json({ message: 'Leave request not found' });
  }
  if (existing.status === status) {
    return res.status(400).json({ message: 'Leave request already in that status' });
  }

  db
    .prepare('UPDATE leave_requests SET status = ? WHERE id = ?')
    .run(status, id);

  createAudit(id, req.user.id, existing.status, status, note || 'Updated by HR');

  const updated = db
    .prepare(
      `SELECT lr.*, lt.name AS leave_type_name, u.name AS employee_name
       FROM leave_requests lr
       JOIN leave_types lt ON lt.id = lr.leave_type_id
       JOIN users u ON u.id = lr.user_id
       WHERE lr.id = ?`
    )
    .get(id);

  res.json(updated);
});

router.get('/:id/audit', requireHr, (req, res) => {
  const { id } = req.params;
  const logs = db
    .prepare(
      `SELECT al.*, u.name AS changed_by_name
       FROM audit_logs al
       JOIN users u ON u.id = al.changed_by
       WHERE al.leave_request_id = ?
       ORDER BY al.created_at DESC`
    )
    .all(id);
  res.json(logs);
});

module.exports = router;
