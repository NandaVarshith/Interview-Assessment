import { motion } from 'framer-motion'
import {
  BrainCircuit,
  CheckCircle2,
  Eye,
  FileBarChart,
  FileWarning,
  MessageSquareText,
  Sparkles,
  Target,
} from 'lucide-react'
import { Button } from '../components/ui/button'

const LEVEL_SCORES = { high: 100, medium: 70, low: 40 }
const asScore = (value) => {
  if (Number.isFinite(value)) return Math.max(0, Math.min(100, Math.round(value)))
  return LEVEL_SCORES[String(value || '').toLowerCase()] ?? null
}
const average = (values) => {
  const available = values.filter(Number.isFinite)
  return available.length ? Math.round(available.reduce((total, value) => total + value, 0) / available.length) : null
}
const formatReportDate = (value) => {
  if (!value) return 'Unavailable'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Unavailable' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function ReportCard({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h2 className="text-base font-black tracking-[-0.01em] text-slate-950">{title}</h2>
      {children}
    </section>
  )
}
function readSessionObject(key) {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(key) || 'null')
    return value && typeof value === 'object' ? value : null
  } catch {
    return null
  }
}
function EvaluationSignalCard({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{label}</p>
      <p className="mt-2 text-lg font-black capitalize text-slate-950">
        {value === null || value === undefined || value === '' ? 'Unavailable' : value}
      </p>
    </div>
  )
}
function SpeechAnalysis({ responses }) {
  const speechResponses = responses.filter((response) => response?.speech && typeof response.speech === 'object')
  if (speechResponses.length === 0) return null
  return (
    <ReportCard title="Speech Analysis" className="mt-5">
      <div className="mt-4 space-y-3">
        {speechResponses.map((response, index) => (
          <div key={`${response.questionIndex}-${response.type || 'main'}-${index}`} className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">
              Question {Number(response.questionIndex) + 1} {response.type && `· ${response.type}`}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                ['Clarity', response.speech.clarity],
                ['Fluency', response.speech.fluency],
                ['Speaking pace', response.speech.speakingPace],
                ['Filler usage', response.speech.fillerUsage],
                ['Repetition', response.speech.repetition],
              ].map(([label, value]) => <EvaluationSignalCard key={label} label={label} value={value} />)}
            </div>
          </div>
        ))}
      </div>
    </ReportCard>
  )
}
function AttentionAnalysis({ gazeMetrics }) {
  if (!gazeMetrics || typeof gazeMetrics !== 'object') return null
  const states = [
    ['Looking at screen', gazeMetrics.lookingAtScreenPercentage],
    ['Looking away', gazeMetrics.lookingAwayPercentage],
    ['Looking down', gazeMetrics.lookingDownPercentage],
  ].filter(([, value]) => Number(value) > 0)
  if (states.length === 0) return null
  return (
    <ReportCard title="Attention" className="mt-5">
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {states.map(([label, value]) => <EvaluationSignalCard key={label} label={label} value={`${Math.round(Number(value))}%`} />)}
      </div>
    </ReportCard>
  )
}
function ReportScoreCard({ item }) {
  const Icon = item.icon
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl text-white"
          style={{ backgroundColor: item.color }}
        >
          <Icon size={20} />
        </span>
        <span className="text-2xl font-black tracking-tight text-slate-950">{item.value}</span>
      </div>
      <p className="text-sm font-black text-slate-800">{item.label}</p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: item.color }}
          initial={{ width: 0 }}
          animate={{ width: `${item.value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
function CandidateReportRadarChart({ metrics }) {
  const center = 130
  const maxRadius = 88
  const points = metrics.map((metric, index) => {
    const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2
    const radius = (metric.value / 100) * maxRadius
    return {
      ...metric,
      x: center + Math.cos(angle) * radius,
      y: center + Math.sin(angle) * radius,
      labelX: center + Math.cos(angle) * 112,
      labelY: center + Math.sin(angle) * 112,
    }
  })
  const polygon = points.map((point) => `${point.x},${point.y}`).join(' ')
  return (
    <ReportCard title="Radar Chart">
      <svg className="mt-4 h-72 w-full" viewBox="0 0 260 260" aria-label="Candidate report radar chart">
        {[0.25, 0.5, 0.75, 1].map((scale) => (
          <polygon
            key={scale}
            points={metrics
              .map((_, index) => {
                const angle = (Math.PI * 2 * index) / metrics.length - Math.PI / 2
                return `${center + Math.cos(angle) * maxRadius * scale},${center + Math.sin(angle) * maxRadius * scale}`
              })
              .join(' ')}
            fill="none"
            stroke="#dbeafe"
            strokeWidth="1"
          />
        ))}
        {points.map((point) => (
          <line
            key={point.label}
            x1={center}
            y1={center}
            x2={point.labelX}
            y2={point.labelY}
            stroke="#e2e8f0"
            strokeWidth="1"
          />
        ))}
        <motion.polygon
          points={polygon}
          fill="rgba(37,99,235,0.18)"
          stroke="#2563eb"
          strokeWidth="3"
          initial={{ opacity: 0, scale: 0.86, transformOrigin: 'center' }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" fill="#0f766e" />
            <text
              x={point.labelX}
              y={point.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-slate-700 text-[10px] font-bold"
            >
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </ReportCard>
  )
}
function CandidateReportTimelineChart({ questions }) {
  const points = questions.map((item, index) => {
    const x = questions.length > 1 ? 32 + index * (232 / (questions.length - 1)) : 150
    const y = 160 - item.value * 1.2
    return { ...item, x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  return (
    <ReportCard title="Timeline Chart">
      <svg className="mt-4 h-72 w-full" viewBox="0 0 300 190" aria-label="Candidate report timeline chart">
        {[40, 80, 120, 160].map((y) => (
          <line key={y} x1="24" y1={y} x2="284" y2={y} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        <motion.path
          d={path}
          fill="none"
          stroke="#2563eb"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
        />
        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="5" fill="#0f766e" />
            <text
              x={point.x}
              y="178"
              textAnchor="middle"
              className="fill-slate-600 text-[10px] font-bold"
            >
              {point.label}
            </text>
            <text
              x={point.x}
              y={point.y - 10}
              textAnchor="middle"
              className="fill-slate-950 text-[10px] font-black"
            >
              {point.value}
            </text>
          </g>
        ))}
      </svg>
    </ReportCard>
  )
}
function QuestionWisePerformance({ questions }) {
  return (
    <ReportCard title="Question-wise Performance" className="lg:col-span-2">
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        {questions.map((item, index) => (
          <div
            key={item.question}
            className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[64px_1fr_120px]"
          >
            <div className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Q{index + 1}
            </div>
            <div>
              <p className="text-sm font-black text-slate-950">{item.question}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.signal || 'No answer-level evaluation was returned for this question.'}</p>
            </div>
            <div>
              <p className="text-right text-xl font-black text-slate-950">{item.score ?? '—'}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-700" style={{ width: `${item.score || 0}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ReportCard>
  )
}
function ReportInsightList({ title, items, icon: Icon, tone }) {
  const toneClasses = {
    strength: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    weakness: 'bg-rose-50 text-rose-700 border-rose-100',
    suggestion: 'bg-blue-50 text-blue-700 border-blue-100',
  }
  return (
    <ReportCard title={title}>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item} className={`flex gap-3 rounded-xl border p-3 ${toneClasses[tone]}`}>
            <Icon className="mt-0.5 shrink-0" size={18} />
            <p className="text-sm leading-6">{item}</p>
          </div>
        ))}
      </div>
    </ReportCard>
  )
}
function buildReportData(summary, evaluation) {
  const responses = Array.isArray(summary.responses) ? summary.responses : []
  const gaze = summary.gazeMetrics || {}
  const speechFluency = average(responses.map((response) => asScore(response?.speech?.fluency)))
  const eyeContact = Number(gaze.lookingAtScreenPercentage) > 0 ? Math.round(gaze.lookingAtScreenPercentage) : null
  const snapshot = [
    { label: 'Overall score', value: asScore(evaluation?.overallScore), icon: Target, color: '#2563eb' },
    { label: 'Technical knowledge', value: asScore(evaluation?.technicalKnowledge), icon: BrainCircuit, color: '#0f766e' },
    { label: 'Communication', value: asScore(evaluation?.communication), icon: MessageSquareText, color: '#7c3aed' },
    { label: 'Resume consistency', value: asScore(evaluation?.resumeConsistency), icon: CheckCircle2, color: '#0891b2' },
    { label: 'Attention', value: asScore(evaluation?.attention), icon: Eye, color: '#059669' },
    { label: 'Speech fluency', value: speechFluency, icon: Sparkles, color: '#d97706' },
  ].filter((item) => item.value !== null)
  const radar = [
    ['Technical', evaluation?.technicalKnowledge],
    ['Answer quality', evaluation?.answerQuality],
    ['Resume', evaluation?.resumeConsistency],
    ['Coverage', evaluation?.topicCoverage],
    ['Communication', evaluation?.communication],
    ['Attention', evaluation?.attention],
  ].map(([label, value]) => ({ label, value: asScore(value) })).filter((item) => item.value !== null)
  const questions = responses
    .filter((response) => response?.type === 'main' || !response?.type)
    .map((response) => {
      const answerEvaluation = response.evaluation || {}
      const score = average([
        asScore(answerEvaluation.correctness),
        asScore(answerEvaluation.relevance),
        asScore(answerEvaluation.depth),
      ])
      return {
        question: response.question || 'Interview question',
        score,
        signal: answerEvaluation.summary || (response.answer?.trim() ? 'Answer captured; no answer-level evaluation returned.' : 'No answer was submitted.'),
        label: `Q${Number(response.questionIndex) + 1}`,
      }
    })
  return { snapshot, radar, questions, eyeContact }
}
function CandidateReportPage({ candidate, onExit }) {
  const summary = readSessionObject('ai-interview-summary') || {}
  const evaluation = candidate.evaluation || readSessionObject('ai-interview-evaluation')
  const responses = Array.isArray(summary.responses) ? summary.responses : []
  const strengths = Array.isArray(evaluation?.strengths) ? evaluation.strengths : []
  const weaknesses = Array.isArray(evaluation?.weaknesses) ? evaluation.weaknesses : []
  const report = buildReportData(summary, evaluation)
  return (
    <main className="dark-report min-h-screen bg-[#07111f] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                <Sparkles size={14} /> Candidate Report
              </p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">
                {candidate.name}
              </h1>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {candidate.role} · {candidate.email} · Session {candidate.sessionId}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                onClick={onExit}
              >
                Back to Site
              </Button>
              <Button onClick={() => window.print()}>
                <FileBarChart size={17} />
                Download PDF
              </Button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[220px_1fr_280px]">
            <div className="rounded-2xl bg-slate-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Overall Score
              </p>
              <p className="mt-3 text-6xl font-black tracking-tight">
                {Number.isFinite(evaluation?.overallScore) ? evaluation.overallScore : '—'}
              </p>
              <p className="mt-2 text-sm font-bold text-cyan-200">
                {evaluation?.recommendation || 'Evaluation unavailable'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Executive Summary
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {evaluation?.summary || 'Interview evaluation is unavailable.'}
              </p>
              <p className="mt-4 text-xs font-bold text-slate-500">
                Completed: {formatReportDate(summary.completedAt)} · Resume: {candidate.resumeName || 'Unavailable'}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                HR Decision
              </p>
              <p className="mt-3 text-2xl font-black capitalize text-emerald-950">
                {evaluation?.recommendation || 'Unavailable'}
              </p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Recommendation is based on the completed interview evaluation.
              </p>
            </div>
          </div>
        </header>
        {evaluation && (
          <section className="mt-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Evaluation Scores</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Technical Knowledge', evaluation.technicalKnowledge],
                ['Communication', evaluation.communication],
                ['Answer Quality', evaluation.answerQuality],
                ['Resume Consistency', evaluation.resumeConsistency],
                ['Topic Coverage', evaluation.topicCoverage],
                ['Attention', evaluation.attention],
              ].map(([label, value]) => <EvaluationSignalCard key={label} label={label} value={value} />)}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{evaluation.summary}</p>
          </section>
        )}
        <section className="mt-5 rounded-3xl border border-slate-200/90 bg-white/90 p-5 shadow-sm backdrop-blur sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">Performance snapshot</p>
              <p className="mt-1 text-sm font-medium text-slate-500">Only metrics with sufficient interview evidence are displayed.</p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">Interview complete</span>
          </div>
          {report.snapshot.length > 0 ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{report.snapshot.map((item) => <ReportScoreCard key={item.label} item={item} />)}</div> : <p className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-500">A performance snapshot requires a completed backend evaluation. No score has been inferred from missing evidence.</p>}
        </section>
        {report.radar.length >= 3 && report.questions.length > 0 && <div className="mt-5 grid gap-5 lg:grid-cols-2"><CandidateReportRadarChart metrics={report.radar} /><CandidateReportTimelineChart questions={report.questions} /></div>}
        {report.questions.length > 0 && <div className="mt-5"><QuestionWisePerformance questions={report.questions} /></div>}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <ReportInsightList title="Strengths" items={strengths} icon={CheckCircle2} tone="strength" />
          <ReportInsightList title="Areas to Improve" items={weaknesses} icon={FileWarning} tone="weakness" />
        </div>
        <SpeechAnalysis responses={responses} />
        <AttentionAnalysis gazeMetrics={summary.gazeMetrics} />
      </div>
    </main>
  )
}


export default CandidateReportPage
