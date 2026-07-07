const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const pending = db
    .prepare(
      `SELECT lr.*, lt.name AS leave_type_name, u.name AS employee_name
       FROM leave_requests lr
       JOIN leave_types lt ON lt.id = lr.leave_type_id
       JOIN users u ON u.id = lr.user_id
       WHERE lr.status = 'pending'
       ORDER BY lr.submitted_at DESC
       LIMIT 6`
    )
    .all();

  const upcoming = db
    .prepare(
      `SELECT lr.*, lt.name AS leave_type_name, u.name AS employee_name
       FROM leave_requests lr
       JOIN leave_types lt ON lt.id = lr.leave_type_id
       JOIN users u ON u.id = lr.user_id
       WHERE date(lr.start_date) >= date('now')
       ORDER BY lr.start_date ASC
       LIMIT 6`
    )
    .all();

  const approvals = db
    .prepare(
      `SELECT lr.*, lt.name AS leave_type_name, u.name AS employee_name
       FROM leave_requests lr
       JOIN leave_types lt ON lt.id = lr.leave_type_id
       JOIN users u ON u.id = lr.user_id
       WHERE lr.status = 'approved'
       ORDER BY lr.submitted_at DESC
       LIMIT 6`
    )
    .all();

  const summary = db
    .prepare(
      `SELECT status, COUNT(*) AS total
       FROM leave_requests
       GROUP BY status`
    )
    .all();

  res.json({ pending, upcoming, approvals, summary });
});

module.exports = router;
