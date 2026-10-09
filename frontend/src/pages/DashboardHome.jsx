import { motion } from 'framer-motion'
import {
  ArrowRight, BrainCircuit, CheckCircle2, Clock3, FileText,
  Menu, Mic, MoreHorizontal, ScanFace, ShieldCheck, Sparkles, Video,
} from 'lucide-react'
import { Button } from '../components/ui/button'
import { PROJECT_NAME } from '../data/appData'

const metrics = [
  ['24', 'Interviews this week', '12% from last week'],
  ['86%', 'Average readiness score', 'Across completed sessions'],
  ['4.8m', 'Average interview time', 'Adaptive question flow'],
]
const signals = [
  ['Technical depth', 88, 'bg-blue-500'],
  ['Communication', 82, 'bg-cyan-400'],
  ['Attention', 94, 'bg-emerald-400'],
]

function Logo() {
  return <div className="flex items-center gap-3">
    <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-950/40"><BrainCircuit size={21} /></span>
    <div><p className="text-sm font-bold text-white">{PROJECT_NAME}</p><p className="text-xs text-slate-400">Interview intelligence platform</p></div>
  </div>
}

export default function DashboardHome({ onStartAssessment }) {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07111f] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_-5%,rgba(37,99,235,.27),transparent_28%),radial-gradient(circle_at_88%_5%,rgba(6,182,212,.15),transparent_22%)]" />
      <header className="relative border-b border-white/10 bg-[#07111f]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            {['Overview', 'Assessment', 'Candidates', 'Analytics'].map((item, index) => <a key={item} href={index === 1 ? '#assessment' : '#overview'} className={`rounded-lg px-3 py-2 text-sm font-semibold ${index === 0 ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>{item}</a>)}
          </nav>
          <div className="flex items-center gap-2"><Button variant="secondary" className="hidden border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 hover:text-white sm:inline-flex">Sign in</Button><Button onClick={onStartAssessment}>Start interview <ArrowRight size={16} /></Button><Button size="icon" variant="secondary" className="border-white/10 bg-white/5 text-white md:hidden" aria-label="Open menu"><Menu size={19} /></Button></div>
        </div>
      </header>

      <div id="overview" className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid gap-5 lg:grid-cols-[1.45fr_.85fr]">
          <section className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,rgba(30,64,175,.42),rgba(15,23,42,.72)_55%,rgba(8,47,73,.55))] p-6 shadow-2xl shadow-black/20 sm:p-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-300"><Sparkles size={14} /> AI interview workspace</div>
            <h1 className="mt-5 max-w-2xl text-4xl font-bold tracking-tight text-white sm:text-5xl">Structured interviews. Clearer hiring decisions.</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">Run resume-informed interviews and review transparent, evidence-backed candidate signals in one focused workspace.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Button className="h-11 px-5" onClick={onStartAssessment}>New assessment <ArrowRight size={17} /></Button><Button variant="secondary" className="h-11 border-white/15 bg-white/8 text-white hover:bg-white/15">View candidates</Button></div>
          </section>
          <section className="rounded-3xl border border-white/10 bg-[#0c1a2b]/85 p-6 shadow-xl shadow-black/15">
            <div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">System status</p><p className="mt-2 text-lg font-bold text-white">Ready to assess</p></div><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-400/10 text-emerald-300"><ShieldCheck size={22} /></span></div>
            <div className="mt-6 space-y-3">{[['Camera access', 'Ready', Video], ['Audio input', 'Ready', Mic], ['Question engine', 'Online', BrainCircuit]].map(([label, status, Icon]) => <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[.035] p-3" key={label}><span className="flex items-center gap-3 text-sm font-medium text-slate-300"><Icon size={16} className="text-cyan-300" />{label}</span><span className="text-xs font-bold text-emerald-300">{status}</span></div>)}</div>
          </section>
        </div>

        <section className="mt-5 grid gap-4 md:grid-cols-3">{metrics.map(([value, label, note]) => <div key={label} className="rounded-2xl border border-white/10 bg-[#0c1a2b]/80 p-5"><p className="text-3xl font-bold tracking-tight text-white">{value}</p><p className="mt-2 text-sm font-semibold text-slate-300">{label}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div>)}</section>

        <div className="mt-5 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
          <section className="rounded-3xl border border-white/10 bg-[#0c1a2b]/85 p-5 sm:p-6">
            <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">Live assessment</p><h2 className="mt-2 text-xl font-bold text-white">Candidate readiness preview</h2></div><Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/5 hover:text-white"><MoreHorizontal size={20} /></Button></div>
            <div className="mt-6 grid gap-5 sm:grid-cols-[.8fr_1.2fr]"><div className="relative min-h-48 overflow-hidden rounded-2xl border border-white/10 bg-[radial-gradient(circle_at_50%_25%,rgba(59,130,246,.3),transparent_32%),linear-gradient(145deg,#111c2d,#0b1321)]"><span className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/30 px-2.5 py-1 text-xs font-semibold text-emerald-300"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Live preview</span><ScanFace className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-slate-300" size={44} /></div><div className="space-y-5">{signals.map(([label, value, color]) => <div key={label}><div className="mb-2 flex justify-between text-sm"><span className="text-slate-300">{label}</span><span className="font-bold text-white">{value}%</span></div><div className="h-2 rounded-full bg-white/8"><motion.div initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: .7 }} className={`h-2 rounded-full ${color}`} /></div></div>)}<div className="rounded-xl border border-blue-400/15 bg-blue-400/8 p-3 text-sm text-blue-100">Recommendation: <strong>Proceed to technical review</strong></div></div></div>
          </section>
          <section id="assessment" className="rounded-3xl border border-white/10 bg-[#0c1a2b]/85 p-5 sm:p-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-slate-500">Assessment flow</p><h2 className="mt-2 text-xl font-bold text-white">Start in three steps</h2><div className="mt-5 space-y-3">{[['01', 'Upload resume', 'Build candidate context', FileText], ['02', 'Check devices', 'Verify camera and audio', CheckCircle2], ['03', 'Begin interview', 'Launch adaptive questions', Clock3]].map(([num, title, description, Icon]) => <div key={num} className="flex gap-3 rounded-2xl border border-white/8 bg-white/[.035] p-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-500/10 text-xs font-bold text-blue-300">{num}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{title}</p><p className="mt-0.5 text-xs text-slate-500">{description}</p></div><Icon size={18} className="mt-1 text-slate-500" /></div>)}</div><Button className="mt-5 w-full" onClick={onStartAssessment}>Start a new assessment <ArrowRight size={16} /></Button></section>
        </div>
      </div>
    </main>
  )
}
