import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  UploadCloud,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { PROJECT_NAME, mockCandidateDefaults, systemCheckItems } from '../data/appData'
import { saveCandidateForDevelopment, validateCandidateForm } from '../services/candidateStorage'
import { prepareInterviewQuestions } from '../services/interviewPreparation'
import { useSystemChecks } from '../services/systemChecks'
import InterviewScreen from './InterviewScreen'
import CandidateReportPage from './CandidateReportPage'

function CandidatePortalShell({ children, step, onExit }) {
  const steps = ['Login', 'System Check', 'Waiting Room', 'Interview']
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.24),transparent_30%),radial-gradient(circle_at_86%_18%,rgba(20,184,166,0.18),transparent_32%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]" />
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-cyan-300/20 bg-white/10 text-cyan-200 shadow-xl shadow-cyan-950/30">
              <BrainCircuit size={22} />
            </span>
            <div>
              <p className="text-sm font-black tracking-tight">Candidate Portal</p>
              <p className="text-xs font-semibold text-slate-400">{PROJECT_NAME}</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 md:flex">
            {steps.map((item, index) => {
              const isActive = step === index
              const isDone = step > index
              return (
                <div
                  key={item}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                    isActive
                      ? 'border-cyan-300/40 bg-cyan-300/10 text-cyan-100'
                      : isDone
                        ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-100'
                        : 'border-white/10 bg-white/5 text-slate-500'
                  }`}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10">
                    {isDone ? <CheckCircle2 size={13} /> : index + 1}
                  </span>
                  {item}
                </div>
              )
            })}
          </div>
          <Button
            variant="secondary"
            className="border-white/10 bg-white/10 text-white hover:bg-white/15"
            onClick={onExit}
          >
            Back to Site
          </Button>
        </header>
        <div className="grid flex-1 place-items-center py-8">{children}</div>
      </div>
    </main>
  )
}
function PortalCard({ eyebrow, title, description, children }) {
  return (
    <section className="w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-[0_35px_120px_rgba(0,0,0,0.36)] backdrop-blur-2xl">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
        <aside className="relative min-h-72 border-b border-white/10 bg-slate-900/70 p-6 lg:border-b-0 lg:border-r">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(34,211,238,0.20),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(37,99,235,0.20),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">{description}</p>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3">
              {[
                ['AI Proctoring', 'Active'],
                ['Question Mode', 'Adaptive'],
                ['Session Type', 'Mock API'],
                ['Data State', 'Local'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/8 p-3">
                  <p className="text-[11px] font-black uppercase tracking-[0.14em] text-slate-500">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </aside>
        <div className="p-5 sm:p-7">{children}</div>
      </div>
    </section>
  )
}
function CandidateLogin({ onStart }) {
  const [form, setForm] = useState({ name: '', email: '', resume: null })
  const [errors, setErrors] = useState({})
  const validationErrors = validateCandidateForm(form)
  const canStart = Object.keys(validationErrors).length === 0
  return (
    <PortalCard
      eyebrow="Step 01"
      title="Candidate Login"
      description="Enter candidate details and upload the resume before the AI interview environment is prepared."
    >
      <form
        className="grid gap-5"
        onSubmit={(event) => {
          event.preventDefault()
          const nextErrors = validateCandidateForm(form)
          setErrors(nextErrors)
          if (Object.keys(nextErrors).length > 0) return
          const nextCandidate = {
            ...mockCandidateDefaults,
            name: form.name.trim(),
            email: form.email.trim(),
            resumeName: form.resume.name,
            resumeSize: form.resume.size,
            resumeType: form.resume.type || 'application/octet-stream',
            resumeFile: form.resume,
            savedAt: new Date().toISOString(),
          }
          saveCandidateForDevelopment(nextCandidate)
          onStart(nextCandidate)
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-200">Name</span>
          <input
            className={`h-12 rounded-xl border bg-slate-950/70 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10 ${
              errors.name ? 'border-rose-300/50' : 'border-white/10'
            }`}
            placeholder="Enter full name"
            value={form.name}
            onChange={(event) => {
              setForm((value) => ({ ...value, name: event.target.value }))
              setErrors((value) => ({ ...value, name: undefined }))
            }}
          />
          {errors.name && <span className="text-xs font-semibold text-rose-300">{errors.name}</span>}
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-200">Email</span>
          <input
            type="email"
            className={`h-12 rounded-xl border bg-slate-950/70 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10 ${
              errors.email ? 'border-rose-300/50' : 'border-white/10'
            }`}
            placeholder="candidate@example.com"
            value={form.email}
            onChange={(event) => {
              setForm((value) => ({ ...value, email: event.target.value }))
              setErrors((value) => ({ ...value, email: undefined }))
            }}
          />
          {errors.email && <span className="text-xs font-semibold text-rose-300">{errors.email}</span>}
        </label>
        <label className="group grid cursor-pointer gap-2">
          <span className="text-sm font-black text-slate-200">Resume Upload</span>
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.doc,.docx"
            onChange={(event) => {
              setForm((value) => ({ ...value, resume: event.target.files?.[0] ?? null }))
              setErrors((value) => ({ ...value, resume: undefined }))
            }}
          />
          <span
            className={`flex min-h-36 items-center justify-center rounded-2xl border border-dashed bg-cyan-300/5 p-6 text-center transition group-hover:bg-cyan-300/10 ${
              errors.resume ? 'border-rose-300/50' : 'border-cyan-300/30'
            }`}
          >
            <span>
              <UploadCloud className="mx-auto text-cyan-200" size={30} />
              <span className="mt-3 block text-sm font-black text-white">
                {form.resume ? form.resume.name : 'Upload PDF, DOC, or DOCX resume'}
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">
                Stored locally for this development session.
              </span>
            </span>
          </span>
          {errors.resume && <span className="text-xs font-semibold text-rose-300">{errors.resume}</span>}
        </label>
        <Button
          type="submit"
          disabled={!canStart}
          className="h-12 bg-cyan-400 text-slate-950 shadow-xl shadow-cyan-950/30 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          Start Interview
          <ArrowRight size={18} />
        </Button>
      </form>
    </PortalCard>
  )
}
function CameraPreview({ stream, checks, microphoneLevel }) {
  const videoRef = useRef(null)
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream
    }
  }, [stream])
  const previewActive = checks.preview.status === 'passed'
  return (
    <div className="relative min-h-80 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#020617,#111827)]">
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur">
        <span className={`h-2 w-2 rounded-full ${previewActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        Camera preview
      </div>
      {stream ? (
        <video
          ref={videoRef}
          className="h-full min-h-80 w-full object-cover"
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
        />
      ) : (
        <>
          <div className="absolute inset-x-8 top-14 h-48 rounded-[44%] border border-cyan-200/20 bg-white/7 shadow-[inset_0_0_60px_rgba(34,211,238,0.06)]" />
          <div className="absolute left-1/2 top-24 h-24 w-24 -translate-x-1/2 rounded-full border border-cyan-200/20 bg-slate-300/10" />
          <div className="absolute bottom-8 left-1/2 h-28 w-44 -translate-x-1/2 rounded-t-[4rem] border border-cyan-200/20 bg-slate-300/10" />
        </>
      )}
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
        {[
          ['Face', checks.face.status === 'passed' ? 'Passed' : 'Unavailable', checks.face.status],
          ['Light', checks.lighting.status === 'passed' ? 'Passed' : 'Unavailable', checks.lighting.status],
          ['Audio', `${microphoneLevel}%`, checks.audioInput.status],
        ].map(([label, value, status]) => (
          <div key={label} className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur">
            <p className="text-xs font-black text-white">{label}</p>
            <p className={`mt-1 text-[11px] font-bold ${status === 'passed' ? 'text-emerald-300' : 'text-amber-300'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
function SystemCheck({ candidate, onContinue }) {
  const { checks, cameraStream, microphoneLevel } = useSystemChecks()
  const requiredCheckKeys = ['camera', 'preview', 'microphone', 'audioInput', 'permissions', 'internet']
  const allPassed = requiredCheckKeys.every((key) => checks[key].status === 'passed')
  return (
    <PortalCard
      eyebrow="Step 02"
      title="System Check"
      description="The interview platform verifies available browser device signals before the assessment starts."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <CameraPreview stream={cameraStream} checks={checks} microphoneLevel={microphoneLevel} />
        <div className="grid content-between gap-4">
          <div className="space-y-3">
            {systemCheckItems.map((check) => {
              const Icon = check.icon
              const current = checks[check.key]
              const passed = current.status === 'passed'
              const failed = current.status === 'failed'
              const unavailable = current.status === 'unavailable'
              return (
                <div
                  key={check.key}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3"
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      passed
                        ? 'bg-emerald-400/15 text-emerald-300'
                        : failed
                          ? 'bg-rose-400/15 text-rose-300'
                          : unavailable
                            ? 'bg-slate-400/15 text-slate-400'
                            : 'bg-amber-400/15 text-amber-300'
                    }`}
                  >
                    {passed ? <CheckCircle2 size={19} /> : <Icon size={19} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">{check.label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {passed ? check.success : current.detail}
                    </p>
                  </div>
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      passed
                        ? 'bg-emerald-400'
                        : failed
                          ? 'bg-rose-400'
                          : unavailable
                            ? 'bg-slate-500'
                            : 'bg-amber-400 animate-pulse'
                    }`}
                  />
                </div>
              )
            })}
          </div>
          <Button
            disabled={!allPassed}
            className="h-12 bg-cyan-400 text-slate-950 hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            onClick={onContinue}
          >
            Continue
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.05] p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Candidate</p>
        <p className="mt-2 text-sm font-bold text-white">
          {candidate.name} · {candidate.email}
        </p>
      </div>
    </PortalCard>
  )
}
function WaitingScreen({ candidate, preparationState, onEnterInterview, onRetry }) {
  const isLoading = preparationState.status === 'loading'
  const hasError = preparationState.status === 'error'
  const questionsReady =
    preparationState.status === 'success' &&
    Array.isArray(candidate.generatedQuestions) &&
    candidate.generatedQuestions.length > 0
  return (
    <PortalCard
      eyebrow="Step 03"
      title="Interview Waiting Room"
      description="Candidate details are locked in while the backend prepares personalized questions from the uploaded resume."
    >
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
            Candidate Information
          </p>
          <div className="mt-5 space-y-4">
            {[
              ['Name', candidate.name],
              ['Email', candidate.email],
              ['Role', candidate.role],
              ['Session ID', candidate.sessionId],
              ['Resume Uploaded', candidate.resumeName],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl bg-white/[0.06] p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.13em] text-slate-500">
                  {label}
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-cyan-300/20 bg-cyan-300/8 p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.22),transparent_36%)]" />
          <div className="relative grid min-h-80 place-items-center text-center">
            <div>
              <div className="relative mx-auto grid h-28 w-28 place-items-center rounded-full border border-cyan-300/30 bg-slate-950/60">
                <span className="absolute h-full w-full animate-ping rounded-full bg-cyan-300/20" />
                <BrainCircuit className="relative text-cyan-200" size={42} />
              </div>
              <h2 className="mt-7 text-2xl font-black tracking-tight text-white">
                {questionsReady ? 'Questions Ready' : isLoading ? 'AI is preparing questions' : 'Preparation failed'}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300">
                {questionsReady
                  ? 'The backend has generated personalized questions from the uploaded resume.'
                  : isLoading
                    ? 'Parsing the resume, extracting skills and projects, and generating personalized questions from the backend.'
                    : preparationState.error || 'We could not prepare interview questions from the backend.'}
              </p>
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    questionsReady ? 'bg-emerald-300' : isLoading ? 'animate-pulse bg-cyan-300' : 'bg-rose-300'
                  }`}
                />
                <span className="text-sm font-black text-white">
                  {questionsReady ? 'Questions generated' : isLoading ? 'Preparing from resume' : 'Retry preparation'}
                </span>
              </div>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {isLoading && (
                  <Button
                    variant="secondary"
                    className="h-12 border-white/10 bg-white/10 px-6 text-white hover:bg-white/15"
                    disabled
                  >
                    Enter Interview
                    <ArrowRight size={18} />
                  </Button>
                )}
                {questionsReady && (
                  <Button
                    className="h-12 bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                    onClick={onEnterInterview}
                  >
                    Enter Interview
                    <ArrowRight size={18} />
                  </Button>
                )}
                {hasError && (
                  <Button
                    className="h-12 bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                    onClick={onRetry}
                  >
                    Retry Preparation
                    <ArrowRight size={18} />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalCard>
  )
}

function CandidatePortal({ onExit }) {
  const [step, setStep] = useState(0)
  const [candidate, setCandidate] = useState(null)
  const [preparationState, setPreparationState] = useState({
    status: 'idle',
    error: '',
  })

  useEffect(() => {
    if (step !== 2 || !candidate?.resumeFile || preparationState.status !== 'idle') {
      return undefined
    }

    let cancelled = false

    const runPreparation = async () => {
      setPreparationState({ status: 'loading', error: '' })
      try {
        const questions = await prepareInterviewQuestions(candidate.resumeFile)
        if (cancelled) return

        const nextCandidate = { ...candidate, generatedQuestions: questions }
        setCandidate(nextCandidate)
        window.sessionStorage.setItem('ai-interview-generated-questions', JSON.stringify(questions))
        window.sessionStorage.setItem(
          'ai-interview-candidate',
          JSON.stringify({
            name: nextCandidate.name,
            email: nextCandidate.email,
            role: nextCandidate.role,
            sessionId: nextCandidate.sessionId,
            resumeScore: nextCandidate.resumeScore,
            estimatedWait: nextCandidate.estimatedWait,
            resumeName: nextCandidate.resumeName,
            resumeSize: nextCandidate.resumeSize,
            resumeType: nextCandidate.resumeType,
            savedAt: nextCandidate.savedAt,
            generatedQuestions: questions,
          }),
        )
        setPreparationState({ status: 'success', error: '' })
      } catch (error) {
        if (cancelled) return
        setPreparationState({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unable to prepare interview questions.',
        })
      }
    }

    void runPreparation()

    return () => {
      cancelled = true
    }
  }, [candidate, step])

  const retryPreparation = () => {
    setPreparationState({ status: 'idle', error: '' })
    setCandidate((current) => (current ? { ...current } : current))
  }

  if (step === 3 && candidate) {
    return (
      <InterviewScreen
        candidate={candidate}
        onExit={onExit}
        onFinish={(responses) => {
          setCandidate((current) => ({ ...current, responses }))
          setStep(4)
        }}
      />
    )
  }
  if (step === 4 && candidate) {
    return <CandidateReportPage candidate={candidate} onExit={onExit} />
  }
  return (
    <CandidatePortalShell step={step} onExit={onExit}>
      {step === 0 && (
        <CandidateLogin
          onStart={(nextCandidate) => {
            setCandidate(nextCandidate)
            setStep(1)
          }}
        />
      )}
      {step === 1 && candidate && (
        <SystemCheck candidate={candidate} onContinue={() => setStep(2)} />
      )}
      {step === 2 && candidate && (
        <WaitingScreen
          candidate={{
            ...candidate,
            generatedQuestions: candidate.generatedQuestions,
          }}
          preparationState={preparationState}
          onEnterInterview={() => {
            if (preparationState.status === 'success') {
              setStep(3)
            }
          }}
          onRetry={retryPreparation}
        />
      )}
    </CandidatePortalShell>
  )
}


export default CandidatePortal
