import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { currentMall } from '../config/mall'
import { getBaseAppUrl } from '../config/env'
import { LP_SEO_REFRESH_EVENT } from '../config/seo-events'
import {
  getDefaultSeoDescription,
  getTwitterCreatorHandle,
  getTwitterSiteHandle,
  resolveAbsoluteUrl,
} from '../config/seo'
import { applySocialMetaTags } from '../lib/seo-tags'

/**
 * Atualiza description, Open Graph, Twitter Cards e canonical após cada navegação.
 * Roda depois das páginas filhas (Outlet antes deste componente no layout) para ler `document.title`.
 */
export const GlobalSeo = () => {
  const location = useLocation()

  useEffect(() => {
    const apply = () => {
      const base = getBaseAppUrl(window.location.origin)
      if (!base) {
        return
      }

      const pathWithSearch = `${location.pathname}${location.search}`
      const canonicalUrl = `${base}${pathWithSearch.startsWith('/') ? pathWithSearch : `/${pathWithSearch}`}`

      const title = document.title.trim() || `${currentMall.name} | Vagas`
      const description = getDefaultSeoDescription()
      const absoluteImageUrl = resolveAbsoluteUrl(base, currentMall.logoUrl)
      const twitterSite = getTwitterSiteHandle()
      const twitterCreator = getTwitterCreatorHandle()

      applySocialMetaTags({
        title,
        description,
        canonicalUrl,
        absoluteImageUrl,
        siteName: currentMall.name,
        twitterSite,
        twitterCreator,
      })
    }

    apply()
    window.addEventListener(LP_SEO_REFRESH_EVENT, apply)
    return () => window.removeEventListener(LP_SEO_REFRESH_EVENT, apply)
  }, [location.pathname, location.search, location.key])

  return null
}
