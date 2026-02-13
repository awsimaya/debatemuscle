export default function TagSelector({ label, options, value, onChange }) {
  return (
    <div>
      <label className="block text-sm text-dm-muted mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full bg-dm-dark border border-dm-mid rounded-lg px-3 py-2 text-dm-text focus:outline-none focus:border-dm-accent transition-colors"
      >
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
