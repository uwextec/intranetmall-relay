import { Navigate, useParams } from 'react-router-dom'

export const LegacyTrabalheVagasRedirect = () => <Navigate replace to="/vagas" />

export const LegacyTrabalheJobRedirect = () => {
  const { idOuSlug = '' } = useParams<{ idOuSlug: string }>()
  return <Navigate replace to={`/vagas/${idOuSlug}`} />
}

export const LegacyTotemLandingRedirect = () => <Navigate replace to="/totem" />

export const LegacyTotemVagasRedirect = () => <Navigate replace to="/totem/vagas" />

export const LegacyTotemJobRedirect = () => {
  const { idOuSlug = '' } = useParams<{ idOuSlug: string }>()
  return <Navigate replace to={`/totem/vagas/${idOuSlug}`} />
}
