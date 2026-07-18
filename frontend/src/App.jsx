import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  FileBarChart,
  FileWarning,
  Eye,
  FileText,
  FileQuestion,
  GitBranch,
  HelpCircle,
  Home,
  LayoutDashboard,
  LogIn,
  Mail,
  Menu,
  MessageSquareText,
  Microscope,
  Network,
  Play,
  Scale,
  Route,
  ScanFace,
  SearchCheck,
  Sparkles,
  Target,
  UserRoundCheck,
  UploadCloud,
  Video,
  Waves,
  X,
} from 'lucide-react'
import { Button } from './components/ui/button'
import './App.css'
const PROJECT_NAME = 'AI Powered Interview Assessment'
const navItems = [
  { label: 'Home', href: '#home', icon: Home },
  { label: 'Features', href: '#features', icon: Sparkles },
  { label: 'Research', href: '#research', icon: Microscope },
  { label: 'Workflow', href: '#workflow', icon: Route },
  { label: 'Assessment', href: '#assessment', icon: ClipboardCheck },
  { label: 'Dashboard', href: '#dashboard', icon: LayoutDashboard },
  { label: 'FAQ', href: '#faq', icon: HelpCircle },
  { label: 'Contact', href: '#contact', icon: Mail },
]
const heroStats = [
  ['100+', 'Interview Sessions'],
  ['95%', 'Evaluation Accuracy'],
  ['15+', 'Assessment Metrics'],
  ['AI Ready', 'Research Prototype'],
]
const transcriptLines = [
  ['AI', 'Generated follow-up from resume project experience'],
  ['Candidate', 'Explained CNN model evaluation and dataset split'],
  ['AI', 'Mapped answer to technical depth and confidence score'],
]
const traditionalInterviewProblems = [
  {
    title: 'Resume exaggeration',
    description: 'Claims are accepted at face value without validating project depth or skill ownership.',
    icon: FileWarning,
  },
  {
    title: 'Subjective evaluation',
    description: 'Scores depend heavily on interviewer mood, memory, and inconsistent judgement.',
    icon: Scale,
  },
  {
    title: 'No behavioral analysis',
    description: 'Confidence, clarity, hesitation, and communication patterns are rarely measured.',
    icon: ScanFace,
  },
  {
    title: 'No attention tracking',
    description: 'Traditional interviews cannot detect focus stability or interview engagement signals.',
    icon: Eye,
  },
  {
    title: 'Inconsistent questioning',
    description: 'Candidates receive different levels of difficulty, making comparison unreliable.',
    icon: MessageSquareText,
  },
  {
    title: 'Lack of explainability',
    description: 'Final decisions often lack transparent reasoning, evidence trails, and metric breakdowns.',
    icon: HelpCircle,
  },
]
const aiSolutions = [
  {
    title: 'Resume validation',
    description: 'Checks candidate claims through targeted project, skill, and experience verification.',
    icon: SearchCheck,
  },
  {
    title: 'Adaptive questioning',
    description: 'Generates role-specific follow-ups based on resume signals and answer quality.',
    icon: BrainCircuit,
  },
  {
    title: 'Speech intelligence',
    description: 'Analyzes fluency, clarity, pace, confidence, and response structure during interviews.',
    icon: Waves,
  },
  {
    title: 'Behavior analysis',
    description: 'Measures behavioral indicators such as emotion, attention, posture, and engagement.',
    icon: ScanFace,
  },
  {
    title: 'Knowledge graph reasoning',
    description: 'Maps resume concepts, questions, answers, and skills into explainable relationships.',
    icon: GitBranch,
  },
  {
    title: 'Explainable hiring recommendation',
    description: 'Produces a transparent shortlist decision with score evidence and recruiter review notes.',
    icon: UserRoundCheck,
  },
]
const researchInnovations = [
  {
    title: 'Resume Driven Domain Specific Question Generation',
    description:
      'Transforms resume skills, projects, and experience into role-specific technical and behavioral questions.',
    icon: FileText,
  },
  {
    title: 'Adaptive Question Planning',
    description:
      'Adjusts question difficulty and follow-up depth based on candidate responses and evaluation confidence.',
    icon: BrainCircuit,
  },
  {
    title: 'Cross Questioning Engine',
    description:
      'Validates consistency by generating deeper probes against earlier answers, resume claims, and domain signals.',
    icon: MessageSquareText,
  },
  {
    title: 'Knowledge Graph Based Candidate Modeling',
    description:
      'Models relationships between skills, projects, answers, concepts, and evidence for explainable assessment.',
    icon: Network,
  },
  {
    title: 'Resume Claim Validation',
    description:
      'Checks whether stated skills and project ownership are supported through targeted interview evidence.',
    icon: SearchCheck,
  },
  {
    title: 'Explainable Hiring Recommendation',
    description:
      'Generates transparent recommendations with score factors, evidence trails, and recruiter review context.',
    icon: UserRoundCheck,
  },
  {
    title: 'Speech Intelligence',
    description:
      'Evaluates clarity, pace, fluency, confidence, and answer structure from interview speech signals.',
    icon: Waves,
  },
  {
    title: 'Behavior Intelligence',
    description:
      'Analyzes attention, engagement, emotional cues, and interaction patterns during the assessment session.',
    icon: ScanFace,
  },
]
const featureCategories = [
  {
    title: 'Resume Intelligence',
    subtitle: 'Transforms uploaded resumes into structured candidate evidence.',
    icon: FileText,
    accent: 'blue',
    features: [
      'Resume Parsing',
      'Skill Extraction',
      'Domain Detection',
      'Resume Claim Validation',
    ],
  },
  {
    title: 'Interview Intelligence',
    subtitle: 'Creates adaptive interview flow from resume and answer signals.',
    icon: BrainCircuit,
    accent: 'violet',
    features: [
      'Resume Driven Questions',
      'Adaptive Questions',
      'Cross Questions',
      'Difficulty Adjustment',
    ],
  },
  {
    title: 'Speech Intelligence',
    subtitle: 'Measures communication quality from candidate speech patterns.',
    icon: Waves,
    accent: 'cyan',
    features: [
      'Speech to Text',
      'Fluency',
      'Speaking Rate',
      'Grammar',
      'Content Clarity',
      'Filler Word Detection',
    ],
  },
  {
    title: 'Behavior Analysis',
    subtitle: 'Captures non-verbal interview signals for richer evaluation.',
    icon: ScanFace,
    accent: 'emerald',
    features: ['Eye Contact', 'Emotion Detection', 'Head Pose', 'Head Nodding', 'Hand Movement'],
  },
  {
    title: 'Attention Tracking',
    subtitle: 'Monitors engagement and suspicious activity during assessment.',
    icon: Eye,
    accent: 'amber',
    features: [
      'Looking at Screen',
      'Looking Away',
      'Looking Down',
      'Cheating Detection',
      'Using Mobile',
      'Multiple Faces',
      'Leaving Frame',
    ],
  },
  {
    title: 'AI Evaluation',
    subtitle: 'Combines evidence into explainable scores and hiring outcomes.',
    icon: LayoutDashboard,
    accent: 'slate',
    features: [
      'Knowledge Graph',
      'Technical Score',
      'Communication Score',
      'Confidence Score',
      'Hiring Recommendation',
      'Explainable Evidence',
    ],
  },
]
const workflowSteps = [
  {
    step: 'Step 1',
    title: 'Upload Resume',
    description: 'Candidate resume is uploaded as the primary source for profile understanding.',
    icon: UploadCloud,
    nodes: ['PDF', 'Skills', 'Projects'],
  },
  {
    step: 'Step 2',
    title: 'AI Resume Analysis',
    description: 'The system extracts skills, education, projects, domains, and experience signals.',
    icon: FileText,
    nodes: ['Parse', 'Extract', 'Rank'],
  },
  {
    step: 'Step 3',
    title: 'Generate Domain Questions',
    description: 'Domain-specific technical and behavioral questions are generated from resume evidence.',
    icon: FileQuestion,
    nodes: ['Role', 'Domain', 'Prompt'],
  },
  {
    step: 'Step 4',
    title: 'Adaptive Interview',
    description: 'Question difficulty and follow-up depth adapt based on candidate performance.',
    icon: BrainCircuit,
    nodes: ['Answer', 'Depth', 'Next'],
  },
  {
    step: 'Step 5',
    title: 'Behavior Monitoring',
    description: 'Visual signals such as attention, posture, emotion, and frame presence are tracked.',
    icon: ScanFace,
    nodes: ['Face', 'Focus', 'Motion'],
  },
  {
    step: 'Step 6',
    title: 'Speech Analysis',
    description: 'Speech is evaluated for fluency, pace, clarity, grammar, and filler word usage.',
    icon: Waves,
    nodes: ['Voice', 'Text', 'Clarity'],
  },
  {
    step: 'Step 7',
    title: 'Knowledge Graph Evaluation',
    description: 'Skills, claims, questions, and answers are mapped into explainable relationships.',
    icon: Network,
    nodes: ['Claim', 'Evidence', 'Score'],
  },
  {
    step: 'Step 8',
    title: 'Explainable Hiring Recommendation',
    description: 'The framework generates a transparent recommendation with evidence-backed reasoning.',
    icon: BadgeCheck,
    nodes: ['Fit', 'Risk', 'Reason'],
  },
  {
    step: 'Step 9',
    title: 'Final Candidate Report',
    description: 'A structured report summarizes scores, observations, evidence, and hiring guidance.',
    icon: FileBarChart,
    nodes: ['Report', 'Scores', 'Notes'],
  },
]
const assessmentMetrics = [
  { label: 'Technical Accuracy', value: 91, icon: BrainCircuit, tone: 'blue' },
  { label: 'Communication', value: 86, icon: MessageSquareText, tone: 'teal' },
  { label: 'Confidence', value: 82, icon: UserRoundCheck, tone: 'violet' },
  { label: 'Content Clarity', value: 88, icon: FileText, tone: 'cyan' },
  { label: 'Speech Fluency', value: 84, icon: Waves, tone: 'emerald' },
  { label: 'Speaking Speed', value: 79, icon: Play, tone: 'amber' },
  { label: 'Filler Words', value: 74, icon: MessageSquareText, tone: 'rose' },
  { label: 'Eye Contact', value: 89, icon: Eye, tone: 'emerald' },
  { label: 'Attention', value: 92, icon: Target, tone: 'blue' },
  { label: 'Emotion', value: 81, icon: ScanFace, tone: 'violet' },
  { label: 'Head Movement', value: 77, icon: ScanFace, tone: 'slate' },
  { label: 'Hand Movement', value: 83, icon: Video, tone: 'cyan' },
  { label: 'Knowledge Graph Coverage', value: 87, icon: Network, tone: 'teal' },
  { label: 'Resume Validation', value: 90, icon: SearchCheck, tone: 'blue' },
]
const overallScore = 86
const metricToneClasses = {
  blue: {
    stroke: '#2563eb',
    icon: 'bg-blue-50 text-blue-700 ring-blue-100',
    glow: 'bg-blue-500/12',
    chip: 'text-blue-700',
  },
  teal: {
    stroke: '#0f766e',
    icon: 'bg-teal-50 text-teal-700 ring-teal-100',
    glow: 'bg-teal-500/12',
    chip: 'text-teal-700',
  },
  violet: {
    stroke: '#7c3aed',
    icon: 'bg-violet-50 text-violet-700 ring-violet-100',
    glow: 'bg-violet-500/12',
    chip: 'text-violet-700',
  },
  cyan: {
    stroke: '#0891b2',
    icon: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
    glow: 'bg-cyan-500/12',
    chip: 'text-cyan-700',
  },
  emerald: {
    stroke: '#059669',
    icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    glow: 'bg-emerald-500/12',
    chip: 'text-emerald-700',
  },
  amber: {
    stroke: '#d97706',
    icon: 'bg-amber-50 text-amber-700 ring-amber-100',
    glow: 'bg-amber-500/14',
    chip: 'text-amber-700',
  },
  rose: {
    stroke: '#e11d48',
    icon: 'bg-rose-50 text-rose-700 ring-rose-100',
    glow: 'bg-rose-500/12',
    chip: 'text-rose-700',
  },
  slate: {
    stroke: '#475569',
    icon: 'bg-slate-100 text-slate-800 ring-slate-200',
    glow: 'bg-slate-500/10',
    chip: 'text-slate-700',
  },
}
const recruiterDashboardPages = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Candidates', icon: UserRoundCheck },
  { label: 'Reports', icon: FileBarChart },
  { label: 'Analytics', icon: Scale },
  { label: 'Settings', icon: Menu },
]
const recruiterInterviews = [
  {
    id: 'INT-2401',
    name: 'Priya Sharma',
    role: 'ML Engineer',
    date: 'Jul 18, 2026',
    score: 91,
    technical: 94,
    communication: 86,
    confidence: 88,
    recommendation: 'Shortlist',
    status: 'Completed',
    resume: 93,
  },
  {
    id: 'INT-2402',
    name: 'Kabir Sen',
    role: 'Backend Engineer',
    date: 'Jul 18, 2026',
    score: 88,
    technical: 92,
    communication: 81,
    confidence: 84,
    recommendation: 'Shortlist',
    status: 'Completed',
    resume: 90,
  },
  {
    id: 'INT-2403',
    name: 'Aarav Nair',
    role: 'Full Stack Engineer',
    date: 'Jul 17, 2026',
    score: 84,
    technical: 86,
    communication: 83,
    confidence: 80,
    recommendation: 'Review',
    status: 'Completed',
    resume: 85,
  },
  {
    id: 'INT-2404',
    name: 'Neha Rao',
    role: 'Data Analyst',
    date: 'Jul 17, 2026',
    score: 76,
    technical: 74,
    communication: 82,
    confidence: 73,
    recommendation: 'Review',
    status: 'Completed',
    resume: 78,
  },
  {
    id: 'INT-2405',
    name: 'Arjun Mehta',
    role: 'Frontend Engineer',
    date: 'Jul 16, 2026',
    score: 79,
    technical: 77,
    communication: 85,
    confidence: 76,
    recommendation: 'Review',
    status: 'Completed',
    resume: 80,
  },
  {
    id: 'INT-2406',
    name: 'Maya Iyer',
    role: 'Product Analyst',
    date: 'Jul 16, 2026',
    score: 69,
    technical: 67,
    communication: 78,
    confidence: 65,
    recommendation: 'Hold',
    status: 'Completed',
    resume: 70,
  },
  {
    id: 'INT-2407',
    name: 'Rohan Das',
    role: 'DevOps Engineer',
    date: 'Jul 15, 2026',
    score: 82,
    technical: 85,
    communication: 76,
    confidence: 79,
    recommendation: 'Shortlist',
    status: 'Completed',
    resume: 84,
  },
  {
    id: 'INT-2408',
    name: 'Sara Thomas',
    role: 'QA Automation Engineer',
    date: 'Jul 15, 2026',
    score: 73,
    technical: 75,
    communication: 72,
    confidence: 71,
    recommendation: 'Hold',
    status: 'Completed',
    resume: 76,
  },
  {
    id: 'INT-2409',
    name: 'Ishan Kapoor',
    role: 'Cloud Engineer',
    date: 'Jul 14, 2026',
    score: 86,
    technical: 89,
    communication: 80,
    confidence: 85,
    recommendation: 'Shortlist',
    status: 'Completed',
    resume: 87,
  },
  {
    id: 'INT-2410',
    name: 'Diya Menon',
    role: 'UX Engineer',
    date: 'Jul 14, 2026',
    score: 81,
    technical: 78,
    communication: 89,
    confidence: 82,
    recommendation: 'Review',
    status: 'Completed',
    resume: 79,
  },
  {
    id: 'INT-2411',
    name: 'Vivaan Reddy',
    role: 'Security Engineer',
    date: 'Jul 13, 2026',
    score: 67,
    technical: 70,
    communication: 63,
    confidence: 66,
    recommendation: 'Reject',
    status: 'Completed',
    resume: 69,
  },
  {
    id: 'INT-2412',
    name: 'Ananya Bose',
    role: 'AI Research Intern',
    date: 'Jul 13, 2026',
    score: 90,
    technical: 93,
    communication: 84,
    confidence: 87,
    recommendation: 'Shortlist',
    status: 'Completed',
    resume: 92,
  },
]
const recruiterActivity = [
  ['2 min ago', 'Priya Sharma report generated', 'Shortlist recommendation'],
  ['18 min ago', 'Kabir Sen interview completed', 'Backend role'],
  ['44 min ago', 'Resume validation queue synced', '12 claims verified'],
  ['1 hr ago', 'Neha Rao moved to review', 'Recruiter note added'],
  ['2 hr ago', 'Analytics export prepared', 'Weekly hiring summary'],
]
const recruiterScoreTrend = [
  { label: 'Mon', value: 76 },
  { label: 'Tue', value: 81 },
  { label: 'Wed', value: 79 },
  { label: 'Thu', value: 84 },
  { label: 'Fri', value: 88 },
  { label: 'Sat', value: 86 },
]
const recruiterRoleBreakdown = [
  { label: 'ML', value: 32 },
  { label: 'Backend', value: 26 },
  { label: 'Frontend', value: 22 },
  { label: 'Data', value: 18 },
  { label: 'Cloud', value: 15 },
]
function ProjectLogo() {
  return (
    <a href="#home" className="group flex min-w-0 items-center gap-3" aria-label={PROJECT_NAME}>
      <motion.span
        className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-[0_10px_30px_rgba(15,23,42,0.10)]"
        whileHover={{ scale: 1.05, rotate: 2 }}
        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
      >
        <span className="absolute inset-0 bg-[linear-gradient(135deg,rgba(37,99,235,0.18),rgba(20,184,166,0.18),rgba(255,255,255,0.7))]" />
        <BrainCircuit className="relative text-slate-950" size={22} />
      </motion.span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold tracking-tight text-slate-950 sm:max-w-[320px] xl:max-w-none">
          {PROJECT_NAME}
        </span>
        <span className="hidden text-xs font-medium text-slate-500 sm:block">
          Explainable interview evaluation framework
        </span>
      </span>
    </a>
  )
}
function DesktopNav({ activeItem, setActiveItem }) {
  return (
    <nav className="hidden items-center gap-0.5 xl:flex" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = activeItem === item.label
        return (
          <motion.a
            key={item.label}
            href={item.href}
            className={`group relative inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold transition ${
              isActive ? 'text-slate-950' : 'text-slate-600 hover:text-slate-950'
            }`}
            onClick={() => setActiveItem(item.label)}
            whileHover={{ y: -1 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            <Icon
              size={15}
              className={`transition ${isActive ? 'text-blue-700' : 'text-slate-400 group-hover:text-blue-700'}`}
            />
            {item.label}
            <span className="absolute inset-0 -z-10 rounded-lg bg-slate-950/[0.04] opacity-0 transition group-hover:opacity-100" />
            {isActive && (
              <motion.span
                layoutId="active-navigation-indicator"
                className="absolute inset-x-3 -bottom-[17px] h-0.5 rounded-full bg-blue-700"
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}
          </motion.a>
        )
      })}
    </nav>
  )
}
function MobileMenu({ open, activeItem, setActiveItem, onClose, onStartAssessment }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="border-t border-white/70 bg-white/92 px-4 py-4 shadow-2xl shadow-slate-950/10 backdrop-blur-2xl xl:hidden"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.24, ease: 'easeOut' }}
        >
          <div className="mx-auto grid max-w-7xl gap-2">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = activeItem === item.label
              return (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-sm font-semibold transition ${
                    isActive
                      ? 'border-blue-200 bg-blue-50 text-blue-800'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.025 }}
                  onClick={() => {
                    setActiveItem(item.label)
                    onClose()
                  }}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-lg ${
                      isActive ? 'bg-white text-blue-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  {item.label}
                </motion.a>
              )
            })}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="secondary" className="w-full" onClick={onClose}>
                <LogIn size={16} />
                Login
              </Button>
              <Button
                className="w-full bg-blue-700 hover:bg-blue-800"
                onClick={() => {
                  onClose()
                  onStartAssessment()
                }}
              >
                Start
                <ArrowRight size={16} />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
function StickyNavbar({ onStartAssessment }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeItem, setActiveItem] = useState('Home')
  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/60 bg-white/72 shadow-[0_1px_0_rgba(15,23,42,0.04),0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.35),transparent)]" />
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <ProjectLogo />
        <DesktopNav activeItem={activeItem} setActiveItem={setActiveItem} />
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden lg:inline-flex">
            <LogIn size={16} />
            Login
          </Button>
          <Button
            className="hidden bg-blue-700 shadow-lg shadow-blue-700/20 hover:bg-blue-800 lg:inline-flex"
            onClick={onStartAssessment}
          >
            Start Interview
            <ArrowRight size={16} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="bg-white/75 xl:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((value) => !value)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      <MobileMenu
        open={mobileOpen}
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        onClose={() => setMobileOpen(false)}
        onStartAssessment={onStartAssessment}
      />
    </motion.header>
  )
}
function StatCard({ value, label, index }) {
  return (
    <motion.div
      className="rounded-xl border border-white/70 bg-white/76 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.28 + index * 0.07 }}
      whileHover={{ y: -4 }}
    >
      <div className="text-2xl font-bold tracking-tight text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </div>
    </motion.div>
  )
}
function DashboardCard({ title, icon: Icon, children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={`rounded-2xl border border-white/70 bg-white/82 p-4 shadow-[0_22px_70px_rgba(15,23,42,0.12)] backdrop-blur-2xl ${className}`}
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.55, delay }}
      whileHover={{ y: -5, scale: 1.01 }}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <Icon size={17} />
          </span>
          <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
      </div>
      {children}
    </motion.div>
  )
}
function ProgressRow({ label, value, color = 'bg-blue-600' }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-950">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, delay: 0.45, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
function WebcamWidget() {
  return (
    <DashboardCard title="Live Webcam" icon={Video} className="md:col-span-2" delay={0.18}>
      <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-44 overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_18%,rgba(59,130,246,0.24),transparent_35%),linear-gradient(135deg,#111827,#1e293b)]">
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/35 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            Live interview
          </div>
          <motion.div
            className="absolute left-1/2 top-1/2 grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/12 text-white ring-1 ring-white/20"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ScanFace size={34} />
          </motion.div>
          <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
            {['Voice', 'Posture', 'Focus'].map((item) => (
              <div key={item} className="rounded-lg bg-white/12 px-2 py-2 text-center text-xs font-semibold text-white backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="grid content-center gap-4">
          <ProgressRow label="Eye Contact" value={88} color="bg-emerald-500" />
          <ProgressRow label="Emotion Detection" value={76} color="bg-violet-500" />
          <ProgressRow label="Speaking Clarity" value={91} color="bg-blue-600" />
        </div>
      </div>
    </DashboardCard>
  )
}
function ScoreRing() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative grid h-24 w-24 place-items-center">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <motion.circle
            cx="50"
            cy="50"
            r="42"
            fill="none"
            stroke="#2563eb"
            strokeLinecap="round"
            strokeWidth="10"
            strokeDasharray="264"
            initial={{ strokeDashoffset: 264 }}
            animate={{ strokeDashoffset: 42 }}
            transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
          />
        </svg>
        <span className="absolute text-2xl font-bold text-slate-950">84</span>
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-500">Overall Score</p>
        <p className="mt-1 text-lg font-bold text-slate-950">Strong Match</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">Recommended for technical round 2</p>
      </div>
    </div>
  )
}
function KnowledgeGraphWidget() {
  return (
    <div className="relative h-36 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 144" aria-hidden="true">
        <motion.path
          d="M70 72 L150 32 L250 58 M150 32 L186 112 M70 72 L186 112 M186 112 L250 58"
          fill="none"
          stroke="#93c5fd"
          strokeWidth="2"
          strokeDasharray="8 8"
          animate={{ strokeDashoffset: [0, -32] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
      {[
        ['Resume', 'left-[28px] top-[54px]'],
        ['DSA', 'left-[128px] top-[18px]'],
        ['ML', 'right-[42px] top-[44px]'],
        ['Projects', 'left-[160px] bottom-[18px]'],
      ].map(([label, position]) => (
        <motion.div
          key={label}
          className={`absolute ${position} rounded-full border border-blue-200 bg-white px-3 py-1 text-xs font-bold text-blue-800 shadow-sm`}
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, delay: label.length * 0.08 }}
        >
          {label}
        </motion.div>
      ))}
    </div>
  )
}
function AssessmentDashboardIllustration() {
  return (
    <motion.div
      className="relative mx-auto w-full max-w-2xl"
      initial={{ opacity: 0, x: 28 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, delay: 0.12 }}
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.24),transparent_34%),radial-gradient(circle_at_90%_10%,rgba(20,184,166,0.20),transparent_30%),radial-gradient(circle_at_50%_90%,rgba(124,58,237,0.16),transparent_34%)] blur-2xl" />
      <div className="relative rounded-[1.75rem] border border-white/70 bg-white/55 p-3 shadow-[0_35px_100px_rgba(15,23,42,0.18)] backdrop-blur-2xl">
        <div className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/85 p-4">
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Assessment Console
              </p>
              <p className="mt-1 text-sm font-bold text-slate-950">Candidate: Priya S.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <CheckCircle2 size={14} />
              AI scoring active
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <DashboardCard title="Resume Analysis" icon={FileText} delay={0.08}>
              <div className="space-y-3">
                <ProgressRow label="Role Match" value={92} />
                <ProgressRow label="Project Relevance" value={86} color="bg-teal-500" />
              </div>
            </DashboardCard>
            <DashboardCard title="Question Generation" icon={BrainCircuit} delay={0.12}>
              <div className="space-y-2">
                {['Adaptive DSA prompt', 'Resume-based ML follow-up', 'Behavioral scenario'].map(
                  (item) => (
                    <div key={item} className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      {item}
                    </div>
                  ),
                )}
              </div>
            </DashboardCard>
            <WebcamWidget />
            <DashboardCard title="Transcript" icon={MessageSquareText} delay={0.24}>
              <div className="space-y-2">
                {transcriptLines.map(([speaker, text]) => (
                  <div key={text} className="rounded-lg bg-slate-50 p-2">
                    <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">
                      {speaker}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                  </div>
                ))}
              </div>
            </DashboardCard>
            <DashboardCard title="Knowledge Graph" icon={Network} delay={0.28}>
              <KnowledgeGraphWidget />
            </DashboardCard>
          </div>
        </div>
      </div>
      <motion.div
        className="absolute -left-4 top-16 hidden w-56 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-2xl shadow-slate-950/12 backdrop-blur-xl sm:block"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-950">
          <Eye size={17} className="text-emerald-600" />
          Attention Tracking
        </div>
        <ProgressRow label="Focus stability" value={89} color="bg-emerald-500" />
      </motion.div>
      <motion.div
        className="absolute -right-4 bottom-10 hidden w-64 rounded-2xl border border-white/70 bg-white/92 p-4 shadow-2xl shadow-slate-950/12 backdrop-blur-xl sm:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ScoreRing />
      </motion.div>
      <motion.div
        className="absolute -right-2 top-24 hidden rounded-2xl border border-blue-100 bg-blue-700 px-4 py-3 text-white shadow-2xl shadow-blue-700/24 lg:block"
        animate={{ x: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="flex items-center gap-2 text-sm font-bold">
          <UserRoundCheck size={18} />
          Hiring Recommendation
        </div>
        <p className="mt-1 text-xs text-blue-100">Shortlist with review notes</p>
      </motion.div>
    </motion.div>
  )
}
function CircularProgress({
  value,
  size = 96,
  strokeWidth = 9,
  color = '#2563eb',
  label,
  valueClassName = 'text-slate-950',
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (value / 100) * circumference
  return (
    <div
      className="relative grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
      aria-label={`${label}: ${value}%`}
      role="img"
    >
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset: dashOffset }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <span className={`absolute text-xl font-black tracking-tight ${valueClassName}`}>{value}</span>
    </div>
  )
}
function MetricCard({ metric, index }) {
  const Icon = metric.icon
  const tone = metricToneClasses[metric.tone] ?? metricToneClasses.blue
  return (
    <motion.article
      className="group relative min-h-52 overflow-hidden rounded-2xl border border-white/75 bg-white/84 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.48, delay: index * 0.035, ease: 'easeOut' }}
      whileHover={{ y: -6, scale: 1.012 }}
    >
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl ${tone.glow}`} />
      <div className="relative flex h-full flex-col">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${tone.icon}`}>
            <Icon size={21} />
          </span>
          <span className={`text-xs font-black uppercase tracking-[0.14em] ${tone.chip}`}>
            Metric
          </span>
        </div>
        <div className="flex flex-1 items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-black tracking-[-0.01em] text-slate-950">
              {metric.label}
            </h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">Assessment score</p>
          </div>
          <CircularProgress
            value={metric.value}
            size={88}
            strokeWidth={8}
            color={tone.stroke}
            label={metric.label}
          />
        </div>
      </div>
    </motion.article>
  )
}
function RecruiterDashboardCard({ title, icon: Icon, children, action, className = '' }) {
  return (
    <motion.section
      className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.07)] ${className}`}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-950 text-white">
            <Icon size={19} />
          </span>
          <h3 className="text-base font-black tracking-[-0.01em] text-slate-950">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </motion.section>
  )
}
function StatusBadge({ value }) {
  const classes = {
    Shortlist: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    Review: 'border-blue-200 bg-blue-50 text-blue-700',
    Hold: 'border-amber-200 bg-amber-50 text-amber-700',
    Reject: 'border-rose-200 bg-rose-50 text-rose-700',
    Completed: 'border-slate-200 bg-slate-50 text-slate-600',
  }
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.08em] ${classes[value] ?? classes.Completed}`}>
      {value}
    </span>
  )
}
function RecruiterSearchFilters({ search, setSearch, filter, setFilter }) {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_220px]">
      <label className="relative block">
        <SearchCheck className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search candidates, roles, or interview IDs"
          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
        />
      </label>
      <select
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-700 outline-none transition focus:border-blue-300 focus:ring-4 focus:ring-blue-100"
      >
        <option value="All">All recommendations</option>
        <option value="Shortlist">Shortlist</option>
        <option value="Review">Review</option>
        <option value="Hold">Hold</option>
        <option value="Reject">Reject</option>
      </select>
    </div>
  )
}
function RecruiterPagination({ page, totalPages, setPage }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
      <p className="text-sm font-semibold text-slate-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          className="bg-white"
          disabled={page === 1}
          onClick={() => setPage(Math.max(1, page - 1))}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          className="bg-white"
          disabled={page === totalPages}
          onClick={() => setPage(Math.min(totalPages, page + 1))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
function RecruiterInterviewsTable({ interviews }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
      <div className="hidden grid-cols-[1.2fr_1fr_90px_110px_110px] gap-4 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-slate-400 md:grid">
        <span>Candidate</span>
        <span>Role</span>
        <span>Score</span>
        <span>Recommend</span>
        <span>Date</span>
      </div>
      {interviews.map((candidate) => (
        <div
          key={candidate.id}
          className="grid gap-3 border-t border-slate-200 px-4 py-4 first:border-t-0 md:grid-cols-[1.2fr_1fr_90px_110px_110px] md:items-center"
        >
          <div>
            <p className="font-black text-slate-950">{candidate.name}</p>
            <p className="mt-1 text-xs font-semibold text-slate-500">{candidate.id}</p>
          </div>
          <p className="text-sm font-semibold text-slate-600">{candidate.role}</p>
          <p className="text-2xl font-black text-slate-950">{candidate.score}</p>
          <StatusBadge value={candidate.recommendation} />
          <p className="text-sm font-semibold text-slate-500">{candidate.date}</p>
        </div>
      ))}
    </div>
  )
}
function RecruiterLineChart({ data }) {
  const points = data.map((item, index) => {
    const x = 34 + index * 48
    const y = 142 - item.value
    return { ...item, x, y }
  })
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ')
  return (
    <svg className="h-56 w-full" viewBox="0 0 300 170" aria-label="Average score trend chart">
      {[40, 75, 110, 145].map((y) => (
        <line key={y} x1="28" y1={y} x2="286" y2={y} stroke="#e2e8f0" strokeWidth="1" />
      ))}
      <motion.path
        d={path}
        fill="none"
        stroke="#2563eb"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="4"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
      {points.map((point) => (
        <g key={point.label}>
          <circle cx={point.x} cy={point.y} r="5" fill="#0f766e" />
          <text x={point.x} y="162" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">
            {point.label}
          </text>
        </g>
      ))}
      </svg>
  )
}

function RecruiterBarChart({ data }) {
  return (
    <div className="flex h-56 items-end gap-3 rounded-xl bg-slate-50 p-4">
      {data.map((item, index) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
          <motion.div
            className="w-full rounded-t-xl bg-[linear-gradient(180deg,#2563eb,#0f766e)]"
            initial={{ height: 0 }}
            whileInView={{ height: `${item.value * 3.2}px` }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: index * 0.05, ease: 'easeOut' }}
          />
          <span className="text-xs font-black text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  )
}
function RecruiterDashboardHome({ interviews, visibleInterviews, page, totalPages, setPage }) {
  const averageScore = Math.round(interviews.reduce((sum, item) => sum + item.score, 0) / interviews.length)
  const averageTechnical = Math.round(interviews.reduce((sum, item) => sum + item.technical, 0) / interviews.length)
  const averageCommunication = Math.round(interviews.reduce((sum, item) => sum + item.communication, 0) / interviews.length)
  const counts = ['Shortlist', 'Review', 'Hold', 'Reject'].map((item) => ({
    label: item,
    value: interviews.filter((interview) => interview.recommendation === item).length,
  }))
  const topCandidates = [...interviews].sort((a, b) => b.score - a.score).slice(0, 4)
  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ['Average Score', averageScore, BadgeCheck],
          ['Technical Avg', averageTechnical, BrainCircuit],
          ['Communication Avg', averageCommunication, MessageSquareText],
        ].map(([label, value, Icon]) => (
          <RecruiterDashboardCard key={label} title={label} icon={Icon}>
            <div className="flex items-end justify-between">
              <p className="text-5xl font-black tracking-tight text-slate-950">{value}</p>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                +8.4%
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-slate-500">Compared with previous hiring batch</p>
          </RecruiterDashboardCard>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <RecruiterDashboardCard title="Charts" icon={Scale}>
          <RecruiterLineChart data={recruiterScoreTrend} />
        </RecruiterDashboardCard>
        <RecruiterDashboardCard title="Hiring Recommendation Counts" icon={ClipboardCheck}>
          <div className="grid gap-3">
            {counts.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <StatusBadge value={item.label} />
                <span className="text-2xl font-black text-slate-950">{item.value}</span>
              </div>
            ))}
          </div>
        </RecruiterDashboardCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <RecruiterDashboardCard title="Recent Interviews" icon={Video}>
          <RecruiterInterviewsTable interviews={visibleInterviews} />
          <div className="mt-4">
            <RecruiterPagination page={page} totalPages={totalPages} setPage={setPage} />
          </div>
        </RecruiterDashboardCard>
        <div className="grid gap-5">
          <RecruiterDashboardCard title="Top Candidates" icon={UserRoundCheck}>
            <div className="space-y-3">
              {topCandidates.map((candidate, index) => (
                <div key={candidate.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div>
                    <p className="text-sm font-black text-slate-950">{index + 1}. {candidate.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{candidate.role}</p>
                  </div>
                  <p className="text-2xl font-black text-blue-700">{candidate.score}</p>
                </div>
              ))}
            </div>
          </RecruiterDashboardCard>
          <RecruiterDashboardCard title="Recent Activity" icon={Route}>
            <div className="space-y-3">
              {recruiterActivity.map(([time, title, detail]) => (
                <div key={title} className="border-l-2 border-blue-200 pl-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">{time}</p>
                  <p className="mt-1 text-sm font-black text-slate-950">{title}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p>
                </div>
              ))}
            </div>
          </RecruiterDashboardCard>
        </div>
      </div>
    </div>
  )
}
function RecruiterCandidatesPage({ interviews, page, totalPages, setPage }) {
  return (
    <RecruiterDashboardCard title="Candidates" icon={UserRoundCheck}>
      <RecruiterInterviewsTable interviews={interviews} />
      <div className="mt-4">
        <RecruiterPagination page={page} totalPages={totalPages} setPage={setPage} />
      </div>
    </RecruiterDashboardCard>
  )
}
function RecruiterReportsPage({ interviews }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {interviews.slice(0, 6).map((candidate) => (
        <RecruiterDashboardCard key={candidate.id} title={candidate.name} icon={FileBarChart}>
          <p className="text-sm font-semibold text-slate-500">{candidate.role}</p>
          <div className="mt-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Report Score</p>
              <p className="mt-1 text-4xl font-black text-slate-950">{candidate.score}</p>
            </div>
            <StatusBadge value={candidate.recommendation} />
          </div>
          <Button className="mt-5 w-full bg-slate-950 text-white hover:bg-slate-800">
            View Report
          </Button>
        </RecruiterDashboardCard>
      ))}
    </div>
  )
}
function RecruiterAnalyticsPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <RecruiterDashboardCard title="Average Score Trend" icon={Scale}>
        <RecruiterLineChart data={recruiterScoreTrend} />
      </RecruiterDashboardCard>
      <RecruiterDashboardCard title="Role Breakdown" icon={Network}>
        <RecruiterBarChart data={recruiterRoleBreakdown} />
      </RecruiterDashboardCard>
      <RecruiterDashboardCard title="Recommendation Distribution" icon={ClipboardCheck} className="lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-4">
          {['Shortlist', 'Review', 'Hold', 'Reject'].map((label) => (
            <div key={label} className="rounded-xl bg-slate-50 p-4">
              <StatusBadge value={label} />
              <p className="mt-4 text-4xl font-black text-slate-950">
                {recruiterInterviews.filter((item) => item.recommendation === label).length}
              </p>
            </div>
          ))}
        </div>
      </RecruiterDashboardCard>
    </div>
  )
}
function RecruiterSettingsPage() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {[
        ['Interview Rules', 'Adaptive cross-questioning enabled', BrainCircuit],
        ['Report Automation', 'Generate HR report after every interview', FileBarChart],
        ['Evaluation Weights', 'Technical 40%, communication 25%, behavior 20%, resume 15%', Scale],
        ['Notifications', 'Notify recruiter when shortlist candidate appears', Mail],
      ].map(([title, detail, Icon]) => (
        <RecruiterDashboardCard key={title} title={title} icon={Icon}>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold leading-6 text-slate-600">{detail}</p>
            <span className="h-7 w-12 rounded-full bg-blue-700 p-1">
              <span className="block h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm" />
            </span>
          </div>
        </RecruiterDashboardCard>
      ))}
    </div>
  )
}
function RecruiterDashboardPreview() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const filteredInterviews = recruiterInterviews.filter((candidate) => {
    const matchesSearch = [candidate.name, candidate.role, candidate.id]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || candidate.recommendation === filter
    return matchesSearch && matchesFilter
  })
  const totalPages = Math.max(1, Math.ceil(filteredInterviews.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const paginatedInterviews = filteredInterviews.slice((safePage - 1) * pageSize, safePage * pageSize)
  function updateSearch(nextSearch) {
    setSearch(nextSearch)
    setPage(1)
  }
  function updateFilter(nextFilter) {
    setFilter(nextFilter)
    setPage(1)
  }
  return (
    <section id="dashboard" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_48%,#ffffff_100%)]" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Recruiter Workspace"
          title="Real Hiring Operations Dashboard"
          description="A premium SaaS dashboard with candidate management, reports, analytics, filters, search, pagination, and realistic mock interview data."
        />
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_35px_120px_rgba(15,23,42,0.14)]">
          <div className="grid lg:grid-cols-[260px_1fr]">
            <aside className="border-b border-slate-200 bg-slate-950 p-4 text-white lg:border-b-0 lg:border-r">
              <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Recruiter Suite</p>
                <p className="mt-2 text-xl font-black">Talent Command</p>
              </div>
              <nav className="grid gap-2" aria-label="Recruiter dashboard pages">
                {recruiterDashboardPages.map((item) => {
                  const Icon = item.icon
                  const isActive = activePage === item.label
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black transition ${
                        isActive
                          ? 'bg-cyan-300 text-slate-950'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                      onClick={() => {
                        setActivePage(item.label)
                        setPage(1)
                      }}
                    >
                      <Icon size={18} />
                      {item.label}
                    </button>
                  )
                })}
              </nav>
            </aside>
            <div className="bg-slate-50 p-4 sm:p-6">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                    {activePage}
                  </p>
                  <h3 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
                    {activePage === 'Dashboard' ? 'Interview Overview' : activePage}
                  </h3>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600">
                  {filteredInterviews.length} results
                </div>
              </div>
              <div className="mb-5">
                <RecruiterSearchFilters
                  search={search}
                  setSearch={updateSearch}
                  filter={filter}
                  setFilter={updateFilter}
                />
              </div>
              {activePage === 'Dashboard' && (
                <RecruiterDashboardHome
                  interviews={filteredInterviews}
                  visibleInterviews={paginatedInterviews}
                  page={safePage}
                  totalPages={totalPages}
                  setPage={setPage}
                />
              )}
              {activePage === 'Candidates' && (
                <RecruiterCandidatesPage
                  interviews={paginatedInterviews}
                  page={safePage}
                  totalPages={totalPages}
                  setPage={setPage}
                />
              )}
              {activePage === 'Reports' && <RecruiterReportsPage interviews={filteredInterviews} />}
              {activePage === 'Analytics' && <RecruiterAnalyticsPage />}
              {activePage === 'Settings' && <RecruiterSettingsPage />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
function AssessmentMetricsDashboard() {
  return (
    <section id="metrics" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#eef4ff_48%,#f8fafc_100%)]" />
      <div className="absolute left-[-12%] top-20 -z-10 h-[500px] w-[500px] rounded-full bg-blue-100/55 blur-3xl" />
      <div className="absolute right-[-10%] bottom-16 -z-10 h-[500px] w-[500px] rounded-full bg-teal-100/50 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Assessment Metrics"
          title="Candidate Performance Dashboard"
          description="A recruiter-ready view of technical, communication, speech, behavior, resume, and graph coverage signals with circular score indicators."
        />
        <motion.div
          className="mb-6 grid gap-6 rounded-3xl border border-white/75 bg-slate-950 p-5 text-white shadow-[0_30px_90px_rgba(15,23,42,0.22)] md:grid-cols-[0.8fr_1.2fr]"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.58, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-5 rounded-2xl border border-white/10 bg-white/6 p-5">
            <CircularProgress
              value={overallScore}
              size={136}
              strokeWidth={12}
              color="#38bdf8"
              label="Overall Score"
              valueClassName="text-white"
            />
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-200">
                Overall Score
              </p>
              <h3 className="mt-2 text-3xl font-black tracking-tight">Strong Fit</h3>
              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
                Balanced performance across knowledge, delivery, behavioral focus, and resume evidence.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['Top Signal', 'Technical Accuracy', '91%'],
              ['Review Point', 'Filler Words', '74%'],
              ['Recommendation', 'Proceed', 'Round 2'],
            ].map(([label, title, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-white/6 p-4">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                  {label}
                </p>
                <p className="mt-3 text-sm font-bold text-white">{title}</p>
                <p className="mt-1 text-2xl font-black tracking-tight text-cyan-200">{value}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {assessmentMetrics.map((metric, index) => (
            <MetricCard key={metric.label} metric={metric} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
function HeroSection({ onStartAssessment }) {
  return (
    <section id="home" className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 lg:px-8 lg:pb-28 lg:pt-20">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_48%,#ffffff_100%)]" />
      <div className="absolute left-1/2 top-12 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-200/25 blur-3xl" />
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[0.95fr_1.05fr]">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/75 px-4 py-2 text-sm font-bold text-blue-800 shadow-sm backdrop-blur-xl">
            <Target size={16} />
            AI-based interview assessment for hiring decisions
          </div>
          <h1 className="max-w-4xl text-5xl font-black tracking-[-0.03em] text-slate-950 sm:text-6xl lg:text-7xl">
            AI Powered Interview Assessment
            <span className="block bg-[linear-gradient(90deg,#1d4ed8,#0f766e,#111827)] bg-clip-text text-transparent">
              and Evaluation Framework
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            An intelligent interview platform that evaluates candidates using
            resume-driven adaptive questioning, speech intelligence, behavioral
            analysis, attention tracking, explainable AI, and hiring recommendations.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 bg-blue-700 px-6 text-base shadow-xl shadow-blue-700/20 hover:bg-blue-800"
              onClick={onStartAssessment}
            >
              Start Assessment
              <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" className="h-12 bg-white/80 px-6 text-base">
              <Play size={18} />
              Watch Demo
            </Button>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map(([value, label], index) => (
              <StatCard key={label} value={value} label={label} index={index} />
            ))}
          </div>
        </motion.div>
        <AssessmentDashboardIllustration />
      </div>
    </section>
  )
}
function SectionHeader({ eyebrow, title, description }) {
  return (
    <motion.div
      className="mx-auto mb-12 max-w-3xl text-center"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
    >
      <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-blue-700">{eyebrow}</p>
      <h2 className="text-3xl font-black tracking-[-0.02em] text-slate-950 sm:text-5xl">
        {title}
      </h2>
      <p className="mt-5 text-base leading-8 text-slate-600 sm:text-lg">{description}</p>
    </motion.div>
  )
}
function getFeatureAccent(accent) {
  const accents = {
    blue: {
      icon: 'bg-blue-50 text-blue-700 ring-blue-100',
      line: 'from-blue-600 to-cyan-500',
      chip: 'bg-blue-50 text-blue-700 border-blue-100',
    },
    violet: {
      icon: 'bg-violet-50 text-violet-700 ring-violet-100',
      line: 'from-violet-600 to-blue-500',
      chip: 'bg-violet-50 text-violet-700 border-violet-100',
    },
    cyan: {
      icon: 'bg-cyan-50 text-cyan-700 ring-cyan-100',
      line: 'from-cyan-600 to-blue-500',
      chip: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    },
    emerald: {
      icon: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
      line: 'from-emerald-600 to-teal-500',
      chip: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    },
    amber: {
      icon: 'bg-amber-50 text-amber-700 ring-amber-100',
      line: 'from-amber-500 to-orange-500',
      chip: 'bg-amber-50 text-amber-700 border-amber-100',
    },
    slate: {
      icon: 'bg-slate-100 text-slate-900 ring-slate-200',
      line: 'from-slate-950 to-blue-700',
      chip: 'bg-slate-100 text-slate-700 border-slate-200',
    },
  }
  return accents[accent] ?? accents.blue
}
function FeatureDashboardCard({ category, index }) {
  const Icon = category.icon
  const accent = getFeatureAccent(category.accent)
  return (
    <motion.article
      className="group relative overflow-hidden rounded-3xl border border-white/75 bg-white/82 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.22 }}
      transition={{ duration: 0.55, delay: index * 0.055, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.012 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(37,99,235,0.10),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.86),rgba(248,250,252,0.78))]" />
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.line}`} />
      <div className="relative">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className={`grid h-14 w-14 place-items-center rounded-2xl ring-1 ${accent.icon}`}>
            <Icon size={26} />
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${accent.chip}`}
          >
            {String(category.features.length).padStart(2, '0')} Metrics
          </span>
        </div>
        <h3 className="text-2xl font-black tracking-[-0.02em] text-slate-950">
          {category.title}
        </h3>
        <p className="mt-3 min-h-14 text-sm leading-7 text-slate-600">{category.subtitle}</p>
        <div className="mt-6 grid gap-2">
          {category.features.map((feature, featureIndex) => (
            <motion.div
              key={feature}
              className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white/78 px-3 py-2.5 shadow-sm"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.035 + featureIndex * 0.025 }}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {feature}
              </span>
              <span className="h-2 w-2 rounded-full bg-blue-500 opacity-70" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.article>
  )
}
function FeaturesSection() {
  return (
    <section id="features" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_45%,#eef4ff_100%)]" />
      <div className="absolute left-[-8%] top-20 -z-10 h-[460px] w-[460px] rounded-full bg-blue-100/55 blur-3xl" />
      <div className="absolute right-[-10%] bottom-20 -z-10 h-[460px] w-[460px] rounded-full bg-teal-100/45 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Feature Architecture"
          title="Complete AI Interview Assessment Modules"
          description="A full evaluation stack grouped into intelligent dashboards for resume understanding, adaptive interviewing, speech analysis, behavior tracking, attention monitoring, and explainable AI scoring."
        />
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {featureCategories.map((category, index) => (
            <FeatureDashboardCard key={category.title} category={category} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
function WorkflowIllustration({ step, index }) {
  const Icon = step.icon
  return (
    <div className="relative h-36 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(37,99,235,0.18),transparent_32%),radial-gradient(circle_at_84%_82%,rgba(20,184,166,0.16),transparent_30%)]" />
      <motion.div
        className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-white text-blue-700 shadow-xl shadow-slate-950/10 ring-1 ring-blue-100"
        animate={{ y: [0, -6, 0], rotate: [0, 1.5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, delay: index * 0.08, ease: 'easeInOut' }}
      >
        <Icon size={30} />
      </motion.div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 144" aria-hidden="true">
        <motion.path
          d="M62 38 C120 20 158 58 190 40 S248 32 276 72 M54 108 C98 82 142 116 180 92 S238 76 280 106"
          fill="none"
          stroke="#bfdbfe"
          strokeWidth="2"
          strokeDasharray="7 9"
          animate={{ strokeDashoffset: [0, -32] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
        />
      </svg>
      {step.nodes.map((node, nodeIndex) => (
        <motion.span
          key={node}
          className="absolute rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[11px] font-black uppercase tracking-[0.08em] text-slate-600 shadow-sm"
          style={{
            left: `${8 + nodeIndex * 31}%`,
            top: `${nodeIndex % 2 === 0 ? 18 : 68}%`,
          }}
          animate={{ y: [0, nodeIndex % 2 === 0 ? -5 : 5, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, delay: nodeIndex * 0.18 }}
        >
          {node}
        </motion.span>
      ))}
    </div>
  )
}
function WorkflowStepCard({ item, index }) {
  const Icon = item.icon
  const isEven = index % 2 === 0
  return (
    <motion.div
      className={`relative grid items-center gap-6 lg:grid-cols-[1fr_80px_1fr] ${
        isEven ? '' : 'lg:[&>*:first-child]:col-start-3'
      }`}
      initial={{ opacity: 0, y: 34 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.58, delay: index * 0.045, ease: 'easeOut' }}
    >
      <motion.article
        className={`group relative overflow-hidden rounded-3xl border border-white/75 bg-white/84 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.09)] backdrop-blur-2xl ${
          isEven ? 'lg:col-start-1' : 'lg:col-start-3'
        }`}
        whileHover={{ y: -7, scale: 1.012 }}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#2563eb,#0f766e,#7c3aed)] opacity-80" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100">
              <Icon size={24} />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-blue-700">
                {item.step}
              </p>
              <h3 className="mt-1 text-xl font-black tracking-[-0.02em] text-slate-950">
                {item.title}
              </h3>
            </div>
          </div>
        </div>
        <WorkflowIllustration step={item} index={index} />
        <p className="mt-5 text-sm leading-7 text-slate-600">{item.description}</p>
      </motion.article>
      <div className="relative hidden h-full place-items-center lg:grid lg:col-start-2 lg:row-start-1">
        <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-blue-200" />
        <motion.div
          className="relative z-10 grid h-12 w-12 place-items-center rounded-full border-4 border-white bg-blue-700 text-white shadow-xl shadow-blue-700/20"
          whileInView={{ scale: [0.88, 1.08, 1] }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: index * 0.04 }}
        >
          {index + 1}
        </motion.div>
      </div>
      {index < workflowSteps.length - 1 && (
        <motion.div
          className="mx-auto grid h-10 w-10 place-items-center rounded-full border border-blue-100 bg-white text-blue-700 shadow-sm lg:hidden"
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <ArrowRight className="rotate-90" size={18} />
        </motion.div>
      )}
    </motion.div>
  )
}
function WorkflowTimelineSection() {
  return (
    <section id="workflow" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#eef4ff_0%,#ffffff_45%,#f8fafc_100%)]" />
      <div className="absolute left-1/2 top-24 -z-10 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Assessment Workflow"
          title="Animated AI Interview Evaluation Timeline"
          description="A complete candidate journey from resume upload to explainable final report, showing how each AI module contributes to a trustworthy hiring decision."
        />
        <div className="relative grid gap-6 lg:gap-0">
          {workflowSteps.map((item, index) => (
            <WorkflowStepCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
function ComparisonCard({ item, index, tone }) {
  const Icon = item.icon
  const isProblem = tone === 'problem'
  const accentClasses = isProblem
    ? 'from-rose-50 to-white text-rose-700 ring-rose-100'
    : 'from-blue-50 to-white text-blue-700 ring-blue-100'
  const markerClasses = isProblem ? 'bg-rose-500' : 'bg-emerald-500'
  return (
    <motion.article
      className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/82 p-5 shadow-[0_18px_55px_rgba(15,23,42,0.07)] backdrop-blur-xl"
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.52, delay: index * 0.06, ease: 'easeOut' }}
      whileHover={{ y: -7, scale: 1.015 }}
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,transparent,rgba(37,99,235,0.45),transparent)] opacity-0 transition group-hover:opacity-100" />
      <div className="flex items-start gap-4">
        <div
          className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accentClasses} ring-1`}
        >
          <Icon size={23} />
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${markerClasses}`} />
            <h3 className="text-lg font-bold tracking-[-0.01em] text-slate-950">{item.title}</h3>
          </div>
          <p className="text-sm leading-7 text-slate-600">{item.description}</p>
        </div>
      </div>
    </motion.article>
  )
}
function ComparisonSection({ id, eyebrow, title, description, items, tone }) {
  return (
    <section id={id} className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)]" />
      <div className="absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-blue-100/40 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <ComparisonCard key={item.title} item={item} index={index} tone={tone} />
          ))}
        </div>
      </div>
    </section>
  )
}
function InterviewComparisonSections() {
  return (
    <>
      <ComparisonSection
        id="assessment"
        eyebrow="Problem Space"
        title="Why Traditional Interviews Fail"
        description="Conventional interview workflows miss critical evidence, produce inconsistent evaluations, and make hiring decisions difficult to justify."
        items={traditionalInterviewProblems}
        tone="problem"
      />
      <section className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_48%,#ffffff_100%)]" />
        <div className="absolute right-0 top-10 -z-10 h-96 w-96 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute left-0 bottom-10 -z-10 h-96 w-96 rounded-full bg-blue-100/55 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="AI Evaluation Layer"
            title="How AI Solves These Problems"
            description="The framework combines resume intelligence, adaptive assessment, behavioral signals, graph reasoning, and explainable recommendations into one evaluation pipeline."
          />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {aiSolutions.map((item, index) => (
              <ComparisonCard key={item.title} item={item} index={index} tone="solution" />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
function ResearchInnovationCard({ item, index }) {
  const Icon = item.icon
  return (
    <motion.article
      className="group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-white/70 bg-white/78 p-6 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-2xl"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.55, delay: index * 0.045, ease: 'easeOut' }}
      whileHover={{ y: -8, scale: 1.015 }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(37,99,235,0.12),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.82),rgba(248,250,252,0.74))]" />
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#2563eb,#0f766e,#7c3aed)] opacity-70 transition group-hover:opacity-100" />
      <motion.div
        className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-blue-100/60 blur-2xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 4, repeat: Infinity, delay: index * 0.12 }}
      />
      <div className="relative flex flex-1 flex-col">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-700 shadow-sm">
            <Icon size={25} />
          </div>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-blue-700">
            Research Module
          </span>
        </div>
        <h3 className="text-xl font-black tracking-[-0.02em] text-slate-950">{item.title}</h3>
        <p className="mt-4 text-sm leading-7 text-slate-600">{item.description}</p>
        <div className="mt-auto pt-6">
          <div className="flex items-center justify-between border-t border-slate-200 pt-4">
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
              Innovation {String(index + 1).padStart(2, '0')}
            </span>
            <motion.span
              className="grid h-8 w-8 place-items-center rounded-full bg-slate-950 text-white"
              whileHover={{ x: 3 }}
            >
              <ArrowRight size={15} />
            </motion.span>
          </div>
        </div>
      </div>
    </motion.article>
  )
}
function ResearchContributionsSection() {
  return (
    <section id="research" className="relative overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_46%,#eef4ff_100%)]" />
      <div className="absolute left-[-10%] top-24 -z-10 h-[420px] w-[420px] rounded-full bg-blue-100/55 blur-3xl" />
      <div className="absolute right-[-8%] bottom-16 -z-10 h-[420px] w-[420px] rounded-full bg-teal-100/50 blur-3xl" />
      <div className="mx-auto max-w-7xl">
        <SectionHeader
          eyebrow="Research Contributions"
          title="Research Innovations"
          description="Core innovation modules designed for intelligent candidate assessment, evidence-based scoring, and explainable hiring recommendations."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {researchInnovations.map((item, index) => (
            <ResearchInnovationCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
const mockCandidateDefaults = {
  role: 'Software Engineer Intern',
  sessionId: 'INT-2048',
  resumeScore: 88,
  estimatedWait: '01:30',
}
const mockCheckSequence = [
  { key: 'camera', label: 'Camera permission', detail: 'Camera preview active', icon: Video },
  { key: 'microphone', label: 'Microphone check', detail: 'Voice input detected', icon: Waves },
  { key: 'permissions', label: 'Permission status', detail: 'Browser permissions granted', icon: CheckCircle2 },
  { key: 'internet', label: 'Internet status', detail: 'Stable connection', icon: Network },
  { key: 'face', label: 'Face detected', detail: 'Single face centered', icon: ScanFace },
  { key: 'lighting', label: 'Lighting indicator', detail: 'Lighting quality accepted', icon: Eye },
]
const interviewQuestions = [
  'Walk me through the most technically challenging project on your resume.',
  'How did you validate model accuracy and prevent overfitting in your ML project?',
  'Describe a time you had to debug a production issue under time pressure.',
  'How would you design a scalable interview analytics pipeline?',
  'What trade-offs did you consider while choosing your frontend architecture?',
]
const interviewEvaluationMetrics = [
  { key: 'eyeContact', label: 'Eye Contact', icon: Eye, color: '#22c55e' },
  { key: 'attention', label: 'Attention', icon: Target, color: '#38bdf8' },
  { key: 'confidence', label: 'Confidence', icon: UserRoundCheck, color: '#a78bfa' },
  { key: 'headPose', label: 'Head Pose', icon: ScanFace, color: '#2dd4bf' },
  { key: 'speakingSpeed', label: 'Speaking Speed', icon: Waves, color: '#f59e0b' },
  { key: 'fillerWords', label: 'Filler Words', icon: MessageSquareText, color: '#fb7185' },
  { key: 'emotion', label: 'Emotion', icon: ScanFace, color: '#60a5fa' },
  { key: 'resumeMatch', label: 'Resume Match', icon: SearchCheck, color: '#34d399' },
]
const initialInterviewMetrics = {
  eyeContact: 84,
  attention: 91,
  confidence: 78,
  headPose: 86,
  speakingSpeed: 74,
  fillerWords: 68,
  emotion: 82,
  resumeMatch: 89,
}
const transcriptSegments = [
  'I started by identifying the core bottleneck in the image preprocessing step.',
  'The model was evaluated with precision, recall, and F1 because the dataset was imbalanced.',
  'For deployment, I separated the inference API from the dashboard so each layer could scale independently.',
  'The biggest trade-off was choosing faster iteration over premature infrastructure complexity.',
  'I validated the resume claim by walking through the actual data flow and failure cases.',
]
const candidateReportData = {
  recommendation: 'Recommended for Final Technical Round',
  generatedAt: 'July 18, 2026',
  summary:
    'Candidate demonstrated strong technical ownership, clear communication, and reliable attention across the simulated interview session.',
  scores: [
    { label: 'Overall Score', value: 86, icon: BadgeCheck, color: '#2563eb' },
    { label: 'Technical Score', value: 91, icon: BrainCircuit, color: '#0f766e' },
    { label: 'Communication', value: 84, icon: MessageSquareText, color: '#7c3aed' },
    { label: 'Confidence', value: 82, icon: UserRoundCheck, color: '#0891b2' },
    { label: 'Eye Contact', value: 88, icon: Eye, color: '#059669' },
    { label: 'Attention', value: 92, icon: Target, color: '#2563eb' },
    { label: 'Speech Fluency', value: 85, icon: Waves, color: '#d97706' },
    { label: 'Resume Validation', value: 90, icon: SearchCheck, color: '#0f766e' },
  ],
  radar: [
    { label: 'Technical', value: 91 },
    { label: 'Communication', value: 84 },
    { label: 'Confidence', value: 82 },
    { label: 'Attention', value: 92 },
    { label: 'Fluency', value: 85 },
    { label: 'Resume', value: 90 },
  ],
  timeline: [
    { label: 'Intro', value: 76 },
    { label: 'Resume', value: 88 },
    { label: 'Technical', value: 91 },
    { label: 'System Design', value: 83 },
    { label: 'Behavioral', value: 80 },
    { label: 'Wrap', value: 86 },
  ],
  questions: [
    {
      question: 'Technically challenging project',
      score: 92,
      signal: 'Strong project ownership and implementation detail.',
    },
    {
      question: 'Model validation and overfitting',
      score: 89,
      signal: 'Clear understanding of evaluation metrics and validation strategy.',
    },
    {
      question: 'Debugging under pressure',
      score: 78,
      signal: 'Good structure, but needed more measurable incident impact.',
    },
    {
      question: 'Scalable analytics pipeline',
      score: 84,
      signal: 'Sound architecture with practical trade-off awareness.',
    },
    {
      question: 'Frontend architecture choices',
      score: 87,
      signal: 'Balanced explanation of UX, performance, and delivery speed.',
    },
  ],
  strengths: [
    'Explains technical decisions with evidence from real project work.',
    'Maintains strong attention and consistent eye contact throughout the interview.',
    'Connects resume claims to concrete implementation details and outcomes.',
  ],
  weaknesses: [
    'Could quantify business or user impact more clearly in behavioral answers.',
    'Occasional filler words appear when transitioning between technical concepts.',
    'System design answers would benefit from deeper failure-mode analysis.',
  ],
  suggestions: [
    'Prepare concise STAR-format examples with measurable outcomes.',
    'Practice explaining database and pipeline scaling decisions using diagrams.',
    'Reduce filler words by pausing briefly before complex technical explanations.',
  ],
}
function formatInterviewTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}
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
  const canStart = form.name.trim() && form.email.trim() && form.resume
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
          if (!canStart) return
          onStart({
            ...mockCandidateDefaults,
            name: form.name.trim(),
            email: form.email.trim(),
            resumeName: form.resume.name,
          })
        }}
      >
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-200">Name</span>
          <input
            className="h-12 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
            placeholder="Enter full name"
            value={form.name}
            onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-200">Email</span>
          <input
            type="email"
            className="h-12 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-sm font-semibold text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
            placeholder="candidate@example.com"
            value={form.email}
            onChange={(event) => setForm((value) => ({ ...value, email: event.target.value }))}
          />
        </label>
        <label className="group grid cursor-pointer gap-2">
          <span className="text-sm font-black text-slate-200">Resume Upload</span>
          <input
            type="file"
            className="sr-only"
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              setForm((value) => ({ ...value, resume: event.target.files?.[0] ?? null }))
            }
          />
          <span className="flex min-h-36 items-center justify-center rounded-2xl border border-dashed border-cyan-300/30 bg-cyan-300/5 p-6 text-center transition group-hover:bg-cyan-300/10">
            <span>
              <UploadCloud className="mx-auto text-cyan-200" size={30} />
              <span className="mt-3 block text-sm font-black text-white">
                {form.resume ? form.resume.name : 'Upload PDF, DOC, or DOCX resume'}
              </span>
              <span className="mt-1 block text-xs font-semibold text-slate-500">
                Mock upload only. No backend storage is used.
              </span>
            </span>
          </span>
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
function CameraPreviewMock({ checks }) {
  return (
    <div className="relative min-h-80 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#020617,#111827)]">
      <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 text-xs font-black text-white backdrop-blur">
        <span className={`h-2 w-2 rounded-full ${checks.camera ? 'bg-emerald-400' : 'bg-amber-400'}`} />
        Camera preview
      </div>
      <div className="absolute inset-x-8 top-14 h-48 rounded-[44%] border border-cyan-200/20 bg-white/7 shadow-[inset_0_0_60px_rgba(34,211,238,0.06)]" />
      <div className="absolute left-1/2 top-24 h-24 w-24 -translate-x-1/2 rounded-full border border-cyan-200/20 bg-slate-300/10" />
      <div className="absolute bottom-8 left-1/2 h-28 w-44 -translate-x-1/2 rounded-t-[4rem] border border-cyan-200/20 bg-slate-300/10" />
      <div className="absolute bottom-4 left-4 right-4 grid grid-cols-3 gap-2">
        {[
          ['Face', checks.face],
          ['Light', checks.lighting],
          ['Audio', checks.microphone],
        ].map(([label, passed]) => (
          <div key={label} className="rounded-xl bg-white/10 px-3 py-2 text-center backdrop-blur">
            <p className="text-xs font-black text-white">{label}</p>
            <p className={`mt-1 text-[11px] font-bold ${passed ? 'text-emerald-300' : 'text-amber-300'}`}>
              {passed ? 'Passed' : 'Checking'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
function SystemCheck({ candidate, onContinue }) {
  const [checks, setChecks] = useState({
    camera: false,
    microphone: false,
    permissions: false,
    internet: false,
    face: false,
    lighting: false,
  })
  useEffect(() => {
    const timers = mockCheckSequence.map((check, index) =>
      window.setTimeout(() => {
        setChecks((value) => ({ ...value, [check.key]: true }))
      }, 500 + index * 420),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [])
  const allPassed = mockCheckSequence.every((check) => checks[check.key])
  return (
    <PortalCard
      eyebrow="Step 02"
      title="System Check"
      description="The interview platform verifies device readiness using mocked camera, audio, permission, connection, face, and lighting signals."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <CameraPreviewMock checks={checks} />
        <div className="grid content-between gap-4">
          <div className="space-y-3">
            {mockCheckSequence.map((check) => {
              const Icon = check.icon
              const passed = checks[check.key]
              return (
                <div
                  key={check.key}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/60 p-3"
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${
                      passed ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'
                    }`}
                  >
                    {passed ? <CheckCircle2 size={19} /> : <Icon size={19} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-white">{check.label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {passed ? check.detail : 'Running mock diagnostic'}
                    </p>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${passed ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
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
function WaitingScreen({ candidate, onEnterInterview }) {
  return (
    <PortalCard
      eyebrow="Step 03"
      title="Interview Waiting Room"
      description="Candidate details are locked in while the mock AI service prepares resume-driven adaptive questions."
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
                AI is preparing questions
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-300">
                Parsing resume claims, selecting domain probes, and calibrating interview difficulty
                using mock API data.
              </p>
              <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
                <span className="text-sm font-black text-white">
                  Estimated wait time: {candidate.estimatedWait}
                </span>
              </div>
              <Button
                className="mx-auto mt-6 h-12 bg-cyan-400 px-6 text-slate-950 hover:bg-cyan-300"
                onClick={onEnterInterview}
              >
                Enter Interview
                <ArrowRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </PortalCard>
  )
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
function InterviewTopBar({ candidate, questionIndex, progress, elapsedSeconds, onExit, onFinish }) {
  return (
    <header className="border-b border-white/10 bg-slate-950/92 px-4 py-4 backdrop-blur-2xl lg:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
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
        <div className="min-w-[240px] flex-1 lg:max-w-xl">
          <div className="mb-2 flex items-center justify-between text-xs font-black uppercase tracking-[0.14em] text-slate-400">
            <span>Question {questionIndex + 1} of {interviewQuestions.length}</span>
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
        <div className="flex items-center gap-2">
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
          <Button className="bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={onFinish}>
            Finish Interview
          </Button>
        </div>
      </div>
    </header>
  )
}
function AIInterviewerPanel({ questionIndex, elapsedSeconds }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
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
        <h2 className="mt-3 text-xl font-black leading-8 tracking-tight text-white">
          {interviewQuestions[questionIndex]}
        </h2>
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
function WebcamInterviewPanel({ cameraOn, microphoneOn, pulse }) {
  return (
    <section className="flex min-h-0 flex-col gap-4">
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
      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_50%_24%,rgba(34,211,238,0.18),transparent_34%),linear-gradient(135deg,#020617,#111827_50%,#0f172a)] shadow-[0_30px_110px_rgba(0,0,0,0.34)]">
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-black/35 px-3 py-2 text-xs font-black text-white backdrop-blur">
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
          Recording
        </div>
        <div className="absolute right-5 top-5 rounded-full bg-black/35 px-3 py-2 text-xs font-black text-cyan-100 backdrop-blur">
          HD Preview
        </div>
        <motion.div
          className="absolute left-1/2 top-[22%] h-32 w-32 -translate-x-1/2 rounded-full border border-cyan-200/20 bg-white/10 shadow-[inset_0_0_70px_rgba(34,211,238,0.08)]"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute left-1/2 top-[43%] h-56 w-72 -translate-x-1/2 rounded-t-[6rem] border border-cyan-200/20 bg-white/10" />
        <div className="absolute left-1/2 top-[22%] h-40 w-44 -translate-x-1/2 rounded-[48%] border-2 border-cyan-300/35" />
        <div className="absolute left-[18%] right-[18%] top-[18%] h-[58%] rounded-[2rem] border border-white/10" />
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
function TranscriptPanel({ transcript, activeText }) {
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
        <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/8 p-4">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-200">Current Answer</p>
          <p className="mt-3 min-h-16 text-sm leading-7 text-slate-100">{activeText}</p>
        </div>
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
  const [activeText, setActiveText] = useState(transcriptSegments[0])
  const [audioPulse, setAudioPulse] = useState(62)
  const questionIndex = Math.min(
    Math.floor(elapsedSeconds / 18),
    interviewQuestions.length - 1,
  )
  const progress = ((questionIndex + 1) / interviewQuestions.length) * 100
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
      setActiveText(transcriptSegments[Math.floor(Math.random() * transcriptSegments.length)])
      setTranscript((lines) => {
        const nextLine = transcriptSegments[Math.floor(Math.random() * transcriptSegments.length)]
        const nextLines = [...lines, nextLine]
        return nextLines.slice(-5)
      })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [])
  return (
    <main className="flex min-h-screen flex-col bg-slate-950 text-white">
      <InterviewTopBar
        candidate={candidate}
        questionIndex={questionIndex}
        progress={progress}
        elapsedSeconds={elapsedSeconds}
        onExit={onExit}
        onFinish={onFinish}
      />
      <div className="grid min-h-0 flex-1 gap-4 p-4 lg:grid-cols-[320px_1fr] xl:grid-cols-[320px_1fr_320px]">
        <AIInterviewerPanel questionIndex={questionIndex} elapsedSeconds={elapsedSeconds} />
        <WebcamInterviewPanel cameraOn microphoneOn pulse={audioPulse} />
        <LiveEvaluationPanel metrics={metrics} />
      </div>
      <div className="p-4 pt-0">
        <TranscriptPanel transcript={transcript} activeText={activeText} />
      </div>
    </main>
  )
}
function ReportCard({ title, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <h2 className="text-base font-black tracking-[-0.01em] text-slate-950">{title}</h2>
      {children}
    </section>
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
function CandidateReportRadarChart() {
  const center = 130
  const maxRadius = 88
  const points = candidateReportData.radar.map((metric, index) => {
    const angle = (Math.PI * 2 * index) / candidateReportData.radar.length - Math.PI / 2
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
            points={candidateReportData.radar
              .map((_, index) => {
                const angle = (Math.PI * 2 * index) / candidateReportData.radar.length - Math.PI / 2
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
function CandidateReportTimelineChart() {
  const points = candidateReportData.timeline.map((item, index) => {
    const x = 32 + index * 48
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
function QuestionWisePerformance() {
  return (
    <ReportCard title="Question-wise Performance" className="lg:col-span-2">
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        {candidateReportData.questions.map((item, index) => (
          <div
            key={item.question}
            className="grid gap-3 border-b border-slate-200 p-4 last:border-b-0 md:grid-cols-[64px_1fr_120px]"
          >
            <div className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
              Q{index + 1}
            </div>
            <div>
              <p className="text-sm font-black text-slate-950">{item.question}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{item.signal}</p>
            </div>
            <div>
              <p className="text-right text-xl font-black text-slate-950">{item.score}</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-blue-700" style={{ width: `${item.score}%` }} />
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
function CandidateReportPage({ candidate, onExit }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">
                Candidate Report
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
              <Button className="bg-slate-950 text-white hover:bg-slate-800" onClick={() => window.print()}>
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
              <p className="mt-3 text-6xl font-black tracking-tight">86</p>
              <p className="mt-2 text-sm font-bold text-cyan-200">
                {candidateReportData.recommendation}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
                Executive Summary
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">{candidateReportData.summary}</p>
              <p className="mt-4 text-xs font-bold text-slate-500">
                Generated: {candidateReportData.generatedAt} · Resume: {candidate.resumeName}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">
                HR Decision
              </p>
              <p className="mt-3 text-2xl font-black text-emerald-950">Proceed</p>
              <p className="mt-2 text-sm leading-6 text-emerald-800">
                Candidate is ready for final technical validation with senior engineering panel.
              </p>
            </div>
          </div>
        </header>
        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {candidateReportData.scores.map((item) => (
            <ReportScoreCard key={item.label} item={item} />
          ))}
        </section>
        <section className="mt-5 grid gap-5 lg:grid-cols-2">
          <CandidateReportRadarChart />
          <CandidateReportTimelineChart />
          <QuestionWisePerformance />
        </section>
        <section className="mt-5 grid gap-5 lg:grid-cols-3">
          <ReportInsightList
            title="Strengths"
            items={candidateReportData.strengths}
            icon={CheckCircle2}
            tone="strength"
          />
          <ReportInsightList
            title="Weaknesses"
            items={candidateReportData.weaknesses}
            icon={FileWarning}
            tone="weakness"
          />
          <ReportInsightList
            title="AI Suggestions"
            items={candidateReportData.suggestions}
            icon={Sparkles}
            tone="suggestion"
          />
        </section>
      </div>
    </main>
  )
}
function CandidatePortal({ onExit }) {
  const [step, setStep] = useState(0)
  const [candidate, setCandidate] = useState(null)
  if (step === 3 && candidate) {
    return <InterviewScreen candidate={candidate} onExit={onExit} onFinish={() => setStep(4)} />
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
        <WaitingScreen candidate={candidate} onEnterInterview={() => setStep(3)} />
      )}
    </CandidatePortalShell>
  )
}
function App() {
  const [showCandidatePortal, setShowCandidatePortal] = useState(false)
  if (showCandidatePortal) {
    return <CandidatePortal onExit={() => setShowCandidatePortal(false)} />
  }
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_42%,#ffffff_100%)]">
      <StickyNavbar onStartAssessment={() => setShowCandidatePortal(true)} />
      <HeroSection onStartAssessment={() => setShowCandidatePortal(true)} />
      <FeaturesSection />
      <WorkflowTimelineSection />
      <InterviewComparisonSections />
      <RecruiterDashboardPreview />
      <AssessmentMetricsDashboard />
      <ResearchContributionsSection />
    </main>
  )
}
export default App
