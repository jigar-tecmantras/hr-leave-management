const baseUrl = process.env.REACT_APP_API_BASE_URL || '';

async function request(path, options = {}, userEmail) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      'x-user-email': userEmail,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(data?.message || 'Unexpected error from server');
  }
  return data;
}

export const fetchLeaveTypes = (email) => request('/api/leave-types', { method: 'GET' }, email);
export const fetchLeaveRequests = (email) => request('/api/leave-requests', { method: 'GET' }, email);
export const fetchDashboard = (email) => request('/api/dashboard', { method: 'GET' }, email);
export const fetchBalances = (email) => request('/api/reports/balances', { method: 'GET' }, email);
export const createLeaveRequest = (email, payload) =>
  request('/api/leave-requests', { method: 'POST', body: payload }, email);
export const updateLeaveRequestStatus = (email, id, status) =>
  request(`/api/leave-requests/${id}`, { method: 'PATCH', body: { status } }, email);
