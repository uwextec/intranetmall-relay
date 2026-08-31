import { getBaseAppUrl } from '../../config/env'
import type { Job } from './types'

export const buildJobPublicUrl = (job: Pick<Job, 'slug'>) => {
  const base = getBaseAppUrl().replace(/\/$/, '')
  return `${base}/vagas/${job.slug}`
}

/**
 * Valor codificado no QR: com e-mail da API, abre o app de e-mail no celular;
 * sem e-mail, abre a página pública da vaga.
 */
export const buildJobQrScanValue = (job: Job) => {
  const email = job.email?.trim()
  if (email) {
    const subject = encodeURIComponent(`Interesse na vaga: ${job.title}`)
    return `mailto:${email}?subject=${subject}`
  }

  return buildJobPublicUrl(job)
}
