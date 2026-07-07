const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { initDb } = require('./src/db');
const authMiddleware = require('./src/middleware/auth');
const leaveTypesRoutes = require('./src/routes/leaveTypes');
const leaveRequestsRoutes = require('./src/routes/leaveRequests');
const dashboardRoutes = require('./src/routes/dashboard');
const reportsRoutes = require('./src/routes/reports');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

initDb();

app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000' }));
app.use(morgan('tiny'));
app.use(express.json());
app.use(authMiddleware);

app.use('/api/leave-types', leaveTypesRoutes);
app.use('/api/leave-requests', leaveRequestsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportsRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Unexpected server error';
  res.status(status).json({ message });
});

app.listen(PORT, () => {
  console.log(`HR Leave API listening on port ${PORT}`);
});
