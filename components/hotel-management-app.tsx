'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, ArrowDownRight, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardCheck, CreditCard, Download, FileText, Filter, Home, Hotel, LayoutDashboard, Mail, MapPin, Menu, MessageCircle, MoreHorizontal, Phone, Plus, Search, Settings, ShieldCheck, Sparkles, TrendingUp, Users, Wallet, X } from 'lucide-react'
import { ReservationsView, Reservation, BookingStatus, Role, ReservationAuditLog } from './reservations-view'
import { AIFeaturesView } from './ai-features-view'
import { PaymentsFinanceView } from './payments-finance-view'
import { AuditLogsView } from './audit-logs-view'
import { NotificationsPopover } from './notifications-popover'
import { RoomsView } from './rooms-view'
import { HotelRoom, initialRooms, toRoomCatalog } from '@/lib/rooms'

/** Bump when the stored room shape changes so stale browser data is ignored. */
const ROOMS_STORAGE_VERSION = 1

const currentReservations: Reservation[] = [
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
type HistoricalDemoReservation = Pick<Reservation, 'id' | 'guest' | 'room' | 'checkIn' | 'checkOut' | 'guests' | 'source' | 'ratePerNight' | 'paid' | 'status'>

const historicalDemoReservations: Reservation[] = ([
  { id: 'VT-2460', guest: 'Mila Perera', room: 'Room 01', checkIn: '2026-01-05', checkOut: '2026-01-09', guests: 2, source: 'Direct · Website', ratePerNight: 22800, paid: 91200, status: 'Checked Out' },
  { id: 'VT-2461', guest: 'James Wilson', room: 'Room 02', checkIn: '2026-01-05', checkOut: '2026-01-10', guests: 2, source: 'Booking.com', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2462', guest: 'Roshani Fernando', room: 'Room 03', checkIn: '2026-01-17', checkOut: '2026-01-21', guests: 2, source: 'Airbnb', ratePerNight: 26000, paid: 104000, status: 'Checked Out' },
  { id: 'VT-2463', guest: 'Oliver James', room: 'Room 04', checkIn: '2026-01-24', checkOut: '2026-01-27', guests: 3, source: 'Agoda', ratePerNight: 28000, paid: 84000, status: 'Checked Out' },
  { id: 'VT-2464', guest: 'Asha Kumar', room: 'Room 01', checkIn: '2026-02-01', checkOut: '2026-02-05', guests: 2, source: 'Direct · WhatsApp', ratePerNight: 22800, paid: 91200, status: 'Checked Out' },
  { id: 'VT-2465', guest: 'Noah Smith', room: 'Room 03', checkIn: '2026-02-01', checkOut: '2026-02-04', guests: 2, source: 'Booking.com', ratePerNight: 26000, paid: 78000, status: 'Checked Out' },
  { id: 'VT-2474', guest: 'Priya Wijesinghe', room: 'Room 02', checkIn: '2026-02-11', checkOut: '2026-02-14', guests: 2, source: 'Direct · Website', ratePerNight: 22800, paid: 68400, status: 'Checked Out' },
  { id: 'VT-2466', guest: 'Luca Martin', room: 'Room 04', checkIn: '2026-02-20', checkOut: '2026-02-25', guests: 3, source: 'Airbnb', ratePerNight: 28000, paid: 140000, status: 'Checked Out' },
  { id: 'VT-2467', guest: 'Sanjana de Silva', room: 'Room 01', checkIn: '2026-03-03', checkOut: '2026-03-08', guests: 2, source: 'Direct · Website', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2468', guest: 'Ethan Brooks', room: 'Room 02', checkIn: '2026-03-03', checkOut: '2026-03-07', guests: 2, source: 'Booking.com', ratePerNight: 22800, paid: 91200, status: 'Checked Out' },
  { id: 'VT-2469', guest: 'Ishani Rajapaksa', room: 'Room 03', checkIn: '2026-03-12', checkOut: '2026-03-16', guests: 2, source: 'Direct · WhatsApp', ratePerNight: 26000, paid: 104000, status: 'Checked Out' },
  { id: 'VT-2470', guest: 'Mason Clarke', room: 'Room 04', checkIn: '2026-03-19', checkOut: '2026-03-24', guests: 4, source: 'Agoda', ratePerNight: 28000, paid: 140000, status: 'Checked Out' },
  { id: 'VT-2475', guest: 'Aiden Cole', room: 'Room 03', checkIn: '2026-04-04', checkOut: '2026-04-07', guests: 2, source: 'Booking.com', ratePerNight: 26000, paid: 78000, status: 'Checked Out' },
  { id: 'VT-2471', guest: 'Zara Thompson', room: 'Room 01', checkIn: '2026-04-12', checkOut: '2026-04-17', guests: 2, source: 'Airbnb', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2472', guest: 'Kavish Perera', room: 'Room 04', checkIn: '2026-04-22', checkOut: '2026-04-27', guests: 3, source: 'Direct · Website', ratePerNight: 28000, paid: 140000, status: 'Checked Out' },
  { id: 'VT-2473', guest: 'Grace Liu', room: 'Room 02', checkIn: '2026-05-02', checkOut: '2026-05-07', guests: 2, source: 'Booking.com', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2489', guest: 'Dilan Jayawardena', room: 'Room 03', checkIn: '2026-05-04', checkOut: '2026-05-10', guests: 2, source: 'Direct · WhatsApp', ratePerNight: 26000, paid: 156000, status: 'Checked Out' },
  { id: 'VT-2490', guest: 'Sofia Garcia', room: 'Room 01', checkIn: '2026-05-18', checkOut: '2026-05-23', guests: 2, source: 'Airbnb', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2476', guest: 'Tharushi de Silva', room: 'Room 01', checkIn: '2026-06-12', checkOut: '2026-06-15', guests: 2, source: 'Direct · WhatsApp', ratePerNight: 22800, paid: 68400, status: 'Checked Out' },
  { id: 'VT-2491', guest: 'Nethmi Silva', room: 'Room 02', checkIn: '2026-06-08', checkOut: '2026-06-13', guests: 2, source: 'Booking.com', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2492', guest: 'Arjun Mehta', room: 'Room 04', checkIn: '2026-06-20', checkOut: '2026-06-25', guests: 4, source: 'Agoda', ratePerNight: 28000, paid: 140000, status: 'Checked Out' },
  { id: 'VT-2493', guest: 'Mia Robinson', room: 'Room 01', checkIn: '2026-07-02', checkOut: '2026-07-08', guests: 2, source: 'Direct · Website', ratePerNight: 22800, paid: 136800, status: 'Checked Out' },
  { id: 'VT-2494', guest: 'Kasun Ekanayake', room: 'Room 02', checkIn: '2026-07-02', checkOut: '2026-07-09', guests: 2, source: 'Booking.com', ratePerNight: 22800, paid: 159600, status: 'Checked Out' },
  { id: 'VT-2495', guest: 'Amelie Dubois', room: 'Room 03', checkIn: '2026-07-12', checkOut: '2026-07-17', guests: 3, source: 'Airbnb', ratePerNight: 26000, paid: 130000, status: 'Checked Out' },
  { id: 'VT-2496', guest: 'Harini Senanayake', room: 'Room 04', checkIn: '2026-07-21', checkOut: '2026-07-26', guests: 4, source: 'Direct · WhatsApp', ratePerNight: 28000, paid: 140000, status: 'Checked Out' },
  { id: 'VT-2477', guest: 'Elena Rossi', room: 'Room 04', checkIn: '2026-08-19', checkOut: '2026-08-23', guests: 3, source: 'Airbnb', ratePerNight: 28000, paid: 84000, status: 'Checked Out' },
  { id: 'VT-2497', guest: 'Liam Taylor', room: 'Room 01', checkIn: '2026-08-05', checkOut: '2026-08-10', guests: 2, source: 'Booking.com', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2498', guest: 'Dinithi Perera', room: 'Room 02', checkIn: '2026-08-12', checkOut: '2026-08-17', guests: 2, source: 'Direct · Website', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2478', guest: 'Theo Martin', room: 'Room 02', checkIn: '2026-09-10', checkOut: '2026-09-13', guests: 2, source: 'Airbnb', ratePerNight: 22800, paid: 68400, status: 'Checked Out' },
  { id: 'VT-2499', guest: 'Ella Williams', room: 'Room 01', checkIn: '2026-09-01', checkOut: '2026-09-05', guests: 2, source: 'Direct · WhatsApp', ratePerNight: 22800, paid: 91200, status: 'Checked Out' },
  { id: 'VT-2500', guest: 'Ravi Jayasinghe', room: 'Room 04', checkIn: '2026-09-18', checkOut: '2026-09-23', guests: 3, source: 'Agoda', ratePerNight: 28000, paid: 140000, status: 'Checked Out' },
  { id: 'VT-2479', guest: 'Amara Jayawardena', room: 'Room 03', checkIn: '2026-10-02', checkOut: '2026-10-05', guests: 2, source: 'Agoda', ratePerNight: 26000, paid: 78000, status: 'Checked Out' },
  { id: 'VT-2480', guest: 'Samir Patel', room: 'Room 01', checkIn: '2026-10-21', checkOut: '2026-10-24', guests: 2, source: 'Booking.com', ratePerNight: 22800, paid: 68400, status: 'Checked Out' },
  { id: 'VT-2501', guest: 'Mei Tan', room: 'Room 02', checkIn: '2026-10-08', checkOut: '2026-10-13', guests: 2, source: 'Airbnb', ratePerNight: 22800, paid: 114000, status: 'Checked Out' },
  { id: 'VT-2502', guest: 'Ruwan Fernando', room: 'Room 04', checkIn: '2026-10-14', checkOut: '2026-10-20', guests: 3, source: 'Direct · Website', ratePerNight: 28000, paid: 168000, status: 'Checked Out' },
  { id: 'VT-2503', guest: 'Isabel Costa', room: 'Room 03', checkIn: '2026-10-17', checkOut: '2026-10-22', guests: 2, source: 'Booking.com', ratePerNight: 26000, paid: 130000, status: 'Checked Out' },
  { id: 'VT-2504', guest: 'Daniela Moretti', room: 'Room 02', checkIn: '2026-12-03', checkOut: '2026-12-08', guests: 2, source: 'Airbnb', ratePerNight: 22800, paid: 57000, status: 'Confirmed' },
  { id: 'VT-2505', guest: 'Benjamin Lee', room: 'Room 04', checkIn: '2026-12-14', checkOut: '2026-12-20', guests: 4, source: 'Direct · Website', ratePerNight: 28000, paid: 84000, status: 'Confirmed' },
 ] satisfies HistoricalDemoReservation[]).map((reservation): Reservation => {
  const total = Math.round((Date.parse(`${reservation.checkOut}T00:00:00`) - Date.parse(`${reservation.checkIn}T00:00:00`)) / 86400000) * reservation.ratePerNight
  const payment: Reservation['payments'][number] = {
    id: `PAY-${reservation.id}`,
    amount: reservation.paid,
    date: reservation.checkIn,
    method: 'Credit Card',
    receiptNumber: `REC-${reservation.id}`,
    reference: 'Demo reservation payment'
  }
  return {
    ...reservation,
    guestEmail: `${reservation.guest.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    guestPhone: '+94 77 123 4567',
    total,
    paymentStatus: reservation.paid >= total ? 'Paid' : 'Partially Paid',
    payments: [payment],
    history: [{
      id: `LOG-${reservation.id}`,
      timestamp: `${reservation.checkIn}T09:00:00`,
      action: 'Created',
      performedBy: `Demo data · ${reservation.source}`,
      note: 'Sample historical reservation for dashboard presentation.'
    }]
  }
})
const initialReservations: Reservation[] = [...historicalDemoReservations, ...currentReservations]

const navGroups = [
  { label: 'OVERVIEW', items: [{ name: 'Dashboard', icon: LayoutDashboard, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }] },
  { label: 'HOTEL OPERATIONS', items: [{ name: 'Reservations', icon: CalendarDays, roles: ['Owner', 'Manager', 'Deputy Manager'] }, { name: 'Rooms', icon: Hotel, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }, { name: 'Guests', icon: Users, roles: ['Owner', 'Manager', 'Deputy Manager'] }, { name: 'Daily Operations', icon: ClipboardCheck, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }, { name: 'Staff & Tasks', icon: Activity, roles: ['Owner', 'Manager', 'Deputy Manager', 'Housekeeper'] }] },
  { label: 'BUSINESS MANAGEMENT', items: [{ name: 'Payments & Finance', icon: Wallet, roles: ['Owner'] }, { name: 'Marketing & CRM', icon: MessageCircle, roles: ['Owner', 'Manager'] }] },
  { label: 'INTELLIGENCE', items: [{ name: 'Reports & Analytics', icon: FileText, roles: ['Owner', 'Manager'] }, { name: 'AI Business Assistant', icon: Sparkles, roles: ['Owner', 'Manager'] }] },
  { label: 'ADMINISTRATION', items: [{ name: 'Audit Logs', icon: ShieldCheck, roles: ['Owner'] }, { name: 'Settings', icon: Settings, roles: ['Owner'] }] },
] as const
const staff = [{ name: 'Mira Jayasinghe', role: 'Manager', initials: 'MJ' }, { name: 'Ruwan Perera', role: 'Deputy Manager', initials: 'RP' }, { name: 'Sewwandi Silva', role: 'Housekeeper', initials: 'SS' }, { name: 'Lakmali Fernando', role: 'Housekeeper', initials: 'LF' }]
/** Dashboard booking-channel colours: Direct, Booking.com, Airbnb, Agoda, Expedia, Trip.com, Other. */
const CHANNEL_COLORS = ['#172B4D', '#27877D', '#5B92E5', '#D99A35', '#8E44AD', '#E07A5F', '#CAD2DE']
const NAMED_CHANNEL_SOURCES = ['Booking.com', 'Airbnb', 'Agoda', 'Expedia', 'Trip.com', 'Walk-in Guest']
const money = (amount: number) => `LKR ${amount.toLocaleString('en-LK')}`

export function HotelManagementApp() {
  const [role, setRole] = useState<Role>('Owner')
  const [page, setPage] = useState('Dashboard')
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations)
  const [rooms, setRooms] = useState<HotelRoom[]>(initialRooms)
  const [focusReservationId, setFocusReservationId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All statuses')
  const [createReservationRequested, setCreateReservationRequested] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notice, setNotice] = useState('')
  const [period, setPeriod] = useState('This month')
  const [taskStates, setTaskStates] = useState(['In progress', 'Pending', 'Inspection required'])
  const [saved, setSaved] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const stored = window.localStorage.getItem('villa-tea-fields-demo')
    if (stored) {
      try {
        const data = JSON.parse(stored)
        if (data.reservations) {
          const savedReservations = data.reservations as Reservation[]
          const savedIds = new Set(savedReservations.map(item => item.id))
          setReservations([...historicalDemoReservations.filter(item => !savedIds.has(item.id)), ...savedReservations])
        }
        if (data.taskStates) setTaskStates(data.taskStates)
        if (data.roomsVersion === ROOMS_STORAGE_VERSION && Array.isArray(data.rooms)) {
          const savedRooms = data.rooms as HotelRoom[]
          setRooms(initialRooms.map(room => savedRooms.find(item => item?.id === room.id) ?? room))
        }
      } catch {
        window.localStorage.removeItem('villa-tea-fields-demo')
      }
    }
    setSaved(true)
  }, [])
  useEffect(() => {
    if (!saved) return
    const payload = { reservations, taskStates, rooms, roomsVersion: ROOMS_STORAGE_VERSION }
    try {
      window.localStorage.setItem('villa-tea-fields-demo', JSON.stringify(payload))
    } catch {
      // Uploaded photos (data URLs) can exceed the browser storage quota. Keep everything else
      // persisted; uploaded photos still remain in state for the current session.
      const lightRooms = rooms.map(room => {
        const photos = room.photos.filter(photo => !photo.src.startsWith('data:'))
        return { ...room, photos, primaryPhotoId: photos.some(photo => photo.id === room.primaryPhotoId) ? room.primaryPhotoId : photos[0]?.id ?? null }
      })
      try {
        window.localStorage.setItem('villa-tea-fields-demo', JSON.stringify({ ...payload, rooms: lightRooms }))
      } catch { /* storage unavailable — state still works for this session */ }
    }
  }, [reservations, taskStates, rooms, saved])
  const roomCatalog = useMemo(() => toRoomCatalog(rooms), [rooms])
  const updateRoom = (updated: HotelRoom) => setRooms(current => current.map(room => room.id === updated.id ? updated : room))
  const openReservation = (id: string) => {
    setFocusReservationId(id)
    setPage('Reservations')
  }

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
  const setTask = (index: number, state: string) => setTaskStates(current => current.map((value, itemIndex) => itemIndex === index ? state : value))

  return <div className="app-shell">
    <div
      className={`sidebar-backdrop ${mobileMenuOpen ? 'open' : ''}`}
      onClick={() => setMobileMenuOpen(false)}
      aria-hidden="true"
    />
    <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
      <div className="brand">
        <img
          src="/icon.svg"
          alt="Villa Tea Fields Logo"
          width={36}
          height={36}
          className="brand-mark"
        />
        <div>
          <strong>Villa Tea Fields</strong>
          <small>HOTEL MANAGEMENT</small>
        </div>
        <button
          className="mobile-menu-close"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>
      <div className="property-switch">
        <div className="property-avatar">VT</div>
        <div>
          <strong>Villa Tea Fields</strong>
          <span>Nuwara Eliya, Sri Lanka</span>
        </div>
        <ChevronDown size={15} />
      </div>
      <nav className="side-nav" aria-label="Main navigation">
        {visibleNav.map(group => (
          <section className="nav-group" key={group.label}>
            <p>{group.label}</p>
            {group.items.map(item => (
              <button
                key={item.name}
                onClick={() => {
                  setPage(item.name)
                  setMobileMenuOpen(false)
                }}
                className={`nav-link ${page === item.name ? 'active' : ''}`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
                {item.name === 'Reservations' && pending > 0 && <i>{pending}</i>}
              </button>
            ))}
          </section>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card">
          <div className="help-icon"><CircleHelp size={17} /></div>
          <strong>Operations Guide & SOPs</strong>
          <span>Standard operating procedures & staff guides.</span>
          <button onClick={() => { setPage('Knowledge Center'); setMobileMenuOpen(false) }}>
            Browse SOPs <span>→</span>
          </button>
        </div>
        <div className="sidebar-user">
          <div className="user-avatar">
            {role === 'Owner' ? 'AS' : role === 'Manager' ? 'MJ' : role === 'Deputy Manager' ? 'RP' : 'SS'}
          </div>
          <div>
            <strong>
              {role === 'Owner'
                ? 'Anushka Senanayake'
                : role === 'Manager'
                ? 'Mira Jayasinghe'
                : role === 'Deputy Manager'
                ? 'Ruwan Perera'
                : 'Sewwandi Silva'}
            </strong>
            <span>{role}</span>
          </div>
          <MoreHorizontal size={18} />
        </div>
      </div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div className="flex items-center gap-3">
          <button
            className="icon-button mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="crumb">
            <span>Villa Tea Fields</span>
            <ChevronRight size={14} />
            <strong>{page}</strong>
          </div>
        </div>
        <div className="top-actions">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F7F8FA] border border-[#E5E9EF] text-xs text-[#778196] font-medium">
            <span>Nuwara Eliya, LK</span>
            <span>·</span>
            <span>18°C Misty</span>
          </div>
          <label className="global-search">
            <Search size={16} />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Search anything..."
            />
            <kbd>⌘ K</kbd>
          </label>
          <button
            className="icon-button notification-button"
            aria-label="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={18} />
            <b />
          </button>
          <div className="top-divider" />
          <div className="profile-select">
            <div className="user-avatar small">
              {role === 'Owner' ? 'AS' : role === 'Manager' ? 'MJ' : role === 'Deputy Manager' ? 'RP' : 'SS'}
            </div>
            <select
              aria-label="Switch active role"
              value={role}
              onChange={event => setRole(event.target.value as Role)}
            >
              <option>Owner</option>
              <option>Manager</option>
              <option>Deputy Manager</option>
              <option>Housekeeper</option>
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
        {showNotifications && (
          <NotificationsPopover
            onNavigate={nextPage => {
              setPage(nextPage)
              setShowNotifications(false)
            }}
            onClose={() => setShowNotifications(false)}
          />
        )}
      </header>
    <div className="page-content w-full min-w-0 max-w-full">
      {page === 'Dashboard' && <Dashboard roomsReady={rooms.filter(room => room.status === 'Ready').length} roomCount={rooms.length} role={role} period={period} setPeriod={setPeriod} reservations={reservations} approve={approve} setPage={setPage} tasks={taskStates} setTask={setTask} />}
      {page === 'Reservations' && allowedPages.includes('Reservations') && (
        <ReservationsView
          reservations={reservations}
          onUpdateReservations={setReservations}
          role={role}
          notify={notify}
          openCreateRequest={createReservationRequested}
          onCreateRequestOpened={() => setCreateReservationRequested(false)}
          roomCatalog={roomCatalog}
          focusReservationId={focusReservationId}
          onFocusReservationHandled={() => setFocusReservationId(null)}
        />
      )}
      {page === 'Rooms' && allowedPages.includes('Rooms') && (
        <RoomsView
          rooms={rooms}
          reservations={reservations}
          role={role}
          onUpdateRoom={updateRoom}
          notify={notify}
          onOpenReservation={openReservation}
        />
      )}
      {page === 'Guests' && allowedPages.includes('Guests') && <Guests reservations={reservations} />}
      {(page === 'Daily Operations' || page === 'Staff & Tasks') && allowedPages.includes(page) && <Operations role={role} tasks={taskStates} setTask={setTask} notify={notify} />}
      {page === 'Payments & Finance' && allowedPages.includes('Payments & Finance') && <PaymentsFinanceView reservations={reservations} onUpdateReservations={setReservations} role={role} notify={notify} />}
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
        <AuditLogsView />
      )}
      {page === 'Settings' && allowedPages.includes('Settings') && <SettingsView notify={notify} />}
      {page === 'Knowledge Center' && <Knowledge />}
      {!allowedPages.includes(page) && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <ShieldCheck size={36} style={{ margin: '0 auto 1rem', color: '#D99A35' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Access Restricted</h2>
          <p style={{ color: '#778196', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Your active role ({role}) does not have permission to view {page}.
          </p>
          <button className="button primary" onClick={() => setPage('Dashboard')}>Return to Dashboard</button>
        </div>
      )}
    </div></main>
    {notice && <div className="toast-message"><span><Check size={15}/></span>{notice}</div>}
  </div>
}

function Dashboard({ role, period, setPeriod, reservations, approve, setPage, tasks, setTask, roomsReady, roomCount }: { roomsReady: number; roomCount: number; role: Role; period: string; setPeriod: (period: string) => void; reservations: Reservation[]; approve: (id: string, status: BookingStatus) => void; setPage: (page: string) => void; tasks: string[]; setTask: (index: number, state: string) => void }) {
  if (role === 'Housekeeper') {
    return <LegacyDashboard role={role} period={period} setPeriod={setPeriod} pending={0} arrivals={reservations.filter(item => item.checkIn === '2026-11-14').length} revenue={0} reservations={reservations} approve={approve} setPage={setPage} tasks={tasks} setTask={setTask} />
  }

  const canApprove = role === 'Owner' || role === 'Manager'
  const canViewFinancials = canApprove
  const rangeStart = period === 'This week' ? '2026-11-08' : period === 'This month' ? '2026-11-01' : '2026-01-01'
  const rangeEnd = period === 'This week' ? '2026-11-14' : period === 'This month' ? '2026-11-30' : '2026-12-31'
  const periodReservations = reservations.filter(item =>
    item.checkIn >= rangeStart && item.checkIn <= rangeEnd && item.status !== 'Cancelled'
  )
  const periodPending = periodReservations.filter(item => item.status === 'Pending Approval').length
  const periodRevenue = periodReservations.reduce((sum, item) => sum + item.paid, 0)
  const dayCount = Math.round((Date.parse(`${rangeEnd}T00:00:00`) - Date.parse(`${rangeStart}T00:00:00`)) / 86400000) + 1
  const occupiedNights = reservations.reduce((sum, item) => {
    if (item.status === 'Cancelled') return sum
    const start = Math.max(Date.parse(`${item.checkIn}T00:00:00`), Date.parse(`${rangeStart}T00:00:00`))
    const end = Math.min(Date.parse(`${item.checkOut}T00:00:00`), Date.parse(`${rangeEnd}T00:00:00`) + 86400000)
    return sum + Math.max(0, Math.round((end - start) / 86400000))
  }, 0)
  const occupancy = Math.min(100, Math.round(occupiedNights / (dayCount * 4) * 100))
  const todayArrivals = reservations.filter(item => item.checkIn === '2026-11-14' && ['Confirmed', 'Checked In'].includes(item.status)).length
  const todayDepartures = reservations.filter(item => item.checkOut === '2026-11-14' && item.status !== 'Cancelled').length

  const dateLabel = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const buckets = period === 'This week'
    ? Array.from({ length: 7 }, (_, index) => {
      const date = `2026-11-${String(8 + index).padStart(2, '0')}`
      return { start: date, end: date, label: dateLabel(new Date(`${date}T12:00:00`)) }
    })
    : period === 'This month'
      ? Array.from({ length: 5 }, (_, index) => {
        const firstDay = index * 7 + 1
        const lastDay = Math.min(firstDay + 6, 30)
        const start = `2026-11-${String(firstDay).padStart(2, '0')}`
        const end = `2026-11-${String(lastDay).padStart(2, '0')}`
        return { start, end, label: `${firstDay}-${lastDay}` }
      })
      : Array.from({ length: 12 }, (_, index) => {
        const monthStart = new Date(Date.UTC(2026, index, 1))
        const monthEnd = new Date(Date.UTC(2026, index + 1, 0))
        return {
          start: monthStart.toISOString().slice(0, 10),
          end: monthEnd.toISOString().slice(0, 10),
          label: monthStart.toLocaleDateString('en-US', { month: 'short' })
        }
      })
  const chartValues = buckets.map(bucket => periodReservations
    .filter(item => item.checkIn >= bucket.start && item.checkIn <= bucket.end)
    .reduce((sum, item) => sum + item.paid, 0))
  const occupancyValues = buckets.map(bucket => {
    const bucketStart = Date.parse(`${bucket.start}T00:00:00`)
    const bucketEnd = Date.parse(`${bucket.end}T00:00:00`) + 86400000
    const nights = reservations.reduce((sum, item) => {
      if (item.status === 'Cancelled') return sum
      const start = Math.max(Date.parse(`${item.checkIn}T00:00:00`), bucketStart)
      const end = Math.min(Date.parse(`${item.checkOut}T00:00:00`), bucketEnd)
      return sum + Math.max(0, Math.round((end - start) / 86400000))
    }, 0)
    const days = Math.round((bucketEnd - bucketStart) / 86400000)
    return Math.min(100, Math.round(nights / (days * 4) * 100))
  })
  const channels = [
    { name: 'Direct', matches: (source: string) => source.startsWith('Direct') || source === 'Walk-in Guest' },
    { name: 'Booking.com', matches: (source: string) => source === 'Booking.com' },
    { name: 'Airbnb', matches: (source: string) => source === 'Airbnb' },
    { name: 'Agoda', matches: (source: string) => source === 'Agoda' },
    { name: 'Expedia', matches: (source: string) => source === 'Expedia' },
    { name: 'Trip.com', matches: (source: string) => source === 'Trip.com' },
    { name: 'Other', matches: (source: string) => !NAMED_CHANNEL_SOURCES.includes(source) && !source.startsWith('Direct') }
  ].map(channel => {
    const count = periodReservations.filter(item => channel.matches(item.source)).length
    return { ...channel, count, share: periodReservations.length ? Math.round(count / periodReservations.length * 100) : 0 }
  })
  const upcoming = periodReservations
    .filter(item => !['Checked Out', 'Cancelled'].includes(item.status))
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
    .slice(0, 5)

  return <><div className="page-heading"><div><p className="eyebrow">SATURDAY, NOVEMBER 14, 2026 <span className="live-pill"><i /> LIVE OVERVIEW</span></p><h1>{role === 'Owner' ? 'Good morning, Anushka' : role === 'Manager' ? 'Good morning, Mira' : 'Good morning, Ruwan'}</h1><p className="subheading">Here’s what’s happening at Villa Tea Fields {period.toLowerCase()}.</p></div><div className="heading-actions"><select className="period-select" aria-label="Dashboard date range" value={period} onChange={event => setPeriod(event.target.value)}><option>This week</option><option>This month</option><option>This year</option></select></div></div>
    <section className="stats-grid">
      <Stat icon={<Hotel />} label="OCCUPANCY RATE" value={`${occupancy}%`} note={`During ${period.toLowerCase()}`} tone="green" />
      <Stat icon={<CalendarDays />} label="TODAY’S ARRIVALS" value={String(todayArrivals).padStart(2, '0')} note={todayArrivals ? `${todayArrivals} guest check-in${todayArrivals === 1 ? '' : 's'} today` : 'No confirmed arrivals'} tone="sand" />
      <Stat icon={<LogOutIcon />} label="TODAY’S DEPARTURES" value={String(todayDepartures).padStart(2, '0')} note={todayDepartures ? 'Scheduled check-outs today' : 'No check-outs today'} tone="blue" />
      <Stat icon={canViewFinancials ? <Wallet /> : <ClipboardCheck />} label={canViewFinancials ? 'REVENUE' : 'ROOMS READY'} value={canViewFinancials ? money(periodRevenue) : `${roomsReady} / ${roomCount}`} note={canViewFinancials ? `For ${period.toLowerCase()}` : `${roomCount - roomsReady} room${roomCount - roomsReady === 1 ? '' : 's'} not marked Ready`} tone="purple" />
    </section>
    <section className="dashboard-grid">
      <div className="card trend-card"><div className="card-heading"><div><h2>{canViewFinancials ? 'Revenue & occupancy' : 'Today at a glance'}</h2><p>{canViewFinancials ? `Performance for ${period.toLowerCase()}` : 'A live view of hotel operations'}</p></div><button className="text-button" onClick={() => setPage(canViewFinancials ? 'Reports & Analytics' : 'Daily Operations')}>{canViewFinancials ? 'View Reports & Analytics' : 'View report'} <ChevronRight size={14} /></button></div><div className="chart-key"><span><i className="key-green" /> Revenue <b>{money(periodRevenue)}</b></span><span><i className="key-gold" /> Occupancy % <b>{occupancy}%</b></span></div><PeriodRevenueChart values={chartValues} occupancyValues={occupancyValues} labels={buckets.map(bucket => bucket.label)} /><div className="chart-months">{buckets.map(bucket => <span key={bucket.label}>{bucket.label}</span>)}</div></div>
      <div className="card channel-card"><div className="card-heading"><div><h2>Booking channels</h2><p>Reservations for {period.toLowerCase()}</p></div><button className="subtle-icon" aria-label={canViewFinancials ? 'View channel analytics' : 'View reservations'} onClick={() => setPage(canViewFinancials ? 'Reports & Analytics' : 'Reservations')}><MoreHorizontal size={18} /></button></div><PeriodChannelChart count={periodReservations.length} shares={channels.map(channel => channel.share)} /><div className="channel-legend">{channels.map((channel, index) => <span key={channel.name}><i className="dot" style={{ background: CHANNEL_COLORS[index] }} />{channel.name} <b>{channel.share}%</b></span>)}</div><div className="channel-insight"><TrendingUp size={15} /><span>{channels[0].share}% of {period.toLowerCase()} bookings are direct</span></div></div>
    </section>
    <section className="lower-grid"><div className="card arrivals-card"><div className="card-heading"><div><h2>Upcoming reservations</h2><p>Arrivals and booking requests · {period.toLowerCase()}</p></div><button className="text-button" onClick={() => setPage('Reservations')}>All reservations <ChevronRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>GUEST</th><th>ROOM</th><th>CHECK IN</th><th>SOURCE</th><th>STATUS</th>{canApprove && <th />}</tr></thead><tbody>{upcoming.map(item => <tr key={item.id}><td><div className="guest-cell"><div className="guest-avatar">{item.guest.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><strong>{item.guest}</strong><small>{item.id}</small></div></div></td><td>{item.room}</td><td>{item.checkIn === '2026-11-14' ? 'Today' : new Date(`${item.checkIn}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td><td>{item.source.replace('Direct · ', '')}</td><td><StatusBadge status={item.status} /></td>{canApprove && item.status === 'Pending Approval' && <td><button className="approve-mini" onClick={() => approve(item.id, 'Confirmed')}>Approve</button></td>}</tr>)}</tbody></table></div><div className="table-footer"><span>Showing <strong>{upcoming.length}</strong> of {periodReservations.length} reservations</span><button onClick={() => setPage('Reservations')}>View all reservations <span>→</span></button></div></div>
      <div className="card attention-card"><div className="card-heading"><div><h2>Needs your attention</h2><p>Items that may need a follow-up</p></div><span className="attention-count">{periodPending + 2}</span></div><div className="attention-item"><div className="attention-icon amber"><CalendarDays size={16} /></div><div><strong>{periodPending} booking requests awaiting approval</strong><span>Review and respond to booking inquiries</span></div><button onClick={() => setPage('Reservations')} aria-label="View booking requests"><ChevronRight size={16} /></button></div><div className="attention-item"><div className="attention-icon rose"><ClipboardCheck size={16} /></div><div><strong>Room 03 ready for inspection</strong><span>Housekeeping · 18 min ago</span></div><button onClick={() => setPage('Daily Operations')} aria-label="View room inspection"><ChevronRight size={16} /></button></div>{canViewFinancials && <div className="attention-item"><div className="attention-icon blue"><CreditCard size={16} /></div><div><strong>2 payments need verification</strong><span>Bank transfers · LKR 68,400</span></div><button onClick={() => setPage('Payments & Finance')} aria-label="View payment verification"><ChevronRight size={16} /></button></div>}{canApprove && <div className="ai-insight"><div><Sparkles size={15} /><strong>AI business insight</strong><span>Weekend demand is trending 18% higher. Consider reviewing rates for the final week of November.</span></div><button onClick={() => setPage('AI Business Assistant')}>Explore insight <span>→</span></button></div>}</div></section>
  </>
}

function LegacyDashboard({ role, period, setPeriod, pending, arrivals, revenue, reservations, approve, setPage, tasks, setTask }: { role: Role; period: string; setPeriod: (period: string) => void; pending: number; arrivals: number; revenue: number; reservations: Reservation[]; approve: (id: string, status: BookingStatus) => void; setPage: (page: string) => void; tasks: string[]; setTask: (index: number, state: string) => void }) {
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
function PeriodRevenueChart({ values, occupancyValues, labels }: { values: number[]; occupancyValues: number[]; labels: string[] }) {
  const maximum = Math.max(...values, 1)
  const points = values.map((value, index) => {
    const x = values.length === 1 ? 320 : index / (values.length - 1) * 640
    const y = 170 - value / maximum * 140
    return `${x},${y}`
  }).join(' ')
  const areaPoints = values.length ? `0,180 ${points} 640,180` : ''
  const occupancyPoints = occupancyValues.map((value, index) => {
    const x = occupancyValues.length === 1 ? 320 : index / (occupancyValues.length - 1) * 640
    const y = 170 - value / 100 * 140
    return `${x},${y}`
  }).join(' ')

  return <div className="chart-area"><div className="chart-y"><span>{money(maximum)}</span><span>{money(maximum * .75)}</span><span>{money(maximum * .5)}</span><span>{money(maximum * .25)}</span><span>LKR 0</span></div><div className="chart-plot"><div className="chart-gridline" /><div className="chart-gridline" /><div className="chart-gridline" /><div className="chart-gridline" /><svg viewBox="0 0 640 190" preserveAspectRatio="none" role="img" aria-label={`Revenue and monthly occupancy for ${labels.join(', ')}`}><defs><linearGradient id="periodRevenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#172B4D" stopOpacity=".15" /><stop offset="100%" stopColor="#172B4D" stopOpacity="0.01" /></linearGradient></defs><polygon points={areaPoints} fill="url(#periodRevenueFill)" /><polyline points={points} fill="none" stroke="#172B4D" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" /><polyline points={occupancyPoints} fill="none" stroke="#27877D" strokeWidth="2" strokeDasharray="4 4" strokeLinejoin="round" strokeLinecap="round" /></svg><div className="chart-hover"><strong>{labels[labels.length - 1]}</strong><span>{money(values[values.length - 1] || 0)} revenue · {occupancyValues[occupancyValues.length - 1] || 0}% occupancy</span></div></div></div>
}
function PeriodChannelChart({ count, shares }: { count: number; shares: number[] }) {
  const colors = CHANNEL_COLORS
  let cumulative = 0
  const stops = shares.map((share, index) => {
    const start = cumulative
    cumulative += share
    return `${colors[index]} ${start}% ${cumulative}%`
  }).join(', ')
  const style = { background: count ? `conic-gradient(${stops})` : '#E5E9EF' }
  return <div className="donut-wrap"><div className="donut" style={style}><div className="donut-inner"><strong>{count}</strong><span>bookings</span></div></div><div className="donut-total"><small>SELECTED PERIOD</small><strong>{count}</strong><span>reservations</span></div></div>
}
function RevenueChart(){const vals=[42,58,48,68,62,80,67,75,56,88,73,96,68,83,72,91,76,88,64,97,79,92,72,84,66,90,74,98,83,92,70,86,76,96,84,100,73,88,76,94];return <div className="chart-area"><div className="chart-y"><span>120k</span><span>90k</span><span>60k</span><span>30k</span><span>0</span></div><div className="chart-plot"><div className="chart-gridline" /><div className="chart-gridline" /><div className="chart-gridline" /><div className="chart-gridline" /><svg viewBox="0 0 640 190" preserveAspectRatio="none" role="img" aria-label="Revenue and occupancy line chart for June to November"><defs><linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#172B4D" stopOpacity=".15" /><stop offset="100%" stopColor="#172B4D" stopOpacity="0" /></linearGradient></defs><path d="M0 145 C25 140 28 110 50 118 S90 150 108 126 S140 85 160 100 S190 132 210 95 S240 72 258 84 S290 120 310 90 S340 35 360 52 S390 92 408 62 S440 40 458 55 S490 90 510 50 S540 25 558 43 S590 62 608 30 S630 14 640 22 L640 190 L0 190Z" fill="url(#revenueFill)" /><path d="M0 145 C25 140 28 110 50 118 S90 150 108 126 S140 85 160 100 S190 132 210 95 S240 72 258 84 S290 120 310 90 S340 35 360 52 S390 92 408 62 S440 40 458 55 S490 90 510 50 S540 25 558 43 S590 62 608 30 S630 14 640 22" fill="none" stroke="#172B4D" strokeWidth="2.5" strokeLinejoin="round" /><path d="M0 158 C28 148 33 135 52 142 S90 153 108 140 S142 120 160 130 S194 148 210 132 S240 105 258 116 S290 141 310 123 S340 90 360 97 S390 122 408 106 S440 92 458 104 S490 124 510 96 S540 80 558 93 S590 105 608 84 S630 72 640 78" fill="none" stroke="#27877D" strokeWidth="2" strokeDasharray="4 4" strokeLinejoin="round" /></svg><div className="chart-hover"><strong>Nov 14</strong><span>LKR 94,200 · 78% occupancy</span></div></div></div>}
function ChannelChart(){return <div className="donut-wrap"><div className="donut"><div className="donut-inner"><strong>28</strong><span>bookings</span></div></div><div className="donut-total"><small>THIS MONTH</small><strong>28</strong><span>reservations</span></div></div>}


type GuestProfile = {
  name: string
  country: string
  stays: number
  last: string
  segment: string
  email: string
  phone: string
  lifetimeValue: number
  consent: boolean
  rating: number
  preference: string
  reviews?: { date: string; source: string; rating: number; text: string }[]
}

const demoGuests: GuestProfile[] = [
  { name: 'Amelia Hart', country: 'United Kingdom', stays: 3, last: 'Nov 14, 2026', segment: 'Repeat guest', email: 'amelia.hart@example.com', phone: '+44 7911 123456', lifetimeValue: 186400, consent: true, rating: 5, preference: 'Mountain view; late-afternoon tea service.', reviews: [{ date: 'Nov 14, 2026', source: 'Guest feedback · demo', rating: 5, text: 'A peaceful stay with beautiful views and thoughtful afternoon tea. We felt very well looked after.' }] },
  { name: 'Nimal Perera', country: 'Sri Lanka', stays: 2, last: 'Nov 14, 2026', segment: 'Local · Repeat', email: 'nimal.p@example.com', phone: '+94 77 765 4321', lifetimeValue: 102000, consent: true, rating: 5, preference: 'Traditional breakfast with pol sambol.', reviews: [{ date: 'Nov 14, 2026', source: 'Guest feedback · demo', rating: 5, text: 'Warm hospitality, a comfortable room, and a delicious local breakfast. I would happily return.' }] },
  { name: 'Sophie Laurent', country: 'France', stays: 1, last: 'Nov 15, 2026', segment: 'International', email: 'sophie.l@example.com', phone: '+33 6 12 34 56 78', lifetimeValue: 112000, consent: false, rating: 5, preference: 'Extra bed; interested in a tea factory tour.' },
  { name: 'Kavindi Silva', country: 'Sri Lanka', stays: 1, last: 'Nov 15, 2026', segment: 'First-time', email: 'kavindi.s@example.com', phone: '+94 71 888 9900', lifetimeValue: 52000, consent: true, rating: 4, preference: 'Quiet room and a desk for remote work.' },
  { name: 'Oliver Bennett', country: 'Australia', stays: 2, last: 'Nov 18, 2026', segment: 'Repeat guest', email: 'oliver.b@example.com', phone: '+61 412 345 678', lifetimeValue: 174000, consent: false, rating: 5, preference: 'Airport pickup and early check-in when available.' },
  { name: 'Maya Chen', country: 'Singapore', stays: 1, last: 'Nov 23, 2026', segment: 'Family', email: 'maya.chen@example.com', phone: '+65 9123 4567', lifetimeValue: 140000, consent: true, rating: 5, preference: 'Family bedding and infant cot.' },
  { name: 'Daniel Kim', country: 'South Korea', stays: 1, last: 'Nov 25, 2026', segment: 'Solo traveler', email: 'daniel.k@example.com', phone: '+82 10 9876 5432', lifetimeValue: 45600, consent: false, rating: 4, preference: 'Late arrival; heater requested.' },
  { name: 'Ishara Fernando', country: 'Sri Lanka', stays: 4, last: 'Nov 20, 2026', segment: 'Repeat · Local', email: 'ishara.f@example.com', phone: '+94 77 444 5566', lifetimeValue: 268000, consent: true, rating: 5, preference: 'Anniversary arrangement with local flowers.', reviews: [{ date: 'Sep 02, 2026', source: 'Guest feedback · demo', rating: 5, text: 'Our anniversary was made truly special. The personal touches and tea garden setting were wonderful.' }, { date: 'May 18, 2026', source: 'Guest feedback · demo', rating: 5, text: 'Another lovely visit. The staff remembered our preferences and made us feel at home.' }] },
  { name: 'Priya Wijesinghe', country: 'Sri Lanka', stays: 2, last: 'Feb 11, 2026', segment: 'Local · Repeat', email: 'priya.w@example.com', phone: '+94 76 222 3344', lifetimeValue: 136800, consent: true, rating: 5, preference: 'Direct booking; prefers a garden-facing room.' },
  { name: 'Aiden Cole', country: 'United States', stays: 1, last: 'Apr 04, 2026', segment: 'First-time', email: 'aiden.c@example.com', phone: '+1 415 555 0142', lifetimeValue: 78000, consent: false, rating: 4, preference: 'Vegetarian breakfast.' },
  { name: 'Tharushi de Silva', country: 'Sri Lanka', stays: 3, last: 'Jun 12, 2026', segment: 'Repeat · Local', email: 'tharushi.d@example.com', phone: '+94 71 555 1212', lifetimeValue: 205200, consent: true, rating: 5, preference: 'WhatsApp is the preferred contact channel.' },
  { name: 'Elena Rossi', country: 'Italy', stays: 1, last: 'Aug 19, 2026', segment: 'International', email: 'elena.rossi@example.com', phone: '+39 333 555 0123', lifetimeValue: 112000, consent: false, rating: 5, preference: 'Tea tasting and a quiet room.', reviews: [{ date: 'Aug 23, 2026', source: 'Guest feedback · demo', rating: 5, text: 'Loved learning about the local tea and enjoying the quiet surroundings.' }] }
]

function Guests({ reservations }: { reservations: Reservation[] }) {
  const [query, setQuery] = useState('')
  const [segment, setSegment] = useState('All guests')
  const [marketing, setMarketing] = useState('All preferences')
  const [selectedGuest, setSelectedGuest] = useState<GuestProfile | null>(null)

  const matchingGuests = demoGuests.filter(guest => {
    const matchesQuery = `${guest.name} ${guest.email} ${guest.country} ${guest.segment}`.toLowerCase().includes(query.toLowerCase())
    const matchesSegment = segment === 'All guests'
      || (segment === 'Repeat guests' ? guest.stays > 1 : segment === 'First-time guests' ? guest.stays === 1 : guest.segment === segment)
    const matchesMarketing = marketing === 'All preferences'
      || (marketing === 'Subscribed' ? guest.consent : !guest.consent)
    return matchesQuery && matchesSegment && matchesMarketing
  })
  const repeatCount = demoGuests.filter(guest => guest.stays > 1).length
  const subscribedCount = demoGuests.filter(guest => guest.consent).length
  const averageRating = demoGuests.reduce((sum, guest) => sum + guest.rating, 0) / demoGuests.length
  const matchingReservations = selectedGuest
    ? reservations.filter(reservation => reservation.guest === selectedGuest.name)
    : []

  const exportGuests = () => {
    const headers = ['Guest', 'Email', 'Phone', 'Country', 'Stays', 'Lifetime Value (LKR)', 'Last Stay', 'Segment', 'Marketing Consent']
    const rows = matchingGuests.map(guest => [
      guest.name, guest.email, guest.phone, guest.country, guest.stays,
      guest.lifetimeValue, guest.last, guest.segment, guest.consent ? 'Subscribed' : 'Not opted in'
    ])
    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const link = document.createElement('a')
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    link.download = 'villa-tea-fields-guest-directory-demo.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">HOTEL OPERATIONS · GUEST RELATIONSHIPS</p>
        <h1>Guest directory</h1>
        <p className="subheading">Recognize returning guests and tailor every stay with a thoughtful, consistent welcome.</p>
      </div>
      <button className="button secondary" onClick={exportGuests}><Download size={15} /> Export filtered guests</button>
    </div>
    <div className="guest-stats">
      <div><strong>{demoGuests.length}</strong><span>demo guest profiles</span></div>
      <div><strong>{Math.round(repeatCount / demoGuests.length * 100)}%</strong><span>returning guests</span></div>
      <div><strong>{Math.round(subscribedCount / demoGuests.length * 100)}%</strong><span>marketing opt-in</span></div>
      <div><strong>{averageRating.toFixed(1)}<span className="star">★</span></strong><span>average demo rating</span></div>
    </div>
    <section className="card directory-card guest-directory-table">
      <div className="filter-row">
        <label className="table-search"><Search size={16} /><input aria-label="Search guests" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search name, email, country or guest type..." /></label>
        <label className="sr-only" htmlFor="guest-segment">Filter by guest type</label>
        <select id="guest-segment" className="button secondary" value={segment} onChange={event => setSegment(event.target.value)}>
          <option>All guests</option><option>Repeat guests</option><option>First-time guests</option><option>Family</option><option>International</option><option>Solo traveler</option>
        </select>
        <label className="sr-only" htmlFor="guest-marketing">Filter by marketing preference</label>
        <select id="guest-marketing" className="button secondary" value={marketing} onChange={event => setMarketing(event.target.value)}>
          <option>All preferences</option><option>Subscribed</option><option>Not opted in</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>GUEST</th><th>LOCATION</th><th>STAYS</th><th>LIFETIME VALUE</th><th>LAST VISIT</th><th>GUEST TYPE</th><th>MARKETING</th></tr></thead>
          <tbody>{matchingGuests.map(guest => <tr key={guest.name}>
            <td><div className="guest-cell"><div className="guest-avatar">{guest.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div><div><button type="button" className="text-left font-semibold text-[#202939] hover:text-[#27877D]" onClick={() => setSelectedGuest(guest)}>{guest.name}</button><small>{guest.email}</small></div></div></td>
            <td>{guest.country}</td><td>{guest.stays}</td><td>{money(guest.lifetimeValue)}</td><td>{guest.last}</td>
            <td><span className="segment-pill">{guest.segment}</span></td>
            <td><span className={`consent ${guest.consent ? 'yes' : 'no'}`}>{guest.consent ? 'Subscribed' : 'Not opted in'}</span></td>
          </tr>)}</tbody>
        </table>
        {matchingGuests.length === 0 && <div className="p-8 text-center text-[#778196]"><Search size={24} className="mx-auto mb-2" /><strong className="block text-[#202939]">No guests match these filters</strong><span className="text-xs">Try another name, guest type, or marketing preference.</span></div>}
      </div>
      <div className="table-footer"><span>Showing <strong>{matchingGuests.length}</strong> of {demoGuests.length} demo guest profiles</span><span className="text-xs text-[#778196]">Select a guest to view profile details</span></div>
    </section>
    <p className="privacy-note"><ShieldCheck size={14} /> Contact details and marketing preferences are shown for authorized staff only. All displayed profiles are sample demonstration data.</p>
    {selectedGuest && <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" role="presentation" onClick={event => { if (event.target === event.currentTarget) setSelectedGuest(null) }}>
      <section className="guest-profile-modal" role="dialog" aria-modal="true" aria-labelledby="guest-profile-title">
        <header className="guest-profile-header">
          <div className="guest-profile-avatar">{selectedGuest.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</div>
          <div className="guest-profile-identity">
            <p className="eyebrow">GUEST PROFILE <span className="guest-demo-badge">DEMO</span></p>
            <h2 id="guest-profile-title">{selectedGuest.name}</h2>
            <div className="guest-profile-tags"><span className="segment-pill">{selectedGuest.segment}</span><span className={`consent ${selectedGuest.consent ? 'yes' : 'no'}`}>{selectedGuest.consent ? 'Marketing opted in' : 'Marketing not opted in'}</span></div>
          </div>
          <button className="guest-profile-close" aria-label="Close guest profile" onClick={() => setSelectedGuest(null)}><X size={18} /></button>
        </header>
        <div className="guest-profile-content">
          <section className="guest-profile-stats" aria-label="Guest summary">
            <div><strong>{selectedGuest.stays}</strong><span>Completed stays</span></div>
            <div><strong>{money(selectedGuest.lifetimeValue)}</strong><span>Lifetime value · demo</span></div>
            <div><strong>{selectedGuest.rating}.0 <span className="guest-profile-star">★</span></strong><span>Average rating</span></div>
          </section>
          <section className="guest-profile-section">
            <h3>Contact & stay</h3>
            <div className="guest-contact-grid">
              <div><Mail size={15} /><span><small>Email</small><a href={`mailto:${selectedGuest.email}`}>{selectedGuest.email}</a></span></div>
              <div><Phone size={15} /><span><small>Phone</small><a href={`tel:${selectedGuest.phone.replace(/\s/g, '')}`}>{selectedGuest.phone}</a></span></div>
              <div><MapPin size={15} /><span><small>Country</small><strong>{selectedGuest.country}</strong></span></div>
              <div><CalendarDays size={15} /><span><small>Last visit</small><strong>{selectedGuest.last}</strong></span></div>
            </div>
          </section>
          <section className="guest-profile-section">
            <h3>Service preferences</h3>
            <p className="guest-preference">{selectedGuest.preference}</p>
          </section>
          <section className="guest-profile-section">
            <div className="guest-section-heading"><h3>Guest reviews</h3><span>{selectedGuest.reviews?.length || 0}</span></div>
            {selectedGuest.reviews?.length ? <div className="guest-reviews">{selectedGuest.reviews.map((review, index) => <article className="guest-review" key={`${review.date}-${index}`}>
              <div className="guest-review-top"><span className="guest-review-stars" aria-label={`${review.rating} out of 5 stars`}>{'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span></span><time>{review.date}</time></div>
              <p>“{review.text}”</p><small>{review.source}</small>
            </article>)}</div> : <p className="guest-empty-review">No guest review has been recorded for this profile yet.</p>}
          </section>
          <section className="guest-profile-section">
            <div className="guest-section-heading"><h3>Reservation history</h3><span>{matchingReservations.length}</span></div>
            {matchingReservations.length ? <ul className="guest-reservation-list">{matchingReservations.map(reservation => <li key={reservation.id}>
              <span className="guest-reservation-icon"><Hotel size={15} /></span>
              <span className="guest-reservation-info"><strong>{reservation.room}</strong><small>{reservation.checkIn} – {reservation.checkOut}</small></span>
              <span className={`status-badge ${reservation.status.toLowerCase().replaceAll(' ', '-')}`}><i />{reservation.status}</span>
            </li>)}</ul> : <p className="guest-empty-review">No reservation linked in the current demo records.</p>}
          </section>
        </div>
        <footer className="guest-profile-footer"><ShieldCheck size={14} /><span>Guest details and preferences are visible to authorized staff only.</span><button onClick={() => setSelectedGuest(null)}>Done</button></footer>
      </section>
    </div>}
  </>
}

function Operations({role, tasks, setTask, notify}:{role:Role;tasks:string[];setTask:(index:number,state:string)=>void;notify:(message:string)=>void}){const [tab,setTab]=useState('Housekeeping');return <><div className="page-heading"><div><p className="eyebrow">HOTEL OPERATIONS</p><h1>{role === 'Housekeeper' ? 'My tasks' : tab === 'Housekeeping' ? 'Daily operations' : 'Staff & tasks'}</h1><p className="subheading">Coordinate the small details that make every stay special.</p></div><button className="button primary" onClick={() => notify('Task form is ready for manager assignment')}><Plus size={16} /> Assign task</button></div><div className="segment-tabs"><button className={tab === 'Housekeeping' ? 'selected' : ''} onClick={() => setTab('Housekeeping')}>Housekeeping <span>3</span></button><button className={tab === 'Guest requests' ? 'selected' : ''} onClick={() => setTab('Guest requests')}>Guest requests <span>2</span></button><button className={tab === 'Breakfast' ? 'selected' : ''} onClick={() => setTab('Breakfast')}>Breakfast <span>Today</span></button><button className={tab === 'Staff' ? 'selected' : ''} onClick={() => setTab('Staff')}>Team <span>5</span></button></div>{tab === 'Housekeeping' ? <div className="ops-layout"><div className="card task-board"><div className="card-heading"><div><h2>Housekeeping board</h2><p>Saturday, November 14 · 3 room tasks</p></div><button className="button secondary"><Filter size={14} /> Filter</button></div>{['Room 03 · Departure clean', 'Room 01 · Guest arrival prep', 'Room 02 · Evening turndown'].map((title, index) => <article className="task-row" key={title}><button className={`task-check ${tasks[index] === 'Completed' ? 'checked' : ''}`} aria-label={`Mark ${title} complete`} onClick={() => setTask(index, tasks[index] === 'Completed' ? 'Pending' : 'Completed')}>{tasks[index] === 'Completed' && <Check size={14} />}</button><div className="task-main"><strong>{title}</strong><span>{index === 0 ? 'Checkout clean · full checklist' : index === 1 ? 'Guest arrival at 2:00 PM' : 'Requested by guest · today'}</span><div className="task-meta"><span className={`priority ${index === 0 ? 'high' : 'normal'}`}>{index === 0 ? 'High priority' : 'Standard'}</span><span>Due {index === 0 ? '11:30 AM' : index === 1 ? '1:00 PM' : '4:00 PM'}</span></div></div><div className="task-assignee"><div className="tiny-avatar">{index === 1 ? 'LF' : 'SS'}</div><span>{index === 1 ? 'Lakmali' : 'Sewwandi'}</span></div><select value={tasks[index] ?? 'Pending'} onChange={event => setTask(index, event.target.value)} aria-label={`Status for ${title}`}><option>Pending</option><option>In progress</option><option>Inspection required</option><option>Completed</option></select></article>)}</div><aside className="card ops-side"><div className="card-heading"><div><h2>Today’s arrivals</h2><p>2 guests checking in</p></div></div><div className="arrival-person"><div className="guest-avatar">NP</div><div><strong>Nimal Perera</strong><span>Room 01 · 2 guests</span></div><span className="arrival-time">2:00 PM</span></div><div className="arrival-person"><div className="guest-avatar">SL</div><div><strong>Sophie Laurent</strong><span>Room 04 · 3 guests</span></div><span className="arrival-time">Tomorrow</span></div><div className="breakfast-note"><span className="breakfast-icon">☕</span><div><strong>Breakfast preparation</strong><span>5 guests · 2 dietary notes</span><button onClick={() => setTab('Breakfast')}>View breakfast plan →</button></div></div><div className="ops-alert"><strong>Maintenance update</strong><span>Room 04 · bathroom tap · Medium priority</span><button onClick={() => notify('Issue assigned to the manager')}>View issue →</button></div></aside></div> : <div className="ops-placeholder card">{tab === 'Guest requests' ? <><MessageCircle size={24} /><h2>Guest requests</h2><p>2 open requests · one extra blanket for Room 02 and an early breakfast for Room 04.</p><button className="button primary" onClick={() => notify('Guest request marked as complete')}>Mark first request complete</button></> : tab === 'Breakfast' ? <><div className="breakfast-big">☕</div><h2>Breakfast coordination</h2><p>Complimentary breakfast · 5 expected guests this morning.</p><p>Room 01 · 2 guests · Room 02 · 2 guests · Room 04 · 1 guest</p><button className="button primary" onClick={() => notify('Breakfast preparation marked as ready')}>Mark preparation ready</button></> : <><Users size={24} /><h2>Villa Tea Fields team</h2>{staff.map(person => <div className="staff-row" key={person.name}><div className="tiny-avatar">{person.initials}</div><strong>{person.name}</strong><span>{person.role}</span></div>)}</>}</div>}</>}
function Housekeeper({tasks, setTask}:{tasks:string[];setTask:(index:number,state:string)=>void}){return <div className="housekeeper-view"><div className="housekeeper-banner"><div><span>YOUR SHIFT · 7:00 AM – 3:00 PM</span><strong>Ready to make someone&apos;s stay?</strong><p>You have 3 room preparations on your list today.</p></div><div className="task-progress"><div><strong>{tasks.filter(task => task === 'Completed').length}/3</strong><span>tasks complete</span></div><div className="progress-track"><i style={{ width: `${tasks.filter(task => task === 'Completed').length * 33.3}%` }} /></div></div></div><h2 className="mobile-section-title">Your room tasks</h2>{['Room 03 · Departure clean', 'Room 01 · Guest arrival prep', 'Room 02 · Evening turndown'].map((title, index) => <article className="card mobile-task" key={title}><div className="mobile-task-top"><span className={`priority ${index === 0 ? 'high' : 'normal'}`}>{index === 0 ? 'HIGH PRIORITY' : 'STANDARD'}</span><span>Due {index === 0 ? '11:30 AM' : index === 1 ? '1:00 PM' : '4:00 PM'}</span></div><h3>{title}</h3><p>{index === 0 ? 'Full room reset after guest departure' : index === 1 ? 'Prepare room before 2:00 PM check-in' : 'Refresh room amenities for current guest'}</p>{tasks[index] === 'Pending' ? <button className="button primary full-button" onClick={() => setTask(index, 'In progress')}>Start cleaning <ChevronRight size={15} /></button> : tasks[index] === 'In progress' ? <div className="checklist"><label><input type="checkbox" /> Change bed linen</label><label><input type="checkbox" /> Clean bathroom</label><label><input type="checkbox" /> Restock amenities</label><label><input type="checkbox" /> Final room check</label><button className="button primary full-button" onClick={() => setTask(index, 'Inspection required')}>Submit for inspection <Check size={15} /></button></div> : tasks[index] === 'Inspection required' ? <div className="inspection-msg"><ClipboardCheck size={15} /> Waiting for manager inspection</div> : <div className="completed-msg"><Check size={15} /> Room marked complete</div>}</article>)}</div>}

function Marketing({page, notify}:{page:string;notify:(message:string)=>void}){const [percent,setPercent]=useState(20);return <><div className="page-heading"><div><p className="eyebrow">BUSINESS MANAGEMENT</p><h1>{page}</h1><p className="subheading">Build guest relationships and grow direct bookings.</p></div><button className="button primary" onClick={() => notify('Campaign draft created')}><Plus size={16} /> New campaign</button></div><div className="stats-grid"><Stat icon={<TrendingUp />} label="DIRECT BOOKINGS" value="42%" change="8.4%" note="vs. last month" tone="green" /><Stat icon={<Users />} label="REPEAT GUESTS" value="32%" change="4.2%" note="186 guest profiles" tone="sand" /><Stat icon={<Wallet />} label="COMMISSION PAID" value="LKR 184k" note="This month · estimated" tone="blue" /><Stat icon={<MessageCircle />} label="GUEST RATING" value="4.8 / 5" note="Across 42 reviews" tone="purple" /></div><div className="marketing-grid"><section className="card channel-analysis"><div className="card-heading"><div><h2>Channel performance</h2><p>Compare bookings, gross revenue and commission</p></div><button className="button secondary">This month <ChevronDown size={14} /></button></div>{[['Direct · Website', 12, 'LKR 486,000', 'LKR 0'], ['WhatsApp & phone', 9, 'LKR 342,000', 'LKR 0'], ['Booking.com', 8, 'LKR 392,000', 'LKR 58,800'], ['Airbnb', 5, 'LKR 224,000', 'LKR 33,600'], ['Agoda & other', 4, 'LKR 182,000', 'LKR 27,300']].map((row, index) => <div className="channel-row" key={String(row[0])}><span className="channel-rank">0{index + 1}</span><strong>{row[0]}</strong><div className="channel-bar"><i style={{ width: `${[84, 62, 58, 43, 34][index]}%` }} /></div><span>{row[1]} bookings</span><strong>{row[2]}</strong><span className="commission-value">{row[3]}</span></div>)}</section><aside className="card savings-calculator"><div className="calc-icon"><TrendingUp size={18} /></div><p className="eyebrow">REVENUE CALCULATOR</p><h2>What if more guests booked direct?</h2><p>Estimate the commission savings by shifting bookings to direct channels.</p><label className="calc-slider-label">Convert <strong>{percent}%</strong> of OTA bookings</label><input className="savings-slider" type="range" min="0" max="50" value={percent} onChange={event => setPercent(Number(event.target.value))} /><div className="calc-result"><span>Potential monthly savings</span><strong>LKR {Math.round(184600 * percent / 100).toLocaleString()}</strong></div><small className="muted-note">Estimated based on current channel mix.</small></aside></div><section className="card campaign-card"><div className="card-heading"><div><h2>Active campaigns</h2><p>Active promotional offers and campaigns</p></div><button className="text-button" onClick={() => notify('All campaigns opened')}>View all <ChevronRight size={14} /></button></div><div className="campaign-row"><div className="campaign-symbol">✳</div><div><strong>Tea Country, Your Way</strong><span>Repeat guests · Direct booking · 10% offer</span></div><span className="campaign-status">Active · Nov 01 – Dec 15</span><button className="subtle-icon" onClick={() => notify('Campaign details opened')} aria-label="Campaign details"><MoreHorizontal size={17} /></button></div></section></>}

function Insights({page, revenue, reservations, notify}:{page:string;revenue:number;reservations:Reservation[];notify:(message:string)=>void}){const [prompt,setPrompt]=useState('');const [answer,setAnswer]=useState('');const [approved,setApproved]=useState(false);const isAi=page==='AI Business Assistant';const ask=()=>{if(!prompt.trim())return;const lower=prompt.toLowerCase();const response=lower.includes('commission')?'Booking platforms generated an estimated LKR 184,600 in commission this month. Direct bookings represented 42% of reservations, avoiding approximately LKR 36,920 in fees compared with a 20% channel shift.':lower.includes('channel')?'Direct channels generated the highest net revenue this month at LKR 828,000 across 21 reservations. Booking.com contributed LKR 333,200 net after estimated commission.':lower.includes('repeat')?'32% of your guest profiles are repeat visitors. Four repeat stays are scheduled this month, representing LKR 312,000 in booking value.':`Villa Tea Fields has collected ${money(revenue)} across ${reservations.length} active and upcoming reservations. Occupancy is tracking at 75%, with ${reservations.filter(item => item.status === 'Pending Approval').length} booking requests awaiting owner review.`;setAnswer(response)};return <><div className="page-heading"><div><p className="eyebrow">INTELLIGENCE</p><h1>{isAi ? 'AI Business Assistant' : 'Reports & analytics'}</h1><p className="subheading">{isAi ? 'Ask your hotel data a question, or explore a decision-ready insight.' : 'One source of truth for operational, tactical and strategic decisions.'}</p></div><button className="button secondary" onClick={() => notify('Report exported successfully')}><Download size={15} /> Export report</button></div>{isAi ? <><div className="ai-banner"><div className="ai-orb"><Sparkles size={24} /></div><div><span>AI ASSISTANT</span><h2>A clearer view of your business starts with a question.</h2><p>Operational insights and recommendations based on current property records.</p></div></div><div className="ai-workspace"><section className="card ask-card"><div className="card-heading"><div><h2>Ask your data</h2><p>Try a suggested question or ask your own.</p></div><span className="read-only-label"><ShieldCheck size={13} /> ACTIVE</span></div><div className="suggestion-chips">{['How did we perform this month?', 'Which channel has highest net revenue?', 'How much commission did we pay?', 'How many guests are repeat customers?'].map(text => <button key={text} onClick={() => { setPrompt(text); setAnswer('') }}>{text}<ChevronRight size={13} /></button>)}</div>{answer && <div className="answer-card"><div className="answer-title"><span><Sparkles size={14} /></span><strong>Business summary</strong><small>Based on current property records</small></div><p>{answer}</p><div className="answer-foot"><span>Data range · November 2026</span><button onClick={() => notify('Supporting report opened')}>View supporting report <ChevronRight size={13} /></button></div></div>}<div className="ask-input"><input placeholder="Ask a question about your hotel..." value={prompt} onChange={event => setPrompt(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing && event.keyCode !== 229) ask() }} /><button aria-label="Ask assistant" onClick={ask}><ArrowUpRight size={17} /></button></div></section><aside className="card pricing-card"><span className="pricing-label"><TrendingUp size={14} /> PRICING SUGGESTION</span><h2>Weekend demand is rising</h2><p>Current occupancy and the November trend suggest higher weekend demand than usual.</p><div className="rate-compare"><div><span>ROOM 01 · CURRENT</span><strong>LKR 22,800</strong></div><ArrowUpRight size={17} /><div><span>SUGGESTED RATE</span><strong>LKR 25,000</strong></div></div><div className="impact-note"><Sparkles size={14} /><span>Suggested +9.6% for Nov 27–29. Potential revenue lift: LKR 17,600.</span></div><div className="pricing-actions"><button className="button secondary" onClick={() => { setApproved(false); notify('Pricing suggestion dismissed') }}>Dismiss</button><button className={`button ${approved ? 'secondary' : 'primary'}`} onClick={() => { setApproved(true); notify('Rate change submitted for owner review') }}>{approved ? 'Sent for review' : 'Review suggestion'}</button></div><small className="muted-note">Rates never change automatically. Owner approval required.</small></aside></div><div className="ai-bottom-grid"><div className="card insight-list"><div className="card-heading"><div><h2>AI-generated insights</h2><p>Suggestions for your review</p></div></div>{['Direct bookings grew 8.4% this month, lowering reliance on platform commissions.', 'Two bank transfers are pending verification. Review before guest departure.', 'Four repeat guests are scheduled this month — consider a personalized welcome.'].map((text, index) => <div className="insight-item" key={text}><span className={`insight-number insight-${index}`}>0{index + 1}</span><p>{text}</p><button className="text-button" onClick={() => notify('Insight opened')}>Explore <ChevronRight size={13} /></button></div>)}</div><div className="card sentiment-card"><div className="card-heading"><div><h2>Guest sentiment</h2><p>Recent review themes</p></div></div><div className="sentiment-score"><strong>4.8</strong><span> / 5.0</span><small>from 42 reviews</small></div>{[['Staff service', '96%'], ['Cleanliness', '91%'], ['Breakfast', '88%'], ['Room comfort', '82%']].map(([label, value]) => <div className="sentiment-row" key={label}><span>{label}</span><div><i style={{ width: value }} /></div><strong>{value}</strong></div>)}</div></div></> : <><div className="segment-tabs"><button className="selected">Overview</button><button>Reservations</button><button>Financial</button><button>Operations</button><button>Marketing</button></div><div className="stats-grid"><Stat icon={<Wallet />} label="REVENUE COLLECTED" value={money(revenue)} change="8.2%" note="vs. previous period" tone="green" /><Stat icon={<Hotel />} label="AVERAGE OCCUPANCY" value="68%" change="12.5%" note="vs. previous period" tone="sand" /><Stat icon={<Users />} label="REPEAT GUESTS" value="32%" change="4.2%" note="of guest profiles" tone="blue" /><Stat icon={<CalendarDays />} label="RESERVATIONS" value="28" note="This month" tone="purple" /></div><div className="report-grid"><section className="card trend-card"><div className="card-heading"><div><h2>Revenue performance</h2><p>Monthly revenue · LKR</p></div><button className="button secondary">2026 <ChevronDown size={14} /></button></div><RevenueChart /><div className="chart-months"><span>JUN</span><span>JUL</span><span>AUG</span><span>SEP</span><span>OCT</span><span>NOV</span></div></section><section className="card report-breakdown"><div className="card-heading"><div><h2>Management reports</h2><p>Detailed reports across management scopes</p></div></div>{[['Operational', 'Arrivals, tasks & room readiness'], ['Tactical', 'Monthly occupancy & channel trends'], ['Strategic', 'Seasonal demand & direct growth']].map(([label, desc], index) => <button className="report-level" key={label} onClick={() => notify(`${label} report opened`)}><span className={`level-number level-${index}`}>0{index + 1}</span><span><strong>{label}</strong><small>{desc}</small></span><ChevronRight size={16} /></button>)}</section></div><section className="card report-table"><div className="card-heading"><div><h2>Reservation performance</h2><p>Underlying records for this period</p></div><button className="text-button">View reservations <ChevronRight size={14} /></button></div><div className="table-wrap"><table><thead><tr><th>RESERVATION</th><th>GUEST</th><th>SOURCE</th><th>BOOKING VALUE</th><th>PAID</th><th>STATUS</th></tr></thead><tbody>{reservations.slice(0, 5).map(item => <tr key={item.id}><td className="id-text">{item.id}</td><td>{item.guest}</td><td>{item.source}</td><td>{money(item.total)}</td><td>{money(item.paid)}</td><td><StatusBadge status={item.status} /></td></tr>)}</tbody></table></div></section></>}</>}

function Audit(){return <><div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>Audit log</h1><p className="subheading">A shared history of the important decisions and actions.</p></div><button className="button secondary"><Download size={15} /> Export log</button></div><div className="card audit-card"><div className="audit-item"><div className="audit-icon green"><Check size={16} /></div><div><strong>Payment verified</strong><span>Bank transfer for reservation VT-2482 verified.</span></div><small>Anushka Senanayake · Owner</small><time>Today, 9:42 AM</time></div><div className="audit-item"><div className="audit-icon gold"><CalendarDays size={16} /></div><div><strong>Reservation approved</strong><span>VT-2481 · Amelia Hart · Room 02.</span></div><small>Anushka Senanayake · Owner</small><time>Today, 8:16 AM</time></div><div className="audit-item"><div className="audit-icon blue"><ClipboardCheck size={16} /></div><div><strong>Room status updated</strong><span>Room 03 marked ready for inspection.</span></div><small>Sewwandi Silva · Housekeeper</small><time>Today, 8:02 AM</time></div><div className="audit-item"><div className="audit-icon rose"><Users size={16} /></div><div><strong>Guest preference updated</strong><span>Dietary preference added to guest profile.</span></div><small>Mira Jayasinghe · Manager</small><time>Yesterday, 4:38 PM</time></div><div className="audit-item"><div className="audit-icon gold"><CreditCard size={16} /></div><div><strong>Refund request submitted</strong><span>VT-2470 · LKR 12,000 · pending owner approval.</span></div><small>Mira Jayasinghe · Manager</small><time>Yesterday, 2:12 PM</time></div></div></>}
function SettingsView({notify}:{notify:(message:string)=>void}){return <><div className="page-heading"><div><p className="eyebrow">ADMINISTRATION</p><h1>Settings</h1><p className="subheading">Configure your property policies and team preferences.</p></div><button className="button primary" onClick={() => notify('Settings saved')}>Save changes</button></div><div className="settings-layout"><nav className="card settings-menu">{['Hotel information', 'Room configurations', 'Pricing & seasons', 'Booking policies', 'Payments & deposits', 'Notifications', 'Users & roles', 'Marketing consent'].map((label, index) => <button className={index === 0 ? 'selected' : ''} key={label}><span>{label}</span><ChevronRight size={15} /></button>)}</nav><section className="card settings-panel"><div className="card-heading"><div><h2>Hotel information</h2><p>Core information used across your management system.</p></div></div><div className="settings-fields"><label className="form-field">Property name<input defaultValue="Villa Tea Fields" /></label><label className="form-field">Location<input defaultValue="Nuwara Eliya, Sri Lanka" /></label><label className="form-field">Property type<select defaultValue="Boutique bed & breakfast"><option>Boutique bed & breakfast</option><option>Guesthouse</option></select></label><label className="form-field">Currency<select defaultValue="LKR · Sri Lankan Rupee"><option>LKR · Sri Lankan Rupee</option></select></label><div className="setting-note"><ShieldCheck size={16} /><span>Policies such as deposits and cancellation terms are configurable. No unconfirmed rules are applied by default.</span></div></div><button className="button primary" onClick={() => notify('Property settings saved')}>Save changes</button></section></div></>}
function Knowledge(){const [search,setSearch]=useState('');const articles=[['Room preparation checklist','Housekeeping · SOP','A room-by-room checklist to ensure a comfortable, consistent arrival experience.'],['Guest check-in procedure','Front desk · SOP','How to welcome guests, verify booking details and share relevant property information.'],['Breakfast preparation guidelines','Breakfast · Operations','Prepare the complimentary breakfast service around guest counts and dietary notes.'],['Maintenance reporting','Operations · SOP','Record an issue, its location and priority so the team can follow up.'],['Guest check-out procedure','Front desk · SOP','Close out the stay, confirm any remaining balance and create a cleaning task.']].filter(article=>article.join(' ').toLowerCase().includes(search.toLowerCase()));return <><div className="page-heading"><div><p className="eyebrow">TEAM KNOWLEDGE</p><h1>Knowledge center</h1><p className="subheading">Practical guides, procedures and institutional knowledge in one place.</p></div><button className="button primary"><Plus size={15} /> Add article</button></div><label className="knowledge-search"><Search size={17} /><input placeholder="Search procedures, guides and team notes..." value={search} onChange={event => setSearch(event.target.value)} /><kbd>⌘ K</kbd></label><div className="knowledge-categories"><button className="selected">All articles <span>12</span></button><button>Housekeeping</button><button>Guest services</button><button>Breakfast</button><button>Maintenance</button><button>Business knowledge</button></div><div className="knowledge-grid">{articles.map((article, index) => <button className="card knowledge-card" key={article[0]}><div className={`knowledge-icon knowledge-${index % 4}`}>{index === 0 ? <ClipboardCheck size={18} /> : index === 1 ? <Users size={18} /> : index === 2 ? <Activity size={18} /> : <FileText size={18} />}</div><span>{article[1]}</span><h2>{article[0]}</h2><p>{article[2]}</p><div>Read article <ChevronRight size={14} /></div></button>)}</div></>}
