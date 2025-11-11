// ⚠️ StrictMode deshabilitado temporalmente para evitar loop infinito de peticiones
// StrictMode causa que useEffect se ejecute 2 veces en desarrollo, lo que con
// el CartContext causa un loop infinito de peticiones al backend
// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/main.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)