import { formatTime } from '../../utils/formatTime';

export default function TimestampBadge({ seconds, onClick, onClear, removable = false }) {
  return (
    <span
      onClick={() => onClick?.(seconds)}
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-dm-mid text-dm-light ${
        onClick ? 'cursor-pointer hover:bg-dm-accent/30' : ''
      } transition-colors`}
    >
      {formatTime(seconds)}
      {removable && (
        <button
          onClick={(e) => { e.stopPropagation(); onClear?.(); }}
          className="ml-0.5 text-dm-muted hover:text-dm-text"
        >
          &times;
        </button>
      )}
    </span>
  );
}
