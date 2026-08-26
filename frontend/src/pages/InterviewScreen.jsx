import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  BrainCircuit,
  Mic,
  MessageSquareText,
  Video,
  Waves,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  initialInterviewMetrics,
  interviewEvaluationMetrics,
  transcriptSegments,
} from '../data/appData'
import { decideInterviewAction, transcribeInterviewAudio } from '../services/interviewPreparation'

const gazeApiBaseUrl = import.meta.env.VITE_GAZE_API_BASE_URL || 'http://127.0.0.1:5051'

function formatInterviewTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
function readSessionArray(key) {
  try {
    const value = JSON.parse(window.sessionStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}
function readSessionString(key) {
  return window.sessionStorage.getItem(key) || ''
}
function InterviewStatusPill({ icon: Icon, label, status, tone = 'emerald' }) {
  const toneClasses = {
    emerald: 'border-emerald-300/20 bg-emerald-300/10 text-emerald-200',
    cyan: 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200',
    amber: 'border-amber-300/20 bg-amber-300/10 text-amber-200',
  }
  return (
    <div className={`flex items-center gap-2 rounded-full border px-3 py-2 ${toneClasses[tone]}`}>
      <Icon size={15} />
      <span className="text-xs font-black">{label}</span>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      <span className="text-xs font-bold opacity-80">{status}</span>
    </div>
  )
}
function InterviewTopBar({ candidate, questionIndex, questionCount, progress, elapsedSeconds, isFollowUp, isLoading, loadingLabel, onExit, onNextQuestion, onFinish }) {
  return (
    <header className="border-b border-white/10 bg-slate-950/92 px-4 py-4 backdrop-blur-2xl lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 max-w-full items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-950/30">
            <BrainCircuit size={22} />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-white">Live AI Interview</p>
            <p className="truncate text-xs font-semibold text-slate-400">
              {candidate.name} · {candidate.role} · {candidate.sessionId}
            </p>
          </div>
        </div>
        <div className="min-w-0 flex-1 basis-full lg:basis-auto lg:max-w-xl">
          <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            <span>Question {questionIndex + 1} of {questionCount}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-[linear-gradient(90deg,#22d3ee,#2563eb,#34d399)]"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            />
          </div>
        </div>
        <div className="flex max-w-full flex-wrap items-center gap-2">
          <div className="rounded-full border border-white/10 bg-white/7 px-4 py-2 text-sm font-black text-white">
            {formatInterviewTime(elapsedSeconds)}
          </div>
          <Button
            variant="secondary"
            className="border-white/10 bg-white/10 text-white hover:bg-white/15"
            onClick={onExit}
          >
            Exit
          </Button>
          {(!isFollowUp || questionIndex < questionCount - 1) && (
            <Button
              variant="secondary"
              className="border-white/10 bg-white/10 text-white hover:bg-white/15"
              onClick={onNextQuestion}
              disabled={isLoading}
            >
              {isLoading ? loadingLabel : 'Next Question'}
            </Button>
          )}
          <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={onFinish}>
            Finish Interview
          </Button>
        </div>
      </div>
    </header>
  )
}
function AIInterviewerPanel({
  interviewQuestions,
  questionIndex,
  followUpQuestion,
  crossQuestion,
  elapsedSeconds,
  answer,
  onAnswerChange,
  onStartRecording,
  onStopRecording,
  isRecording,
  speechStatus,
  followUpError,
  answerDisabled,
}) {
  return (
    <aside className="flex min-h-0 min-w-0 flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="rounded-2xl border border-cyan-300/20 bg-slate-950/70 p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="relative grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,#22d3ee,#2563eb)] text-white shadow-xl shadow-cyan-950/30"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="absolute inset-0 rounded-2xl border border-white/30" />
            <BrainCircuit size={30} />
          </motion.div>
          <div>
            <p className="text-sm font-black text-white">AI Interviewer</p>
            <p className="mt-1 text-xs font-semibold text-cyan-200">Adaptive question engine</p>
          </div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Current Question</p>
        <h2 className="mt-3 break-words text-xl font-black leading-8 tracking-tight text-white">
          {crossQuestion || followUpQuestion || interviewQuestions[questionIndex] || 'Questions will appear here once they are ready.'}
        </h2>
        <label className="mt-5 block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Your Answer</span>
          <textarea
            aria-label="Your answer"
            className="mt-3 min-h-32 w-full max-w-full resize-y rounded-xl border border-cyan-300/20 bg-slate-950/70 p-3 text-sm leading-7 text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300/60"
            placeholder="Type your answer here..."
            rows={5}
            value={answer}
            onChange={(event) => onAnswerChange(event.target.value)}
            disabled={answerDisabled}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={answerDisabled && !isRecording}
            >
              <Mic size={16} />
              {isRecording ? 'Stop Recording' : 'Record Answer'}
            </Button>
            {speechStatus && <span className="text-xs font-semibold text-cyan-200">{speechStatus}</span>}
          </div>
          {followUpError && <p className="mt-2 text-xs font-semibold text-amber-200">{followUpError}</p>}
        </label>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Timer</p>
          <span className="rounded-full bg-cyan-300/10 px-3 py-1 text-xs font-black text-cyan-200">
            Live
          </span>
        </div>
        <p className="text-4xl font-black tracking-tight text-white">
          {formatInterviewTime(elapsedSeconds)}
        </p>
      </div>
      <div className="min-h-0 flex-1 rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
          Previous Question History
        </p>
        <div className="space-y-3 overflow-auto pr-1">
          {interviewQuestions.slice(0, questionIndex).length === 0 && (
            <p className="rounded-xl bg-white/[0.05] p-3 text-sm font-semibold text-slate-500">
              Previous questions will appear here.
            </p>
          )}
          {interviewQuestions.slice(0, questionIndex).map((question, index) => (
            <div key={question} className="rounded-xl border border-white/10 bg-white/[0.05] p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-200">
                Question {index + 1}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{question}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
function WebcamInterviewPanel({ cameraOn, microphoneOn, isRecording, pulse, monitoringWarning, videoRef }) {
  return (
    <section className="flex min-h-0 min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-2xl">
        <div>
          <p className="text-sm font-black text-white">Candidate Camera</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Mock preview · no OpenCV integration</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <InterviewStatusPill icon={Video} label="Camera" status={cameraOn ? 'On' : 'Off'} tone="emerald" />
          <InterviewStatusPill icon={Waves} label="Microphone" status={microphoneOn ? 'Clear' : 'Muted'} tone="cyan" />
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-4">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Monitoring</p>
        <p className={`mt-2 text-sm font-black ${monitoringWarning ? 'text-amber-200' : 'text-cyan-100'}`}>
          {monitoringWarning || 'Interview monitoring active'}
        </p>
      </div>
      <div className="relative h-[min(58vh,520px)] min-h-[280px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_24%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#020617,#111827_50%,#0f172a)] shadow-[0_30px_110px_rgba(0,0,0,0.34)] lg:min-h-[420px]">
        <video
          ref={videoRef}
          className={`absolute inset-0 h-full w-full object-cover ${cameraOn ? '' : 'hidden'}`}
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
        />
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 text-xs font-black text-white backdrop-blur">
          <span className={`h-2 w-2 rounded-full ${isRecording ? 'animate-pulse bg-red-400' : 'bg-emerald-400'}`} />
          {isRecording ? 'Recording' : 'Camera ready'}
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-black/35 px-3 py-2 text-xs font-black text-cyan-100 backdrop-blur">
          HD Preview
        </div>
        {!cameraOn && (
          <>
            <motion.div
              className="absolute left-1/2 top-[22%] h-32 w-32 -translate-x-1/2 rounded-full border border-cyan-200/20 bg-white/10 shadow-[inset_0_0_70px_rgba(34,211,238,0.08)]"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute left-1/2 top-[43%] h-56 w-72 -translate-x-1/2 rounded-t-[6rem] border border-cyan-200/20 bg-white/10" />
            <div className="absolute left-1/2 top-[22%] h-40 w-44 -translate-x-1/2 rounded-[48%] border-2 border-cyan-300/35" />
            <div className="absolute left-[18%] right-[18%] top-[18%] h-[58%] rounded-[2rem] border border-white/10" />
          </>
        )}
        <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
          {[
            ['Face centered', 'Stable'],
            ['Audio level', `${pulse}%`],
            ['Frame quality', 'Good'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-black/30 p-3 backdrop-blur">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{label}</p>
              <p className="mt-1 text-sm font-black text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
function LiveEvaluationPanel({ metrics }) {
  return (
    <aside className="min-h-0 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-white">Live Evaluation</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Mock websocket updates every second</p>
        </div>
        <span className="rounded-full bg-emerald-300/10 px-3 py-1 text-xs font-black text-emerald-200">
          WS
        </span>
      </div>
      <div className="grid gap-3 overflow-auto pr-1">
        {interviewEvaluationMetrics.map((metric) => {
          const Icon = metric.icon
          const value = metrics[metric.key]
          return (
            <div key={metric.key} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.06]" style={{ color: metric.color }}>
                    <Icon size={17} />
                  </span>
                  <span className="text-sm font-black text-white">{metric.label}</span>
                </div>
                <span className="text-lg font-black text-white">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: metric.color }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </aside>
  )
}
function TranscriptPanel({ transcript }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-white">Answer Transcript</p>
          <p className="mt-1 text-xs font-semibold text-slate-400">Live speech-to-text simulation</p>
        </div>
        <InterviewStatusPill icon={MessageSquareText} label="Transcript" status="Streaming" tone="cyan" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
        <div className="flex gap-3 overflow-x-auto rounded-2xl border border-white/10 bg-slate-950/60 p-3">
          {transcript.map((line, index) => (
            <div key={`${line}-${index}`} className="min-w-72 rounded-xl bg-white/[0.06] p-3">
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                Segment {index + 1}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-300">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
function InterviewScreen({ candidate, onExit, onFinish }) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [metrics, setMetrics] = useState(initialInterviewMetrics)
  const [transcript, setTranscript] = useState([transcriptSegments[0]])
  const [audioPulse, setAudioPulse] = useState(62)
  const [questionIndex, setQuestionIndex] = useState(0)
  const interviewQuestions = candidate.generatedQuestions?.length
    ? candidate.generatedQuestions
    : readSessionArray('ai-interview-generated-questions')
  const questionCount = interviewQuestions.length
  const [responses, setResponses] = useState(() => readSessionArray('ai-interview-responses'))
  const [decisions, setDecisions] = useState(() => readSessionArray('ai-interview-decisions'))
  const [answerDraft, setAnswerDraft] = useState(() => {
    const savedResponse = readSessionArray('ai-interview-responses').find((item) => item.questionIndex === 0)
    return savedResponse?.answer || ''
  })
  const [followUpQuestion, setFollowUpQuestion] = useState(() => readSessionString('ai-interview-follow-up-question'))
  const [crossQuestion, setCrossQuestion] = useState(() => readSessionString('ai-interview-cross-question'))
  const [crossClaim, setCrossClaim] = useState('')
  const [crossClaimIndex, setCrossClaimIndex] = useState(null)
  const [followUpError, setFollowUpError] = useState('')
  const [followUpLoading, setFollowUpLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechStatus, setSpeechStatus] = useState('')
  const [speechMetrics, setSpeechMetrics] = useState(null)
  const [cameraReady, setCameraReady] = useState(false)
  const gazeVideoRef = useRef(null)
  const gazeCanvasRef = useRef(null)
  const gazeCountsRef = useRef({ looking_at_screen: 0, looking_away: 0, looking_down: 0, total: 0 })
  const monitoringEventsRef = useRef([])
  const monitoringStateRef = useRef({ type: null, count: 0, active: false })
  const [monitoringWarning, setMonitoringWarning] = useState('')
  const recorderRef = useRef(null)
  const recordingStreamRef = useRef(null)
  const recordingStartedAtRef = useRef(0)
  const currentQuestionIndex = Math.min(questionIndex, Math.max(questionCount - 1, 0))
  const progress = questionCount > 0 ? ((currentQuestionIndex + 1) / questionCount) * 100 : 0

  const getGazeMetrics = () => {
    const counts = gazeCountsRef.current
    const total = counts.total
    if (!total) {
      return { lookingAtScreenPercentage: 0, lookingAwayPercentage: 0, lookingDownPercentage: 0 }
    }
    return {
      lookingAtScreenPercentage: Math.round((counts.looking_at_screen / total) * 100),
      lookingAwayPercentage: Math.round((counts.looking_away / total) * 100),
      lookingDownPercentage: Math.round((counts.looking_down / total) * 100),
    }
  }

  const recordMonitoringState = (type) => {
    const current = monitoringStateRef.current
    if (current.type !== type) {
      monitoringStateRef.current = { type, count: 1, active: false }
      return
    }
    current.count += 1
    if (current.count < 3 || current.active) return
    current.active = true
    const event = { type, startedAt: new Date().toISOString() }
    monitoringEventsRef.current = [...monitoringEventsRef.current, event]
    window.sessionStorage.setItem('ai-interview-monitoring-events', JSON.stringify(monitoringEventsRef.current))
    setMonitoringWarning(
      type === 'no-face'
        ? 'Please ensure your face is visible to the camera.'
        : 'Please keep your attention on the screen.',
    )
  }

  const clearMonitoringState = () => {
    const current = monitoringStateRef.current
    if (current.active) {
      const lastEvent = monitoringEventsRef.current[monitoringEventsRef.current.length - 1]
      if (lastEvent && !lastEvent.endedAt) lastEvent.endedAt = new Date().toISOString()
      window.sessionStorage.setItem('ai-interview-monitoring-events', JSON.stringify(monitoringEventsRef.current))
    }
    monitoringStateRef.current = { type: null, count: 0, active: false }
    setMonitoringWarning('')
  }

  useEffect(() => {
    let cancelled = false
    let stream = null
    let interval = null
    let processing = false

    const captureGazeFrame = async () => {
      const video = gazeVideoRef.current
      const canvas = gazeCanvasRef.current
      if (cancelled || processing || !video || !canvas || video.readyState < 2) return
      processing = true
      try {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const context = canvas.getContext('2d')
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.55))
        if (!blob || cancelled) return
        const controller = new AbortController()
        const timeout = window.setTimeout(() => controller.abort(), 1500)
        const response = await fetch(`${gazeApiBaseUrl}/api/gaze/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'image/jpeg' },
          body: blob,
          signal: controller.signal,
        })
        window.clearTimeout(timeout)
        if (!response.ok) {
          return
        }
        const state = (await response.json())?.state
        if (state === 'attention_unavailable' || state === 'multiple_faces') {
          recordMonitoringState('no-face')
          return
        }
        if (['looking_at_screen', 'looking_away', 'looking_down'].includes(state)) {
          if (state === 'looking_away' || state === 'looking_down') recordMonitoringState('off-screen')
          else clearMonitoringState()
          gazeCountsRef.current[state] += 1
          gazeCountsRef.current.total += 1
        }
      } catch {
        // Gaze is optional and must never interrupt the interview.
        clearMonitoringState()
      } finally {
        processing = false
      }
    }

    const startGaze = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) return
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (cancelled || !gazeVideoRef.current) return
        gazeVideoRef.current.srcObject = stream
        await gazeVideoRef.current.play().catch(() => {})
        setCameraReady(true)
        interval = window.setInterval(captureGazeFrame, 800)
    } catch {
      // Camera or local vision bridge failure is intentionally ignored.
      setCameraReady(false)
      clearMonitoringState()
      }
    }
    void startGaze()
    return () => {
      cancelled = true
      if (interval) window.clearInterval(interval)
      if (stream) stream.getTracks().forEach((track) => track.stop())
      setCameraReady(false)
    }
  }, [])

  const saveResponses = (nextResponses) => {
    setResponses(nextResponses)
    window.sessionStorage.setItem('ai-interview-responses', JSON.stringify(nextResponses))
  }

  const saveCurrentAnswer = () => {
    const responseType = crossQuestion ? 'cross-question' : followUpQuestion ? 'follow-up' : 'main'
    const nextResponses = responses.filter(
      (item) => !(item.questionIndex === currentQuestionIndex && (item.type || 'main') === responseType),
    )
    const response = {
      question: crossQuestion || followUpQuestion || interviewQuestions[currentQuestionIndex],
      answer: answerDraft,
      questionIndex: currentQuestionIndex,
      type: responseType,
    }
    if (crossQuestion) {
      response.resumeClaim = crossClaim
      response.claimIndex = crossClaimIndex
    }
    if (
      speechMetrics
      && speechMetrics.questionIndex === currentQuestionIndex
      && speechMetrics.type === responseType
    ) {
      const { questionIndex: _questionIndex, type: _type, ...speech } = speechMetrics
      response.speech = speech
    }
    nextResponses.push(response)
    nextResponses.sort((first, second) => first.questionIndex - second.questionIndex)
    saveResponses(nextResponses)
    return nextResponses
  }

  const updateAnswer = (answer, answerSpeech = speechMetrics) => {
    setAnswerDraft(answer)
    const responseType = crossQuestion ? 'cross-question' : followUpQuestion ? 'follow-up' : 'main'
    const nextResponses = responses.filter(
      (item) => !(item.questionIndex === currentQuestionIndex && (item.type || 'main') === responseType),
    )
    const response = {
      question: crossQuestion || followUpQuestion || interviewQuestions[currentQuestionIndex],
      answer,
      questionIndex: currentQuestionIndex,
      type: responseType,
    }
    if (crossQuestion) {
      response.resumeClaim = crossClaim
      response.claimIndex = crossClaimIndex
    }
    if (answerSpeech) response.speech = answerSpeech
    nextResponses.push(response)
    nextResponses.sort((first, second) => first.questionIndex - second.questionIndex)
    saveResponses(nextResponses)
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setSpeechStatus('Audio recording is not supported in this browser.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'
      const recorder = new MediaRecorder(stream, { mimeType })
      const chunks = []
      recorderRef.current = recorder
      recordingStreamRef.current = stream
      recordingStartedAtRef.current = Date.now()
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data)
      }
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop())
        recorderRef.current = null
        recordingStreamRef.current = null
        setIsRecording(false)
        setSpeechStatus('Transcribing...')
        try {
          const durationSeconds = (Date.now() - recordingStartedAtRef.current) / 1000
          const result = await transcribeInterviewAudio(new Blob(chunks, { type: mimeType }), durationSeconds)
          const combinedAnswer = [answerDraft.trim(), result.transcript.trim()].filter(Boolean).join('\n')
          const responseType = crossQuestion ? 'cross-question' : followUpQuestion ? 'follow-up' : 'main'
          setSpeechMetrics({ ...result, questionIndex: currentQuestionIndex, type: responseType })
          updateAnswer(combinedAnswer, result)
          setSpeechStatus(`Transcript ready (${result.wordCount} words)`)
        } catch (error) {
          setSpeechStatus(error instanceof Error ? error.message : 'Speech processing unavailable.')
        }
      }
      recorder.start()
      setIsRecording(true)
      setSpeechStatus('Recording...')
    } catch (error) {
      setSpeechStatus(error instanceof Error ? error.message : 'Microphone access failed.')
    }
  }

  const stopRecording = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }

  const storeEvaluation = (savedResponses, evaluation, responseType) => {
    if (!evaluation) return savedResponses
    const evaluatedResponses = savedResponses.map((response) => (
      response.questionIndex === currentQuestionIndex && (response.type || 'main') === responseType
        ? { ...response, evaluation }
        : response
    ))
    saveResponses(evaluatedResponses)
    return evaluatedResponses
  }

  const storeDecision = (decision) => {
    const nextDecisions = [
      ...decisions.filter((item) => !(
        item.questionIndex === currentQuestionIndex
        && item.action === decision.action
        && item.question === decision.question
      )),
      { ...decision, questionIndex: currentQuestionIndex },
    ]
    setDecisions(nextDecisions)
    window.sessionStorage.setItem('ai-interview-decisions', JSON.stringify(nextDecisions))
  }

  const completeResponses = () => {
    const savedResponses = saveCurrentAnswer()
    const completedResponses = interviewQuestions.flatMap((question, index) => {
      const mainResponse = savedResponses.find(
        (response) => response.questionIndex === index && (response.type || 'main') === 'main',
      ) || {
        question,
        answer: '',
        questionIndex: index,
        type: 'main',
      }
      const followUpResponses = savedResponses.filter(
        (response) =>
          response.questionIndex === index && ['follow-up', 'cross-question'].includes(response.type),
      )
      return [mainResponse, ...followUpResponses]
    })
    saveResponses(completedResponses)
    const candidateInfo = Object.fromEntries(
      Object.entries(candidate).filter(([key]) => ![
        'resumeFile',
        'generatedQuestions',
        'resumeClaims',
        'responses',
      ].includes(key)),
    )
    const summary = {
      candidate: candidateInfo,
      questions: interviewQuestions,
      responses: completedResponses,
      resumeClaims: Array.isArray(candidate.resumeClaims) ? candidate.resumeClaims : [],
      decisions: readSessionArray('ai-interview-decisions'),
      gazeMetrics: getGazeMetrics(),
      monitoringEvents: monitoringEventsRef.current.map((event) => (
        event.endedAt ? event : { ...event, endedAt: new Date().toISOString() }
      )),
      completed: true,
      completedAt: new Date().toISOString(),
    }
    window.sessionStorage.setItem('ai-interview-summary', JSON.stringify(summary))
    return completedResponses
  }
  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds((value) => value + 1)
      setMetrics((currentMetrics) =>
        Object.fromEntries(
          Object.entries(currentMetrics).map(([key, value]) => {
            const movement = Math.floor(Math.random() * 7) - 3
            const nextValue = Math.max(58, Math.min(96, value + movement))
            return [key, nextValue]
          }),
        ),
      )
      setAudioPulse(Math.floor(52 + Math.random() * 42))
      setTranscript((lines) => {
        const nextLine = transcriptSegments[Math.floor(Math.random() * transcriptSegments.length)]
        const nextLines = [...lines, nextLine]
        return nextLines.slice(-5)
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])
  if (questionCount === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-white">
        <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-center">
          <h1 className="text-2xl font-black">No generated questions available</h1>
          <p className="mt-3 text-sm text-slate-300">Return to preparation and generate the interview questions again.</p>
          <Button className="mt-6 bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={onExit}>
            Return to Preparation
          </Button>
        </div>
      </main>
    )
  }
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <canvas ref={gazeCanvasRef} className="hidden" />
      <InterviewTopBar
        candidate={candidate}
        questionIndex={currentQuestionIndex}
        questionCount={questionCount}
        progress={progress}
        elapsedSeconds={elapsedSeconds}
        isFollowUp={Boolean(followUpQuestion || crossQuestion)}
        isLoading={followUpLoading || isRecording || speechStatus === 'Transcribing...'}
        loadingLabel={followUpLoading ? 'Generating follow-up...' : isRecording ? 'Recording answer...' : 'Transcribing answer...'}
        onExit={onExit}
        onNextQuestion={async () => {
          const savedResponses = saveCurrentAnswer()
          if (crossQuestion) {
            const nextIndex = Math.min(currentQuestionIndex + 1, questionCount - 1)
            setCrossQuestion('')
            setCrossClaim('')
            setCrossClaimIndex(null)
            setFollowUpQuestion('')
            window.sessionStorage.removeItem('ai-interview-cross-question')
            window.sessionStorage.removeItem('ai-interview-follow-up-question')
            setFollowUpError('')
            setQuestionIndex(nextIndex)
            setAnswerDraft(
              savedResponses.find(
                (response) => response.questionIndex === nextIndex && (response.type || 'main') === 'main',
              )?.answer || '',
            )
            return
          }

          if (followUpQuestion) {
            setFollowUpError('')
            setFollowUpLoading(true)
            try {
              const mainResponse = savedResponses.find(
                (response) => response.questionIndex === currentQuestionIndex && (response.type || 'main') === 'main',
              )
              const decision = await decideInterviewAction({
                questionIndex: currentQuestionIndex,
                mainQuestion: interviewQuestions[currentQuestionIndex],
                mainAnswer: mainResponse?.answer || '',
                followUpQuestion,
                followUpAnswer: answerDraft,
                resumeClaims: Array.isArray(candidate.resumeClaims) ? candidate.resumeClaims : [],
                usedClaimIndexes: savedResponses
                  .filter((response) => response.type === 'cross-question' && Number.isInteger(response.claimIndex))
                  .map((response) => response.claimIndex),
                plannedQuestions: interviewQuestions,
                responses: savedResponses,
              })
              storeDecision(decision)
              const evaluatedResponses = storeEvaluation(savedResponses, decision.evaluation, 'follow-up')
              if (decision.action === 'cross_question') {
                setCrossQuestion(decision.question)
                setCrossClaim(decision.resumeClaim || '')
                setCrossClaimIndex(Number.isInteger(decision.claimIndex) ? decision.claimIndex : null)
                window.sessionStorage.setItem('ai-interview-cross-question', decision.question)
                setAnswerDraft('')
              } else {
                const nextIndex = Math.min(currentQuestionIndex + 1, questionCount - 1)
                setCrossQuestion('')
                setCrossClaim('')
                setCrossClaimIndex(null)
                setFollowUpQuestion('')
                window.sessionStorage.removeItem('ai-interview-cross-question')
                window.sessionStorage.removeItem('ai-interview-follow-up-question')
                setQuestionIndex(nextIndex)
                setAnswerDraft(evaluatedResponses.find(
                  (response) => response.questionIndex === nextIndex && (response.type || 'main') === 'main',
                )?.answer || '')
              }
            } catch (error) {
              setFollowUpError(error instanceof Error ? error.message : 'Cross-question unavailable.')
              const nextIndex = Math.min(currentQuestionIndex + 1, questionCount - 1)
              setCrossQuestion('')
              setCrossClaim('')
              setCrossClaimIndex(null)
              setFollowUpQuestion('')
              window.sessionStorage.removeItem('ai-interview-cross-question')
              window.sessionStorage.removeItem('ai-interview-follow-up-question')
              setQuestionIndex(nextIndex)
              setAnswerDraft(
                savedResponses.find(
                  (response) => response.questionIndex === nextIndex && (response.type || 'main') === 'main',
                )?.answer || '',
              )
            } finally {
              setFollowUpLoading(false)
            }
            return
          }

          setFollowUpError('')
          setFollowUpLoading(true)
          try {
            const decision = await decideInterviewAction({
              questionIndex: currentQuestionIndex,
              mainQuestion: interviewQuestions[currentQuestionIndex],
              mainAnswer: answerDraft,
              followUpQuestion: null,
              followUpAnswer: null,
              resumeClaims: Array.isArray(candidate.resumeClaims) ? candidate.resumeClaims : [],
              usedClaimIndexes: savedResponses
                .filter((response) => response.type === 'cross-question' && Number.isInteger(response.claimIndex))
                .map((response) => response.claimIndex),
              plannedQuestions: interviewQuestions,
              responses: savedResponses,
            })
            storeDecision(decision)
            const evaluatedResponses = storeEvaluation(savedResponses, decision.evaluation, 'main')
            if (decision.action === 'probe' || decision.action === 'clarify') {
              setFollowUpQuestion(decision.question)
              window.sessionStorage.setItem('ai-interview-follow-up-question', decision.question)
              setAnswerDraft('')
            } else if (decision.action === 'cross_question') {
              setCrossQuestion(decision.question)
              setCrossClaim(decision.resumeClaim || '')
              setCrossClaimIndex(Number.isInteger(decision.claimIndex) ? decision.claimIndex : null)
              window.sessionStorage.setItem('ai-interview-cross-question', decision.question)
              setAnswerDraft('')
            } else {
              const nextIndex = Math.min(currentQuestionIndex + 1, questionCount - 1)
              setQuestionIndex(nextIndex)
              setAnswerDraft(evaluatedResponses.find(
                (response) => response.questionIndex === nextIndex && (response.type || 'main') === 'main',
              )?.answer || '')
            }
          } catch (error) {
            setFollowUpError(error instanceof Error ? error.message : 'Follow-up question unavailable.')
            const nextIndex = Math.min(currentQuestionIndex + 1, questionCount - 1)
            setQuestionIndex(nextIndex)
            setAnswerDraft(
              savedResponses.find(
                (response) => response.questionIndex === nextIndex && (response.type || 'main') === 'main',
              )?.answer || '',
            )
          } finally {
            setFollowUpLoading(false)
          }
        }}
        onFinish={() => onFinish(completeResponses())}
      />
      <div className="grid min-h-0 min-w-0 flex-1 items-start gap-4 p-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)_minmax(0,320px)]">
        <AIInterviewerPanel
          interviewQuestions={interviewQuestions}
          questionIndex={currentQuestionIndex}
          followUpQuestion={followUpQuestion}
          crossQuestion={crossQuestion}
          elapsedSeconds={elapsedSeconds}
          answer={answerDraft}
          onAnswerChange={updateAnswer}
          onStartRecording={startRecording}
          onStopRecording={stopRecording}
          isRecording={isRecording}
          speechStatus={speechStatus}
          followUpError={followUpError}
          answerDisabled={followUpLoading}
        />
        <WebcamInterviewPanel
          cameraOn={cameraReady}
          microphoneOn
          isRecording={isRecording}
          pulse={audioPulse}
          monitoringWarning={monitoringWarning}
          videoRef={gazeVideoRef}
        />
        <LiveEvaluationPanel metrics={metrics} />
      </div>
      <div className="p-4 pt-0">
        <TranscriptPanel transcript={transcript} />
      </div>
    </main>
  )
}


export default InterviewScreen
