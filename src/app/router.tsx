import { createBrowserRouter } from 'react-router-dom'

import {
  LegacyTotemJobRedirect,
  LegacyTotemLandingRedirect,
  LegacyTotemVagasRedirect,
  LegacyTrabalheJobRedirect,
  LegacyTrabalheVagasRedirect,
} from './legacy-route-redirects'
import { HomePage } from '../pages/home-page'
import { JobDetailPage } from '../pages/job-detail-page'
import { VagasPage } from '../pages/vagas-page'

import { RootLayout } from './root-layout'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/trabalhe-conosco',
        element: <HomePage />,
      },
      {
        path: '/vagas',
        element: <VagasPage />,
      },
      {
        path: '/vagas/:idOuSlug',
        element: <JobDetailPage />,
      },
      {
        path: '/trabalhe-conosco/vagas',
        element: <LegacyTrabalheVagasRedirect />,
      },
      {
        path: '/trabalhe-conosco/:idOuSlug',
        element: <LegacyTrabalheJobRedirect />,
      },
      {
        path: '/totem',
        element: <HomePage isTotem />,
      },
      {
        path: '/totem/vagas',
        element: <VagasPage isTotem />,
      },
      {
        path: '/totem/vagas/:idOuSlug',
        element: <JobDetailPage isTotem />,
      },
      {
        path: '/totem/trabalhe-conosco',
        element: <LegacyTotemLandingRedirect />,
      },
      {
        path: '/totem/trabalhe-conosco/vagas',
        element: <LegacyTotemVagasRedirect />,
      },
      {
        path: '/totem/trabalhe-conosco/:idOuSlug',
        element: <LegacyTotemJobRedirect />,
      },
    ],
  },
])
