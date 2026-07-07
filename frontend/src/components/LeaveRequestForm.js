import { useEffect, useState } from 'react';

export default function LeaveRequestForm({ leaveTypes = [], onSubmit, loading }) {
  const [form, setForm] = useState({
    leave_type_id: leaveTypes[0]?.id || '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      leave_type_id: leaveTypes[0]?.id || prev.leave_type_id,
    }));
  }, [leaveTypes]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      <label>
        Leave type
        <select name="leave_type_id" value={form.leave_type_id} onChange={handleChange} required>
          {leaveTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name} ({type.days_per_year} days / year)
            </option>
          ))}
        </select>
      </label>

      <label>
        Start date
        <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
      </label>

      <label>
        End date
        <input type="date" name="end_date" value={form.end_date} onChange={handleChange} required />
      </label>

      <label>
        Reason
        <textarea
          name="reason"
          value={form.reason}
          onChange={handleChange}
          placeholder="Optional note for HR"
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? 'Submitting…' : 'Request leave'}
      </button>
    </form>
  );
}
