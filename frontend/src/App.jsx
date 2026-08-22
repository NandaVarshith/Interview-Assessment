import { useState } from 'react'
import './styles/App.css'
import LandingPage from './pages/LandingPage'
import CandidatePortal from './pages/CandidatePortal'

function App() {
  const [showCandidatePortal, setShowCandidatePortal] = useState(false)
  if (showCandidatePortal) {
    return <CandidatePortal onExit={() => setShowCandidatePortal(false)} />
  }
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_42%,#ffffff_100%)]">
      <LandingPage onStartAssessment={() => setShowCandidatePortal(true)} />
    </main>
  )
}

export default App
