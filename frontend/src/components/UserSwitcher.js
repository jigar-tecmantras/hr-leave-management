const USERS = [
  { label: 'HR Admin', email: 'hr@example.com' },
  { label: 'Alice (Engineering)', email: 'alice@example.com' },
  { label: 'Bob (Marketing)', email: 'bob@example.com' },
];

export default function UserSwitcher({ value, onChange }) {
  return (
    <label className="user-switcher">
      View as
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {USERS.map((user) => (
          <option key={user.email} value={user.email}>
            {user.label} — {user.email}
          </option>
        ))}
      </select>
    </label>
  );
}
