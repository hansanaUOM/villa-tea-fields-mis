'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardCheck, CreditCard, Download, FileText, Filter, Home, Hotel, LayoutDashboard, Menu, MessageCircle, MoreHorizontal, Plus, Search, Settings, ShieldCheck, Sparkles, TrendingUp, Users, Wallet, X } from 'lucide-react'
import { ReservationsView, Reservation, BookingStatus, Role, ReservationAuditLog } from './reservations-view'
import { AIFeaturesView } from './ai-features-view'
import { AuditLogsView } from './audit-logs-view'

const initialReservations: Reservation[] = [
  {
    id: 'VT-2481',
    guest: 'Amelia Hart',
    guestEmail: 'amelia.hart@gmail.com',
    guestPhone: '+44 7911 123456',
    room: 'Room 02',
    checkIn: '2026-11-14',
    checkOut: '2026-11-17',
    guests: 2,
    source: 'Booking.com',
    ratePerNight: 22800,
    total: 68400,
    paid: 34200,
    status: 'Checked In',
    paymentStatus: 'Partially Paid',
    specialRequests: 'High floor, mountain view preference. Late arrival approx 4 PM.',
    payments: [
      { id: 'PAY-101', amount: 34200, date: '2026-11-10', method: 'Online Gateway', receiptNumber: 'REC-2026-4421', reference: 'OTA Advance 50%' }
    ],
    history: [
      { id: 'LOG-1', timestamp: 'Nov 10, 2026, 09:30 AM', action: 'Created', performedBy: 'System (Booking.com)', note: 'Booking confirmed via channel manager.' },
      { id: 'LOG-2', timestamp: 'Nov 14, 2026, 02:15 PM', action: 'Checked In', performedBy: 'Mira Jayasinghe (Manager)', note: 'Guest checked in at front desk, keycard issued.' }
    ],
    reminderSent: true
  },
  {
    id: 'VT-2482',
    guest: 'Nimal Perera',
    guestEmail: 'nimal.p@sltnet.lk',
    guestPhone: '+94 77 765 4321',
    room: 'Room 01',
    checkIn: '2026-11-14',
    checkOut: '2026-11-16',
    guests: 2,
    source: 'Direct · WhatsApp',
    ratePerNight: 22800,
    total: 45600,
    paid: 45600,
    status: 'Confirmed',
    paymentStatus: 'Paid',
    specialRequests: 'Traditional Sri Lankan breakfast with pol sambol.',
    payments: [
      { id: 'PAY-102', amount: 45600, date: '2026-11-12', method: 'Bank Transfer', receiptNumber: 'REC-2026-4422', reference: 'Commercial Bank ref #9983' }
    ],
    history: [
      { id: 'LOG-3', timestamp: 'Nov 12, 2026, 11:20 AM', action: 'Created', performedBy: 'Ruwan Perera (Deputy Manager)', note: 'Inquiry via WhatsApp confirmed with bank slip.' },
      { id: 'LOG-4', timestamp: 'Nov 12, 2026, 11:45 AM', action: 'Approved', performedBy: 'Anushka Senanayake (Owner)', note: 'Bank transfer verified and approved.' }
    ],
    reminderSent: true
  },
  {
    id: 'VT-2483',
    guest: 'Sophie Laurent',
    guestEmail: 'sophie.laurent@paris.fr',
    guestPhone: '+33 6 12 34 56 78',
    room: 'Room 04',
    checkIn: '2026-11-15',
    checkOut: '2026-11-19',
    guests: 3,
    source: 'Airbnb',
    ratePerNight: 28000,
    total: 112000,
    paid: 56000,
    status: 'Confirmed',
    paymentStatus: 'Partially Paid',
    specialRequests: 'Extra bed for teenager, tea factory tour booking assistance.',
    payments: [
      { id: 'PAY-103', amount: 56000, date: '2026-11-08', method: 'Credit Card', receiptNumber: 'REC-2026-4423', reference: 'Airbnb Payout' }
    ],
    history: [
      { id: 'LOG-5', timestamp: 'Nov 08, 2026, 04:10 PM', action: 'Created', performedBy: 'System (Airbnb)', note: 'Confirmed 4-night stay in Valley View Master Room.' }
    ],
    reminderSent: false
  },
  {
    id: 'VT-2484',
    guest: 'Kavindi Silva',
    guestEmail: 'kavindi.silva@outlook.com',
    guestPhone: '+94 71 888 9900',
    room: 'Room 03',
    checkIn: '2026-11-15',
    checkOut: '2026-11-17',
    guests: 1,
    source: 'Direct · Website',
    ratePerNight: 26000,
    total: 52000,
    paid: 0,
    status: 'Pending Approval',
    paymentStatus: 'Unpaid',
    specialRequests: 'Quiet room for remote work writing retreat.',
    payments: [],
    history: [
      { id: 'LOG-6', timestamp: 'Nov 14, 2026, 08:30 PM', action: 'Created', performedBy: 'Guest (Direct Website)', note: 'Booking request placed, awaiting owner approval.' }
    ],
    reminderSent: false
  },
  {
    id: 'VT-2485',
    guest: 'Oliver Bennett',
    guestEmail: 'oliver.b@sydney.com.au',
    guestPhone: '+61 412 345 678',
    room: 'Room 01',
    checkIn: '2026-11-18',
    checkOut: '2026-11-22',
    guests: 2,
    source: 'Booking.com',
    ratePerNight: 22800,
    total: 91200,
    paid: 45600,
    status: 'Confirmed',
    paymentStatus: 'Partially Paid',
    specialRequests: 'Airport pickup required from Colombo Katunayake (LKR 28,000 extra).',
    payments: [
      { id: 'PAY-104', amount: 45600, date: '2026-11-11', method: 'Credit Card', receiptNumber: 'REC-2026-4424', reference: 'Visa ending 8812' }
    ],
    history: [
      { id: 'LOG-7', timestamp: 'Nov 11, 2026, 03:00 PM', action: 'Created', performedBy: 'System (Booking.com)', note: 'Confirmed 4-night stay.' }
    ],
    reminderSent: false
  },
  {
    id: 'VT-2486',
    guest: 'Ishara Fernando',
    guestEmail: 'ishara.f@gmail.com',
    guestPhone: '+94 77 444 5566',
    room: 'Room 03',
    checkIn: '2026-11-20',
    checkOut: '2026-11-23',
    guests: 2,
    source: 'Direct · Email',
    ratePerNight: 26000,
    total: 78000,
    paid: 39000,
    status: 'Pending Approval',
    paymentStatus: 'Partially Paid',
    specialRequests: 'Anniversary celebration setup with tea country flowers.',
    payments: [
      { id: 'PAY-105', amount: 39000, date: '2026-11-13', method: 'Bank Transfer', receiptNumber: 'REC-2026-4425', reference: 'Sampath Bank deposit' }
    ],
    history: [
      { id: 'LOG-8', timestamp: 'Nov 13, 2026, 06:12 PM', action: 'Created', performedBy: 'Mira Jayasinghe (Manager)', note: 'Special arrangement request forwarded to Owner for approval.' }
    ],
    reminderSent: false
  },
  {
    id: 'VT-2487',
    guest: 'Maya & Leo Chen',
    guestEmail: 'maya.chen@singnet.com.sg',
    guestPhone: '+65 9123 4567',
    room: 'Room 04',
    checkIn: '2026-11-23',
    checkOut: '2026-11-28',
    guests: 4,
    source: 'Agoda',
    ratePerNight: 28000,
    total: 140000,
    paid: 70000,
    status: 'Confirmed',
    paymentStatus: 'Partially Paid',
    specialRequests: 'Two extra bedding sets, infant cot required.',
    payments: [
      { id: 'PAY-106', amount: 70000, date: '2026-11-09', method: 'Credit Card', receiptNumber: 'REC-2026-4426', reference: 'MasterCard Agoda' }
    ],
    history: [
      { id: 'LOG-9', timestamp: 'Nov 09, 2026, 10:20 AM', action: 'Created', performedBy: 'System (Agoda)', note: 'Family reservation confirmed.' }
    ],
    reminderSent: false
  },
  {
    id: 'VT-2488',
    guest: 'Daniel Kim',
    guestEmail: 'daniel.kim@seoul.kr',
    guestPhone: '+82 10 9876 5432',
    room: 'Room 02',
    checkIn: '2026-11-25',
    checkOut: '2026-11-27',
    guests: 1,
    source: 'Trip.com',
    ratePerNight: 22800,
    total: 45600,
    paid: 0,
    status: 'Pending Approval',
    paymentStatus: 'Unpaid',
    specialRequests: 'Late night arrival, requests heater setup in room.',
    payments: [],
    history: [
      { id: 'LOG-10', timestamp: 'Nov 14, 2026, 01:45 PM', action: 'Created', performedBy: 'System (Trip.com)', note: 'Booking request awaiting approval.' }
    ],
    reminderSent: false
  }
]
const navGroups = [
  { label: 'OVERVIEW', items: [{ name: 'Dashboard', icon: LayoutDashboard, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }] },
  { label: 'HOTEL OPERATIONS', items: [{ name: 'Reservations', icon: CalendarDays, roles: ['Owner', 'Manager', 'Deputy Manager'] }, { name: 'Rooms', icon: Hotel, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }, { name: 'Guests', icon: Users, roles: ['Owner', 'Manager', 'Deputy Manager'] }, { name: 'Daily Operations', icon: ClipboardCheck, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }, { name: 'Staff & Tasks', icon: Activity, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }] },
  { label: 'BUSINESS MANAGEMENT', items: [{ name: 'Payments & Finance', icon: Wallet, roles: ['Owner'] }, { name: 'Pricing & Promotions', icon: TrendingUp, roles: ['Owner'] }, { name: 'Marketing & CRM', icon: MessageCircle, roles: ['Owner', 'Manager'] }] },
  { label: 'INTELLIGENCE', items: [{ name: 'Reports & Analytics', icon: FileText, roles: ['Owner', 'Manager'] }, { name: 'AI Business Assistant', icon: Sparkles, roles: ['Owner', 'Manager'] }] },
  { label: 'ADMINISTRATION', items: [{ name: 'Audit Logs', icon: ShieldCheck, roles: ['Owner'] }, { name: 'Settings', icon: Settings, roles: ['Owner'] }] },
] as const
const rooms = [
  { name: 'Room 01', state: 'Reserved', guest: 'Nimal Perera', detail: 'Arriving today · 2 nights', image: 'photo-1611892440504-42a792e24d32' },
  { name: 'Room 02', state: 'Occupied', guest: 'Amelia Hart', detail: 'Departs Nov 17', image: 'photo-1616594039964-ae9021a400a0' },
  { name: 'Room 03', state: 'Ready', guest: '—', detail: 'Next arrival Nov 15', image: 'photo-1618221195710-dd6b41faaea6' },
  { name: 'Room 04', state: 'Reserved', guest: 'Sophie Laurent', detail: 'Arriving tomorrow · 4 nights', image: 'photo-1616486338812-3dadae4b4ace' },
]
const staff = [{ name: 'Mira Jayasinghe', role: 'Manager', initials: 'MJ' }, { name: 'Ruwan Perera', role: 'Deputy Manager', initials: 'RP' }, { name: 'Sewwandi Silva', role: 'Housekeeper', initials: 'SS' }, { name: 'Lakmali Fernando', role: 'Housekeeper', initials: 'LF' }]
const money = (amount: number) => `LKR ${amount.toLocaleString('en-LK')}`

export function HotelManagementApp({ initialPage = 'Dashboard' }: { initialPage?: string } = {}) {
  const [role, setRole] = useState<Role>('Owner')
  const [page, setPage] = useState(initialPage)
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [showCreate, setShowCreate] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notice, setNotice] = useState('')
  const [period, setPeriod] = useState('This month')
  const [taskStates, setTaskStates] = useState(['In progress', 'Pending', 'Inspection required'])
  const [newGuest, setNewGuest] = useState('')
  const [newRoom, setNewRoom] = useState('Room 01')
  const [newDates, setNewDates] = useState({ checkIn: '2026-11-29', checkOut: '2026-12-02' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const p = params.get('page')
      if (p === 'Audit Logs' || p === 'audit-logs' || p === 'audit' || window.location.pathname.includes('audit-logs')) {
        setPage('Audit Logs')
      }
    }
    const stored = window.localStorage.getItem('villa-tea-fields-demo')
    if (stored) {
      try { const data = JSON.parse(stored); if (data.reservations) setReservations(data.reservations); if (data.taskStates) setTaskStates(data.taskStates) } catch { window.localStorage.removeItem('villa-tea-fields-demo') }
    }
    setSaved(true)
  }, [])
  useEffect(() => { if (saved) window.localStorage.setItem('villa-tea-fields-demo', JSON.stringify({ reservations, taskStates })) }, [reservations, taskStates, saved])

  const visibleNav = navGroups.map(group => ({ ...group, items: group.items.filter(item => item.roles.some(allowedRole => allowedRole === role)) })).filter(group => group.items.length)
  const allowedPages = useMemo(() => {
    const list: string[] = ['Dashboard', 'Knowledge Center']
    visibleNav.forEach(group => {
      group.items.forEach(item => {
        list.push(item.name)
      })
    })
    return list
  }, [visibleNav])

  useEffect(() => {
    if (!allowedPages.includes(page)) {
      setPage('Dashboard')
    }
  }, [role, page, allowedPages])

  const filteredReservations = useMemo(() => reservations.filter(item => (statusFilter === 'All statuses' || item.status === statusFilter) && `${item.id} ${item.guest} ${item.room} ${item.source}`.toLowerCase().includes(query.toLowerCase())), [reservations, statusFilter, query])
  const pending = reservations.filter(item => item.status === 'Pending Approval').length
  const arrivals = reservations.filter(item => item.checkIn === '2026-11-14' && ['Confirmed', 'Checked In'].includes(item.status)).length
  const totalRevenue = reservations.filter(item => !['Cancelled'].includes(item.status)).reduce((sum, item) => sum + item.paid, 0)
  const notify = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 3200) }
  const approve = (id: string, status: BookingStatus) => {
    setReservations(current => current.map(item => {
      if (item.id !== id) return item
      const log: ReservationAuditLog = {
        id: `LOG-${Date.now()}`,
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
        action: status === 'Confirmed' ? 'Approved' : 'Declined',
        performedBy: `${role} (${role === 'Owner' ? 'Anushka S.' : 'Mira J.'})`,
        note: `Reservation ${status.toLowerCase()} from dashboard.`
      }
      return {
        ...item,
        status,
        history: [log, ...(item.history || [])]
      }
    }))
    notify(status === 'Confirmed' ? 'Reservation approved · relevant staff & guest notified' : 'Reservation rejected')
  }
  const createReservation = () => {
    if (!newGuest.trim() || !newDates.checkIn || !newDates.checkOut || newDates.checkOut <= newDates.checkIn) { notify('Add a guest name and valid stay dates'); return }
    const conflict = reservations.some(item => item.room === newRoom && !['Cancelled', 'Rejected', 'Checked Out'].includes(item.status) && newDates.checkIn < item.checkOut && newDates.checkOut > item.checkIn)
    if (conflict) { notify('Those dates overlap an active reservation for this room'); return }
    const nights = Math.max(1, Math.round((new Date(newDates.checkOut).getTime() - new Date(newDates.checkIn).getTime()) / 86400000))
    const price = newRoom === 'Room 03' ? 26000 : 22800
    const newId = `VT-${2490 + reservations.length}`
    const newRes: Reservation = {
      id: newId,
      guest: newGuest,
      guestEmail: `${newGuest.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      guestPhone: '+94 77 123 4567',
      room: newRoom,
      checkIn: newDates.checkIn,
      checkOut: newDates.checkOut,
      guests: 2,
      source: 'Direct · Website',
      ratePerNight: price,
      total: nights * price,
      paid: 0,
      status: 'Pending Approval',
      paymentStatus: 'Unpaid',
      payments: [],
      history: [
        {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          action: 'Created',
          performedBy: `${role} (${role === 'Owner' ? 'Anushka S.' : 'Staff'})`,
          note: `Quick booking created for ${newGuest} (${newRoom}, ${nights} nights).`
        }
      ],
      reminderSent: false
    }
    setReservations(current => [newRes, ...current])
    setShowCreate(false); setNewGuest(''); setPage('Reservations'); notify(`Booking request ${newId} created · awaiting owner approval`)
  }
  const setTask = (index: number, state: string) => setTaskStates(current => current.map((value, itemIndex) => itemIndex === index ? state : value))

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><span>V</span></div><div><strong>villa tea fields</strong><small>HOTEL MANAGEMENT</small></div><button className="icon-button mobile-menu" aria-label="Menu"><Menu /></button></div>
      <div className="property-switch"><div className="property-avatar">VT</div><div><strong>Villa Tea Fields</strong><span>Nuwara Eliya, Sri Lanka</span></div><ChevronDown size={15}/></div>
      <nav className="side-nav" aria-label="Main navigation">{visibleNav.map(group => <section className="nav-group" key={group.label}><p>{group.label}</p>{group.items.map(item => <button key={item.name} onClick={() => setPage(item.name)} className={`nav-link ${page === item.name ? 'active' : ''}`}><item.icon size={17}/><span>{item.name}</span>{item.name === 'Reservations' && pending > 0 && <i>{pending}</i>}</button>)}</section>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><strong>Need a hand?</strong><span>Visit the knowledge center for guides and SOPs.</span><button onClick={() => setPage('Knowledge Center')}>Browse help <span>→</span></button></div><div className="sidebar-user"><div className="user-avatar">{role === 'Owner' ? 'AS' : role === 'Manager' ? 'MJ' : role === 'Deputy Manager' ? 'RP' : 'SS'}</div><div><strong>{role === 'Owner' ? 'Anushka Senanayake' : role === 'Manager' ? 'Mira Jayasinghe' : role === 'Deputy Manager' ? 'Ruwan Perera' : 'Sewwandi Silva'}</strong><span>{role}</span></div><MoreHorizontal size={18}/></div></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="crumb"><span>Villa Tea Fields</span><ChevronRight size={14}/><strong>{page}</strong></div><div className="top-actions"><label className="global-search"><Search size={16}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search anything..."/><kbd>⌘ K</kbd></label><button className="icon-button notification-button" aria-label="Notifications" onClick={() => setShowNotifications(!showNotifications)}><Bell size={18}/><b/></button><div className="top-divider"/><div className="profile-select"><div className="user-avatar small">{role === 'Owner' ? 'AS' : role === 'Manager' ? 'MJ' : role === 'Deputy Manager' ? 'RP' : 'SS'}</div><select aria-label="Switch active role" value={role} onChange={event => setRole(event.target.value as Role)}><option>Owner</option><option>Manager</option><option>Deputy Manager</option><option>Housekeeper</option></select><ChevronDown size={14}/></div></div>
      {showNotifications && <div className="notification-popover"><div className="popover-head"><strong>Notifications</strong><button onClick={() => { setShowNotifications(false); notify('All caught up') }}>Mark all read</button></div><div className="notice-row"><span className="notice-dot gold-dot"/><div><strong>{pending} booking requests need review</strong><small>New reservations · just now</small></div></div><div className="notice-row"><span className="notice-dot green-dot"/><div><strong>Room 03 is ready for inspection</strong><small>Housekeeping · 18 minutes ago</small></div></div><div className="notice-row"><span className="notice-dot blue-dot"/><div><strong>Guest arrival: Nimal Perera</strong><small>Today at 2:00 PM</small></div></div></div>}
    </header>
    <div className="page-content">
      {page === 'Dashboard' && <Dashboard role={role} period={period} setPeriod={setPeriod} pending={pending} arrivals={arrivals} revenue={totalRevenue} reservations={reservations} approve={approve} setPage={setPage} tasks={taskStates} setTask={setTask} />}
      {page === 'Reservations' && allowedPages.includes('Reservations') && (
        <ReservationsView
          reservations={reservations}
          onUpdateReservations={setReservations}
          role={role}
          notify={notify}
        />
      )}
      {page === 'Rooms' && allowedPages.includes('Rooms') && <Rooms />}
      {page === 'Guests' && allowedPages.includes('Guests') && <Guests reservations={reservations} />}
      {(page === 'Daily Operations' || page === 'Staff & Tasks') && allowedPages.includes(page) && <Operations role={role} tasks={taskStates} setTask={setTask} notify={notify} />}
      {page === 'Payments & Finance' && allowedPages.includes('Payments & Finance') && <Finance revenue={totalRevenue} reservations={reservations} notify={notify} />}
      {(page === 'Pricing & Promotions' || page === 'Marketing & CRM') && allowedPages.includes(page) && <Marketing page={page} notify={notify} />}
      {page === 'AI Business Assistant' && allowedPages.includes('AI Business Assistant') && (
        <AIFeaturesView
          initialTab="chatbot"
          role={role}
          reservations={reservations}
          notify={notify}
        />
      )}
      {page === 'Reports & Analytics' && allowedPages.includes('Reports & Analytics') && (
        <AIFeaturesView
          initialTab="reports"
          role={role}
          reservations={reservations}
          notify={notify}
        />
      )}
      {page === 'Audit Logs' && allowedPages.includes('Audit Logs') && (
        <AuditLogsView notify={notify} />
      )}
      {page === 'Settings' && allowedPages.includes('Settings') && <SettingsView notify={notify} />}
      {page === 'Knowledge Center' && <Knowledge />}
      {!allowedPages.includes(page) && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <ShieldCheck size={36} style={{ margin: '0 auto 1rem', color: '#c28e38' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Access Restricted</h2>
          <p style={{ color: '#737b74', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Your active role ({role}) does not have permission to view {page}.
          </p>
          <button className="button primary" onClick={() => setPage('Dashboard')}>Return to Dashboard</button>
        </div>
      )}
    </div></main>
    {showCreate && role !== 'Housekeeper' && <div className="modal-backdrop" role="presentation" onClick={event => { if (event.target === event.currentTarget) setShowCreate(false) }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="create-title"><div className="modal-head"><div><p className="eyebrow">NEW BOOKING</p><h2 id="create-title">Create reservation request</h2></div><button className="icon-button" onClick={() => setShowCreate(false)} aria-label="Close"><X size={18}/></button></div><p className="modal-copy">New requests are sent to the owner for approval before confirmation.</p><div className="form-grid"><label className="form-field wide">Guest name<input autoFocus placeholder="e.g. Priya Perera" value={newGuest} onChange={event => setNewGuest(event.target.value)}/></label><label className="form-field">Room<select value={newRoom} onChange={event => setNewRoom(event.target.value)}>{rooms.map(room => <option key={room.name}>{room.name}</option>)}</select></label><label className="form-field">Guests<select><option>2 guests</option><option>1 guest</option><option>3 guests</option><option>4 guests</option></select></label><label className="form-field">Check in<input type="date" value={newDates.checkIn} onChange={event => setNewDates({ ...newDates, checkIn: event.target.value })}/></label><label className="form-field">Check out<input type="date" value={newDates.checkOut} onChange={event => setNewDates({ ...newDates, checkOut: event.target.value })}/></label></div><div className="modal-footer"><button className="button secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="button primary" onClick={createReservation}>Submit for approval <ChevronRight size={15}/></button></div></section></div>}
    {notice && <div className="toast-message"><span><Check size={15}/></span>{notice}</div>}
  </div>
}

function Dashboard({ role, period, setPeriod, pending, arrivals, revenue, reservations, approve, setPage, tasks, setTask }: { role: Role; period: string; setPeriod: (period: string) => void; pending: number; arrivals: number; revenue: number; reservations: Reservation[]; approve: (id: string, status: BookingStatus) => void; setPage: (page: string) => void; tasks: string[]; setTask: (index: number, state: string) => void }) {
  const isOwner = role === 'Owner';
  const isManager = role === 'Manager';
  const isHousekeeper = role === 'Housekeeper';
  const canApprove = isOwner || isManager;
  const canCreateBooking = !isHousekeeper;
  const canViewFinancials = isOwner || isManager;

  return <><div className="page-heading"><div><p className="eyebrow">SATURDAY, NOVEMBER 14, 2026 <span className="live-pill"><i /> LIVE OVERVIEW</span></p><h1>{isHousekeeper ? 'Good morning, Sewwandi' : role === 'Owner' ? 'Good morning, Anushka' : `Good morning, ${role === 'Manager' ? 'Mira' : 'Ruwan'}`}</h1><p className="subheading">{isHousekeeper ? 'Here are your room preparations for today.' : 'Here’s what’s happening at Villa Tea Fields today.'}</p></div>{!isHousekeeper && <div className="heading-actions"><select className="period-select" value={period} onChange={event => setPeriod(event.target.value)}><option>This month</option><option>This week</option><option>This year</option></select>{canCreateBooking && <button className="button primary" onClick={() => setPage('Reservations')}><Plus size={16} /> New reservation</button>}</div>}</div>
        {isHousekeeper ? <Housekeeper tasks={tasks} setTask={setTask} /> : <><section className="stats-grid"><Stat icon={<Hotel />} label="OCCUPANCY RATE" value="75%" change="12.5%" note="vs. last month" tone="green" /><Stat icon={<CalendarDays />} label="TODAY’S ARRIVALS" value={String(arrivals).padStart(2, '0')} note="1 check-in remaining" tone="sand" /><Stat icon={<LogOutIcon />} label="TODAY’S DEPARTURES" value="01" note="Room 02 · 11:00 AM" tone="blue" /><Stat icon={canViewFinancials ? <Wallet /> : <ClipboardCheck />} label={canViewFinancials ? 'REVENUE THIS MONTH' : 'ROOMS READY'} value={canViewFinancials ? `LKR ${(revenue / 1000).toFixed(0)}k` : '2 / 4'} change={canViewFinancials ? '8.2%' : '50%'} note={canViewFinancials ? 'vs. last month' : '2 need attention'} tone="purple" /></section>
          <section className="dashboard-grid"><div className="card trend-card"><div className="card-heading"><div><h2>{canViewFinancials ? 'Revenue & occupancy' : 'Today at a glance'}</h2><p>{canViewFinancials ? 'Your property performance over time' : 'A live view of hotel operations'}</p></div><button className="text-button" onClick={() => setPage(canViewFinancials ? 'Reports & Analytics' : 'Daily Operations')}>View report <ChevronRight size={14} /></button></div><div className="chart-key"><span><i className="key-green" /> Revenue <b>LKR 1.24M</b></span><span><i className="key-gold" /> Occupancy <b>68%</b></span></div><RevenueChart /><div className="chart-months"><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span></div></div><div className="card channel-card"><div className="card-heading"><div><h2>Booking channels</h2><p>Reservations by source</p></div><button className="subtle-icon" aria-label="More options"><MoreHorizontal size={18} /></button></div><ChannelChart /><div className="channel-legend"><span><i className="dot direct" />Direct <b>42%</b></span><span><i className="dot ota" />Booking.com <b>28%</b></span><span><i className="dot airbnb" />Airbnb <b>18%</b></span><span><i className="dot other" />Other <b>12%</b></span></div><div className="channel-insight"><TrendingUp size={15} /><span>Direct bookings are up <strong>8.4%</strong> this month</span></div></div></section>
          <section className="lower-grid"><div className="card arrivals-card"><div className="card-heading"><div><h2>Upcoming reservations</h2><p>Your next arrivals and pending bookings</p></div><button className="text-button" onClick={() => setPage('Reservations')}>All reservations <ChevronRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>GUEST</th><th>ROOM</th><th>CHECK IN</th><th>SOURCE</th><th>STATUS</th>{canApprove && <th />}</tr></thead><tbody>{reservations.filter(item => !['Checked Out', 'Cancelled'].includes(item.status)).slice(0, 5).map(item => <tr key={item.id}><td><div className="guest-cell"><div className="guest-avatar">{item.guest.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><strong>{item.guest}</strong><small>{item.id}</small></div></div></td><td>{item.room}</td><td>{item.checkIn === '2026-11-14' ? 'Today' : new Date(`${item.checkIn}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td><td>{item.source.replace('Direct · ', '')}</td><td><StatusBadge status={item.status} /></td>{canApprove && item.status === 'Pending Approval' && <td><button className="approve-mini" onClick={() => approve(item.id, 'Confirmed')}>Approve</button></td>}</tr>)}</tbody></table></div><div className="table-footer"><span>Showing <strong>5</strong> of {reservations.length} reservations</span><button onClick={() => setPage('Reservations')}>View all reservations <span>→</span></button></div></div><div className="card attention-card"><div className="card-heading"><div><h2>Needs your attention</h2><p>Items that may need a follow-up</p></div><span className="attention-count">{canViewFinancials ? pending + 2 : pending + 1}</span></div><div className="attention-item"><div className="attention-icon amber"><CalendarDays size={16} /></div><div><strong>{pending} booking requests awaiting approval</strong><span>Review and respond to booking inquiries</span></div><button onClick={() => setPage('Reservations')} aria-label="View booking requests"><ChevronRight size={16} /></button></div><div className="attention-item"><div className="attention-icon rose"><ClipboardCheck size={16} /></div><div><strong>Room 03 ready for inspection</strong><span>Housekeeping · 18 min ago</span></div><button onClick={() => setPage('Daily Operations')} aria-label="View room inspection"><ChevronRight size={16} /></button></div>{canViewFinancials && <div className="attention-item"><div className="attention-icon blue"><CreditCard size={16} /></div><div><strong>2 payments need verification</strong><span>Bank transfers · LKR 68,400</span></div><button onClick={() => setPage('Payments & Finance')} aria-label="View payment verification"><ChevronRight size={16} /></button></div>}{(isOwner || isManager) && <div className="ai-insight"><div><Sparkles size={15} /><strong>AI business insight</strong><span>Weekend demand is trending 18% higher. Consider reviewing rates for the final week of November.</span></div><button onClick={() => setPage('AI Business Assistant')}>Explore insight <span>→</span></button></div>}</div></section></>}
      </>
}
function LogOutIcon(){return <ArrowDownRight />}
function Stat({icon, label, value, change, note, tone}:{icon:React.ReactNode;label:string;value:string;change?:string;note:string;tone:string}){return <article className="stat-card"><div className="stat-top"><span className={`stat-icon ${tone}`}>{icon}</span>{change && <span className="stat-change"><ArrowUpRight size={13} />{change}</span>}</div><p>{label}</p><div className="stat-value">{value}</div><small>{note}</small></article>}
function StatusBadge({status}:{status:string}){const cls=status.toLowerCase().replaceAll(' ','-');return <span className={`status-badge ${cls}`}><i />{status}</span>}
function RevenueChart(){const vals=[42,58,48,68,62,80,67,75,56,88,73,96,68,83,72,91,76,88,64,97,79,92,72,84,66,90,74,98,83,92,70,86,76,96,84,100,73,88,76,94];return <div className="chart-area"><div className="chart-y"><span>120k</span><span>90k</span><span>60k</span><span>30k</span><span>0</span></div><div className="chart-plot"><div className="chart-gridline" /><div className="chart-gridline" /><div className="chart-gridline" /><div className="chart-gridline" /><svg viewBox="0 0 640 190" preserveAspectRatio="none" role="img" aria-label="Revenue and occupancy line chart for June to November"><defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#496f55" stopOpacity=".18" /><stop offset="100%" stopColor="#496f55" stopOpacity="0" /></linearGradient></defs><path d="M0 145 C25 140 28 110 50 118 S90 150 108 126 S140 85 160 100 S190 132 210 95 S240 72 258 84 S290 120 310 90 S340 35 360 52 S390 92 408 62 S440 40 458 55 S490 90 510 50 S540 25 558 43 S590 62 608 30 S630 14 640 22 L640 190 L0 190Z" fill="url(#revenueFill)" /><path d="M0 145 C25 140 28 110 50 118 S90 150 108 126 S140 85 160 100 S190 132 210 95 S240 72 258 84 S290 120 310 90 S340 35 360 52 S390 92 408 62 S440 40 458 55 S490 90 510 50 S540 25 558 43 S590 62 608 30 S630 14 640 22" fill="none" stroke="#416849" strokeWidth="3" /><path d="M0 158 C28 148 33 135 52 142 S90 153 108 140 S142 120 160 130 S194 148 210 132 S240 105 258 116 S290 141 310 123 S340 90 360 97 S390 122 408 106 S440 92 458 104 S490 124 510 96 S540 80 558 93 S590 105 608 84 S630 72 640 78" fill="none" stroke="#d1ab6b" strokeWidth="2.5" strokeDasharray="5 5" /></svg><div className="chart-hover"><strong>Nov 14</strong><span>LKR 94,200 · 78% occupancy</span></div></div></div>}
function ChannelChart(){return <div className="donut-wrap"><div className="donut"><div className="donut-inner"><strong>28</strong><span>bookings</span></div></div><div className="donut-total"><small>THIS MONTH</small><strong>28</strong><span>reservations</span></div></div>}

function Rooms(){return <><div className="page-heading"><div><p className="eyebrow">HOTEL OPERATIONS</p><h1>Rooms & property</h1><p className="subheading">A clear view of availability and room readiness.</p></div><button className="button secondary"><CalendarDays size={16} /> Room calendar</button></div><div className="room-summary"><span><i className="room-dot occupied-dot" />Occupied <strong>1</strong></span><span><i className="room-dot ready-dot" />Ready <strong>1</strong></span><span><i className="room-dot reserved-dot" />Reserved <strong>2</strong></span><span className="room-summary-total">4 rooms total</span></div><div className="room-grid">{rooms.map((room, index) => <article className="card room-card" key={room.name}><div className="room-photo" style={{ backgroundImage: `url(https://images.unsplash.com/${room.image}?auto=format&fit=crop&w=900&q=80)` }}><span className={`room-state ${room.state.toLowerCase().replaceAll(' ', '-')}`}><i />{room.state}</span><button className="room-more" aria-label={`${room.name} options`}><MoreHorizontal size={18} /></button></div><div className="room-content"><div className="room-title"><h2>{room.name}</h2><span>2 guests</span></div><p className="room-guest"><Users size={14} />{room.guest}</p><p className="room-detail"><CalendarDays size={14} />{room.detail}</p><div className="room-footer"><div><span>BASE RATE</span><strong>{money(index === 2 ? 26000 : 22800)} <small>/ night</small></strong></div><button className="text-button">Room details <ChevronRight size={14} /></button></div></div></article>)}</div><div className="card room-note"><div className="attention-icon amber"><ClipboardCheck size={17} /></div><div><strong>Room combinations</strong><span>Combination bookings block all component rooms to prevent double bookings.</span></div><button className="text-button">Configure <ChevronRight size={14} /></button></div></>}

function Guests({reservations}:{reservations:Reservation[]}){const guests=[{name:'Amelia Hart',country:'United Kingdom',stays:3,last:'Today',segment:'Repeat guest',email:'amelia.hart@example.com',consent:true},{name:'Nimal Perera',country:'Sri Lanka',stays:2,last:'Today',segment:'Local · Repeat',email:'nimal.p@example.com',consent:true},{name:'Sophie Laurent',country:'France',stays:1,last:'Nov 15, 2026',segment:'International',email:'sophie.l@example.com',consent:false},{name:'Kavindi Silva',country:'Sri Lanka',stays:1,last:'Nov 15, 2026',segment:'First-time',email:'kavindi.s@example.com',consent:true},{name:'Oliver Bennett',country:'Australia',stays:2,last:'Nov 18, 2026',segment:'Repeat guest',email:'oliver.b@example.com',consent:false},{name:'Maya Chen',country:'Singapore',stays:1,last:'Nov 23, 2026',segment:'Family',email:'maya.chen@example.com',consent:true},{name:'Daniel Kim',country:'South Korea',stays:1,last:'Nov 25, 2026',segment:'Solo traveler',email:'daniel.k@example.com',consent:false},{name:'Ishara Fernando',country:'Sri Lanka',stays:4,last:'Nov 20, 2026',segment:'Repeat · Local',email:'ishara.f@example.com',consent:true}];return <><div className="page-heading"><div><p className="eyebrow">HOTEL OPERATIONS</p><h1>Guest directory</h1><p className="subheading">Thoughtful, personal service starts with knowing your guests.</p></div><button className="button secondary"><Download size={15} /> Export guests</button></div><div className="guest-stats"><div><strong>186</strong><span>guest profiles</span></div><div><strong>32%</strong><span>repeat guests</span></div><div><strong>68%</strong><span>marketing opt-in</span></div><div><strong>4.8<span className="star">★</span></strong><span>average guest rating</span></div></div><div className="card directory-card"><div className="filter-row"><label className="table-search"><Search size={16} /><input placeholder="Search guests by name, email or country..." /></label><button className="button secondary"><Filter size={15} /> Segments <ChevronDown size={14} /></button><button className="button secondary">All guests <ChevronDown size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>GUEST</th><th>LOCATION</th><th>STAYS</th><th>LIFETIME VALUE</th><th>LAST VISIT</th><th>SEGMENT</th><th>MARKETING</th></tr></thead><tbody>{guests.map((guest, index) => <tr key={guest.name}><td><div className="guest-cell"><div className="guest-avatar">{guest.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><strong>{guest.name}</strong><small>{guest.email}</small></div></div></td><td>{guest.country}</td><td>{guest.stays}</td><td>{money([186400, 102000, 112000, 52000, 174000, 140000, 45600, 268000][index])}</td><td>{guest.last}</td><td><span className="segment-pill">{guest.segment}</span></td><td><span className={`consent ${guest.consent ? 'yes' : 'no'}`}>{guest.consent ? 'Subscribed' : 'Not opted in'}</span></td></tr>)}</tbody></table></div><div className="table-footer"><span>Showing 8 of 186 guest profiles</span><div className="pager"><button className="page-current">1</button><button>2</button><button>3</button><button aria-label="Next"><ChevronRight size={16} /></button></div></div></div><p className="privacy-note"><ShieldCheck size={14} /> Guest contact details are only available to authorized staff.</p></>}

function Operations({role, tasks, setTask, notify}:{role:Role;tasks:string[];setTask:(index:number,state:string)=>void;notify:(message:string)=>void}){const [tab,setTab]=useState('Housekeeping');return <><div className="page-heading"><div><p className="eyebrow">HOTEL OPERATIONS</p><h1>{role === 'Housekeeper' ? 'My tasks' : tab === 'Housekeeping' ? 'Daily operations' : 'Staff & tasks'}</h1><p className="subheading">Coordinate the small details that make every stay special.</p></div><button className="button primary" onClick={() => notify('Task form is ready for manager assignment')}><Plus size={16} /> Assign task</button></div><div className="segment-tabs"><button className={tab === 'Housekeeping' ? 'selected' : ''} onClick={() => setTab('Housekeeping')}>Housekeeping <span>3</span></button><button className={tab === 'Guest requests' ? 'selected' : ''} onClick={() => setTab('Guest requests')}>Guest requests <span>2</span></button><button className={tab === 'Breakfast' ? 'selected' : ''} onClick={() => setTab('Breakfast')}>Breakfast <span>Today</span></button><button className={tab === 'Staff' ? 'selected' : ''} onClick={() => setTab('Staff')}>Team <span>5</span></button></div>{tab === 'Housekeeping' ? <div className="ops-layout"><div className="card task-board"><div className="card-heading"><div><h2>Housekeeping board</h2><p>Saturday, November 14 · 3 room tasks</p></div><button className="button secondary"><Filter size={14} /> Filter</button></div>{['Room 03 · Departure clean', 'Room 01 · Guest arrival prep', 'Room 02 · Evening turndown'].map((title, index) => <article className="task-row" key={title}><button className={`task-check ${tasks[index] === 'Completed' ? 'checked' : ''}`} aria-label={`Mark ${title} complete`} onClick={() => setTask(index, tasks[index] === 'Completed' ? 'Pending' : 'Completed')}>{tasks[index] === 'Completed' && <Check size={14} />}</button><div className="task-main"><strong>{title}</strong><span>{index === 0 ? 'Checkout clean · full checklist' : index === 1 ? 'Guest arrival at 2:00 PM' : 'Requested by guest · today'}</span><div className="task-meta"><span className={`priority ${index === 0 ? 'high' : 'normal'}`}>{index === 0 ? 'High priority' : 'Standard'}</span><span>Due {index === 0 ? '11:30 AM' : index === 1 ? '1:00 PM' : '4:00 PM'}</span></div></div><div className="task-assignee"><div className="tiny-avatar">{index === 1 ? 'LF' : 'SS'}</div><span>{index === 1 ? 'Lakmali' : 'Sewwandi'}</span></div><select value={tasks[index] ?? 'Pending'} onChange={event => setTask(index, event.target.value)} aria-label={`Status for ${title}`}><option>Pending</option><option>In progress</option><option>Inspection required</option><option>Completed</option></select></article>)}</div><aside className="card ops-side"><div className="card-heading"><div><h2>Today’s arrivals</h2><p>2 guests checking in</p></div></div><div className="arrival-person"><div className="guest-avatar">NP</div><div><strong>Nimal Perera</strong><span>Room 01 · 2 guests</span></div><span className="arrival-time">2:00 PM</span></div><div className="arrival-person"><div className="guest-avatar">SL</div><div><strong>Sophie Laurent</strong><span>Room 04 · 3 guests</span></div><span className="arrival-time">Tomorrow</span></div><div className="breakfast-note"><span className="breakfast-icon">☕</span><div><strong>Breakfast preparation</strong><span>5 guests · 2 dietary notes</span><button onClick={() => setTab('Breakfast')}>View breakfast plan →</button></div></div><div className="ops-alert"><strong>Maintenance update</strong><span>Room 04 · bathroom tap · Medium priority</span><button onClick={() => notify('Issue assigned to the manager')}>View issue →</button></div></aside></div> : <div className="ops-placeholder card">{tab === 'Guest requests' ? <><MessageCircle size={24} /><h2>Guest requests</h2><p>2 open requests · one extra blanket for Room 02 and an early breakfast for Room 04.</p><button className="button primary" onClick={() => notify('Guest request marked as complete')}>Mark first request complete</button></> : tab === 'Breakfast' ? <><div className="breakfast-big">☕</div><h2>Breakfast coordination</h2><p>Complimentary breakfast · 5 expected guests this morning.</p><p>Room 01 · 2 guests · Room 02 · 2 guests · Room 04 · 1 guest</p><button className="button primary" onClick={() => notify('Breakfast preparation marked as ready')}>Mark preparation ready</button></> : <><Users size={24} /><h2>Villa Tea Fields team</h2>{staff.map(person => <div className="staff-row" key={person.name}><div className="tiny-avatar">{person.initials}</div><strong>{person.name}</strong><span>{person.role}</span></div>)}</>}</div>}</>}
function Housekeeper({tasks, setTask}:{tasks:string[];setTask:(index:number,state:string)=>void}){return <div className="housekeeper-view"><div className="housekeeper-banner"><div><span>YOUR SHIFT · 7:00 AM – 3:00 PM</span><strong>Ready to make someone&apos;s stay?</strong><p>You have 3 room preparations on your list today.</p></div><div className="task-progress"><div><strong>{tasks.filter(task => task === 'Completed').length}/3</strong><span>tasks complete</span></div><div className="progress-track"><i style={{ width: `${tasks.filter(task => task === 'Completed').length * 33.3}%` }} /></div></div></div><h2 className="mobile-section-title">Your room tasks</h2>{['Room 03 · Departure clean', 'Room 01 · Guest arrival prep', 'Room 02 · Evening turndown'].map((title, index) => <article className="card mobile-task" key={title}><div className="mobile-task-top"><span className={`priority ${index === 0 ? 'high' : 'normal'}`}>{index === 0 ? 'HIGH PRIORITY' : 'STANDARD'}</span><span>Due {index === 0 ? '11:30 AM' : index === 1 ? '1:00 PM' : '4:00 PM'}</span></div><h3>{title}</h3><p>{index === 0 ? 'Full room reset after guest departure' : index === 1 ? 'Prepare room before 2:00 PM check-in' : 'Refresh room amenities for current guest'}</p>{tasks[index] === 'Pending' ? <button className="button primary full-button" onClick={() => setTask(index, 'In progress')}>Start cleaning <ChevronRight size={15} /></button> : tasks[index] === 'In progress' ? <div className="checklist"><label><input type="checkbox" /> Change bed linen</label><label><input type="checkbox" /> Clean bathroom</label><label><input type="checkbox" /> Restock amenities</label><label><input type="checkbox" /> Final room check</label><button className="button primary full-button" onClick={() => setTask(index, 'Inspection required')}>Submit for inspection <Check size={15} /></button></div> : tasks[index] === 'Inspection required' ? <div className="inspection-msg"><ClipboardCheck size={15} /> Waiting for manager inspection</div> : <div className="completed-msg"><Check size={15} /> Room marked complete</div>}</article>)}</div>}

function Finance({revenue, reservations, notify}:{revenue:number;reservations:Reservation[];notify:(message:string)=>void}){const total=reservations.reduce((sum,item)=>sum+item.total,0);return <><div className="page-heading"><div><p className="eyebrow">BUSINESS MANAGEMENT</p><h1>Payments & finance</h1><p className="subheading">A clear picture of revenue, payments and what is still due.</p></div><button className="button primary" onClick={() => notify('New expense form opened')}><Plus size={16} /> Record expense</button></div><div className="stats-grid finance-stats"><Stat icon={<Wallet />} label="TOTAL REVENUE" value={money(revenue)} change="8.2%" note="Payments received" tone="green" /><Stat icon={<CreditCard />} label="OUTSTANDING" value={money(total - revenue)} note="Across active bookings" tone="sand" /><Stat icon={<TrendingUp />} label="PLATFORM COMMISSION" value="LKR 184,600" note="This month · estimated" tone="blue" /><Stat icon={<ArrowUpRight />} label="EST. NET REVENUE" value="LKR 1.06M" change="5.1%" note="After platform fees" tone="purple" /></div><div className="finance-grid"><section className="card ledger-card"><div className="card-heading"><div><h2>Recent transactions</h2><p>Latest activity across your property</p></div><button className="text-button" onClick={() => notify('Showing all transactions')}>Full ledger <ChevronRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>TRANSACTION</th><th>RESERVATION</th><th>DATE</th><th>METHOD</th><th>AMOUNT</th><th>STATUS</th></tr></thead><tbody>{[{ name: 'Stay payment', id: 'VT-2481', date: 'Nov 14', method: 'Bank transfer', amount: 34200, status: 'Pending verification' }, { name: 'Stay deposit', id: 'VT-2482', date: 'Nov 13', method: 'PayHere', amount: 45600, status: 'Verified' }, { name: 'Stay deposit', id: 'VT-2483', date: 'Nov 12', method: 'PayHere', amount: 56000, status: 'Verified' }, { name: 'Platform payout', id: 'VT-2467', date: 'Nov 11', method: 'Booking.com', amount: 68400, status: 'Verified' }].map(row => <tr key={row.id}><td><strong>{row.name}</strong><small className="table-sub">{row.id}</small></td><td>{row.id}</td><td>{row.date}, 2026</td><td>{row.method}</td><td className="money-in">+{money(row.amount)}</td><td>{row.status === 'Verified' ? <span className="payment-label paid">Verified</span> : <button className="verify-button" onClick={() => notify('Bank transfer verified · financial balance updated')}>Verify payment</button>}</td></tr>)}</tbody></table></div></section><aside className="card finance-side"><div className="card-heading"><div><h2>Direct booking impact</h2><p>Commission savings opportunity</p></div><TrendingUp size={17} /></div><div className="savings-figure"><strong>LKR 36,920</strong><span>estimated monthly savings</span></div><label className="slider-label">Shift OTA bookings to direct <strong>20%</strong></label><input className="savings-slider" type="range" min="0" max="50" defaultValue="20" onChange={event => { const output = document.getElementById('savings-output'); if (output) output.textContent = `LKR ${Math.round(184600 * Number(event.target.value) / 100).toLocaleString()}` }} /><div className="slider-label"><span>0%</span><span>50%</span></div><p className="savings-note">At this rate, your potential savings could reach <strong id="savings-output">LKR 36,920</strong> per month.</p><button className="button secondary full-button" onClick={() => notify('Channel analysis report opened')}>Explore channel analysis <ChevronRight size={15} /></button></aside></div></>}

function Marketing({page, notify}:{page:string;notify:(message:string)=>void}){const [percent,setPercent]=useState(20);return <><div className="page-heading"><div><p className="eyebrow">BUSINESS MANAGEMENT</p><h1>{page}</h1><p className="subheading">Build guest relationships and grow direct bookings.</p></div><button className="button primary" onClick={() => notify('Campaign draft created')}><Plus size={16} /> New campaign</button></div><div className="stats-grid"><Stat icon={<TrendingUp />} label="DIRECT BOOKINGS" value="42%" change="8.4%" note="vs. last month" tone="green" /><Stat icon={<Users />} label="REPEAT GUESTS" value="32%" change="4.2%" note="186 guest profiles" tone="sand" /><Stat icon={<Wallet />} label="COMMISSION PAID" value="LKR 184k" note="This month · estimated" tone="blue" /><Stat icon={<MessageCircle />} label="GUEST RATING" value="4.8 / 5" note="Across 42 reviews" tone="purple" /></div><div className="marketing-grid"><section className="card channel-analysis"><div className="card-heading"><div><h2>Channel performance</h2><p>Compare bookings, gross revenue and commission</p></div><button className="button secondary">This month <ChevronDown size={14} /></button></div>{[['Direct · Website', 12, 'LKR 486,000', 'LKR 0'], ['WhatsApp & phone', 9, 'LKR 342,000', 'LKR 0'], ['Booking.com', 8, 'LKR 392,000', 'LKR 58,800'], ['Airbnb', 5, 'LKR 224,000', 'LKR 33,600'], ['Agoda & other', 4, 'LKR 182,000', 'LKR 27,300']].map((row, index) => <div className="channel-row" key={String(row[0])}><span className="channel-rank">0{index + 1}</span><strong>{row[0]}</strong><div className="channel-bar"><i style={{ width: `${[84, 62, 58, 43, 34][index]}%` }} /></div><span>{row[1]} bookings</span><strong>{row[2]}</strong><span className="commission-value">{row[3]}</span></div>)}</section><aside className="card savings-calculator"><div className="calc-icon"><TrendingUp size={18} /></div><p className="eyebrow">REVENUE CALCULATOR</p><h2>What if more guests booked direct?</h2><p>Estimate the commission savings by shifting bookings to direct channels.</p><label className="calc-slider-label">Convert <strong>{percent}%</strong> of OTA bookings</label><input className="savings-slider" type="range" min="0" max="50" value={percent} onChange={event => setPercent(Number(event.target.value))} /><div className="calc-result"><span>Potential monthly savings</span><strong>LKR {Math.round(184600 * percent / 100).toLocaleString()}</strong></div><small className="muted-note">Estimated based on current channel mix.</small></aside></div><section className="card campaign-card"><div className="card-heading"><div><h2>Active campaigns</h2><p>Active promotional offers and campaigns</p></div><button className="text-button" onClick={() => notify('All campaigns opened')}>View all <ChevronRight size={14} /></button></div><div className="campaign-row"><div className="campaign-symbol">✳</div><div><strong>Tea Country, Your Way</strong><span>Repeat guests · Direct booking · 10% offer</span></div><span className="campaign-status">Active · Nov 01 – Dec 15</span><button className="subtle-icon" onClick={() => notify('Campaign details opened')} aria-label="Campaign details"><MoreHorizontal size={17} /></button></div></section></>}

function Insights({page, revenue, reservations, notify}:{page:string;revenue:number;reservations:Reservation[];notify:(message:string)=>void}){const [prompt,setPrompt]=useState('');const [answer,setAnswer]=useState('');const [approved,setApproved]=useState(false);const isAi=page==='AI Business Assistant';const ask=()=>{if(!prompt.trim())return;const lower=prompt.toLowerCase();const response=lower.includes('commission')?'Booking platforms generated an estimated LKR 184,600 in commission this month. Direct bookings represented 42% of reservations, avoiding approximately LKR 36,920 in fees compared with a 20% channel shift.':lower.includes('channel')?'Direct channels generated the highest net revenue this month at LKR 828,000 across 21 reservations. Booking.com contributed LKR 333,200 net after estimated commission.':lower.includes('repeat')?'32% of your guest profiles are repeat visitors. Four repeat stays are scheduled this month, representing LKR 312,000 in booking value.':`Villa Tea Fields has collected ${money(revenue)} across ${reservations.length} active and upcoming reservations. Occupancy is tracking at 75%, with ${reservations.filter(item => item.status === 'Pending Approval').length} booking requests awaiting owner review.`;setAnswer(response)};return <><div className="page-heading"><div><p className="eyebrow">INTELLIGENCE</p><h1>{isAi ? 'AI Business Assistant' : 'Reports & analytics'}</h1><p className="subheading">{isAi ? 'Ask your hotel data a question, or explore a decision-ready insight.' : 'One source of truth for operational, tactical and strategic decisions.'}</p></div><button className="button secondary" onClick={() => notify('Report exported successfully')}><Download size={15} /> Export report</button></div>{isAi ? <><div className="ai-banner"><div className="ai-orb"><Sparkles size={24} /></div><div><span>AI ASSISTANT</span><h2>A clearer view of your business starts with a question.</h2><p>Operational insights and recommendations based on current property records.</p></div></div><div className="ai-workspace"><section className="card ask-card"><div className="card-heading"><div><h2>Ask your data</h2><p>Try a suggested question or ask your own.</p></div><span className="read-only-label"><ShieldCheck size={13} /> ACTIVE</span></div><div className="suggestion-chips">{['How did we perform this month?', 'Which channel has highest net revenue?', 'How much commission did we pay?', 'How many guests are repeat customers?'].map(text => <button key={text} onClick={() => { setPrompt(text); setAnswer('') }}>{text}<ChevronRight size={13} /></button>)}</div>{answer && <div className="answer-card"><div className="answer-title"><span><Sparkles size={14} /></span><strong>Business summary</strong><small>Based on current property records</small></div><p>{answer}</p><div className="answer-foot"><span>Data range · November 2026</span><button onClick={() => notify('Supporting report opened')}>View supporting report <ChevronRight size={13} /></button></div></div>}<div className="ask-input"><input placeholder="Ask a question about your hotel..." value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) ask() }} /><button aria-label="Ask assistant" onClick={ask}><ArrowUpRight size={17} /></button></div></section><aside className="card pricing-card"><span className="pricing-label"><TrendingUp size={14} /> PRICING SUGGESTION</span><h2>Weekend demand is rising</h2><p>Current occupancy and the November trend suggest higher weekend demand than usual.</p><div className="rate-compare"><div><span>ROOM 01 · CURRENT</span><strong>LKR 22,800</strong></div><ArrowUpRight size={17} /><div><span>SUGGESTED RATE</span><strong>LKR 25,000</strong></div></div><div className="impact-note"><Sparkles size={14} /><span>Suggested +9.6% for Nov 27–29. Potential revenue lift: LKR 17,600.</span></div><div className="pricing-actions"><button className="button secondary" onClick={() => { setApproved(false); notify('Pricing suggestion dismissed') }}>Dismiss</button><button className={`button ${approved ? 'secondary' : 'primary'}`} onClick={() => { setApproved(true); notify('Rate change submitted for owner review') }}>{approved ? 'Sent for review' : 'Review suggestion'}</button></div><small className="muted-note">Rates never change automatically. Owner approval required.</small></aside></div><div className="ai-bottom-grid"><div className="card insight-list"><div className="card-heading"><div><h2>AI-generated insights</h2><p>Suggestions for your review</p></div></div>{['Direct bookings grew 8.4% this month, lowering reliance on platform commissions.', 'Two bank transfers are pending verification. Review before guest departure.', 'Four repeat guests are scheduled this month — consider a personalized welcome.'].map((text, index) => <div className="insight-item" key={text}><span className={`insight-number insight-${index}`}>0{index + 1}</span><p>{text}</p><button className="text-button" onClick={() => notify('Insight opened')}>Explore <ChevronRight size={13} /></button></div>)}</div><div className="card sentiment-card"><div className="card-heading"><div><h2>Guest sentiment</h2><p>Recent review themes</p></div></div><div className="sentiment-score"><strong>4.8</strong><span> / 5.0</span><small>from 42 reviews</small></div>{[['Staff service', '96%'], ['Cleanliness', '91%'], ['Breakfast', '88%'], ['Room comfort', '82%']].map(([label, value]) => <div className="sentiment-row" key={label}><span>{label}</span><div><i style={{ width: value }} /></div><strong>{value}</strong></div>)}</div></div></> : <><div className="segment-tabs"><button className="selected">Overview</button><button>Reservations</button><button>Financial</button><button>Operations</button><button>Marketing</button></div><div className="stats-grid"><Stat icon={<Wallet />} label="REVENUE COLLECTED" value={money(revenue)} change="8.2%" note="vs. previous period" tone="green" /><Stat icon={<Hotel />} label="AVERAGE OCCUPANCY" value="68%" change="12.5%" note="vs. previous period" tone="sand" /><Stat icon={<Users />} label="REPEAT GUESTS" value="32%" change="4.2%" note="of guest profiles" tone="blue" /><Stat icon={<CalendarDays />} label="RESERVATIONS" value="28" note="This month" tone="purple" /></div><div className="report-grid"><section className="card trend-card"><div className="card-heading"><div><h2>Revenue performance</h2><p>Monthly revenue · LKR</p></div><button className="button secondary">2026 <ChevronDown size={14} /></button></div><RevenueChart /><div className="chart-months"><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span></div></section><section className="card report-breakdown"><div className="card-heading"><div><h2>Management reports</h2><p>Detailed reports across management scopes</p></div></div>{[['Operational', 'Arrivals, tasks & room readiness'], ['Tactical', 'Monthly occupancy & channel trends'], ['Strategic', 'Seasonal demand & direct growth']].map(([label, desc], index) => <button className="report-level" key={label} onClick={() => notify(`${label} report opened`)}><span className={`level-number level-${index}`}>0{index + 1}</span><span><strong>{label}</strong><small>{desc}</small></span><ChevronRight size={16} /></button>)}</section></div><section className="card report-table"><div className="card-heading"><div><h2>Reservation performance</h2><p>Underlying records for this period</p></div><button className="text-button">View reservations <ChevronRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>RESERVATION</th><th>GUEST</th><th>SOURCE</th><th>BOOKING VALUE</th><th>PAID</th><th>STATUS</th></tr></thead><tbody>{reservations.slice(0, 5).map(item => <tr key={item.id}><td className="id-text">{item.id}</td><td>{item.guest}</td><td>{item.source}</td><td>{money(item.total)}</td><td>{money(item.paid)}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div></section></>}</>}

function Audit(){return <AuditLogsView />}
function SettingsView({notify}:{notify:(message:string)=>void}){return <><div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>Settings</h1><p className="subheading">Configure your property policies and team preferences.</p></div><button className="button primary" onClick={() => notify('Settings saved')}>Save changes</button></div><div className="settings-layout"><nav className="card settings-menu">{['Hotel information', 'Room configurations', 'Pricing & seasons', 'Booking policies', 'Payments & deposits', 'Notifications', 'Users & roles', 'Marketing consent'].map((label, index) => <button className={index === 0 ? 'selected' : ''} key={label}><span>{label}</span><ChevronRight size={15} /></button>)}</nav><section className="card settings-panel"><div className="card-heading"><div><h2>Hotel information</h2><p>Core information used across your management system.</p></div></div><div className="settings-fields"><label className="form-field">Property name<input defaultValue="Villa Tea Fields" /></label><label className="form-field">Location<input defaultValue="Nuwara Eliya, Sri Lanka" /></label><label className="form-field">Property type<select defaultValue="Boutique bed & breakfast"><option>Boutique bed & breakfast</option><option>Guesthouse</option></select></label><label className="form-field">Currency<select defaultValue="LKR · Sri Lankan Rupee"><option>LKR · Sri Lankan Rupee</option></select></label><div className="setting-note"><ShieldCheck size={16} /><span>Policies such as deposits and cancellation terms are configurable. No unconfirmed rules are applied by default.</span></div></div><button className="button primary" onClick={() => notify('Property settings saved')}>Save changes</button></section></div></>}
function Knowledge(){const [search,setSearch]=useState('');const articles=[['Room preparation checklist','Housekeeping · SOP','A room-by-room checklist to ensure a comfortable, consistent arrival experience.'],['Guest check-in procedure','Front desk · SOP','How to welcome guests, verify booking details and share relevant property information.'],['Breakfast preparation guidelines','Breakfast · Operations','Prepare the complimentary breakfast service around guest counts and dietary notes.'],['Maintenance reporting','Operations · SOP','Record an issue, its location and priority so the team can follow up.'],['Guest check-out procedure','Front desk · SOP','Close out the stay, confirm any remaining balance and create a cleaning task.']].filter(article=>article.join(' ').toLowerCase().includes(search.toLowerCase()));return <><div className="page-heading"><div><p className="eyebrow">TEAM KNOWLEDGE</p><h1>Knowledge center</h1><p className="subheading">Practical guides, procedures and institutional knowledge in one place.</p></div><button className="button primary"><Plus size={15} /> Add article</button></div><label className="knowledge-search"><Search size={17} /><input placeholder="Search procedures, guides and team notes..." value={search} onChange={event => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label><div className="knowledge-categories"><button className="selected">All articles <span>12</span></button><button>Housekeeping</button><button>Guest services</button><button>Breakfast</button><button>Maintenance</button><button>Business knowledge</button></div><div className="knowledge-grid">{articles.map((article, index) => <button className="card knowledge-card" key={article[0]}><div className={`knowledge-icon knowledge-${index % 4}`}>{index === 0 ? <ClipboardCheck size={18} /> : index === 1 ? <Users size={18} /> : index === 2 ? <Activity size={18} /> : <FileText size={18} />}</div><span>{article[1]}</span><h2>{article[0]}</h2><p>{article[2]}</p><div>Read article <ChevronRight size={14} /></div></button>)}</div></>}
