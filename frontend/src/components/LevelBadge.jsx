import { LEVEL_COLORS } from '../utils/constants';

export default function LevelBadge({ level, size = 'sm' }) {
  const colors = LEVEL_COLORS[level] || { bg: 'var(--pale)', fg: 'var(--jade)' };
  const isGradient = colors.bg.startsWith('linear');
  const pad = size === 'lg' ? '0.35rem 0.85rem' : '0.2rem 0.6rem';
  const fontSize = size === 'lg' ? '0.85rem' : '0.7rem';
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: pad,
        borderRadius: 20,
        fontSize,
        fontWeight: 700,
        letterSpacing: '0.02em',
        color: colors.fg,
        ...(isGradient ? { background: colors.bg } : { backgroundColor: colors.bg }),
      }}
    >
      {level}
    </span>
  );
}
