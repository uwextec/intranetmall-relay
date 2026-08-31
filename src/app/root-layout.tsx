import { Outlet } from 'react-router-dom'

import { GlobalSeo } from '../components/global-seo'

export const RootLayout = () => (
  <>
    <Outlet />
    <GlobalSeo />
  </>
)
