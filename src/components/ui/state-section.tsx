import { Button } from './button'
import { Text } from './typography'

type StateSectionProps = {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export const StateSection = ({
  title,
  description,
  actionLabel,
  onAction,
}: StateSectionProps) => {
  return (
    <section className="rounded-[1.375rem] bg-white px-6 py-10 text-center shadow-[0_4px_27.5px_var(--Color-Shadow-Soft)]">
      <Text as="h3" variant="h3" className="text-[var(--Color-Heading)]">
        {title}
      </Text>
      <Text className="mx-auto mt-3 max-w-xl text-[var(--Color-Text-Muted)]">{description}</Text>
      {actionLabel && onAction ? (
        <div className="mt-6">
          <Button className="bg-[#374248] text-white hover:bg-[#2D363B]" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      ) : null}
    </section>
  )
}
