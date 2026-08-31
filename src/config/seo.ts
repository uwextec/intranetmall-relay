import { currentMall } from './mall'

const envString = (key: keyof ImportMetaEnv): string | undefined => {
  const raw = import.meta.env[key]
  if (typeof raw !== 'string') {
    return undefined
  }
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Texto para meta description e Open Graph / Twitter (pode sobrescrever por shopping).
 */
export const getDefaultSeoDescription = () => {
  const fromEnv = envString('VITE_SEO_DESCRIPTION')
  if (fromEnv) {
    return fromEnv
  }

  return `Vagas em aberto no ${currentMall.name}. Confira oportunidades, requisitos e candidatura com QR Code.`
}

export const getTwitterSiteHandle = () => {
  const raw = envString('VITE_TWITTER_SITE')
  if (!raw) {
    return undefined
  }

  return raw.startsWith('@') ? raw : `@${raw}`
}

export const getTwitterCreatorHandle = () => {
  const raw = envString('VITE_TWITTER_CREATOR')
  if (!raw) {
    return undefined
  }

  return raw.startsWith('@') ? raw : `@${raw}`
}

export const resolveAbsoluteUrl = (base: string, pathOrUrl: string) => {
  const trimmed = pathOrUrl.trim()
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed
  }

  const baseUrl = base.replace(/\/$/, '')
  const path = trimmed.startsWith('/') ? trimmed : `/${trimmed}`
  return `${baseUrl}${path}`
}
