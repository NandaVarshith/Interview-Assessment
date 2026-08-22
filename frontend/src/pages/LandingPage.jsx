import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  FileBarChart,
  FileText,
  LogIn,
  Mail,
  Menu,
  MessageSquareText,
  Network,
  Play,
  Route,
  Scale,
  ScanFace,
  SearchCheck,
  Target,
  UserRoundCheck,
  Video,
  X,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import {
  PROJECT_NAME,
  aiSolutions,
  assessmentMetrics,
  featureCategories,
  heroStats,
  metricToneClasses,
  navItems,
  overallScore,
  recruiterActivity,
  recruiterDashboardPages,
  recruiterInterviews,
  recruiterRoleBreakdown,
  recruiterScoreTrend,
  researchInnovations,
  traditionalInterviewProblems,
  transcriptLines,
  workflowSteps,
} from '../data/appData'

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


export default function LandingPage({ onStartAssessment }) {
  return (
    <>
      <StickyNavbar onStartAssessment={onStartAssessment} />
      <HeroSection onStartAssessment={onStartAssessment} />
      <FeaturesSection />
      <WorkflowTimelineSection />
      <InterviewComparisonSections />
      <RecruiterDashboardPreview />
      <AssessmentMetricsDashboard />
      <ResearchContributionsSection />
    </>
  )
}
