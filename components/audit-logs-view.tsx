'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Filter,
  History,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { ReactNode } from 'react'

type AuditSeverity = 'Normal' | 'Warning' | 'Critical'
type AuditCategory = 'Reservation' | 'Payment' | 'Refund' | 'Room Operations' | 'Housekeeping' | 'Administration'

interface AuditRecord {
  id: string
  timestamp: string
  user: string
  role: string
  action: string
  category: AuditCategory
  affectedItem: string
  severity: AuditSeverity
  description: string
  before?: string
  after?: string
}

const auditRecords: AuditRecord[] = [
  {
    id: 'AUD-1048',
    timestamp: 'Nov 14, 2026 · 09:34 AM',
    user: 'Mira Jayasinghe',
    role: 'Manager',
    action: 'Reservation approved',
    category: 'Reservation',
    affectedItem: 'VT-2486 · Ishara Fernando',
    severity: 'Normal',
    description: 'Approved the anniversary stay after reviewing the special arrangement request and deposit record.',
    before: 'Pending Approval',
    after: 'Confirmed'
  },
  {
    id: 'AUD-1047',
    timestamp: 'Nov 14, 2026 · 08:45 AM',
    user: 'Anushka Senanayake',
    role: 'Owner',
    action: 'Payment verified',
    category: 'Payment',
    affectedItem: 'PAY-102 · VT-2482',
    severity: 'Normal',
    description: 'Verified the Commercial Bank transfer against the bank statement and linked it to receipt REC-2026-4422.',
    before: 'Pending verification',
    after: 'Verified'
  },
  {
    id: 'AUD-1046',
    timestamp: 'Nov 14, 2026 · 08:02 AM',
    user: 'Sewwandi Silva',
    role: 'Housekeeper',
    action: 'Inspection requested',
    category: 'Housekeeping',
    affectedItem: 'Room 03 · Highland Heritage',
    severity: 'Warning',
    description: 'Marked the departure clean as complete and requested a manager inspection before the next arrival.',
    before: 'Cleaning in progress',
    after: 'Inspection required'
  },
  {
    id: 'AUD-1045',
    timestamp: 'Nov 13, 2026 · 11:30 PM',
    user: 'Automated Night Audit',
    role: 'System',
    action: 'Night audit completed',
    category: 'Administration',
    affectedItem: 'Daily close · Nov 13',
    severity: 'Normal',
    description: 'Daily operational close completed and the collected revenue summary was prepared for review.'
  },
  {
    id: 'AUD-1044',
    timestamp: 'Nov 13, 2026 · 04:15 PM',
    user: 'Ruwan Perera',
    role: 'Deputy Manager',
    action: 'Rate override applied',
    category: 'Reservation',
    affectedItem: 'VT-2486 · Room 01',
    severity: 'Warning',
    description: 'Applied a promotional rate override to a direct booking. Owner authorization is required for final approval.',
    before: 'LKR 22,800 / night',
    after: 'LKR 14,820 / night'
  },
  {
    id: 'AUD-1043',
    timestamp: 'Nov 13, 2026 · 02:12 PM',
    user: 'Mira Jayasinghe',
    role: 'Manager',
    action: 'Refund requested',
    category: 'Refund',
    affectedItem: 'REF-301 · VT-2470',
    severity: 'Warning',
    description: 'Submitted a refund request after a weather-related cancellation and attached the guest communication note.',
    before: 'Refund not requested',
    after: 'LKR 12,000 pending owner approval'
  },
  {
    id: 'AUD-1042',
    timestamp: 'Nov 13, 2026 · 10:40 AM',
    user: 'Lakmali Fernando',
    role: 'Housekeeper',
    action: 'Room status updated',
    category: 'Room Operations',
    affectedItem: 'Room 01 · Single Tree Deluxe',
    severity: 'Normal',
    description: 'Updated the room status after completing arrival preparation for the 2:00 PM guest arrival.',
    before: 'Cleaning in progress',
    after: 'Ready'
  },
  {
    id: 'AUD-1041',
    timestamp: 'Nov 12, 2026 · 06:20 PM',
    user: 'AI Financial Audit',
    role: 'System',
    action: 'Duplicate payment flagged',
    category: 'Payment',
    affectedItem: 'VT-2482 · LKR 45,600',
    severity: 'Critical',
    description: 'Two incoming transfers with the same amount and reference were detected within four minutes.',
    before: 'Single payment expected',
    after: 'Potential duplicate requires investigation'
  },
  {
    id: 'AUD-1040',
    timestamp: 'Nov 12, 2026 · 03:05 PM',
    user: 'Anushka Senanayake',
    role: 'Owner',
    action: 'Booking policy updated',
    category: 'Administration',
    affectedItem: 'Settings · Booking policies',
    severity: 'Normal',
    description: 'Updated the deposit policy used for direct website reservations.',
    before: '30% deposit',
    after: '50% deposit'
  },
  {
    id: 'AUD-1039',
    timestamp: 'Nov 12, 2026 · 11:18 AM',
    user: 'Ruwan Perera',
    role: 'Deputy Manager',
    action: 'Task assigned',
    category: 'Housekeeping',
    affectedItem: 'TASK-882 · Room 02 turndown',
    severity: 'Normal',
    description: 'Assigned the evening turndown task to Lakmali Fernando for Amelia Hart’s occupied room.',
    before: 'Unassigned',
    after: 'Assigned to Lakmali Fernando'
  }
]

const severityStyles: Record<AuditSeverity, string> = {
  Normal: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  Warning: 'bg-amber-50 text-amber-700 border-amber-100',
  Critical: 'bg-rose-50 text-rose-700 border-rose-100'
}

const categoryStyles: Record<AuditCategory, string> = {
  Reservation: 'bg-blue-50 text-blue-700',
  Payment: 'bg-violet-50 text-violet-700',
  Refund: 'bg-rose-50 text-rose-700',
  'Room Operations': 'bg-cyan-50 text-cyan-700',
  Housekeeping: 'bg-emerald-50 text-emerald-700',
  Administration: 'bg-slate-100 text-slate-700'
}

function SummaryCard({ label, value, note, icon, tone }: { label: string; value: string; note: string; icon: ReactNode; tone: string }) {
  return (
    <article className="rounded-xl border border-[#E5E9EF] bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold tracking-wider text-[#778196]">{label}</p>
          <strong className="mt-1 block text-2xl font-bold text-[#202939]">{value}</strong>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-lg ${tone}`}>{icon}</span>
      </div>
      <p className="mt-2 text-[11px] text-[#778196]">{note}</p>
    </article>
  )
}

export function AuditLogsView() {
  const [query, setQuery] = useState('')
  const [dateRange, setDateRange] = useState('All dates')
  const [userFilter, setUserFilter] = useState('All users')
  const [categoryFilter, setCategoryFilter] = useState('All categories')
  const [severityFilter, setSeverityFilter] = useState('All severities')
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null)

  const filteredRecords = useMemo(() => auditRecords.filter(record => {
    const matchesQuery = `${record.id} ${record.user} ${record.action} ${record.affectedItem} ${record.description}`.toLowerCase().includes(query.toLowerCase())
    const matchesUser = userFilter === 'All users' || record.user === userFilter
    const matchesCategory = categoryFilter === 'All categories' || record.category === categoryFilter
    const matchesSeverity = severityFilter === 'All severities' || record.severity === severityFilter
    const matchesDate = dateRange === 'All dates' || (dateRange === 'Today' ? record.timestamp.startsWith('Nov 14') : !record.timestamp.startsWith('Nov 14'))
    return matchesQuery && matchesUser && matchesCategory && matchesSeverity && matchesDate
  }), [categoryFilter, dateRange, query, severityFilter, userFilter])

  const warningCount = auditRecords.filter(record => record.severity === 'Warning').length
  const criticalCount = auditRecords.filter(record => record.severity === 'Critical').length
  const users = Array.from(new Set(auditRecords.map(record => record.user)))

  return (
    <div className="space-y-5">
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Audit logs</h1>
          <p className="subheading">A transparent history of decisions, financial activity and operational changes.</p>
        </div>
        <button className="button secondary flex items-center gap-1.5" onClick={() => window.print()}>
          <Download size={15} /> Export view
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="TOTAL ACTIVITIES" value={String(auditRecords.length)} note="Across all tracked areas" icon={<History size={18} />} tone="bg-[#F0F3F7] text-[#172B4D]" />
        <SummaryCard label="TODAY'S ACTIVITIES" value={String(auditRecords.filter(record => record.timestamp.startsWith('Nov 14')).length)} note="Recorded since midnight" icon={<Clock3 size={18} />} tone="bg-[#EAF4F3] text-[#27877D]" />
        <SummaryCard label="WARNINGS" value={String(warningCount)} note="Require staff attention" icon={<AlertTriangle size={18} />} tone="bg-[#FDF6EA] text-[#B7791F]" />
        <SummaryCard label="CRITICAL" value={String(criticalCount)} note="Require immediate review" icon={<ShieldCheck size={18} />} tone="bg-[#FDF1F0] text-[#D9534F]" />
      </div>

      <section className="overflow-hidden rounded-xl border border-[#E5E9EF] bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-[#E5E9EF] bg-[#FAFBFC] p-3">
          <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#E5E9EF] bg-white px-3 py-2">
            <Search size={15} className="text-[#778196]" />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search activity, user or reference..." className="w-full bg-transparent text-xs outline-none" />
          </label>
          <div className="flex items-center gap-1.5 text-[#778196]">
            <Filter size={14} />
            <span className="hidden text-[11px] font-medium sm:inline">Filter by</span>
          </div>
          <select value={dateRange} onChange={event => setDateRange(event.target.value)} className="rounded-lg border border-[#E5E9EF] bg-white px-2.5 py-2 text-xs text-[#202939] outline-none">
            <option>All dates</option>
            <option>Today</option>
            <option>Earlier</option>
          </select>
          <select value={userFilter} onChange={event => setUserFilter(event.target.value)} className="rounded-lg border border-[#E5E9EF] bg-white px-2.5 py-2 text-xs text-[#202939] outline-none">
            <option>All users</option>
            {users.map(user => <option key={user}>{user}</option>)}
          </select>
          <select value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} className="rounded-lg border border-[#E5E9EF] bg-white px-2.5 py-2 text-xs text-[#202939] outline-none">
            <option>All categories</option>
            {(['Reservation', 'Payment', 'Refund', 'Room Operations', 'Housekeeping', 'Administration'] as AuditCategory[]).map(category => <option key={category}>{category}</option>)}
          </select>
          <select value={severityFilter} onChange={event => setSeverityFilter(event.target.value)} className="rounded-lg border border-[#E5E9EF] bg-white px-2.5 py-2 text-xs text-[#202939] outline-none">
            <option>All severities</option>
            <option>Normal</option>
            <option>Warning</option>
            <option>Critical</option>
          </select>
        </div>

        <div className="flex items-center justify-between border-b border-[#E5E9EF] px-4 py-3">
          <div className="flex items-center gap-2">
            <CalendarDays size={15} className="text-[#778196]" />
            <span className="text-xs text-[#778196]">Showing <strong className="text-[#202939]">{filteredRecords.length}</strong> of {auditRecords.length} activities</span>
          </div>
          <span className="hidden text-[11px] text-[#778196] sm:inline">Latest activity first</span>
        </div>

        {filteredRecords.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="bg-[#F7F8FA] text-[10px] uppercase tracking-wider text-[#778196]">
                <tr>
                  <th className="px-4 py-3 font-semibold">Activity</th>
                  <th className="px-4 py-3 font-semibold">User / role</th>
                  <th className="px-4 py-3 font-semibold">Affected item</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Severity</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9EF]">
                {filteredRecords.map(record => (
                  <tr key={record.id} className="transition hover:bg-[#FAFBFC]">
                    <td className="px-4 py-3.5">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#F0F3F7] text-[#172B4D]"><FileText size={15} /></span>
                        <div>
                          <strong className="block text-[#202939]">{record.action}</strong>
                          <span className="mt-1 block text-[11px] text-[#778196]">{record.id} · {record.timestamp}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <strong className="block text-[#202939]">{record.user}</strong>
                      <span className="text-[11px] text-[#778196]">{record.role}</span>
                    </td>
                    <td className="px-4 py-3.5 font-medium text-[#425246]">{record.affectedItem}</td>
                    <td className="px-4 py-3.5"><span className={`rounded px-2 py-1 text-[10px] font-semibold ${categoryStyles[record.category]}`}>{record.category}</span></td>
                    <td className="px-4 py-3.5"><span className={`rounded-full border px-2 py-1 text-[10px] font-semibold ${severityStyles[record.severity]}`}>{record.severity}</span></td>
                    <td className="px-4 py-3.5 text-right"><button className="button secondary px-2.5 py-1.5 text-[11px]" onClick={() => setSelectedRecord(record)}>View <ChevronRight size={13} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#F0F3F7] text-[#778196]"><Search size={21} /></div>
            <h2 className="mt-4 text-sm font-bold text-[#202939]">No activities found</h2>
            <p className="mx-auto mt-1 max-w-sm text-xs text-[#778196]">Try clearing a filter or searching for a different activity, user or reference.</p>
          </div>
        )}
      </section>

      {selectedRecord && (
        <div className="modal-backdrop" onClick={event => { if (event.target === event.currentTarget) setSelectedRecord(null) }}>
          <section className="modal max-w-xl" role="dialog" aria-modal="true" aria-labelledby="audit-detail-title">
            <div className="modal-head">
              <div>
                <p className="eyebrow">AUDIT ACTIVITY · {selectedRecord.id}</p>
                <h2 id="audit-detail-title">{selectedRecord.action}</h2>
              </div>
              <button className="icon-button" onClick={() => setSelectedRecord(null)} aria-label="Close audit details"><X size={18} /></button>
            </div>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#E5E9EF] bg-[#FAFBFC] p-3 text-xs">
                <div><span className="block text-[10px] uppercase tracking-wide text-[#778196]">Timestamp</span><strong className="mt-1 block text-[#202939]">{selectedRecord.timestamp}</strong></div>
                <div><span className="block text-[10px] uppercase tracking-wide text-[#778196]">Performed by</span><strong className="mt-1 block text-[#202939]">{selectedRecord.user}</strong><span className="text-[#778196]">{selectedRecord.role}</span></div>
                <div><span className="block text-[10px] uppercase tracking-wide text-[#778196]">Category</span><span className={`mt-1 inline-block rounded px-2 py-1 text-[10px] font-semibold ${categoryStyles[selectedRecord.category]}`}>{selectedRecord.category}</span></div>
                <div><span className="block text-[10px] uppercase tracking-wide text-[#778196]">Severity</span><span className={`mt-1 inline-block rounded-full border px-2 py-1 text-[10px] font-semibold ${severityStyles[selectedRecord.severity]}`}>{selectedRecord.severity}</span></div>
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wide text-[#778196]">Affected item</span>
                <p className="mt-1 text-xs font-semibold text-[#202939]">{selectedRecord.affectedItem}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#556257]">{selectedRecord.description}</p>
              </div>
              {(selectedRecord.before || selectedRecord.after) && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3"><span className="text-[10px] font-semibold uppercase tracking-wide text-rose-600">Before</span><p className="mt-1 text-xs text-[#425246]">{selectedRecord.before || '—'}</p></div>
                  <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3"><span className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700">After</span><p className="mt-1 text-xs text-[#425246]">{selectedRecord.after || '—'}</p></div>
                </div>
              )}
            </div>
            <div className="modal-footer"><button className="button secondary" onClick={() => setSelectedRecord(null)}>Close</button></div>
          </section>
        </div>
      )}
    </div>
  )
}
