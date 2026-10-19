import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Zap } from 'lucide-react'

export default function AuthFlowShell({ eyebrow, title, description, children }: {
  eyebrow: string
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        <Link to="/" className="inline-flex items-center gap-2 text-lg font-bold text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#49BBBD] text-white shadow-sm"><Zap size={19} /></span>
          G<span className="-ml-2 text-[#49BBBD]">Job</span>
        </Link>
        <section className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5 sm:p-9">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#49BBBD]/12 text-[#31999b]"><ShieldCheck size={24} /></div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#31999b]">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
          <div className="mt-7">{children}</div>
        </section>
      </div>
    </main>
  )
}
