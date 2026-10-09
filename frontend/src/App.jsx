import { useState } from 'react'
import './styles/App.css'
import DashboardHome from './pages/DashboardHome'
import CandidatePortal from './pages/CandidatePortal'

function App() {
  const [showCandidatePortal, setShowCandidatePortal] = useState(false)
  if (showCandidatePortal) {
    return <CandidatePortal onExit={() => setShowCandidatePortal(false)} />
  }
  return (
    <DashboardHome onStartAssessment={() => setShowCandidatePortal(true)} />
  )
}

export default App
