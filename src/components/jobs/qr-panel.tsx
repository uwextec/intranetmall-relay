import { QRCodeSVG } from 'qrcode.react'

import { Text } from '../ui/typography'

type QrPanelProps = {
  url: string
  title?: string
  /** Texto abaixo do título (ex.: e-mail exibido ou orientação ao candidato) */
  contactSubtitle?: string
}

export const QrPanel = ({
  url,
  title = 'Fale com a loja',
  contactSubtitle,
}: QrPanelProps) => {
  return (
    <div className="flex min-h-[223px] w-full min-w-0 max-w-none flex-col items-center justify-center gap-[18px] rounded-[20px] border border-[var(--Color-Border-Default)] bg-white p-[14px] sm:max-w-[272px]">
      <Text as="h3" variant="label" className="shrink-0 text-center text-[16px] leading-4 font-medium text-[var(--Color-Base-02)]">
        {title}
      </Text>
      {contactSubtitle ? (
        <Text
          as="p"
          variant="captionMedium"
          className="min-w-0 max-w-full break-all text-center text-[16px] leading-5 font-semibold text-[var(--Color-Heading)]"
        >
          {contactSubtitle}
        </Text>
      ) : null}
      <div className="flex justify-center">
        <div className="flex h-[114px] w-[119px] items-center justify-center rounded-[12px] bg-[var(--Color-QR-Surface)] p-[10px]">
          <QRCodeSVG bgColor="transparent" fgColor="var(--Color-Heading)" includeMargin size={96} value={url} />
        </div>
      </div>
    </div>
  )
}
