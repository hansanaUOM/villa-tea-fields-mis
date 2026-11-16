'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarCheck2,
  Check,
  CheckCheck,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  Inbox,
  Sparkles,
  X,
} from 'lucide-react'

type NotificationCategory = 'Reservations' | 'Payments' | 'Housekeeping' | 'Operations'

interface NotificationItem {
  id: string
  category: NotificationCategory
  title: string
  description: string
  timestamp: string
  targetPage: string
  unread: boolean
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'N-001',
    category: 'Reservations',
    title: '2 booking requests need review',
    description: 'Kavindi Silva and Ishara Fernando are waiting for approval.',
    timestamp: 'Just now',
    targetPage: 'Reservations',
    unread: true
  },
  {
    id: 'N-002',
    category: 'Payments',
    title: 'Bank transfer awaiting verification',
    description: 'PAY-102 · LKR 34,200 from Amelia Hart requires review.',
    timestamp: '18 min ago',
    targetPage: 'Payments & Finance',
    unread: true
  },
  {
    id: 'N-003',
    category: 'Housekeeping',
    title: 'Room 03 is ready for inspection',
    description: 'Departure cleaning is complete and manager inspection is pending.',
    timestamp: '42 min ago',
    targetPage: 'Rooms',
    unread: true
  },
  {
    id: 'N-004',
    category: 'Operations',
    title: 'Guest arrival today at 2:00 PM',
    description: 'Nimal Perera · Room 01 · 2 guests · Direct WhatsApp.',
    timestamp: '1 hr ago',
    targetPage: 'Reservations',
    unread: false
  },
  {
    id: 'N-005',
    category: 'Payments',
    title: 'Refund request needs owner approval',
    description: 'REF-301 · LKR 12,000 weather cancellation refund.',
    timestamp: 'Yesterday',
    targetPage: 'Payments & Finance',
    unread: false
  }
]

const categoryMeta: Record<NotificationCategory, { icon: typeof CalendarCheck2; iconClass: string; badgeClass: string }> = {
  Reservations: { icon: CalendarCheck2, iconClass: 'bg-blue-50 text-blue-700', badgeClass: 'bg-blue-50 text-blue-700' },
  Payments: { icon: CreditCard, iconClass: 'bg-violet-50 text-violet-700', badgeClass: 'bg-violet-50 text-violet-700' },
  Housekeeping: { icon: ClipboardCheck, iconClass: 'bg-emerald-50 text-emerald-700', badgeClass: 'bg-emerald-50 text-emerald-700' },
  Operations: { icon: Sparkles, iconClass: 'bg-amber-50 text-amber-700', badgeClass: 'bg-amber-50 text-amber-700' }
}

interface NotificationsPopoverProps {
  onNavigate: (page: string) => void
  onClose: () => void
}

export function NotificationsPopover({ onNavigate, onClose }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const unreadCount = useMemo(() => notifications.filter(notification => notification.unread).length, [notifications])

  const markRead = (id: string) => {
    setNotifications(current => current.map(notification => notification.id === id ? { ...notification, unread: false } : notification))
  }

  const openNotification = (notification: NotificationItem) => {
    markRead(notification.id)
    onNavigate(notification.targetPage)
    onClose()
  }

  return (
    <div className="notification-popover !w-[380px] !p-0 max-w-[calc(100vw-2rem)] overflow-hidden" role="dialog" aria-label="Notifications">
      <div className="flex items-center justify-between border-b border-[#E5E9EF] bg-white px-4 py-3.5">
        <div>
          <div className="flex items-center gap-2">
            <strong className="text-sm text-[#202939]">Notifications</strong>
            {unreadCount > 0 && <span className="rounded-full bg-[#172B4D] px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount} unread</span>}
          </div>
          <p className="mt-0.5 text-[11px] text-[#778196]">Updates from today’s hotel operations</p>
        </div>
        <button className="icon-button h-8 w-8" onClick={onClose} aria-label="Close notifications"><X size={16} /></button>
      </div>

      {unreadCount > 0 && (
        <div className="flex items-center justify-between border-b border-[#E5E9EF] bg-[#FAFBFC] px-4 py-2">
          <span className="text-[11px] text-[#778196]">Keep your team aligned with the latest activity.</span>
          <button
            className="flex items-center gap-1 text-[11px] font-semibold text-[#27877D] hover:underline"
            onClick={() => setNotifications(current => current.map(notification => ({ ...notification, unread: false })))}
          >
            <CheckCheck size={13} /> Mark all read
          </button>
        </div>
      )}

      {notifications.length > 0 ? (
        <div className="max-h-[440px] overflow-y-auto bg-white">
          {notifications.map(notification => {
            const meta = categoryMeta[notification.category]
            const Icon = meta.icon
            return (
              <div key={notification.id} className={`group flex gap-3 border-b border-[#EEF2F6] px-4 py-3.5 transition hover:bg-[#FAFBFC] ${notification.unread ? 'bg-[#F8FBFB]' : ''}`}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${meta.iconClass}`}><Icon size={15} /></span>
                <button className="min-w-0 flex-1 text-left" onClick={() => openNotification(notification)}>
                  <div className="flex items-start gap-2">
                    <strong className={`text-xs leading-relaxed ${notification.unread ? 'text-[#202939]' : 'font-medium text-[#556257]'}`}>{notification.title}</strong>
                    {notification.unread && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#27877D]" />}
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#778196]">{notification.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${meta.badgeClass}`}>{notification.category}</span>
                    <span className="text-[10px] text-[#9AA3B2]">{notification.timestamp}</span>
                  </div>
                </button>
                {notification.unread && (
                  <button className="mt-0.5 hidden h-7 w-7 shrink-0 place-items-center rounded-md text-[#778196] hover:bg-[#F0F3F7] hover:text-[#172B4D] group-hover:grid" onClick={() => markRead(notification.id)} aria-label={`Mark ${notification.title} as read`}>
                    <Check size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="px-6 py-14 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#F0F3F7] text-[#778196]"><Inbox size={22} /></div>
          <h2 className="mt-3 text-sm font-bold text-[#202939]">You’re all caught up</h2>
          <p className="mt-1 text-xs text-[#778196]">New reservation and operations updates will appear here.</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#E5E9EF] bg-[#FAFBFC] px-4 py-3">
        <span className="flex items-center gap-1.5 text-[10px] text-[#778196]"><AlertTriangle size={13} className="text-[#D99A35]" /> Prototype notifications</span>
        <button className="flex items-center gap-1 text-[11px] font-semibold text-[#172B4D] hover:underline" onClick={() => { onNavigate('Dashboard'); onClose() }}>View dashboard <ChevronRight size={13} /></button>
      </div>
    </div>
  )
}
