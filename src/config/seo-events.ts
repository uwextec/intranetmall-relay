/** Disparado quando `document.title` muda sem troca de rota (ex.: detalhe da vaga após carregar). */
export const LP_SEO_REFRESH_EVENT = 'lp-seo-refresh'

export const dispatchSeoRefresh = () => {
  if (typeof window === 'undefined') {
    return
  }
  window.dispatchEvent(new Event(LP_SEO_REFRESH_EVENT))
}
