const upsertMetaByName = (name: string, content: string) => {
  const selector = `meta[name="${name}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const upsertMetaByProperty = (property: string, content: string) => {
  const selector = `meta[property="${property}"]`
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

const upsertCanonical = (href: string) => {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export type SocialMetaPayload = {
  title: string
  description: string
  canonicalUrl: string
  absoluteImageUrl: string
  siteName: string
  twitterSite?: string
  twitterCreator?: string
}

export const applySocialMetaTags = (payload: SocialMetaPayload) => {
  upsertMetaByName('description', payload.description)

  upsertCanonical(payload.canonicalUrl)

  upsertMetaByProperty('og:type', 'website')
  upsertMetaByProperty('og:site_name', payload.siteName)
  upsertMetaByProperty('og:locale', 'pt_BR')
  upsertMetaByProperty('og:title', payload.title)
  upsertMetaByProperty('og:description', payload.description)
  upsertMetaByProperty('og:url', payload.canonicalUrl)
  upsertMetaByProperty('og:image', payload.absoluteImageUrl)

  upsertMetaByName('twitter:card', 'summary_large_image')
  upsertMetaByName('twitter:title', payload.title)
  upsertMetaByName('twitter:description', payload.description)
  upsertMetaByName('twitter:image', payload.absoluteImageUrl)

  if (payload.twitterSite) {
    upsertMetaByName('twitter:site', payload.twitterSite)
  }

  if (payload.twitterCreator) {
    upsertMetaByName('twitter:creator', payload.twitterCreator)
  }
}
