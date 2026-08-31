import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { QrPanel } from '../components/jobs/qr-panel'
import { PageShell } from '../components/layout/page-shell'
import { Button } from '../components/ui/button'
import { StateSection } from '../components/ui/state-section'
import { Text } from '../components/ui/typography'
import { buildJobQrScanValue } from '../features/jobs/qr-destination'
import { getJobIdFromParam } from '../features/jobs/normalizers'
import { useJobs } from '../features/jobs/useJobs'
import { currentMall } from '../config/mall'
import { dispatchSeoRefresh } from '../config/seo-events'
import { useDocumentTitle } from '../hooks/use-document-title'

type JobDetailPageProps = {
  isTotem?: boolean
}

export const JobDetailPage = ({ isTotem = false }: JobDetailPageProps) => {
  const { idOuSlug = '' } = useParams()
  const { jobs, isLoading, error } = useJobs()

  const jobId = getJobIdFromParam(idOuSlug)
  const job = jobs.find((item) => item.id === jobId)
  const backPath = isTotem ? '/totem/vagas' : '/vagas'

  useDocumentTitle(job ? `${currentMall.name} | ${job.title}` : `${currentMall.name} | Vaga`)

  useEffect(() => {
    if (isLoading) {
      return
    }
    dispatchSeoRefresh()
  }, [isLoading, job?.id, job?.title])

  return (
    <PageShell isTotem={isTotem}>
      <section className="px-6 py-8 sm:px-10 lg:px-16">
        <Link className="inline-flex text-sm font-medium text-[var(--Color-Primary)]" to={backPath}>
          Voltar para vagas
        </Link>

        <div className="mt-6 rounded-[1.375rem] bg-[var(--Color-Base-03)] p-5 shadow-[0_4px_27.5px_var(--Color-Shadow-Soft)] sm:p-8">
          {isLoading ? (
            <StateSection
              description="Carregando detalhes da vaga."
              title="Buscando informações"
            />
          ) : null}

          {!isLoading && error ? (
            <StateSection
              description={error}
              title="Não foi possível carregar a vaga"
            />
          ) : null}

          {!isLoading && !error && !job ? (
            <StateSection
              description="A vaga informada não foi encontrada ou pode ter sido removida."
              title="Vaga indisponivel"
            />
          ) : null}

          {!isLoading && !error && job ? (
            <article className="grid gap-8 rounded-[1.375rem] bg-white p-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8">
              <div>
                <Text as="p" variant="label" className="text-[var(--Color-Text-Muted)]">
                  {job.storeName}
                </Text>
                <Text as="h1" variant="h2" className="mt-2 text-[var(--Color-Heading)]">
                  {job.title}
                </Text>
                <Text className="mt-4 text-[var(--Color-Text-Muted)]">{job.roleType}</Text>

                <div className="mt-8 space-y-4">
                  {job.descriptionParagraphs.map((paragraph) => (
                    <Text className="text-[var(--Color-Base-02)]" key={paragraph}>
                      {paragraph}
                    </Text>
                  ))}
                </div>

                {job.requirements.length > 0 ? (
                  <section className="mt-8">
                    <Text as="h2" variant="h5" className="text-[var(--Color-Heading)]">
                      Requisitos
                    </Text>
                    <ul className="mt-4 space-y-2">
                      {job.requirements.map((item) => (
                        <li className="text-[var(--Color-Text-Muted)]" key={item}>
                          - {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {!isTotem ? (
                  <div className="mt-8">
                    {job.email ? (
                      <a href={`mailto:${job.email}?subject=${encodeURIComponent(`Vaga ${job.title}`)}`}>
                        <Button>Falar com a loja</Button>
                      </a>
                    ) : (
                      <Text variant="small" className="text-[var(--Color-Text-Muted)]">
                        O contato direto nao foi informado. Recomendamos procurar a loja no shopping.
                      </Text>
                    )}
                  </div>
                ) : null}
              </div>

              <aside className="space-y-4">
                <QrPanel
                  contactSubtitle={
                    job.email?.trim()
                      ? job.email.trim()
                      : 'Escaneie para abrir a página desta vaga no celular.'
                  }
                  title="Continue a candidatura no celular"
                  url={buildJobQrScanValue(job)}
                />
                {isTotem ? (
                  <Text variant="small" className="text-center text-[var(--Color-Text-Muted)]">
                    Este totem e apenas consultivo. Escaneie o codigo para continuar fora do totem.
                  </Text>
                ) : null}
              </aside>
            </article>
          ) : null}
        </div>
      </section>
    </PageShell>
  )
}
