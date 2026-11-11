const COLORS = {
  PENDING: 'badge-amber',
  APPROVED: 'badge-green',
  REJECTED: 'badge-red',
  IN_PROGRESS: 'badge-blue',
  RESOLVED: 'badge-green',
};

export default function StatusBadge({ status }) {
  return <span className={`badge ${COLORS[status] || ''}`}>{status.replace('_', ' ')}</span>;
}
