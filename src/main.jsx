import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import ListTemplateFinal from './components/ListTemplateFinal.jsx'
import ListHouston from './components/ListHouston.jsx'
import FortMcHenry from './components/FortMcHenry.jsx'
import FortMcHenryAlt from './components/FortMcHenryAlt.jsx'
import TourMock from './components/TourMock.jsx'

function App() {
  const params = new URLSearchParams(window.location.search)
  const view = params.get('view') || 'list-final'

  let Comp = ListTemplateFinal
  if (view === 'list-houston') Comp = ListHouston
  if (view === 'fort') Comp = FortMcHenry || FortMcHenryAlt
  if (view === 'tour') Comp = TourMock

  // Build base href that works on GitHub Pages with a subpath
  const base = document.querySelector('base')?.getAttribute('href') || window.location.pathname.replace(/index\.html$/, '')

  const link = (v) => `${base}index.html?view=${v}`

  return (
    <div className="max-w-7xl mx-auto p-4">
      <nav className="flex flex-wrap gap-3 mb-4 text-sm underline">
        <a href={link('list-final')}>List: Final</a>
        <a href={link('list-houston')}>List: Houston</a>
        <a href={link('fort')}>Fort McHenry</a>
        <a href={link('tour')}>Self-Guided Tour</a>
      </nav>
      <div className="h-full">
        <Comp />
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)
