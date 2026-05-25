import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./styles/global.css"
import "./styles/global.css"
import "./styles/layout.css"
import "./styles/home.css"
import "./styles/ui.css"
import "./styles/responsive.css"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
