import React, { useState, useEffect } from 'react';

interface PersonAvatarProps {
  name: string;
  photoUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const AVATAR_PALETTES = [
  { bg: '#e0e7ff', color: '#3730a3', border: '#c7d2fe' }, // indigo
  { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' }, // blue
  { bg: '#e0f2fe', color: '#0369a1', border: '#bae6fd' }, // sky
  { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }, // emerald
  { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' }, // slate
  { bg: '#fef3c7', color: '#92400e', border: '#fde68a' }, // amber
  { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' }, // purple
];

function getPalette(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVATAR_PALETTES.length;
  return AVATAR_PALETTES[index];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const PersonAvatar: React.FC<PersonAvatarProps> = ({
  name,
  photoUrl,
  size = 'sm',
  className = '',
}) => {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [photoUrl]);

  const sizePixels = {
    xs: 22,
    sm: 28,
    md: 36,
    lg: 48,
  }[size];

  const fontSize = {
    xs: '10px',
    sm: '11px',
    md: '13px',
    lg: '16px',
  }[size];

  const palette = getPalette(name || 'Unknown');
  const initials = getInitials(name || 'Unknown');

  // If photoUrl is valid and hasn't failed to load, render the real photo
  if (photoUrl && photoUrl.trim() !== '' && !imageFailed) {
    return (
      <span
        className={`person-avatar-wrap ${className}`}
        style={{
          width: `${sizePixels}px`,
          height: `${sizePixels}px`,
          minWidth: `${sizePixels}px`,
          minHeight: `${sizePixels}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: palette.bg,
          border: `1px solid ${palette.border}`,
          flexShrink: 0,
        }}
      >
        <img
          src={photoUrl}
          alt={name}
          onError={() => setImageFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      </span>
    );
  }

  // Fallback avatar with initials
  return (
    <span
      className={`person-avatar-wrap ${className}`}
      style={{
        width: `${sizePixels}px`,
        height: `${sizePixels}px`,
        minWidth: `${sizePixels}px`,
        minHeight: `${sizePixels}px`,
        borderRadius: '50%',
        backgroundColor: palette.bg,
        color: palette.color,
        border: `1px solid ${palette.border}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 600,
        fontSize: fontSize,
        lineHeight: 1,
        userSelect: 'none',
        flexShrink: 0,
        letterSpacing: '-0.02em',
      }}
      aria-label={name}
      title={name}
    >
      {initials}
    </span>
  );
};
