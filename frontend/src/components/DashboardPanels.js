export default function DashboardPanels({ dashboard, balances }) {
  if (!dashboard) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="dashboard-grid">
      <div className="panel-block">
        <h3>Pending approvals</h3>
        {dashboard.pending.length === 0 ? (
          <p>No pending requests</p>
        ) : (
          <ul>
            {dashboard.pending.map((item) => (
              <li key={item.id}>
                {item.employee_name} — {item.leave_type_name} ({item.days_requested} day(s))
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel-block">
        <h3>Upcoming time off</h3>
        {dashboard.upcoming.length === 0 ? (
          <p>No upcoming leaves</p>
        ) : (
          <ul>
            {dashboard.upcoming.map((item) => (
              <li key={item.id}>
                {item.employee_name}: {item.start_date} → {item.end_date}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="panel-block">
        <h3>Summary by status</h3>
        <ul>
          {dashboard.summary.map((item) => (
            <li key={item.status}>
              {item.status}: {item.total}
            </li>
          ))}
        </ul>
      </div>

      <div className="panel-block">
        <h3>Leave balances</h3>
        {balances.length === 0 ? (
          <p>No balance data</p>
        ) : (
          <div className="balance-stack">
            {balances.slice(0, 1).map((employee) => (
              <div key={employee.email}>
                <h4>{employee.name}</h4>
                <ul>
                  {employee.breakdown.map((item) => (
                    <li key={item.id}>
                      {item.name}: {item.used} used / {item.remaining} remaining
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="muted">Only the first employee is shown in this panel; see reports for all.</p>
          </div>
        )}
      </div>
    </div>
  );
}
