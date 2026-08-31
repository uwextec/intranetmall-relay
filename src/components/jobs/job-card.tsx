import type { ReactNode } from 'react'

import { CargoMetaIcon, HorarioMetaIcon, PisoMetaIcon, SalarioMetaIcon } from '../icons/job-card-meta-icons'
import type { Job } from '../../features/jobs/types'
import { buildJobQrScanValue } from '../../features/jobs/qr-destination'
import { Text } from '../ui/typography'
import { QrPanel } from './qr-panel'
import { RequirementsExpandable } from './requirements-expandable'

type JobCardProps = {
  job: Job
}

const MetaRow = ({ icon, label, value }: { icon: ReactNode; label: string; value: string }) => (
  <div className="flex min-w-0 items-center gap-[10px] pl-[5px] leading-[26px]">
    {icon}
    <Text
      variant="bodyMd"
      className="min-w-0 flex flex-1 items-baseline gap-1 text-base leading-[26px] tracking-[-0.02em] text-[#768696]"
    >
      <span className="shrink-0 text-base leading-[26px] text-[#768696]">{label}:</span>
      <span className="min-w-0 flex-1 truncate text-base leading-[26px] text-[#8F9AA4]">{value}</span>
    </Text>
  </div>
)

const buildRequirementsText = (job: Job) => {
  if (job.requirements.length > 0) {
    return job.requirements.join(' ')
  }

  return job.descriptionParagraphs.join(' ')
}

const buildScheduleText = (job: Job) => {
  const fullDescription = [job.description, ...job.descriptionParagraphs].join('\n')
  const scheduleMatch = fullDescription.match(
    /(?:hor[aá]rio(?:s)?(?: de trabalho)?|escala)\s*[-:]\s*([^\n\r]+)/i,
  )

  if (scheduleMatch?.[1]) {
    return scheduleMatch[1].trim()
  }

  if (job.roleType && !/mall/i.test(job.roleType)) {
    return job.roleType
  }

  return null
}

const buildFloorText = (job: Job) => {
  const floor = job.floor?.trim()
  if (!floor) {
    return 'Nao informado'
  }

  if (/mall/i.test(floor)) {
    return 'Nao informado'
  }

  return floor
}

export const JobCard = ({ job }: JobCardProps) => {
  const qrValue = buildJobQrScanValue(job)
  const requirementsText = buildRequirementsText(job) || 'Sem requisitos informados'
  const scheduleText = buildScheduleText(job)
  const floorText = buildFloorText(job)
  const contactSubtitle = job.email?.trim() || 'E-mail não informado — o QR abre a página da vaga'

  return (
    <article className="rounded-[22px] bg-white p-[22px]">
      <div className="grid min-w-0 grid-cols-1 gap-[20px] lg:grid-cols-[minmax(0,1fr)_272px] lg:items-start">
        <div className="grid min-w-0 gap-12 lg:grid-cols-2">
          <div className="min-w-0">
            <Text
              as="h3"
              variant="cardTitle"
              className="text-[16px] font-bold leading-[26px] tracking-[-0.02em] text-[var(--Color-Base-02)]"
            >
              {job.storeName}
            </Text>
            <div className="mt-3 space-y-3">
              <MetaRow icon={<PisoMetaIcon />} label="Piso" value={floorText} />
              <MetaRow icon={<CargoMetaIcon />} label="Cargo" value={job.title} />
              {scheduleText ? <MetaRow icon={<HorarioMetaIcon />} label="Horário" value={scheduleText} /> : null}
              <MetaRow icon={<SalarioMetaIcon />} label="Salário" value="A combinar" />
            </div>
          </div>

          <div className="min-w-0">
            <Text as="h4" variant="cardSubtitle" className="text-[14px] leading-[26px] text-[var(--Color-Base-02)]">
              Requisitos:
            </Text>
            <div className="mt-2">
              <RequirementsExpandable role={job.title} storeName={job.storeName} text={requirementsText} />
            </div>
          </div>
        </div>

        <div className="flex min-w-0 justify-center lg:justify-end">
          <QrPanel contactSubtitle={contactSubtitle} title="Fale com a loja" url={qrValue} />
        </div>
      </div>
    </article>
  )
}
