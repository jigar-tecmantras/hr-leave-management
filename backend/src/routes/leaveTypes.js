const express = require('express');
const { db } = require('../db');
const { requireHr } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const leaveTypes = db
    .prepare('SELECT id, name, description, days_per_year FROM leave_types ORDER BY name')
    .all();
  res.json(leaveTypes);
});

router.post('/', requireHr, (req, res) => {
  const { name, description, days_per_year } = req.body;
  if (!name || !days_per_year) {
    return res.status(400).json({ message: 'Name and days_per_year are required' });
  }

  const stmt = db.prepare(
    'INSERT INTO leave_types (name, description, days_per_year) VALUES (?, ?, ?)'
  );
  const result = stmt.run(name.trim(), description || '', Number(days_per_year));
  const leaveType = db
    .prepare('SELECT id, name, description, days_per_year FROM leave_types WHERE id = ?')
    .get(result.lastInsertRowid);

  res.status(201).json(leaveType);
});

module.exports = router;
