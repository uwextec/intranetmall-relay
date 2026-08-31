const FALLBACK = '#e6e6e6'

/**
 * Extrai uma cor predominante para usar como fundo (CSS rgb ou hex).
 * Amostragem baixa (~32²) para ficar rápido no totem.
 */
export function getDominantColorFromImage(img: HTMLImageElement): string {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return FALLBACK
  }

  const sampleSize = 32
  canvas.width = sampleSize
  canvas.height = sampleSize

  try {
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize)
  } catch {
    return FALLBACK
  }

  const { data } = ctx.getImageData(0, 0, sampleSize, sampleSize)
  const histogram = new Map<string, number>()
  const channelStep = 24

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 20) {
      continue
    }

    const r = Math.floor(data[i] / channelStep) * channelStep
    const g = Math.floor(data[i + 1] / channelStep) * channelStep
    const b = Math.floor(data[i + 2] / channelStep) * channelStep
    const key = `${r},${g},${b}`

    histogram.set(key, (histogram.get(key) ?? 0) + 1)
  }

  let bestKey = FALLBACK
  let bestCount = 0

  histogram.forEach((count, key) => {
    if (count <= bestCount) {
      return
    }
    bestCount = count
    bestKey = `rgb(${key})`
  })

  return bestCount === 0 ? FALLBACK : bestKey
}
