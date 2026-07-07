const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/balances', (req, res) => {
  const leaveTypes = db.prepare('SELECT id, name, days_per_year FROM leave_types ORDER BY name').all();
  const employees = db.prepare('SELECT id, name, email FROM users WHERE role = ? ORDER BY name').all('employee');

  const balances = employees.map(employee => {
    const usage = db
      .prepare(
        `SELECT leave_type_id, SUM(days_requested) AS used
         FROM leave_requests
         WHERE user_id = ?
           AND status = 'approved'
         GROUP BY leave_type_id`
      )
      .all(employee.id)
      .reduce((acc, row) => {
        acc[row.leave_type_id] = row.used;
        return acc;
      }, {});

    const breakdown = leaveTypes.map(type => ({
      id: type.id,
      name: type.name,
      days_per_year: type.days_per_year,
      used: usage[type.id] || 0,
      remaining: Math.max(type.days_per_year - (usage[type.id] || 0), 0)
    }));

    return {
      ...employee,
      breakdown
    };
  });

  const typeTotals = leaveTypes.map(type => {
    const used = db
      .prepare(
        `SELECT COALESCE(SUM(days_requested), 0) AS used
         FROM leave_requests
         WHERE leave_type_id = ?
           AND status = 'approved'`
      )
      .get(type.id).used;
    return {
      id: type.id,
      name: type.name,
      days_per_year: type.days_per_year,
      used
    };
  });

  res.json({ balances, typeTotals });
});

module.exports = router;
