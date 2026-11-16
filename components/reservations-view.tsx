'use client'

import React, { useEffect, useState, useMemo } from 'react'
import {
  CalendarDays, Plus, Search, Filter, Download, ChevronRight, ChevronLeft,
  X, Check, AlertCircle, Clock, CreditCard, FileText, Printer, Send,
  ShieldCheck, RefreshCw, Eye, Edit3, Trash2, Calendar, Phone, Mail,
  User, CheckCircle2, DollarSign, Ban, ArrowUpRight, BedDouble, Info,
  Sparkles
} from 'lucide-react'

export type Role = 'Owner' | 'Manager' | 'Deputy Manager' | 'Housekeeper'
export type BookingStatus = 'Pending Approval' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'
export type PaymentStatus = 'Paid' | 'Partially Paid' | 'Unpaid' | 'Refunded'
export type PaymentMethod = 'Bank Transfer' | 'Credit Card' | 'Cash' | 'Online Gateway'

export interface PaymentRecord {
  id: string
  amount: number
  date: string
  method: PaymentMethod
  receiptNumber: string
  reference?: string
  isRefund?: boolean
}

export interface ReservationAuditLog {
  id: string
  timestamp: string
  action: string
  performedBy: string
  note: string
}

export interface Reservation {
  id: string
  guest: string
  guestEmail: string
  guestPhone: string
  room: string
  checkIn: string
  checkOut: string
  guests: number
  source: string
  total: number
  paid: number
  status: BookingStatus
  ratePerNight: number
  specialRequests?: string
  paymentStatus: PaymentStatus
  payments: PaymentRecord[]
  history: ReservationAuditLog[]
  cancellationReason?: string
  cancelledAt?: string
  reminderSent?: boolean
  reminderSentAt?: string
}

export interface RoomInfo {
  name: string
  type: string
  rate: number
  capacity: number
  status: 'Available' | 'Occupied' | 'Reserved' | 'Maintenance'
}

export const ROOM_DATA: RoomInfo[] = [
  { name: 'Room 01', type: 'Deluxe Tea Garden Room', rate: 22800, capacity: 2, status: 'Occupied' },
  { name: 'Room 02', type: 'Planter\'s Mountain View', rate: 22800, capacity: 2, status: 'Occupied' },
  { name: 'Room 03', type: 'Highland Heritage Suite', rate: 26000, capacity: 3, status: 'Available' },
  { name: 'Room 04', type: 'Valley View Master Room', rate: 28000, capacity: 4, status: 'Reserved' },
]

export const money = (amount: number) => `LKR ${Number(amount || 0).toLocaleString('en-LK')}`

interface ReservationsViewProps {
  reservations: Reservation[]
  onUpdateReservations: (updater: (prev: Reservation[]) => Reservation[]) => void
  role: Role
  notify: (msg: string) => void
  openCreateRequest: boolean
  onCreateRequestOpened: () => void
  /** Live room catalogue (rates, names) from the Rooms module. Falls back to ROOM_DATA. */
  roomCatalog?: RoomInfo[]
  /** When set, opens this reservation's details (e.g. when navigating from the Room calendar). */
  focusReservationId?: string | null
  onFocusReservationHandled?: () => void
}

export function ReservationsView({
  reservations,
  onUpdateReservations,
  role,
  notify,
  openCreateRequest,
  onCreateRequestOpened,
  roomCatalog,
  focusReservationId,
  onFocusReservationHandled
}: ReservationsViewProps) {
  const roomList = roomCatalog ?? ROOM_DATA
  // Navigation tabs within Reservations
  const [activeTab, setActiveTab] = useState<'table' | 'availability' | 'reports'>('table')

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('All statuses')
  const [roomFilter, setRoomFilter] = useState<string>('All rooms')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming'>('all')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [modalMode, setModalMode] = useState<'details' | 'edit' | 'cancel' | 'payment' | 'voucher' | 'receipt' | null>(null)
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null)

  // Block room state
  const [blockedRooms, setBlockedRooms] = useState<Array<{ room: string; startDate: string; endDate: string; reason: string }>>([
    { room: 'Room 03', startDate: '2026-11-28', endDate: '2026-11-30', reason: 'Annual Tea Terrace Renovation' }
  ])
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [newBlock, setNewBlock] = useState({ room: 'Room 01', startDate: '2026-12-01', endDate: '2026-12-03', reason: 'Deep Sanitization' })

  // Form states for New / Edit Booking
  const [formData, setFormData] = useState({
    guest: '',
    guestEmail: '',
    guestPhone: '',
    room: 'Room 01',
    checkIn: '2026-11-18',
    checkOut: '2026-11-20',
    guests: 2,
    source: 'Direct · Website',
    specialRequests: '',
    initialPaid: 0,
    paymentMethod: 'Credit Card' as PaymentMethod
  })

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer')
  const [paymentRef, setPaymentRef] = useState('')

  // Cancellation form state
  const [cancellationReason, setCancellationReason] = useState('Change of travel plans')

  // Permission checks
  const isOwner = role === 'Owner'
  const isManager = role === 'Manager'
  const isDeputyManager = role === 'Deputy Manager'
  const isHousekeeper = role === 'Housekeeper'

  const canApprove = isOwner || isManager
  const canModify = isOwner || isManager || isDeputyManager
  const canCancel = isOwner || isManager
  const canRecordPayment = !isHousekeeper
  const canCreateReservation = !isHousekeeper
  const canBlockRooms = isOwner || isManager
  const canViewFinancials = !isHousekeeper
  const canViewReports = isOwner || isManager
  const canExport = !isHousekeeper

  useEffect(() => {
    if (openCreateRequest && canCreateReservation) {
      setShowCreateModal(true)
      onCreateRequestOpened()
    }
  }, [openCreateRequest, canCreateReservation, onCreateRequestOpened])

  useEffect(() => {
    if (!focusReservationId) return
    const target = reservations.find(item => item.id === focusReservationId)
    if (target) {
      setActiveTab('table')
      setSelectedReservation(target)
      setModalMode('details')
    }
    onFocusReservationHandled?.()
  }, [focusReservationId, reservations, onFocusReservationHandled])

  // Switch tab back if role does not have report access
  React.useEffect(() => {
    if (!canViewReports && activeTab === 'reports') {
      setActiveTab('table')
    }
  }, [canViewReports, activeTab])

  // Availability conflict checker
  const checkConflict = (targetRoom: string, checkIn: string, checkOut: string, excludeId?: string) => {
    // Check against other reservations
    const hasReservationConflict = reservations.some(item => {
      if (item.id === excludeId) return false
      if (item.room !== targetRoom) return false
      if (['Cancelled', 'Checked Out'].includes(item.status)) return false
      return checkIn < item.checkOut && checkOut > item.checkIn
    })

    // Check against blocked dates
    const hasBlockConflict = blockedRooms.some(block => {
      if (block.room !== targetRoom) return false
      return checkIn < block.endDate && checkOut > block.startDate
    })

    return hasReservationConflict || hasBlockConflict
  }

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter(item => {
      const matchesQuery = `${item.id} ${item.guest} ${item.guestEmail} ${item.room} ${item.source}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'All statuses' || item.status === statusFilter
      const matchesRoom = roomFilter === 'All rooms' || item.room === roomFilter

      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = item.checkIn === '2026-11-14' || item.checkOut === '2026-11-14'
      } else if (dateFilter === 'upcoming') {
        matchesDate = item.checkIn >= '2026-11-14' && !['Cancelled', 'Checked Out'].includes(item.status)
      }

      return matchesQuery && matchesStatus && matchesRoom && matchesDate
    })
  }, [reservations, searchQuery, statusFilter, roomFilter, dateFilter])

  // Statistics
  const stats = useMemo(() => {
    const total = reservations.length
    const pending = reservations.filter(r => r.status === 'Pending Approval').length
    const confirmed = reservations.filter(r => ['Confirmed', 'Checked In'].includes(r.status)).length
    const cancelled = reservations.filter(r => r.status === 'Cancelled').length
    const totalRevenue = reservations.filter(r => r.status !== 'Cancelled').reduce((sum, r) => sum + r.paid, 0)
    const totalExpected = reservations.filter(r => r.status !== 'Cancelled').reduce((sum, r) => sum + r.total, 0)
    const outstanding = Math.max(0, totalExpected - totalRevenue)
    const arrivingToday = reservations.filter(r => r.checkIn === '2026-11-14' && r.status !== 'Cancelled').length

    return { total, pending, confirmed, cancelled, totalRevenue, outstanding, arrivingToday }
  }, [reservations])

  // Handlers
  const handleApprove = (id: string, newStatus: BookingStatus) => {
    onUpdateReservations(current =>
      current.map(item => {
        if (item.id !== id) return item
        const actionLabel = newStatus === 'Confirmed' ? 'Approved' : 'Rejected / Cancelled'
        const newLog: ReservationAuditLog = {
          id: `LOG-${Date.now()}`,
          timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
          action: actionLabel,
          performedBy: `${role} (${role === 'Owner' ? 'Anushka S.' : 'Mira J.'})`,
          note: `Reservation ${newStatus.toLowerCase()} via quick action.`
        }
        return {
          ...item,
          status: newStatus,
          history: [newLog, ...(item.history || [])]
        }
      })
    )
    notify(`Reservation ${id} has been ${newStatus === 'Confirmed' ? 'confirmed · confirmation alert sent to guest' : 'declined'}`)
  }

  // Create new reservation
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.guest.trim()) {
      notify('Please enter guest name')
      return
    }
    if (formData.checkOut <= formData.checkIn) {
      notify('Check-out date must be after check-in date')
      return
    }

    // Double-booking check
    if (checkConflict(formData.room, formData.checkIn, formData.checkOut)) {
      notify(`Collision Alert: ${formData.room} is already booked or blocked for those dates!`)
      return
    }

    const roomDetails = roomList.find(r => r.name === formData.room) || roomList[0]
    const checkInDate = new Date(formData.checkIn)
    const checkOutDate = new Date(formData.checkOut)
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
    const total = nights * roomDetails.rate
    const paid = Math.min(total, Number(formData.initialPaid) || 0)
    const paymentStatus: PaymentStatus = paid >= total ? 'Paid' : paid > 0 ? 'Partially Paid' : 'Unpaid'

    const newId = `VT-${2490 + reservations.length}`
    const paymentsList: PaymentRecord[] = paid > 0 ? [{
      id: `PAY-${Date.now()}`,
      amount: paid,
      date: new Date().toISOString().split('T')[0],
      method: formData.paymentMethod,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      reference: 'Initial Deposit / Advance'
    }] : []

    const initialLog: ReservationAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      action: 'Created',
      performedBy: `${role} (${role === 'Owner' ? 'Anushka S.' : 'Front Desk'})`,
      note: `New booking request created for ${formData.guest} (${nights} nights, ${formData.room}).`
    }

    const newReservation: Reservation = {
      id: newId,
      guest: formData.guest,
      guestEmail: formData.guestEmail || `${formData.guest.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      guestPhone: formData.guestPhone || '+94 77 123 4567',
      room: formData.room,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: Number(formData.guests),
      source: formData.source,
      total,
      paid,
      status: 'Pending Approval',
      ratePerNight: roomDetails.rate,
      specialRequests: formData.specialRequests,
      paymentStatus,
      payments: paymentsList,
      history: [initialLog],
      reminderSent: false
    }

    onUpdateReservations(current => [newReservation, ...current])
    setShowCreateModal(false)
    // Reset
    setFormData({
      guest: '',
      guestEmail: '',
      guestPhone: '',
      room: 'Room 01',
      checkIn: '2026-11-18',
      checkOut: '2026-11-20',
      guests: 2,
      source: 'Direct · Website',
      specialRequests: '',
      initialPaid: 0,
      paymentMethod: 'Credit Card'
    })
    notify(`Reservation ${newId} created · Pending Owner approval`)
  }

  // Edit reservation
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReservation) return

    if (formData.checkOut <= formData.checkIn) {
      notify('Check-out date must be after check-in date')
      return
    }

    // Verify availability excluding current booking
    if (checkConflict(formData.room, formData.checkIn, formData.checkOut, selectedReservation.id)) {
      notify(`Collision Alert: ${formData.room} is not available for those dates!`)
      return
    }

    const roomDetails = roomList.find(r => r.name === formData.room) || roomList[0]
    const checkInDate = new Date(formData.checkIn)
    const checkOutDate = new Date(formData.checkOut)
    const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)))
    const newTotal = nights * roomDetails.rate
    const newPaymentStatus: PaymentStatus = selectedReservation.paid >= newTotal
      ? 'Paid'
      : selectedReservation.paid > 0 ? 'Partially Paid' : 'Unpaid'

    const editLog: ReservationAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      action: 'Modified',
      performedBy: `${role}`,
      note: `Dates changed to ${formData.checkIn} - ${formData.checkOut}, Room: ${formData.room}, Guests: ${formData.guests}.`
    }

    const updated: Reservation = {
      ...selectedReservation,
      guest: formData.guest,
      guestEmail: formData.guestEmail,
      guestPhone: formData.guestPhone,
      room: formData.room,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guests: Number(formData.guests),
      ratePerNight: roomDetails.rate,
      total: newTotal,
      paymentStatus: newPaymentStatus,
      specialRequests: formData.specialRequests,
      history: [editLog, ...(selectedReservation.history || [])]
    }

    onUpdateReservations(current => current.map(item => item.id === updated.id ? updated : item))
    setSelectedReservation(updated)
    setModalMode('details')
    notify(`Reservation ${updated.id} modified successfully · customer alert triggered`)
  }

  // Cancellation
  const handleCancelSubmit = () => {
    if (!selectedReservation) return

    const cancelLog: ReservationAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      action: 'Cancelled',
      performedBy: `${role}`,
      note: `Cancelled. Reason: ${cancellationReason}. Room ${selectedReservation.room} released back to inventory.`
    }

    let updatedPayments = [...(selectedReservation.payments || [])]
    let newPaymentStatus: PaymentStatus = selectedReservation.paymentStatus

    // If paid > 0, calculate policy refund
    if (selectedReservation.paid > 0) {
      const refundRecord: PaymentRecord = {
        id: `REF-${Date.now()}`,
        amount: selectedReservation.paid,
        date: new Date().toISOString().split('T')[0],
        method: 'Bank Transfer',
        receiptNumber: `REC-REF-${Math.floor(1000 + Math.random() * 9000)}`,
        reference: `Refund: ${cancellationReason}`,
        isRefund: true
      }
      updatedPayments.push(refundRecord)
      newPaymentStatus = 'Refunded'
    }

    const updated: Reservation = {
      ...selectedReservation,
      status: 'Cancelled',
      cancellationReason,
      cancelledAt: new Date().toISOString(),
      paymentStatus: newPaymentStatus,
      history: [cancelLog, ...(selectedReservation.history || [])],
      payments: updatedPayments
    }

    onUpdateReservations(current => current.map(item => item.id === updated.id ? updated : item))
    setSelectedReservation(updated)
    setModalMode('details')
    notify(`Reservation ${updated.id} cancelled. Room slot ${updated.room} is now available!`)
  }

  // Record payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedReservation || paymentAmount <= 0) {
      notify('Please enter a valid payment amount')
      return
    }

    const newPayment: PaymentRecord = {
      id: `PAY-${Date.now()}`,
      amount: Number(paymentAmount),
      date: new Date().toISOString().split('T')[0],
      method: paymentMethod,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      reference: paymentRef || 'Front Desk Stay Payment'
    }

    const newPaid = selectedReservation.paid + Number(paymentAmount)
    const newStatus: PaymentStatus = newPaid >= selectedReservation.total ? 'Paid' : 'Partially Paid'

    const payLog: ReservationAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      action: 'Payment Recorded',
      performedBy: `${role}`,
      note: `Payment of ${money(Number(paymentAmount))} recorded via ${paymentMethod} (${newPayment.receiptNumber}).`
    }

    const updated: Reservation = {
      ...selectedReservation,
      paid: newPaid,
      paymentStatus: newStatus,
      payments: [...(selectedReservation.payments || []), newPayment],
      history: [payLog, ...(selectedReservation.history || [])]
    }

    onUpdateReservations(current => current.map(item => item.id === updated.id ? updated : item))
    setSelectedReservation(updated)
    setActiveReceipt(newPayment)
    setPaymentAmount(0)
    setPaymentRef('')
    setModalMode('receipt')
    notify(`Payment of ${money(newPayment.amount)} recorded · Receipt generated`)
  }

  // Send Reminder
  const handleSendReminder = (res: Reservation) => {
    const reminderLog: ReservationAuditLog = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
      action: 'Reminder Dispatched',
      performedBy: `${role}`,
      note: `Automated WhatsApp & Email check-in reminder sent to ${res.guestEmail}.`
    }

    const updated: Reservation = {
      ...res,
      reminderSent: true,
      reminderSentAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      history: [reminderLog, ...(res.history || [])]
    }

    onUpdateReservations(current => current.map(item => item.id === updated.id ? updated : item))
    setSelectedReservation(updated)
    notify(`Check-in reminder dispatched to ${res.guest} via Email & WhatsApp!`)
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Reservation ID', 'Guest Name', 'Email', 'Phone', 'Room', 'Check-In', 'Check-Out', 'Guests', 'Source', 'Total (LKR)', 'Paid (LKR)', 'Status', 'Payment Status']
    const rows = filteredReservations.map(r => [
      r.id,
      `"${r.guest}"`,
      r.guestEmail,
      r.guestPhone,
      r.room,
      r.checkIn,
      r.checkOut,
      r.guests,
      `"${r.source}"`,
      r.total,
      r.paid,
      r.status,
      r.paymentStatus
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `villa-tea-fields-reservations-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    notify('Reservation report exported to CSV')
  }

  // Open Edit Modal
  const openEditModal = (res: Reservation) => {
    setSelectedReservation(res)
    setFormData({
      guest: res.guest,
      guestEmail: res.guestEmail,
      guestPhone: res.guestPhone,
      room: res.room,
      checkIn: res.checkIn,
      checkOut: res.checkOut,
      guests: res.guests,
      source: res.source,
      specialRequests: res.specialRequests || '',
      initialPaid: res.paid,
      paymentMethod: 'Bank Transfer'
    })
    setModalMode('edit')
  }

  return (
    <div className="reservations-module w-full min-w-0 max-w-full space-y-5">
      {/* Pending Approval Alert */}
      {canApprove && stats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 w-full min-w-0">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>{stats.pending} booking {stats.pending === 1 ? 'request requires' : 'requests require'} approval.</strong> Review pending inquiries to confirm or release room dates.
            </span>
          </div>
          <button
            onClick={() => setStatusFilter('Pending Approval')}
            className="px-2.5 py-1 rounded bg-amber-600 text-white font-medium hover:bg-amber-700 transition shrink-0"
          >
            Review Pending
          </button>
        </div>
      )}

      {/* Main Page Heading */}
      <div className="page-heading flex flex-wrap items-center justify-between gap-3 w-full min-w-0">
        <div>
          <p className="eyebrow text-xs uppercase tracking-wider text-[#778196] font-semibold">HOTEL OPERATIONS</p>
          <h1 className="text-2xl font-bold text-[#202939]">Reservations & Bookings</h1>
          <p className="subheading text-xs text-[#778196]">
            Manage bookings, room availability, and guest stays.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canBlockRooms && (
            <button
              className="button secondary flex items-center gap-1.5 text-xs px-3 py-2 border rounded-lg hover:bg-neutral-100 transition"
              onClick={() => setShowBlockModal(true)}
            >
              <Ban size={15} /> Block Room Dates
            </button>
          )}

          {canCreateReservation && (
            <button
              className="button primary flex items-center gap-1.5 text-xs bg-[#172B4D] text-white px-3.5 py-2 rounded-lg font-medium shadow-sm hover:bg-[#0F1D34] transition"
              onClick={() => {
                setFormData({
                  guest: '',
                  guestEmail: '',
                  guestPhone: '',
                  room: 'Room 01',
                  checkIn: '2026-11-18',
                  checkOut: '2026-11-20',
                  guests: 2,
                  source: 'Direct · Website',
                  specialRequests: '',
                  initialPaid: 0,
                  paymentMethod: 'Credit Card'
                })
                setShowCreateModal(true)
              }}
            >
              <Plus size={16} /> New Reservation
            </button>
          )}
        </div>
      </div>

      {/* Statistics Banner */}
      <div className={`grid ${canViewFinancials ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-3'} gap-3 w-full min-w-0`}>
        <div className="bg-white border border-[#E5E9EF] rounded-xl p-3 shadow-xs min-w-0">
          <span className="text-[11px] text-[#778196] block font-medium">TOTAL RESERVATIONS</span>
          <strong className="text-xl font-bold text-[#202939]">{stats.total}</strong>
          <span className="text-[10px] text-emerald-700 block mt-0.5">{stats.confirmed} active / confirmed</span>
        </div>

        <div className="bg-white border border-[#E5E9EF] rounded-xl p-3 shadow-xs min-w-0">
          <span className="text-[11px] text-[#778196] block font-medium">AWAITING APPROVAL</span>
          <strong className={`text-xl font-bold ${stats.pending > 0 ? 'text-amber-600' : 'text-[#202939]'}`}>
            {String(stats.pending).padStart(2, '0')}
          </strong>
          <span className="text-[10px] text-[#778196] block mt-0.5">Pending review</span>
        </div>

        <div className="bg-white border border-[#E5E9EF] rounded-xl p-3 shadow-xs min-w-0">
          <span className="text-[11px] text-[#778196] block font-medium">ARRIVING TODAY</span>
          <strong className="text-xl font-bold text-[#202939]">{String(stats.arrivingToday).padStart(2, '0')}</strong>
          <span className="text-[10px] text-blue-700 block mt-0.5">Nov 14, 2026</span>
        </div>

        {canViewFinancials && (
          <div className="bg-white border border-[#E5E9EF] rounded-xl p-3 shadow-xs min-w-0">
            <span className="text-[11px] text-[#778196] block font-medium">REVENUE COLLECTED</span>
            <strong className="text-xl font-bold text-[#172B4D]">{money(stats.totalRevenue)}</strong>
            <span className="text-[10px] text-[#778196] block mt-0.5">Outstanding: {money(stats.outstanding)}</span>
          </div>
        )}
      </div>

      {/* Module Sub-tabs */}
      <div className="flex border-b border-[#E5E9EF] gap-4 text-xs font-medium w-full min-w-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('table')}
          className={`pb-2.5 flex items-center gap-1.5 transition whitespace-nowrap outline-none focus:outline-none ${
            activeTab === 'table'
              ? 'border-b-2 border-[#172B4D] text-[#172B4D] font-semibold'
              : 'text-[#778196] hover:text-[#202939]'
          }`}
        >
          <FileText size={15} /> All Reservations ({reservations.length})
        </button>

        <button
          onClick={() => setActiveTab('availability')}
          className={`pb-2.5 flex items-center gap-1.5 transition whitespace-nowrap outline-none focus:outline-none ${
            activeTab === 'availability'
              ? 'border-b-2 border-[#172B4D] text-[#172B4D] font-semibold'
              : 'text-[#778196] hover:text-[#202939]'
          }`}
        >
          <CalendarDays size={15} /> Room Availability Matrix
        </button>

        {canViewReports && (
          <button
            onClick={() => setActiveTab('reports')}
            className={`pb-2.5 flex items-center gap-1.5 transition whitespace-nowrap outline-none focus:outline-none ${
              activeTab === 'reports'
                ? 'border-b-2 border-[#172B4D] text-[#172B4D] font-semibold'
                : 'text-[#778196] hover:text-[#202939]'
            }`}
          >
            <ArrowUpRight size={15} /> Analytics & Reporting
          </button>
        )}
      </div>

      {/* TAB 1: ALL RESERVATIONS TABLE */}
      {activeTab === 'table' && (
        <section className="bg-white border border-[#E5E9EF] rounded-xl shadow-xs overflow-hidden w-full min-w-0 max-w-full">
          {/* Filter Bar */}
          <div className="p-3.5 border-b border-[#E5E9EF] flex flex-wrap items-center justify-between gap-3 bg-[#FAFBFC] w-full min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-0">
              {/* Search */}
              <div className="flex items-center gap-2 bg-white border border-[#E5E9EF] rounded-lg px-2.5 py-1.5 flex-1 min-w-[180px] max-w-sm">
                <Search size={15} className="text-[#778196]" />
                <input
                  type="text"
                  placeholder="Search by ID, guest, room or source..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full text-xs outline-none bg-transparent"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-white border border-[#E5E9EF] rounded-lg px-2.5 py-1.5 text-xs text-[#202939] outline-none"
              >
                <option>All statuses</option>
                <option>Pending Approval</option>
                <option>Confirmed</option>
                <option>Checked In</option>
                <option>Checked Out</option>
                <option>Cancelled</option>
              </select>

              {/* Room Filter */}
              <select
                value={roomFilter}
                onChange={e => setRoomFilter(e.target.value)}
                className="bg-white border border-[#E5E9EF] rounded-lg px-2.5 py-1.5 text-xs text-[#202939] outline-none"
              >
                <option>All rooms</option>
                <option>Room 01</option>
                <option>Room 02</option>
                <option>Room 03</option>
                <option>Room 04</option>
              </select>

              {/* Date Filter */}
              <div className="flex items-center border border-[#E5E9EF] rounded-lg bg-white overflow-hidden text-xs">
                <button
                  onClick={() => setDateFilter('all')}
                  className={`px-2.5 py-1.5 transition ${dateFilter === 'all' ? 'bg-[#eef2ec] text-[#172B4D] font-medium' : 'text-[#778196]'}`}
                >
                  All Dates
                </button>
                <button
                  onClick={() => setDateFilter('today')}
                  className={`px-2.5 py-1.5 transition ${dateFilter === 'today' ? 'bg-[#eef2ec] text-[#172B4D] font-medium' : 'text-[#778196]'}`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter('upcoming')}
                  className={`px-2.5 py-1.5 transition ${dateFilter === 'upcoming' ? 'bg-[#eef2ec] text-[#172B4D] font-medium' : 'text-[#778196]'}`}
                >
                  Upcoming
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('All statuses')
                  setRoomFilter('All rooms')
                  setDateFilter('all')
                }}
                className="text-xs text-[#778196] hover:text-[#202939] px-2 py-1.5 rounded hover:bg-neutral-100"
              >
                Reset
              </button>
              {canExport && (
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 text-xs bg-white border border-[#E5E9EF] px-3 py-1.5 rounded-lg text-[#202939] hover:bg-neutral-50 transition"
                >
                  <Download size={14} /> Export CSV
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-left border-collapse text-xs min-w-[860px]">
              <thead>
                <tr className="border-b border-[#E5E9EF] bg-[#F7F8FA] text-[#778196] uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-px">RESERVATION ID</th>
                  <th className="py-2.5 px-3 font-semibold w-full min-w-[180px]">GUEST DETAILS</th>
                  <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-px">STAY DATES</th>
                  <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-px">ROOM & GUESTS</th>
                  <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-px">SOURCE</th>
                  {canViewFinancials && <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-px">FINANCIALS</th>}
                  {canViewFinancials && <th className="py-2.5 px-3 font-semibold whitespace-nowrap w-px">PAYMENT</th>}
                  <th className="py-2.5 pl-3 pr-2 font-semibold whitespace-nowrap w-px">STATUS</th>
                  <th className="py-2.5 pl-2 pr-3 font-semibold text-right whitespace-nowrap w-px">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E9EF]">
                {filteredReservations.map(res => {
                  const checkInFormatted = new Date(`${res.checkIn}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  const checkOutFormatted = new Date(`${res.checkOut}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  const isPending = res.status === 'Pending Approval'

                  return (
                    <tr key={res.id} className="hover:bg-[#FAFBFC] transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#172B4D] whitespace-nowrap w-px">
                        <button
                          onClick={() => {
                            setSelectedReservation(res)
                            setModalMode('details')
                          }}
                          className="hover:underline flex items-center gap-1"
                        >
                          {res.id}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 w-full min-w-[180px]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#e7eee7] text-[#416247] flex items-center justify-center font-bold text-[10px]">
                            {res.guest.split(' ').map(p => p[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <strong className="block text-[#202939]">{res.guest}</strong>
                            <small className="text-[#778196] block text-[10px]">{res.guestEmail}</small>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap w-px">
                        <strong className="block text-[#202939]">{checkInFormatted} → {checkOutFormatted}</strong>
                        <small className="text-[#778196] text-[10px]">
                          {Math.max(1, Math.round((new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) / 86400000))} nights
                        </small>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap w-px">
                        <span className="font-semibold text-[#202939] block">{res.room}</span>
                        <small className="text-[#778196] text-[10px]">{res.guests} {res.guests === 1 ? 'Guest' : 'Guests'}</small>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap w-px">
                        <span className="text-[#202939]">{res.source.replace('Direct · ', '')}</span>
                      </td>

                      {canViewFinancials && (
                        <td className="py-2.5 px-3 whitespace-nowrap w-px">
                          <strong className="block text-[#202939]">{money(res.total)}</strong>
                          <small className="text-[#778196] text-[10px]">Paid: {money(res.paid)}</small>
                        </td>
                      )}

                      {canViewFinancials && (
                        <td className="py-2.5 px-3 whitespace-nowrap w-px">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                            res.paymentStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : res.paymentStatus === 'Partially Paid'
                              ? 'bg-amber-100 text-amber-800'
                              : res.paymentStatus === 'Refunded'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {res.paymentStatus}
                          </span>
                        </td>
                      )}

                      <td className="py-2.5 pl-3 pr-2 whitespace-nowrap w-px">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          res.status === 'Confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : res.status === 'Pending Approval'
                            ? 'bg-amber-100 text-amber-800'
                            : res.status === 'Checked In'
                            ? 'bg-blue-100 text-blue-800'
                            : res.status === 'Checked Out'
                            ? 'bg-neutral-100 text-neutral-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {res.status}
                        </span>
                      </td>

                      <td className="py-2.5 pl-2 pr-3 text-right whitespace-nowrap w-px">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && canApprove ? (
                            <>
                              <button
                                onClick={() => handleApprove(res.id, 'Confirmed')}
                                className="px-2 py-1 rounded bg-[#172B4D] text-white text-[11px] font-medium hover:bg-[#25442e] transition"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleApprove(res.id, 'Cancelled')}
                                className="px-2 py-1 rounded border border-rose-200 text-rose-700 text-[11px] hover:bg-rose-50 transition"
                              >
                                Decline
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedReservation(res)
                                  setModalMode('details')
                                }}
                                className="p-1.5 rounded hover:bg-neutral-100 text-[#778196] hover:text-[#202939]"
                                title="View Details"
                              >
                                <Eye size={15} />
                              </button>

                              {canModify && res.status !== 'Cancelled' && (
                                <button
                                  onClick={() => openEditModal(res)}
                                  className="p-1.5 rounded hover:bg-neutral-100 text-[#778196] hover:text-[#202939]"
                                  title="Modify Dates or Room"
                                >
                                  <Edit3 size={15} />
                                </button>
                              )}

                              {canViewFinancials && (
                                <button
                                  onClick={() => {
                                    setSelectedReservation(res)
                                    setModalMode('voucher')
                                  }}
                                  className="p-1.5 rounded hover:bg-neutral-100 text-[#778196] hover:text-[#202939]"
                                  title="Print / Download Voucher"
                                >
                                  <Printer size={15} />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {filteredReservations.length === 0 && (
              <div className="p-8 text-center text-[#778196]">
                <Search size={28} className="mx-auto mb-2 text-neutral-400" />
                <p className="font-semibold text-[#202939]">No reservations match your search or filter</p>
                <p className="text-xs mt-1">Try resetting the status or keyword filters.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 2: ROOM AVAILABILITY MATRIX */}
      {activeTab === 'availability' && (
        <section className="bg-white border border-[#E5E9EF] rounded-xl p-4 shadow-xs space-y-4 w-full min-w-0 max-w-full">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5E9EF] pb-3">
            <div>
              <h2 className="text-base font-bold text-[#202939]">Room Availability Matrix</h2>
              <p className="text-xs text-[#778196]">
                Daily room occupancy, arrivals, and maintenance schedule.
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm bg-emerald-500 inline-block"/> Available</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm bg-blue-600 inline-block"/> Occupied / In Stay</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm bg-amber-500 inline-block"/> Reserved</span>
              <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded-sm bg-rose-500 inline-block"/> Maintenance Block</span>
            </div>
          </div>

          {/* Daily Matrix Grid for Nov 14 - Nov 28, 2026 */}
          <div className="overflow-x-auto w-full min-w-0">
            <table className="w-full text-center border border-[#E5E9EF] text-xs min-w-[700px]">
              <thead>
                <tr className="bg-[#F7F8FA] text-[#778196] text-[10px]">
                  <th className="p-2 border border-[#E5E9EF] text-left w-36">ROOM</th>
                  {Array.from({ length: 14 }).map((_, idx) => {
                    const d = 14 + idx
                    return (
                      <th key={d} className="p-2 border border-[#E5E9EF] min-w-[50px]">
                        <div>Nov {d}</div>
                        <span className="text-[9px] text-gray-400 font-normal">2026</span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {roomList.map(room => (
                  <tr key={room.name}>
                    <td className="p-2.5 border border-[#E5E9EF] text-left font-semibold bg-[#FAFBFC]">
                      <div className="text-[#202939]">{room.name}</div>
                      <div className="text-[10px] text-[#778196] font-normal">{room.type}</div>
                      {canViewFinancials && (
                        <div className="text-[10px] text-[#172B4D] font-semibold">{money(room.rate)}/night</div>
                      )}
                    </td>

                    {Array.from({ length: 14 }).map((_, idx) => {
                      const dayStr = `2026-11-${String(14 + idx).padStart(2, '0')}`

                      // Find reservation covering this day
                      const matchingRes = reservations.find(r =>
                        r.room === room.name &&
                        r.status !== 'Cancelled' &&
                        dayStr >= r.checkIn &&
                        dayStr < r.checkOut
                      )

                      // Check blocked rooms
                      const matchingBlock = blockedRooms.find(b =>
                        b.room === room.name &&
                        dayStr >= b.startDate &&
                        dayStr < b.endDate
                      )

                      if (matchingBlock) {
                        return (
                          <td
                            key={dayStr}
                            className="p-1 border border-[#E5E9EF] bg-rose-50 text-rose-800 text-[10px]"
                            title={`Blocked: ${matchingBlock.reason}`}
                          >
                            <div className="bg-rose-500 text-white rounded py-1 px-0.5 text-[9px] font-bold">
                              Blocked
                            </div>
                          </td>
                        )
                      }

                      if (matchingRes) {
                        const isPending = matchingRes.status === 'Pending Approval'
                        const isCheckedIn = matchingRes.status === 'Checked In'
                        const bgColor = isCheckedIn ? 'bg-blue-600' : isPending ? 'bg-amber-500' : 'bg-emerald-700'

                        return (
                          <td
                            key={dayStr}
                            className="p-1 border border-[#E5E9EF] hover:bg-neutral-100 transition cursor-pointer"
                            onClick={() => {
                              setSelectedReservation(matchingRes)
                              setModalMode('details')
                            }}
                            title={`${matchingRes.guest} (${matchingRes.id}) - ${matchingRes.status}`}
                          >
                            <div className={`${bgColor} text-white rounded py-1 px-0.5 text-[9px] font-semibold truncate`}>
                              {matchingRes.guest.split(' ')[0]}
                            </div>
                          </td>
                        )
                      }

                      return (
                        <td key={dayStr} className="p-1 border border-[#E5E9EF] bg-emerald-50/40">
                          <span className="text-[10px] text-emerald-800 font-medium">Free</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Blocked dates summary */}
          <div className="bg-[#FAFBFC] border border-[#E5E9EF] rounded-lg p-3 text-xs">
            <h3 className="font-semibold text-[#202939] mb-1.5 flex items-center gap-1.5">
              <Ban size={14} className="text-rose-600" /> Active Maintenance & Administrative Blocks
            </h3>
            {blockedRooms.length === 0 ? (
              <p className="text-[#778196]">No active room blocks.</p>
            ) : (
              <div className="space-y-1.5">
                {blockedRooms.map((b, i) => (
                  <div key={i} className="flex items-center justify-between bg-white border border-[#E5E9EF] p-2 rounded">
                    <div>
                      <strong className="text-[#202939]">{b.room}</strong>: {b.startDate} to {b.endDate} — <span className="text-[#778196]">{b.reason}</span>
                    </div>
                    {canBlockRooms && (
                      <button
                        onClick={() => {
                          setBlockedRooms(prev => prev.filter((_, idx) => idx !== i))
                          notify(`Unblocked ${b.room} dates`)
                        }}
                        className="text-rose-600 hover:underline text-[11px]"
                      >
                        Remove Block
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* TAB 3: RESERVATION ANALYTICS & REPORTING */}
      {canViewReports && activeTab === 'reports' && (
        <section className="space-y-4 w-full min-w-0 max-w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Status breakdown card */}
            <div className="bg-white border border-[#E5E9EF] rounded-xl p-4 shadow-xs">
              <h3 className="font-bold text-[#202939] text-sm mb-3">Booking Status Distribution</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#778196]">Confirmed & Active</span>
                  <strong className="text-emerald-700">{stats.confirmed} ({Math.round((stats.confirmed / (stats.total || 1)) * 100)}%)</strong>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${(stats.confirmed / (stats.total || 1)) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#778196]">Pending Approval</span>
                  <strong className="text-amber-600">{stats.pending} ({Math.round((stats.pending / (stats.total || 1)) * 100)}%)</strong>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(stats.pending / (stats.total || 1)) * 100}%` }} />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[#778196]">Cancelled</span>
                  <strong className="text-rose-600">{stats.cancelled} ({Math.round((stats.cancelled / (stats.total || 1)) * 100)}%)</strong>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(stats.cancelled / (stats.total || 1)) * 100}%` }} />
                </div>
              </div>
            </div>

            {/* Revenue breakdown card */}
            <div className="bg-white border border-[#E5E9EF] rounded-xl p-4 shadow-xs">
              <h3 className="font-bold text-[#202939] text-sm mb-3">Revenue & Payment Summary</h3>
              <div className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#eef2ec] flex justify-between items-center">
                  <span className="text-[#172B4D] font-medium">Collected Revenue:</span>
                  <strong className="text-[#172B4D] text-sm">{money(stats.totalRevenue)}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 flex justify-between items-center">
                  <span className="text-amber-900 font-medium">Pending Balance:</span>
                  <strong className="text-amber-800 text-sm">{money(stats.outstanding)}</strong>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-100 flex justify-between items-center">
                  <span className="text-[#202939] font-medium">Total Booking Value:</span>
                  <strong className="text-[#202939] text-sm">{money(stats.totalRevenue + stats.outstanding)}</strong>
                </div>
              </div>
            </div>

            {/* Channel mix */}
            <div className="bg-white border border-[#E5E9EF] rounded-xl p-4 shadow-xs">
              <h3 className="font-bold text-[#202939] text-sm mb-3">Reservation Channels</h3>
              <div className="space-y-2 text-xs">
                {[
                  { name: 'Direct · Website', count: reservations.filter(r => r.source.includes('Website')).length },
                  { name: 'Direct · WhatsApp & Phone', count: reservations.filter(r => r.source.includes('WhatsApp') || r.source.includes('Email')).length },
                  { name: 'Booking.com', count: reservations.filter(r => r.source.includes('Booking.com')).length },
                  { name: 'Airbnb & Agoda', count: reservations.filter(r => r.source.includes('Airbnb') || r.source.includes('Agoda')).length }
                ].map((channel, i) => (
                  <div key={i} className="flex items-center justify-between py-1 border-b border-[#f1f3ef] last:border-0">
                    <span className="text-[#778196]">{channel.name}</span>
                    <strong className="text-[#202939]">{channel.count} bookings</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E5E9EF] rounded-xl p-4 shadow-xs flex items-center justify-between">
            <div>
              <h4 className="font-bold text-[#202939] text-sm">Export Reservation Report</h4>
              <p className="text-xs text-[#778196]">Generate operational CSV spreadsheet with reservation and payment details.</p>
            </div>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 text-xs bg-[#172B4D] text-white px-3.5 py-2 rounded-lg font-medium hover:bg-[#0F1D34] transition"
            >
              <Download size={15} /> Export CSV
            </button>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* MODALS SECTION */}
      {/* ========================================================================= */}

      {/* MODAL 1: CREATE NEW RESERVATION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9EF]">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#172B4D]">NEW BOOKING REQUEST</span>
                <h2 className="text-lg font-bold text-[#202939]">Create Guest Reservation</h2>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-full hover:bg-neutral-100 text-[#778196]"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#778196] font-medium mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Fernando"
                    value={formData.guest}
                    onChange={e => setFormData({ ...formData, guest: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[#778196] font-medium mb-1">Guest Email</label>
                  <input
                    type="email"
                    placeholder="guest@example.com"
                    value={formData.guestEmail}
                    onChange={e => setFormData({ ...formData, guestEmail: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[#778196] font-medium mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+94 77 123 4567"
                    value={formData.guestPhone}
                    onChange={e => setFormData({ ...formData, guestPhone: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[#778196] font-medium mb-1">Room Assignment</label>
                  <select
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  >
                    {roomList.map(r => (
                      <option key={r.name} value={r.name}>
                        {r.name} ({r.type} - {money(r.rate)}/night)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#778196] font-medium mb-1">Check-in Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[#778196] font-medium mb-1">Check-out Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block text-[#778196] font-medium mb-1">Guests Count</label>
                  <select
                    value={formData.guests}
                    onChange={e => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#778196] font-medium mb-1">Booking Source</label>
                  <select
                    value={formData.source}
                    onChange={e => setFormData({ ...formData, source: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  >
                    <option>Direct · Website</option>
                    <option>Direct · WhatsApp</option>
                    <option>Walk-in Guest</option>
                    <option>Booking.com</option>
                    <option>Airbnb</option>
                    <option>Agoda</option>
                  </select>
                </div>
              </div>

              {/* Conflict indicator */}
              {checkConflict(formData.room, formData.checkIn, formData.checkOut) && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>
                    <strong>Double Booking Conflict!</strong> {formData.room} is not available between {formData.checkIn} and {formData.checkOut}.
                  </span>
                </div>
              )}

              {/* Price calculation preview */}
              <div className="bg-[#FAFBFC] border border-[#E5E9EF] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <span className="text-[#778196] block text-[11px]">Calculated Cost</span>
                  <span className="text-[#202939] font-medium">
                    {Math.max(1, Math.round((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / 86400000))} nights × {money((roomList.find(r => r.name === formData.room) || roomList[0]).rate)}
                  </span>
                </div>
                <strong className="text-base text-[#172B4D]">
                  {money(
                    Math.max(1, Math.round((new Date(formData.checkOut).getTime() - new Date(formData.checkIn).getTime()) / 86400000)) *
                    (roomList.find(r => r.name === formData.room) || roomList[0]).rate
                  )}
                </strong>
              </div>

              {canViewFinancials && (
                <div>
                  <label className="block text-[#778196] font-medium mb-1">Initial Deposit / Advance Payment (Optional)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min="0"
                      placeholder="LKR amount"
                      value={formData.initialPaid || ''}
                      onChange={e => setFormData({ ...formData, initialPaid: Number(e.target.value) })}
                      className="border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                    />
                    <select
                      value={formData.paymentMethod}
                      onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                      className="border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                    >
                      <option>Credit Card</option>
                      <option>Bank Transfer</option>
                      <option>Cash</option>
                      <option>Online Gateway</option>
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[#778196] font-medium mb-1">Special Requests / Dietary Requirements</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Vegetarian breakfast, late check-in at 7 PM..."
                  value={formData.specialRequests}
                  onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E5E9EF]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#E5E9EF] rounded-lg text-[#202939] hover:bg-neutral-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkConflict(formData.room, formData.checkIn, formData.checkOut)}
                  className="px-4 py-2 bg-[#172B4D] text-white rounded-lg font-medium hover:bg-[#0F1D34] transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Reservation Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: RESERVATION DETAILS & AUDIT TRAIL */}
      {modalMode === 'details' && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9EF]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs bg-[#eef2ec] text-[#172B4D] px-2 py-0.5 rounded font-bold">
                    {selectedReservation.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                    selectedReservation.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {selectedReservation.status}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-[#202939] mt-1">{selectedReservation.guest}</h2>
              </div>
              <button
                onClick={() => setModalMode(null)}
                className="p-1 rounded-full hover:bg-neutral-100 text-[#778196]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Action Ribbon */}
            <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E5E9EF]">
              {canViewFinancials && (
                <button
                  onClick={() => setModalMode('voucher')}
                  className="flex items-center gap-1.5 text-xs bg-[#eef2ec] text-[#172B4D] px-3 py-1.5 rounded-lg hover:bg-[#dfe8dd] font-medium"
                >
                  <Printer size={14} /> Booking Voucher
                </button>
              )}

              {canRecordPayment && selectedReservation.status !== 'Cancelled' && (
                <button
                  onClick={() => {
                    setPaymentAmount(Math.max(0, selectedReservation.total - selectedReservation.paid))
                    setModalMode('payment')
                  }}
                  className="flex items-center gap-1.5 text-xs bg-[#172B4D] text-white px-3 py-1.5 rounded-lg hover:bg-[#25442e] font-medium"
                >
                  <DollarSign size={14} /> Record Payment
                </button>
              )}

              {canModify && selectedReservation.status !== 'Cancelled' && (
                <button
                  onClick={() => openEditModal(selectedReservation)}
                  className="flex items-center gap-1.5 text-xs border border-[#E5E9EF] px-3 py-1.5 rounded-lg text-[#202939] hover:bg-neutral-50"
                >
                  <Edit3 size={14} /> Modify Stay
                </button>
              )}

              {canCancel && selectedReservation.status !== 'Cancelled' && (
                <button
                  onClick={() => setModalMode('cancel')}
                  className="flex items-center gap-1.5 text-xs border border-rose-200 text-rose-700 px-3 py-1.5 rounded-lg hover:bg-rose-50"
                >
                  <Trash2 size={14} /> Cancel Booking
                </button>
              )}

              {!isHousekeeper && (
                <button
                  onClick={() => handleSendReminder(selectedReservation)}
                  className="flex items-center gap-1.5 text-xs border border-[#E5E9EF] px-3 py-1.5 rounded-lg text-[#202939] hover:bg-neutral-50"
                >
                  <Send size={14} /> {selectedReservation.reminderSent ? 'Resend Reminder' : 'Send Reminder'}
                </button>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-[#FAFBFC] p-3.5 rounded-xl border border-[#E5E9EF]">
              <div>
                <span className="text-[#778196] block">Room</span>
                <strong className="text-[#202939]">{selectedReservation.room}</strong>
              </div>
              <div>
                <span className="text-[#778196] block">Stay Period</span>
                <strong className="text-[#202939]">{selectedReservation.checkIn} to {selectedReservation.checkOut}</strong>
              </div>
              <div>
                <span className="text-[#778196] block">Booking Channel</span>
                <strong className="text-[#202939]">{selectedReservation.source}</strong>
              </div>
              <div>
                <span className="text-[#778196] block">Guest Count</span>
                <strong className="text-[#202939]">{selectedReservation.guests} Persons</strong>
              </div>
            </div>

            {/* Special Requests */}
            {selectedReservation.specialRequests && (
              <div className="bg-[#FAFBFC] border border-[#E5E9EF] p-3 rounded-xl text-xs">
                <span className="text-[#778196] block font-medium mb-0.5">Special Requests & Preferences</span>
                <p className="text-[#202939] font-medium">{selectedReservation.specialRequests}</p>
              </div>
            )}

            {/* Financial Overview (Hidden for Housekeeper) */}
            {canViewFinancials && (
              <div className="bg-white border border-[#E5E9EF] p-3.5 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-[#202939]">Total Reservation Value</span>
                  <span className="text-base text-[#172B4D]">{money(selectedReservation.total)}</span>
                </div>
                <div className="flex items-center justify-between text-[#778196]">
                  <span>Amount Paid</span>
                  <span className="text-emerald-700 font-medium">{money(selectedReservation.paid)}</span>
                </div>
                <div className="flex items-center justify-between text-[#778196]">
                  <span>Outstanding Balance</span>
                  <span className="text-rose-700 font-medium">{money(Math.max(0, selectedReservation.total - selectedReservation.paid))}</span>
                </div>

                {/* Payment Progress Bar */}
                <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden mt-1">
                  <div
                    className="bg-[#172B4D] h-2 rounded-full"
                    style={{ width: `${Math.min(100, (selectedReservation.paid / (selectedReservation.total || 1)) * 100)}%` }}
                  />
                </div>

                {selectedReservation.payments && selectedReservation.payments.length > 0 && (
                  <div className="pt-2 border-t border-[#f1f3ef] mt-2">
                    <span className="text-[11px] font-bold text-[#778196] block mb-1">Payment Transactions</span>
                    <div className="space-y-1">
                      {selectedReservation.payments.map(p => (
                        <div key={p.id} className="flex items-center justify-between text-[11px] py-0.5">
                          <span className="text-[#778196]">{p.date} • {p.method} ({p.receiptNumber})</span>
                          <div className="flex items-center gap-2">
                            <strong className={p.isRefund ? 'text-purple-700' : 'text-emerald-700'}>
                              {p.isRefund ? `-${money(p.amount)} (Refund)` : `+${money(p.amount)}`}
                            </strong>
                            <button
                              onClick={() => {
                                setActiveReceipt(p)
                                setModalMode('receipt')
                              }}
                              className="text-[#172B4D] hover:underline"
                            >
                              Receipt
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audit History Trail */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs text-[#202939] uppercase tracking-wider">
                Reservation History & Audit Trail
              </h3>
              <div className="max-h-44 overflow-y-auto border border-[#E5E9EF] rounded-xl p-3 space-y-2 bg-[#FAFBFC] text-xs">
                {(selectedReservation.history || []).map((h, i) => (
                  <div key={h.id || i} className="flex items-start gap-2 text-[11px] pb-1.5 border-b border-[#f0f2ee] last:border-0">
                    <Clock size={13} className="text-[#778196] shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-[#202939]">{h.action}</strong>
                        <span className="text-[10px] text-[#778196]">{h.timestamp}</span>
                      </div>
                      <p className="text-[#778196]">{h.note}</p>
                      <small className="text-[10px] text-emerald-800 font-medium">By: {h.performedBy}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E5E9EF]">
              <button
                onClick={() => setModalMode(null)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#202939] rounded-lg text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: BOOKING CONFIRMATION VOUCHER */}
      {modalMode === 'voucher' && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95">
            {/* Printable Voucher Paper */}
            <div className="border-4 border-double border-[#172B4D]/40 p-6 rounded-xl space-y-4 bg-[#fdfdfc]">
              <div className="flex justify-between items-start border-b border-[#E5E9EF] pb-4">
                <div>
                  <h1 className="text-xl font-serif font-bold text-[#172B4D]">Villa Tea Fields</h1>
                  <p className="text-[11px] text-[#778196]">Nuwara Eliya, Central Highlands, Sri Lanka</p>
                  <p className="text-[10px] text-[#778196]">Tel: +94 52 222 3456 • stay@villateafields.com</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] tracking-wider uppercase font-bold text-[#778196] block">BOOKING CONFIRMATION</span>
                  <strong className="text-base font-mono text-[#172B4D]">{selectedReservation.id}</strong>
                  <span className="block text-[10px] text-emerald-700 font-semibold mt-1">Status: Confirmed</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] text-[#778196] block uppercase">GUEST DETAILS</span>
                  <strong className="text-[#202939] block">{selectedReservation.guest}</strong>
                  <span className="text-[11px] text-[#778196] block">{selectedReservation.guestEmail}</span>
                  <span className="text-[11px] text-[#778196] block">{selectedReservation.guestPhone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#778196] block uppercase">STAY DETAILS</span>
                  <strong className="text-[#202939] block">{selectedReservation.room}</strong>
                  <span className="text-[11px] text-[#202939] block">
                    Check-in: <strong>{selectedReservation.checkIn}</strong> (2:00 PM)
                  </span>
                  <span className="text-[11px] text-[#202939] block">
                    Check-out: <strong>{selectedReservation.checkOut}</strong> (11:00 AM)
                  </span>
                </div>
              </div>

              <div className="bg-[#F7F8FA] p-3 rounded-lg text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Room Charge:</span>
                  <strong>{money(selectedReservation.total)}</strong>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Advance Paid:</span>
                  <strong>{money(selectedReservation.paid)}</strong>
                </div>
                <div className="flex justify-between border-t border-[#E5E9EF] pt-1 text-sm font-bold text-[#172B4D]">
                  <span>Balance Due at Check-in:</span>
                  <span>{money(Math.max(0, selectedReservation.total - selectedReservation.paid))}</span>
                </div>
              </div>

              <div className="text-[10px] text-[#778196] border-t border-[#E5E9EF] pt-2 space-y-1">
                <p>• Cancellation Policy: Free cancellation up to 48 hours prior to arrival.</p>
                <p>• Complimentary Ceylon Tea service and breakfast included with every stay.</p>
                <p>• Please present this voucher and valid photo identification upon arrival.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalMode('details')}
                className="px-4 py-2 border border-[#E5E9EF] rounded-lg text-xs font-medium text-[#202939] hover:bg-neutral-50"
              >
                Back to Details
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#172B4D] text-white rounded-lg text-xs font-medium hover:bg-[#0F1D34] flex items-center gap-1.5"
              >
                <Printer size={14} /> Print / Save Voucher
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: MODIFY RESERVATION */}
      {modalMode === 'edit' && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9EF]">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-amber-700">RESERVATION MODIFICATION</span>
                <h2 className="text-lg font-bold text-[#202939]">Modify Stay {selectedReservation.id}</h2>
              </div>
              <button onClick={() => setModalMode('details')} className="p-1 rounded-full hover:bg-neutral-100 text-[#778196]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-[#778196] font-medium mb-1">Guest Name</label>
                <input
                  type="text"
                  required
                  value={formData.guest}
                  onChange={e => setFormData({ ...formData, guest: e.target.value })}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#778196] font-medium mb-1">Room Assignment</label>
                  <select
                    value={formData.room}
                    onChange={e => setFormData({ ...formData, room: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  >
                    {roomList.map(r => (
                      <option key={r.name} value={r.name}>
                        {r.name} ({r.type})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#778196] font-medium mb-1">Guests Count</label>
                  <select
                    value={formData.guests}
                    onChange={e => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#778196] font-medium mb-1">Check-in Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkIn}
                    onChange={e => setFormData({ ...formData, checkIn: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>
                <div>
                  <label className="block text-[#778196] font-medium mb-1">Check-out Date</label>
                  <input
                    type="date"
                    required
                    value={formData.checkOut}
                    onChange={e => setFormData({ ...formData, checkOut: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>
              </div>

              {/* Conflict indicator */}
              {checkConflict(formData.room, formData.checkIn, formData.checkOut, selectedReservation.id) && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} className="shrink-0 text-rose-600" />
                  <span>Conflict Alert: {formData.room} is occupied or blocked for those requested dates.</span>
                </div>
              )}

              <div>
                <label className="block text-[#778196] font-medium mb-1">Special Notes / Change Reason</label>
                <textarea
                  rows={2}
                  value={formData.specialRequests}
                  onChange={e => setFormData({ ...formData, specialRequests: e.target.value })}
                  placeholder="Reason for modifying dates or room..."
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E9EF]">
                <button
                  type="button"
                  onClick={() => setModalMode('details')}
                  className="px-4 py-2 border border-[#E5E9EF] rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={checkConflict(formData.room, formData.checkIn, formData.checkOut, selectedReservation.id)}
                  className="px-4 py-2 bg-[#172B4D] text-white rounded-lg font-medium text-xs hover:bg-[#0F1D34] disabled:opacity-50"
                >
                  Save Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: CANCELLATION & POLICY */}
      {modalMode === 'cancel' && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9EF]">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-rose-700">RESERVATION CANCELLATION</span>
                <h2 className="text-lg font-bold text-[#202939]">Cancel Booking {selectedReservation.id}</h2>
              </div>
              <button onClick={() => setModalMode('details')} className="p-1 rounded-full hover:bg-neutral-100 text-[#778196]">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3 rounded-lg text-xs space-y-1">
                <strong>Cancellation Policy Terms:</strong>
                <p>• Cancelling releases slot for <strong>{selectedReservation.room}</strong> immediately back to inventory.</p>
                {selectedReservation.paid > 0 && (
                  <p>• Refund of <strong>{money(selectedReservation.paid)}</strong> will be credited to guest via original payment method.</p>
                )}
              </div>

              <div>
                <label className="block text-[#778196] font-medium mb-1">Select Cancellation Reason *</label>
                <select
                  value={cancellationReason}
                  onChange={e => setCancellationReason(e.target.value)}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                >
                  <option>Change of travel plans</option>
                  <option>Emergency / Illness</option>
                  <option>Weather conditions in Nuwara Eliya</option>
                  <option>Booked alternate dates</option>
                  <option>Customer non-responsive</option>
                  <option>Administrative override</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E9EF]">
                <button
                  onClick={() => setModalMode('details')}
                  className="px-4 py-2 border border-[#E5E9EF] rounded-lg text-xs"
                >
                  Keep Reservation
                </button>
                <button
                  onClick={handleCancelSubmit}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium text-xs hover:bg-rose-700"
                >
                  Confirm & Release Slot
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: RECORD PAYMENT */}
      {modalMode === 'payment' && selectedReservation && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9EF]">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-[#172B4D]">FINANCIAL MANAGEMENT</span>
                <h2 className="text-lg font-bold text-[#202939]">Record Payment for {selectedReservation.id}</h2>
              </div>
              <button onClick={() => setModalMode('details')} className="p-1 rounded-full hover:bg-neutral-100 text-[#778196]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-4 mt-4 text-xs">
              <div className="bg-[#FAFBFC] border border-[#E5E9EF] p-3 rounded-lg flex justify-between">
                <span>Remaining Due:</span>
                <strong className="text-rose-700 font-bold">
                  {money(Math.max(0, selectedReservation.total - selectedReservation.paid))}
                </strong>
              </div>

              <div>
                <label className="block text-[#778196] font-medium mb-1">Payment Amount (LKR) *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={paymentAmount || ''}
                  onChange={e => setPaymentAmount(Number(e.target.value))}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                />
              </div>

              <div>
                <label className="block text-[#778196] font-medium mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                >
                  <option>Bank Transfer</option>
                  <option>Credit Card</option>
                  <option>Cash</option>
                  <option>Online Gateway</option>
                </select>
              </div>

              <div>
                <label className="block text-[#778196] font-medium mb-1">Transaction Reference / Note</label>
                <input
                  type="text"
                  placeholder="e.g. BOC slip #99324 / POS terminal"
                  value={paymentRef}
                  onChange={e => setPaymentRef(e.target.value)}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E9EF]">
                <button
                  type="button"
                  onClick={() => setModalMode('details')}
                  className="px-4 py-2 border border-[#E5E9EF] rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#172B4D] text-white rounded-lg font-medium text-xs hover:bg-[#0F1D34]"
                >
                  Record Payment & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: PAYMENT RECEIPT */}
      {modalMode === 'receipt' && selectedReservation && activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95 space-y-4">
            <div className="border border-[#E5E9EF] p-5 rounded-xl bg-[#fdfdfc] text-xs space-y-3 font-mono">
              <div className="text-center border-b border-[#E5E9EF] pb-3">
                <h3 className="text-base font-bold text-[#172B4D] font-serif">Villa Tea Fields</h3>
                <p className="text-[10px] text-[#778196]">Official Payment Receipt</p>
                <p className="text-[10px] text-[#202939] font-bold mt-1">{activeReceipt.receiptNumber}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-[#778196]">Reservation ID:</span>
                  <span className="font-bold">{selectedReservation.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#778196]">Guest:</span>
                  <span className="font-bold">{selectedReservation.guest}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#778196]">Payment Date:</span>
                  <span>{activeReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#778196]">Method:</span>
                  <span>{activeReceipt.method}</span>
                </div>
                {activeReceipt.reference && (
                  <div className="flex justify-between">
                    <span className="text-[#778196]">Reference:</span>
                    <span>{activeReceipt.reference}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-b border-[#E5E9EF] py-2 flex justify-between items-center text-sm font-bold text-[#172B4D]">
                <span>AMOUNT RECEIVED:</span>
                <span>{money(activeReceipt.amount)}</span>
              </div>

              <div className="text-[10px] text-[#778196] text-center pt-1">
                Thank you for staying at Villa Tea Fields.
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setModalMode('details')}
                className="px-4 py-2 border border-[#E5E9EF] rounded-lg text-xs text-[#202939]"
              >
                Back to Details
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#172B4D] text-white rounded-lg text-xs font-medium flex items-center gap-1.5"
              >
                <Printer size={14} /> Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: ADMIN BLOCK ROOM DATES */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E5E9EF] my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E9EF]">
              <div>
                <span className="text-[10px] tracking-wider uppercase font-bold text-rose-700">ADMINISTRATIVE CONTROL</span>
                <h2 className="text-lg font-bold text-[#202939]">Block Room Availability</h2>
              </div>
              <button onClick={() => setShowBlockModal(false)} className="p-1 rounded-full hover:bg-neutral-100 text-[#778196]">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault()
                if (newBlock.endDate <= newBlock.startDate) {
                  notify('End date must be after start date')
                  return
                }
                setBlockedRooms(prev => [...prev, newBlock])
                setShowBlockModal(false)
                notify(`Blocked ${newBlock.room} from ${newBlock.startDate} to ${newBlock.endDate}`)
              }}
              className="space-y-4 mt-4 text-xs"
            >
              <div>
                <label className="block text-[#778196] font-medium mb-1">Select Room</label>
                <select
                  value={newBlock.room}
                  onChange={e => setNewBlock({ ...newBlock, room: e.target.value })}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                >
                  {roomList.map(r => (
                    <option key={r.name} value={r.name}>{r.name} ({r.type})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#778196] font-medium mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newBlock.startDate}
                    onChange={e => setNewBlock({ ...newBlock, startDate: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>
                <div>
                  <label className="block text-[#778196] font-medium mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newBlock.endDate}
                    onChange={e => setNewBlock({ ...newBlock, endDate: e.target.value })}
                    className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#778196] font-medium mb-1">Block Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Cleaning / Private Tea Festival VIP"
                  value={newBlock.reason}
                  onChange={e => setNewBlock({ ...newBlock, reason: e.target.value })}
                  className="w-full border border-[#E5E9EF] rounded-lg px-3 py-2 text-xs outline-none focus:border-[#172B4D]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E5E9EF]">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 border border-[#E5E9EF] rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg font-medium text-xs hover:bg-rose-700"
                >
                  Apply Room Block
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}


