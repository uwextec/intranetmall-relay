import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { currentMall } from './config/mall'

const applyMallColors = () => {
  const root = document.documentElement

  root.style.setProperty('--Color-Primary', currentMall.colors.primary)
  root.style.setProperty('--Color-Heading', currentMall.colors.heading)
  root.style.setProperty('--Color-Background', currentMall.colors.background)
}

applyMallColors()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
