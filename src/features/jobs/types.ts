export type RawJob = {
  IdVaga: number | string
  IdLoja?: number | string | null
  TipoVaga?: string | null
  NomeDaVaga?: string | null
  NomeDaLoja?: string | null
  DescricaoDaVaga?: string | null
  EmailDaVaga?: string | null
  DataCadastro?: string | null
  /** Preenchido no servidor ao cruzar `NomeDaLoja` com o guia de lojas (WordPress). */
  storeFloorLabel?: string | null
}

export type Job = {
  id: string
  slug: string
  title: string
  storeName: string
  floor: string
  roleType: string
  description: string
  descriptionParagraphs: string[]
  requirements: string[]
  email: string | null
  storeId: string | null
  createdAt: string | null
}

export type JobFilters = {
  role: string
  store: string
}

export type JobsResponse = {
  jobs: RawJob[]
}

export type AreasResponse = {
  areas: string[]
}
