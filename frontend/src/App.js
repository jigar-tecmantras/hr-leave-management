import { useEffect, useMemo, useState } from 'react';
import LeaveRequestForm from './components/LeaveRequestForm';
import LeaveList from './components/LeaveList';
import DashboardPanels from './components/DashboardPanels';
import UserSwitcher from './components/UserSwitcher';
import {
  fetchLeaveTypes,
  fetchLeaveRequests,
  createLeaveRequest,
  updateLeaveRequestStatus,
  fetchDashboard,
  fetchBalances,
} from './api';

function App() {
  const [currentUser, setCurrentUser] = useState('hr@example.com');
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const isHr = useMemo(() => currentUser === 'hr@example.com', [currentUser]);

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [types, requests, dash, balanceReport] = await Promise.all([
        fetchLeaveTypes(currentUser),
        fetchLeaveRequests(currentUser),
        fetchDashboard(currentUser),
        fetchBalances(currentUser),
      ]);
      setLeaveTypes(types);
      setLeaveRequests(requests);
      setDashboard(dash);
      setBalances(balanceReport);
    } catch (err) {
      setError(err.message || 'Could not load data.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (payload) => {
    setActionLoading(true);
    setError(null);
    try {
      await createLeaveRequest(currentUser, payload);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to submit leave request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(true);
    setError(null);
    try {
      await updateLeaveRequestStatus(currentUser, id, status);
      await loadData();
    } catch (err) {
      setError(err.message || 'Failed to update leave status');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <h1>HR Leave Management</h1>
          <p>HR view and employee self-service in one workspace.</p>
        </div>
        <UserSwitcher value={currentUser} onChange={setCurrentUser} />
      </header>

      {error && <div className="notice error">{error}</div>}

      <section className="grid-two">
        <article className="panel">
          <h2>{isHr ? 'Requests overview' : 'Your leave history'}</h2>
          <LeaveList
            requests={leaveRequests}
            isHr={isHr}
            onStatusChange={handleStatusChange}
            loading={loading}
          />
        </article>
        <article className="panel">
          <h2>Balances & dashboard</h2>
          <DashboardPanels dashboard={dashboard} balances={balances} />
        </article>
      </section>

      {!isHr && (
        <article className="panel">
          <h2>Request time off</h2>
          <LeaveRequestForm
            leaveTypes={leaveTypes}
            onSubmit={handleSubmit}
            loading={actionLoading}
          />
        </article>
      )}
    </div>
  );
}

export default App;
