const requiredClientEnv = {
  appUrl: import.meta.env.VITE_PUBLIC_APP_URL as string | undefined,
}

export const env = {
  appUrl: requiredClientEnv.appUrl?.replace(/\/$/, '') || '',
}

export const getBaseAppUrl = (origin?: string) => {
  if (env.appUrl) {
    return env.appUrl
  }

  if (origin) {
    return origin.replace(/\/$/, '')
  }

  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  return ''
}
