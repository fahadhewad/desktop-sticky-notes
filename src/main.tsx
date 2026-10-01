import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import QuickCapture from './components/QuickCapture'
import '@fontsource-variable/inter'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* The quick-add popup loads this same bundle with #quick. */}
    {window.location.hash === '#quick' ? <QuickCapture /> : <App />}
  </React.StrictMode>,
)
