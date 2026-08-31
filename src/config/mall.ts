import logo from '../assets/logo.webp'

export type MallVisualConfig = {
  name: string
  logoUrl: string
  logoAlt: string
  colors: {
    primary: string
    heading: string
    background: string
  }
}

const defaultMall: MallVisualConfig = {
  name: 'Palladium Curitiba',
  logoUrl: logo,
  logoAlt: 'Palladium Curitiba',
  colors: {
    primary: '#3772FF',
    heading: '#111214',
    background: '#FBFEFF',
  },
}

const envString = (key: keyof ImportMetaEnv): string | undefined => {
  const raw = import.meta.env[key]
  if (typeof raw !== 'string') return undefined
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Configuracao visual do shopping atual.
 * Valores vêm de variáveis `VITE_*` no build (local: `.env`; Vercel: Environment Variables).
 * Se uma chave não existir, usa o padrão abaixo (Palladium).
 */
export const currentMall: MallVisualConfig = (() => {
  const name = envString('VITE_MALL_NAME') ?? defaultMall.name
  const logoUrl = envString('VITE_MALL_LOGO_URL') ?? defaultMall.logoUrl
  const logoAlt = envString('VITE_MALL_LOGO_ALT') ?? name

  return {
    name,
    logoUrl,
    logoAlt,
    colors: {
      primary: envString('VITE_MALL_COLOR_PRIMARY') ?? defaultMall.colors.primary,
      heading: envString('VITE_MALL_COLOR_HEADING') ?? defaultMall.colors.heading,
      background: envString('VITE_MALL_COLOR_BACKGROUND') ?? defaultMall.colors.background,
    },
  }
})()
