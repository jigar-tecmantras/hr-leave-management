const statusStyles = {
  pending: 'status--pending',
  approved: 'status--approved',
  denied: 'status--denied',
  cancelled: 'status--cancelled',
};

export default function LeaveList({ requests = [], isHr, onStatusChange }) {
  return (
    <div className="leave-list">
      {requests.length === 0 && <p>No leave requests to show.</p>}
      {requests.map((request) => (
        <article key={request.id} className="leave-card">
          <header>
            <p className="meta">{new Date(request.submitted_at).toLocaleDateString()}</p>
            <span className={`status-pill ${statusStyles[request.status]}`}>
              {request.status}
            </span>
          </header>
          <strong>{request.leave_type_name}</strong>
          <p>
            {request.employee_name || request.employee_email}
            {request.reason ? ` — ${request.reason}` : ''}
          </p>
          <p>
            {request.start_date} → {request.end_date} ({request.days_requested} day(s))
          </p>
          {isHr && (
            <div className="actions">
              <button onClick={() => onStatusChange(request.id, 'approved')}>Approve</button>
              <button onClick={() => onStatusChange(request.id, 'denied')} className="danger">
                Deny
              </button>
              {request.status === 'approved' && (
                <button onClick={() => onStatusChange(request.id, 'cancelled')} className="secondary">
                  Cancel
                </button>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
