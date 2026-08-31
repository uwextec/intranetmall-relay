export const colors = {
  background: 'var(--Color-Background)',
  surface: 'var(--Color-Surface)',
  surfaceAlt: 'var(--Color-Base-03)',
  surfaceMuted: 'var(--Color-Base-03)',
  primary: 'var(--Color-Primary)',
  primaryForeground: 'var(--Color-Surface)',
  heading: 'var(--Color-Heading)',
  text: 'var(--Color-Base-02)',
  textMuted: 'var(--Color-Text-Muted)',
  textSoft: 'var(--Color-Text-Soft)',
  border: 'var(--Color-Border-Default)',
  shadow: '0 4px 27.5px var(--Color-Shadow-Soft)',
  buttonShadow: '0 4px 47.4px var(--Color-Shadow-Strong)',
} as const

export const spacing = {
  section: 'clamp(1.5rem, 2vw, 2.625rem)',
  container: 'min(100% - 2rem, 72rem)',
  totemContainer: 'min(100% - 3rem, 64rem)',
} as const

export const radius = {
  page: '2.75rem',
  section: '1.375rem',
  card: '1.25rem',
  button: '999px',
  qr: '0.75rem',
} as const

export const typography = {
  h1: 'text-[clamp(3rem,7vw,6rem)] leading-[0.95] font-bold tracking-[-0.03em]',
  h2: 'text-[clamp(1.75rem,4vw,3rem)] leading-[1.1] font-medium',
  h3: 'text-[1.5rem] leading-[1.2] font-semibold',
  h4: 'text-[1.25rem] leading-[1.25] font-semibold',
  h5: 'text-[1rem] leading-[1.4] font-semibold',
  h6: 'text-[0.875rem] leading-[1.4] font-semibold uppercase tracking-[0.08em]',
  p: 'text-[1rem] leading-[1.7] font-normal',
  bodyMd: 'text-[0.9375rem] leading-[1.625rem] font-normal tracking-[-0.02em]',
  bodyMdMedium: 'text-[0.9375rem] leading-[1.625rem] font-medium tracking-[-0.02em]',
  small: 'text-[0.875rem] leading-[1.6] font-normal',
  smallMedium: 'text-[0.875rem] leading-[1.6] font-medium',
  caption: 'text-[0.8125rem] leading-[1.5] font-normal',
  captionMedium: 'text-[0.8125rem] leading-[1.5] font-medium',
  label: 'text-[0.9375rem] leading-[1.5] font-medium',
  cardTitle: 'text-[1rem] leading-[1.5] font-bold tracking-[-0.02em] normal-case',
  cardSubtitle: 'text-[0.875rem] leading-[1.5] font-bold tracking-[-0.02em] normal-case',
} as const
