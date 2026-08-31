/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_APP_URL?: string
  readonly VITE_MALL_NAME?: string
  readonly VITE_MALL_LOGO_URL?: string
  readonly VITE_MALL_LOGO_ALT?: string
  readonly VITE_MALL_COLOR_PRIMARY?: string
  readonly VITE_MALL_COLOR_HEADING?: string
  readonly VITE_MALL_COLOR_BACKGROUND?: string
  /** Meta description padrão (OG/Twitter). Se omitir, gera texto com `VITE_MALL_NAME`. */
  readonly VITE_SEO_DESCRIPTION?: string
  /** Ex.: @ShoppingCuritiba — opcional; preenche `twitter:site`. */
  readonly VITE_TWITTER_SITE?: string
  /** Opcional; preenche `twitter:creator` (perfil ou marca). */
  readonly VITE_TWITTER_CREATOR?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
