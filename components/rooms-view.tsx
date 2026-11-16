'use client'

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import {
  ArrowLeft, BedDouble, CalendarDays, Check, ChevronLeft, ChevronRight, CircleAlert, ClipboardCheck, Clock,
  ExternalLink, ImagePlus, Info, Lock, Mail, MoreHorizontal, Phone, Plus, Star, Trash2, Undo2, Users, X,
} from 'lucide-react'
import { money, type Reservation, type Role } from './reservations-view'
import {
  MAX_PHOTOS, OPERATIONAL_STATUSES, PLACEHOLDER_PHOTO, STAFF_NAME, STATUS_META,
  addDays, daysBetween, fileToPhotoDataUrl, formatDate, formatDateTime, getGuestAvailability, getRoomReservations,
  layoutWeek, parseISODate, primaryPhoto, roomPermissions, startOfWeek, toISODate, todayISO, uid,
  type CalendarSegment as Segment, type HotelRoom, type OperationalStatus,
} from '@/lib/rooms'

// ============================================================================================
// Rooms page
// ============================================================================================

interface RoomsViewProps {
  rooms: HotelRoom[]
  reservations: Reservation[]
  role: Role
  onUpdateRoom: (room: HotelRoom) => void
  notify: (message: string) => void
  /** Navigates to the existing Reservations module and opens the given reservation. */
  onOpenReservation: (id: string) => void
}

export function RoomsView({ rooms, reservations, role, onUpdateRoom, notify, onOpenReservation }: RoomsViewProps) {
  const [view, setView] = useState<'grid' | 'calendar'>('grid')
  const [detailsRoomId, setDetailsRoomId] = useState<string | null>(null)
  const [menuRoomId, setMenuRoomId] = useState<string | null>(null)
  const [calendarFocus, setCalendarFocus] = useState({ room: 'all', date: todayISO(), nonce: 0 })
  const today = todayISO()
  const detailsRoom = rooms.find(room => room.id === detailsRoomId) ?? null

  const changeStatus = (room: HotelRoom, status: OperationalStatus) => {
    setMenuRoomId(null)
    if (room.status === status) return
    onUpdateRoom({ ...room, status, statusUpdatedAt: new Date().toISOString(), statusUpdatedBy: `${STAFF_NAME[role]} (${role})` })
    notify(`${room.id} status updated to ${status}`)
  }

  const openCalendar = (room = 'all', date = todayISO()) => {
    setDetailsRoomId(null)
    setMenuRoomId(null)
    setCalendarFocus(current => ({ room, date, nonce: current.nonce + 1 }))
    setView('calendar')
  }

  return <>
    {view === 'calendar' ? (
      <RoomCalendar
        key={calendarFocus.nonce}
        rooms={rooms}
        reservations={reservations}
        role={role}
        initialRoom={calendarFocus.room}
        initialDate={calendarFocus.date}
        onBack={() => setView('grid')}
        onOpenSuite={setDetailsRoomId}
        onOpenReservation={onOpenReservation}
      />
    ) : <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">HOTEL OPERATIONS · {rooms.length} SUITES</p>
          <h1>Rooms & inventory</h1>
          <p className="subheading">Room status, housekeeping readiness, and guest allocations.</p>
        </div>
        <button className="button secondary" onClick={() => openCalendar()}><CalendarDays size={16} /> Room calendar</button>
      </div>
      <div className="room-summary" aria-label="Room status summary">
        {OPERATIONAL_STATUSES.map(status => (
          <span key={status}><i className={`room-dot ${STATUS_META[status].className}-dot`} />{status} <strong>{rooms.filter(room => room.status === status).length}</strong></span>
        ))}
        <span className="room-summary-total">{rooms.length} suites total</span>
      </div>
      <div className="room-grid">
        {rooms.map(room => {
          const { current, upcoming } = getRoomReservations(room.id, reservations, today)
          const next = upcoming[0]
          return <article className="card room-card" key={room.id}>
            <div className="room-photo">
              <RoomImage src={primaryPhoto(room)} alt={`${room.name} primary photograph`} />
              <OperationalStatusPill status={room.status} className="room-state" />
              <button
                className="room-more"
                aria-label={`${room.id} quick actions`}
                aria-haspopup="menu"
                aria-expanded={menuRoomId === room.id}
                onClick={() => setMenuRoomId(menuRoomId === room.id ? null : room.id)}
              >
                <MoreHorizontal size={18} />
              </button>
              {menuRoomId === room.id && (
                <RoomQuickMenu
                  room={room}
                  onClose={() => setMenuRoomId(null)}
                  onDetails={() => { setMenuRoomId(null); setDetailsRoomId(room.id) }}
                  onCalendar={() => openCalendar(room.id)}
                  onStatus={status => changeStatus(room, status)}
                />
              )}
            </div>
            <div className="room-content">
              <div className="room-title"><h2>{room.id} · {room.name}</h2><span>Up to {room.maxOccupancy} guests</span></div>
              <p className="room-guest"><Users size={14} />{current ? `${current.guest} · in house` : 'No guest in house'}</p>
              <p className="room-detail">
                <CalendarDays size={14} />
                {current
                  ? `Departs ${formatDate(current.checkOut, { month: 'short', day: 'numeric' })}${next ? ` · next arrival ${formatDate(next.checkIn, { month: 'short', day: 'numeric' })}` : ''}`
                  : next
                    ? `Next arrival ${formatDate(next.checkIn, { month: 'short', day: 'numeric' })} · ${next.guest}${next.status === 'Pending Approval' ? ' (pending)' : ''}`
                    : 'No upcoming reservations'}
              </p>
              <div className="room-footer">
                <div><span>BASE RATE</span><strong>{money(room.price)} <small>/ night</small></strong></div>
                <button className="text-button" onClick={() => setDetailsRoomId(room.id)}>Suite details <ChevronRight size={14} /></button>
              </div>
            </div>
          </article>
        })}
      </div>
      <div className="card room-note">
        <div className="attention-icon amber"><ClipboardCheck size={17} /></div>
        <div>
          <strong>Room status is managed by staff</strong>
          <span>Statuses are internal and never shown to guests. Booking channels only see availability derived from reservations.</span>
        </div>
        <button className="text-button" onClick={() => openCalendar()}>Open calendar <ChevronRight size={14} /></button>
      </div>
    </>}

    {detailsRoom && (
      <SuiteDetailsDialog
        key={detailsRoom.id}
        room={detailsRoom}
        reservations={reservations}
        role={role}
        onClose={() => setDetailsRoomId(null)}
        onSave={(updated, summary) => {
          onUpdateRoom(updated)
          setDetailsRoomId(null)
          notify(`${updated.id} saved · ${summary}`)
        }}
        onViewCalendar={(roomId, date) => openCalendar(roomId, date)}
        onOpenReservation={id => { setDetailsRoomId(null); onOpenReservation(id) }}
      />
    )}
  </>
}

function RoomImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])
  return <img src={failed ? PLACEHOLDER_PHOTO : src} alt={alt} className={className} onError={() => setFailed(true)} loading="lazy" />
}

function OperationalStatusPill({ status, className = 'op-status' }: { status: OperationalStatus; className?: string }) {
  return <span className={`${className} ${STATUS_META[status].className}`}><i />{status}</span>
}

function RoomQuickMenu({ room, onClose, onDetails, onCalendar, onStatus }: {
  room: HotelRoom
  onClose: () => void
  onDetails: () => void
  onCalendar: () => void
  onStatus: (status: OperationalStatus) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    const onPointer = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && !(event.target as HTMLElement).closest('.room-more')) onClose()
    }
    document.addEventListener('mousedown', onPointer)
    return () => document.removeEventListener('mousedown', onPointer)
  }, [onClose])

  const onKeyDown = (event: React.KeyboardEvent) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? [])
    const index = items.indexOf(document.activeElement as HTMLElement)
    if (event.key === 'Escape') { event.preventDefault(); onClose() }
    if (event.key === 'ArrowDown') { event.preventDefault(); items[(index + 1) % items.length]?.focus() }
    if (event.key === 'ArrowUp') { event.preventDefault(); items[(index - 1 + items.length) % items.length]?.focus() }
  }

  return <div className="room-menu" role="menu" aria-label={`${room.id} actions`} ref={ref} onKeyDown={onKeyDown}>
    <button role="menuitem" onClick={onDetails}><Info size={14} /> Suite details</button>
    <button role="menuitem" onClick={onCalendar}><CalendarDays size={14} /> View on calendar</button>
    <p>Set status</p>
    {OPERATIONAL_STATUSES.map(status => (
      <button key={status} role="menuitemradio" aria-checked={room.status === status} onClick={() => onStatus(status)}>
        <i className={`room-dot ${STATUS_META[status].className}-dot`} />{status}{room.status === status && <Check size={14} className="ml-auto" />}
      </button>
    ))}
  </div>
}

// ============================================================================================
// Accessible dialog shell (focus trap, Escape, backdrop click, focus restore)
// ============================================================================================

let openDialogs = 0

function Dialog({ labelledBy, onRequestClose, className = '', children }: {
  labelledBy: string
  onRequestClose: () => void
  className?: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onRequestClose)
  closeRef.current = onRequestClose

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const previous = document.activeElement as HTMLElement | null
    const focusables = () => Array.from(node.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(element => element.offsetParent !== null || element === document.activeElement)
    ;(node.querySelector<HTMLElement>('[data-autofocus]') ?? focusables()[0])?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const items = focusables()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    node.addEventListener('keydown', onKeyDown)
    openDialogs += 1
    document.body.style.overflow = 'hidden'
    return () => {
      node.removeEventListener('keydown', onKeyDown)
      openDialogs -= 1
      if (openDialogs === 0) document.body.style.overflow = ''
      if (previous && document.contains(previous)) previous.focus()
    }
  }, [])

  return <div className="modal-backdrop rooms-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) closeRef.current() }}>
    <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={labelledBy} className={`rooms-dialog ${className}`}>
      {children}
    </div>
  </div>
}

// ============================================================================================
// Suite details dialog
// ============================================================================================

type SuiteTab = 'details' | 'photos' | 'status' | 'reservations'
const SUITE_TABS: { id: SuiteTab; label: string }[] = [
  { id: 'details', label: 'Details & pricing' },
  { id: 'photos', label: 'Photos' },
  { id: 'status', label: 'Status & housekeeping' },
  { id: 'reservations', label: 'Reservations' },
]
const AMENITY_SUGGESTIONS = ['Wi-Fi', 'Hot water shower', 'Room heater', 'Electric blanket', 'Tea & coffee station', 'Bathtub', 'Fireplace', 'Mountain view', 'Garden view', 'Writing desk', 'Hair dryer', 'Complimentary breakfast']

function SuiteDetailsDialog({ room, reservations, role, onClose, onSave, onViewCalendar, onOpenReservation }: {
  room: HotelRoom
  reservations: Reservation[]
  role: Role
  onClose: () => void
  onSave: (room: HotelRoom, summary: string) => void
  onViewCalendar: (roomId: string, date?: string) => void
  onOpenReservation: (id: string) => void
}) {
  const perms = roomPermissions(role)
  const [draft, setDraft] = useState<HotelRoom>(room)
  const [priceInput, setPriceInput] = useState(String(room.price))
  const [capacityInput, setCapacityInput] = useState(String(room.maxOccupancy))
  const [tab, setTab] = useState<SuiteTab>('details')
  const [previewId, setPreviewId] = useState<string | null>(room.primaryPhotoId ?? room.photos[0]?.id ?? null)
  const [processing, setProcessing] = useState(0)
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [dragging, setDragging] = useState(false)
  const [amenityInput, setAmenityInput] = useState('')
  const [amenityError, setAmenityError] = useState('')
  const [noteInput, setNoteInput] = useState('')
  const [pendingClose, setPendingClose] = useState<null | (() => void)>(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const today = todayISO()

  const price = Number(priceInput.replace(/[,\s]/g, ''))
  const capacity = Number(capacityInput)
  const { current, upcoming } = getRoomReservations(room.id, reservations, today)
  const largestUpcomingParty = Math.max(0, ...[current, ...upcoming].filter(Boolean).map(item => item!.guests))

  const errors = {
    name: !draft.name.trim() ? 'Room name is required.' : draft.name.trim().length > 60 ? 'Keep the room name under 60 characters.' : '',
    type: !draft.type.trim() ? 'Room type is required.' : '',
    description: draft.description.trim().length < 20 ? 'Add a short description (at least 20 characters).' : draft.description.length > 600 ? 'Keep the description to 600 characters or fewer.' : '',
    bedConfiguration: !draft.bedConfiguration.trim() ? 'Bed configuration is required.' : '',
    capacity: !capacityInput.trim() || !Number.isInteger(capacity) || capacity < 1 || capacity > 6 ? 'Enter a whole number between 1 and 6.' : '',
    price: !priceInput.trim() ? 'Enter a nightly price.'
      : !Number.isInteger(price) ? 'Use whole rupees only, e.g. 24500.'
        : price < 5000 || price > 250000 ? 'Nightly price must be between LKR 5,000 and LKR 250,000.' : '',
    amenities: draft.amenities.length === 0 ? 'List at least one amenity.' : '',
  }
  const errorCount = Object.values(errors).filter(Boolean).length
  const dirty = JSON.stringify(draft) !== JSON.stringify(room) || priceInput !== String(room.price) || capacityInput !== String(room.maxOccupancy)
  const savedPhotoIds = new Set(room.photos.map(photo => photo.id))
  const removedPhotos = room.photos.filter(photo => !draft.photos.some(item => item.id === photo.id))
  const savedNoteIds = new Set(room.notes.map(note => note.id))
  const preview = draft.photos.find(photo => photo.id === previewId) ?? draft.photos.find(photo => photo.id === draft.primaryPhotoId) ?? draft.photos[0]

  const update = <K extends keyof HotelRoom>(key: K, value: HotelRoom[K]) => setDraft(currentDraft => ({ ...currentDraft, [key]: value }))

  const requestClose = (after?: () => void) => {
    const finish = () => { onClose(); after?.() }
    if (dirty) setPendingClose(() => finish)
    else finish()
  }

  const save = () => {
    setSubmitAttempted(true)
    if (errorCount > 0) {
      setTab('details')
      return
    }
    const changes: string[] = []
    if (price !== room.price) changes.push(`price ${money(room.price)} → ${money(price)}`)
    if (draft.status !== room.status) changes.push(`status → ${draft.status}`)
    const added = draft.photos.filter(photo => !savedPhotoIds.has(photo.id)).length
    if (added) changes.push(`${added} photo${added > 1 ? 's' : ''} added`)
    if (removedPhotos.length) changes.push(`${removedPhotos.length} photo${removedPhotos.length > 1 ? 's' : ''} removed`)
    if (draft.primaryPhotoId !== room.primaryPhotoId && !added && !removedPhotos.length) changes.push('primary photo changed')
    if (JSON.stringify(draft.notes) !== JSON.stringify(room.notes)) changes.push('housekeeping notes updated')
    const detailsChanged = draft.name !== room.name || draft.type !== room.type || draft.description !== room.description ||
      draft.bedConfiguration !== room.bedConfiguration || capacity !== room.maxOccupancy || JSON.stringify(draft.amenities) !== JSON.stringify(room.amenities)
    if (detailsChanged) changes.push('room details updated')

    const statusChanged = draft.status !== room.status
    onSave({
      ...draft,
      name: draft.name.trim(),
      type: draft.type.trim(),
      description: draft.description.trim(),
      bedConfiguration: draft.bedConfiguration.trim(),
      price,
      maxOccupancy: capacity,
      ...(statusChanged ? { statusUpdatedAt: new Date().toISOString(), statusUpdatedBy: `${STAFF_NAME[role]} (${role})` } : {}),
    }, changes.join(', ') || 'no changes')
  }

  // ---------- photos ----------
  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList)
    if (!files.length) return
    const slots = MAX_PHOTOS - draft.photos.length
    const problems: string[] = []
    if (slots <= 0) {
      setUploadErrors([`A room can have at most ${MAX_PHOTOS} photographs. Remove one first.`])
      return
    }
    if (files.length > slots) problems.push(`Only ${slots} more photo${slots > 1 ? 's' : ''} can be added (limit ${MAX_PHOTOS}). Extra files were skipped.`)
    const accepted = files.slice(0, slots)
    setProcessing(accepted.length)
    const results = await Promise.allSettled(accepted.map(fileToPhotoDataUrl))
    const added = results.flatMap(result => result.status === 'fulfilled' ? [{ id: uid('photo'), src: result.value }] : [])
    results.forEach(result => { if (result.status === 'rejected') problems.push((result.reason as Error).message) })
    setDraft(currentDraft => ({
      ...currentDraft,
      photos: [...currentDraft.photos, ...added],
      primaryPhotoId: currentDraft.primaryPhotoId ?? added[0]?.id ?? null,
    }))
    if (added[0]) setPreviewId(added[0].id)
    setUploadErrors(problems)
    setProcessing(0)
  }

  const removePhoto = (id: string) => {
    setDraft(currentDraft => {
      const photos = currentDraft.photos.filter(photo => photo.id !== id)
      return { ...currentDraft, photos, primaryPhotoId: currentDraft.primaryPhotoId === id ? photos[0]?.id ?? null : currentDraft.primaryPhotoId }
    })
    if (previewId === id) setPreviewId(null)
  }

  const restorePhoto = (id: string) => {
    const photo = room.photos.find(item => item.id === id)
    if (!photo) return
    setDraft(currentDraft => ({ ...currentDraft, photos: [...currentDraft.photos, photo], primaryPhotoId: currentDraft.primaryPhotoId ?? photo.id }))
  }

  // ---------- amenities ----------
  const addAmenity = (value: string) => {
    const amenity = value.trim()
    if (!amenity) { setAmenityError('Type an amenity first.'); return }
    if (amenity.length > 40) { setAmenityError('Keep amenities under 40 characters.'); return }
    if (draft.amenities.some(item => item.toLowerCase() === amenity.toLowerCase())) { setAmenityError(`"${amenity}" is already listed.`); return }
    update('amenities', [...draft.amenities, amenity])
    setAmenityInput('')
    setAmenityError('')
  }

  // ---------- notes ----------
  const addNote = () => {
    const text = noteInput.trim()
    if (!text) return
    update('notes', [{ id: uid('note'), text, author: `${STAFF_NAME[role]} (${role})`, createdAt: new Date().toISOString() }, ...draft.notes])
    setNoteInput('')
  }

  const statusHint = (() => {
    const next = upcoming[0]
    if (current?.status === 'Checked In' && draft.status !== 'Occupied') return `${current.guest} is checked in to this room. "Occupied" may be more accurate.`
    if (draft.status === 'Occupied' && !current) return 'No reservation covers tonight for this room. Check whether the guest has departed.'
    if (draft.status === 'Not Reserved' && next) return `There is an upcoming reservation on ${formatDate(next.checkIn, { month: 'short', day: 'numeric' })} (${next.guest}). "Reserved" or "Ready" may be more accurate.`
    if (draft.status === 'Reserved' && !current && !next) return 'There are no upcoming reservations for this room.'
    return ''
  })()
  const availability = getGuestAvailability(room.id, reservations, today)

  const fieldError = (key: keyof typeof errors) => errors[key] && (submitAttempted || key === 'price' || key === 'capacity')
    ? <span className="field-error" role="alert"><CircleAlert size={12} />{errors[key]}</span>
    : null

  return <Dialog labelledBy="suite-title" onRequestClose={() => requestClose()} className="suite-dialog">
    <header className="suite-head">
      <div className="suite-head-photo"><RoomImage src={primaryPhoto(draft)} alt="" /></div>
      <div className="suite-head-copy">
        <p className="eyebrow">{room.id} · {room.type}</p>
        <h2 id="suite-title">{room.name}</h2>
        <div className="suite-head-meta">
          <OperationalStatusPill status={room.status} />
          <span><Clock size={12} /> Status updated {formatDateTime(room.statusUpdatedAt)}</span>
        </div>
      </div>
      <button className="icon-close" onClick={() => requestClose()} aria-label="Close suite details"><X size={18} /></button>
    </header>

    <div className="suite-tabs" role="tablist" aria-label="Suite details sections">
      {SUITE_TABS.map(item => (
        <button
          key={item.id}
          role="tab"
          id={`suite-tab-${item.id}`}
          aria-selected={tab === item.id}
          aria-controls={`suite-panel-${item.id}`}
          className={tab === item.id ? 'active' : ''}
          onClick={() => setTab(item.id)}
        >
          {item.label}
          {item.id === 'details' && submitAttempted && errorCount > 0 && <b className="tab-error">{errorCount}</b>}
          {item.id === 'photos' && <small>{draft.photos.length}</small>}
          {item.id === 'reservations' && <small>{(current ? 1 : 0) + upcoming.length}</small>}
        </button>
      ))}
    </div>

    <div className="suite-body" role="tabpanel" id={`suite-panel-${tab}`} aria-labelledby={`suite-tab-${tab}`}>
      {tab === 'details' && <div className="suite-details">
        {submitAttempted && errorCount > 0 && (
          <div className="suite-alert danger" role="alert"><CircleAlert size={16} /> Please fix {errorCount} field{errorCount > 1 ? 's' : ''} before saving.</div>
        )}
        {!perms.editDetails && (
          <div className="suite-alert info"><Lock size={14} /> Room details are read-only for your role. You can update status and housekeeping notes.</div>
        )}

        <section className="suite-price card">
          <div>
            <span className="suite-label">Nightly rate</span>
            <strong>{money(errors.price ? room.price : price)} <small>/ night</small></strong>
            <p>Breakfast included. Applies to new bookings; existing reservations keep the rate they were booked at.</p>
          </div>
          <label className="form-field suite-price-input">
            <span>Edit nightly price (LKR) {!perms.editPrice && <Lock size={11} />}</span>
            <div className="input-prefix">
              <span>LKR</span>
              <input
                inputMode="numeric"
                value={priceInput}
                disabled={!perms.editPrice}
                aria-invalid={!!errors.price}
                onChange={event => setPriceInput(event.target.value.replace(/[^\d,\s]/g, ''))}
              />
            </div>
            {fieldError('price')}
            {!perms.editPrice && <small className="field-hint">Only the Owner or Manager can change pricing.</small>}
            {perms.editPrice && !errors.price && price !== room.price && <small className="field-hint changed">Was {money(room.price)} · {price > room.price ? '+' : ''}{Math.round((price - room.price) / room.price * 100)}%</small>}
          </label>
        </section>

        <div className="form-grid">
          <label className="form-field">
            <span>Room name</span>
            <input value={draft.name} disabled={!perms.editDetails} aria-invalid={!!errors.name} onChange={event => update('name', event.target.value)} />
            {fieldError('name')}
          </label>
          <label className="form-field">
            <span>Room number</span>
            <input value={room.id} readOnly disabled title="Room numbers are fixed because reservations reference them." />
          </label>
          <label className="form-field">
            <span>Room type</span>
            <input value={draft.type} disabled={!perms.editDetails} aria-invalid={!!errors.type} onChange={event => update('type', event.target.value)} />
            {fieldError('type')}
          </label>
          <label className="form-field">
            <span>Bed configuration</span>
            <input value={draft.bedConfiguration} disabled={!perms.editDetails} aria-invalid={!!errors.bedConfiguration} onChange={event => update('bedConfiguration', event.target.value)} />
            {fieldError('bedConfiguration')}
          </label>
          <label className="form-field">
            <span>Maximum occupancy (guests)</span>
            <input type="number" min={1} max={6} value={capacityInput} disabled={!perms.editDetails} aria-invalid={!!errors.capacity} onChange={event => setCapacityInput(event.target.value)} />
            {fieldError('capacity')}
            {!errors.capacity && capacity < largestUpcomingParty && (
              <small className="field-hint warn">An upcoming reservation has {largestUpcomingParty} guests. Existing bookings are not changed.</small>
            )}
          </label>
          <label className="form-field wide">
            <span>Description <small className="char-count">{draft.description.length}/600</small></span>
            <textarea rows={3} value={draft.description} disabled={!perms.editDetails} aria-invalid={!!errors.description} onChange={event => update('description', event.target.value)} />
            {fieldError('description')}
          </label>
        </div>

        <section className="suite-amenities">
          <span className="suite-label">Amenities</span>
          <ul className="amenity-chips">
            {draft.amenities.map(amenity => (
              <li key={amenity}>
                {amenity}
                {perms.editDetails && <button aria-label={`Remove ${amenity}`} onClick={() => update('amenities', draft.amenities.filter(item => item !== amenity))}><X size={12} /></button>}
              </li>
            ))}
            {draft.amenities.length === 0 && <li className="empty">No amenities listed</li>}
          </ul>
          {fieldError('amenities')}
          {perms.editDetails && <>
            <div className="amenity-add">
              <input
                value={amenityInput}
                placeholder="Add an amenity, e.g. Balcony"
                aria-label="New amenity"
                onChange={event => { setAmenityInput(event.target.value); setAmenityError('') }}
                onKeyDown={event => { if (event.key === 'Enter') { event.preventDefault(); addAmenity(amenityInput) } }}
              />
              <button className="button secondary" onClick={() => addAmenity(amenityInput)}><Plus size={14} /> Add</button>
            </div>
            {amenityError && <span className="field-error" role="alert"><CircleAlert size={12} />{amenityError}</span>}
            <div className="amenity-suggestions">
              {AMENITY_SUGGESTIONS.filter(item => !draft.amenities.some(existing => existing.toLowerCase() === item.toLowerCase())).slice(0, 6).map(item => (
                <button key={item} onClick={() => addAmenity(item)}><Plus size={11} /> {item}</button>
              ))}
            </div>
          </>}
        </section>
      </div>}

      {tab === 'photos' && <div className="suite-photos">
        <div className="photo-preview">
          {preview ? <>
            <RoomImage src={preview.src} alt={`${draft.name} photograph preview`} />
            <div className="photo-preview-tags">
              {preview.id === draft.primaryPhotoId && <span className="tag primary"><Star size={11} /> Primary · shown on Rooms page</span>}
              {!savedPhotoIds.has(preview.id) && <span className="tag new">New · not saved yet</span>}
            </div>
          </> : <div className="photo-empty"><ImagePlus size={28} /><p>No photographs. The Rooms page will show a placeholder image.</p></div>}
        </div>

        <ul className="photo-grid" aria-label="Room photographs">
          {draft.photos.map((photo, index) => (
            <li key={photo.id} className={`${photo.id === preview?.id ? 'selected' : ''}`}>
              <button className="photo-thumb" onClick={() => setPreviewId(photo.id)} aria-label={`Preview photo ${index + 1}`} aria-pressed={photo.id === preview?.id}>
                <RoomImage src={photo.src} alt="" />
                {photo.id === draft.primaryPhotoId && <span className="thumb-badge"><Star size={10} /> Primary</span>}
                {!savedPhotoIds.has(photo.id) && <span className="thumb-badge new">New</span>}
              </button>
              {perms.editDetails && <div className="photo-actions">
                <button
                  onClick={() => update('primaryPhotoId', photo.id)}
                  disabled={photo.id === draft.primaryPhotoId}
                  aria-label={`Set photo ${index + 1} as primary`}
                  title="Set as primary"
                ><Star size={13} /></button>
                <button onClick={() => removePhoto(photo.id)} aria-label={`Remove photo ${index + 1}`} title="Remove"><Trash2 size={13} /></button>
              </div>}
            </li>
          ))}
          {perms.editDetails && draft.photos.length < MAX_PHOTOS && (
            <li>
              <label
                className={`photo-drop ${dragging ? 'dragging' : ''}`}
                onDragOver={event => { event.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={event => { event.preventDefault(); setDragging(false); void addFiles(event.dataTransfer.files) }}
              >
                <ImagePlus size={20} />
                <span>{processing ? `Processing ${processing}…` : 'Add photos'}</span>
                <small>Click or drop · JPG, PNG, WebP</small>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={processing > 0}
                  onChange={event => { if (event.target.files) void addFiles(event.target.files); event.target.value = '' }}
                />
              </label>
            </li>
          )}
        </ul>

        {uploadErrors.length > 0 && <div className="suite-alert danger" role="alert"><CircleAlert size={16} /><div>{uploadErrors.map(error => <p key={error}>{error}</p>)}</div></div>}
        {removedPhotos.length > 0 && (
          <div className="removed-photos">
            <span>Will be removed when you save:</span>
            {removedPhotos.map(photo => (
              <button key={photo.id} onClick={() => restorePhoto(photo.id)} title="Restore photo">
                <RoomImage src={photo.src} alt="" /><Undo2 size={12} /> Restore
              </button>
            ))}
          </div>
        )}
        <p className="suite-footnote">
          {perms.editDetails
            ? `Photos are processed in your browser and stored with this prototype's local data (max ${MAX_PHOTOS}). The primary photo is used on the Rooms page.`
            : 'Only the Owner, Manager or Deputy Manager can change photographs.'}
        </p>
      </div>}

      {tab === 'status' && <div className="suite-status">
        <section>
          <span className="suite-label" id="op-status-label">Operational status <small>(internal · staff only)</small></span>
          <div className="status-options" role="radiogroup" aria-labelledby="op-status-label">
            {OPERATIONAL_STATUSES.map(status => (
              <label key={status} className={`status-option ${STATUS_META[status].className} ${draft.status === status ? 'selected' : ''}`}>
                <input type="radio" name="operational-status" value={status} checked={draft.status === status} onChange={() => update('status', status)} />
                <span className="status-option-head"><i />{status}{draft.status === status && <Check size={14} />}</span>
                <small>{STATUS_META[status].description}</small>
              </label>
            ))}
          </div>
          <p className="status-updated">
            <Clock size={12} /> Last updated {formatDateTime(room.statusUpdatedAt)} by {room.statusUpdatedBy}
            {draft.status !== room.status && <b> · change will be timestamped on save</b>}
          </p>
          {statusHint && <div className="suite-alert info"><Info size={14} /><div><p>{statusHint}</p><small>Suggestion only — status never changes automatically.</small></div></div>}
        </section>

        <section className="guest-availability">
          <span className="suite-label">Guest-facing availability</span>
          <div className={`availability-chip ${availability.available ? 'open' : 'closed'}`}>{availability.label}</div>
          <p>Booking channels see only availability derived from reservations. The operational status above is never shown to guests.</p>
        </section>

        <section className="hk-notes">
          <span className="suite-label">Housekeeping notes</span>
          <div className="hk-add">
            <textarea
              rows={2}
              value={noteInput}
              maxLength={300}
              placeholder="e.g. Replace bedside lamp bulb; guest prefers extra towels"
              aria-label="New housekeeping note"
              onChange={event => setNoteInput(event.target.value)}
              onKeyDown={event => { if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); addNote() } }}
            />
            <button className="button secondary" onClick={addNote} disabled={!noteInput.trim()}><Plus size={14} /> Add note</button>
          </div>
          <ul>
            {draft.notes.map(note => (
              <li key={note.id}>
                <div>
                  <p>{note.text}</p>
                  <small>{note.author} · {formatDateTime(note.createdAt)}{!savedNoteIds.has(note.id) && <b> · unsaved</b>}</small>
                </div>
                {(perms.editDetails || !savedNoteIds.has(note.id)) && (
                  <button aria-label="Delete note" title="Delete note" onClick={() => update('notes', draft.notes.filter(item => item.id !== note.id))}><Trash2 size={13} /></button>
                )}
              </li>
            ))}
            {draft.notes.length === 0 && <li className="empty">No housekeeping notes for this room.</li>}
          </ul>
        </section>
      </div>}

      {tab === 'reservations' && <div className="suite-reservations">
        <div className="suite-res-head">
          <p>Current and upcoming stays for {room.id}. Cancelled reservations do not block the room.</p>
          <button className="button secondary" onClick={() => requestClose(() => onViewCalendar(room.id))}><CalendarDays size={15} /> Open room calendar</button>
        </div>
        {!current && upcoming.length === 0 && <div className="empty-state"><CalendarDays size={22} /><p>No current or upcoming reservations.</p></div>}
        <ul>
          {[...(current ? [current] : []), ...upcoming].map(item => (
            <li key={item.id}>
              <div className="res-dates">
                <strong>{formatDate(item.checkIn, { month: 'short', day: 'numeric' })} → {formatDate(item.checkOut, { month: 'short', day: 'numeric' })}</strong>
                <small>{daysBetween(item.checkIn, item.checkOut)} nights</small>
              </div>
              <div className="res-guest">
                <strong>{item.guest}{item === current && <em>In house</em>}</strong>
                <small><Users size={12} /> {item.guests} guest{item.guests > 1 ? 's' : ''} · {item.id}</small>
              </div>
              <ReservationStatusBadge status={item.status} />
              <div className="res-actions">
                <button className="text-button" onClick={() => requestClose(() => onViewCalendar(room.id, item.checkIn))}>Calendar</button>
                {perms.openReservations && <button className="text-button" onClick={() => requestClose(() => onOpenReservation(item.id))}>Open <ExternalLink size={12} /></button>}
              </div>
            </li>
          ))}
        </ul>
      </div>}
    </div>

    <footer className="suite-footer">
      {pendingClose ? <>
        <span className="discard-copy"><CircleAlert size={15} /> Discard your unsaved changes?</span>
        <div>
          <button className="button secondary" onClick={() => setPendingClose(null)} autoFocus>Keep editing</button>
          <button className="button danger" onClick={() => { const finish = pendingClose; setPendingClose(null); finish() }}>Discard changes</button>
        </div>
      </> : <>
        <span className={`dirty-indicator ${dirty ? 'on' : ''}`}>{dirty ? 'Unsaved changes' : 'No changes'}</span>
        <div>
          <button className="button secondary" onClick={onClose}>Cancel</button>
          <button className="button primary" onClick={save} disabled={!dirty || processing > 0}><Check size={15} /> Save changes</button>
        </div>
      </>}
    </footer>
  </Dialog>
}

function ReservationStatusBadge({ status }: { status: Reservation['status'] }) {
  return <span className={`status-badge ${status.toLowerCase().replaceAll(' ', '-')}`}><i />{status}</span>
}

// ============================================================================================
// Room calendar
// ============================================================================================

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const RESERVATION_STATUSES: Reservation['status'][] = ['Confirmed', 'Pending Approval', 'Checked In', 'Checked Out', 'Cancelled']

function RoomCalendar({ rooms, reservations, role, initialRoom, initialDate, onBack, onOpenSuite, onOpenReservation }: {
  rooms: HotelRoom[]
  reservations: Reservation[]
  role: Role
  initialRoom: string
  initialDate: string
  onBack: () => void
  onOpenSuite: (roomId: string) => void
  onOpenReservation: (id: string) => void
}) {
  const today = todayISO()
  const [mode, setMode] = useState<'month' | 'week'>('month')
  const [cursor, setCursor] = useState(initialDate)
  const [roomFilter, setRoomFilter] = useState(initialRoom)
  const [showCancelled, setShowCancelled] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const roomById = useMemo(() => new Map(rooms.map(room => [room.id, room])), [rooms])
  const visibleRooms = roomFilter === 'all' ? rooms : rooms.filter(room => room.id === roomFilter)
  const visible = useMemo(() => reservations.filter(item =>
    roomById.has(item.room) &&
    item.checkOut > item.checkIn &&
    (roomFilter === 'all' || item.room === roomFilter) &&
    (showCancelled || item.status !== 'Cancelled')
  ), [reservations, roomById, roomFilter, showCancelled])

  const cursorDate = parseISODate(cursor)
  const monthStart = toISODate(new Date(cursorDate.getFullYear(), cursorDate.getMonth(), 1))
  const daysInMonth = new Date(cursorDate.getFullYear(), cursorDate.getMonth() + 1, 0).getDate()
  const gridStart = startOfWeek(monthStart)
  const weekCount = Math.ceil((daysBetween(gridStart, monthStart) + daysInMonth) / 7)
  const weekStart = startOfWeek(cursor)
  const periodStart = mode === 'month' ? monthStart : weekStart
  const periodEnd = mode === 'month' ? addDays(monthStart, daysInMonth) : addDays(weekStart, 7)
  const inPeriod = visible.filter(item => item.checkIn < periodEnd && item.checkOut > periodStart)
  const selected = reservations.find(item => item.id === selectedId) ?? null

  const title = mode === 'month'
    ? cursorDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : `${formatDate(weekStart, { month: 'short', day: 'numeric' })} – ${formatDate(addDays(weekStart, 6), { month: 'short', day: 'numeric', year: 'numeric' })}`

  const navigate = (direction: -1 | 1) => {
    if (mode === 'month') setCursor(toISODate(new Date(cursorDate.getFullYear(), cursorDate.getMonth() + direction, 1)))
    else setCursor(addDays(cursor, direction * 7))
  }

  const bar = (segment: Segment, compact: boolean, showRoom: boolean) => {
    const item = segment.reservation
    const room = roomById.get(item.room)!
    const nights = daysBetween(item.checkIn, item.checkOut)
    const label = `${item.guest}, ${room.id} ${room.name}, check-in ${formatDate(item.checkIn)}, check-out ${formatDate(item.checkOut)}, ${nights} nights, ${item.guests} guests, ${item.status}`
    return <button
      key={`${item.id}-${segment.start}`}
      type="button"
      className={`cal-bar ${item.status.toLowerCase().replaceAll(' ', '-')} ${segment.continuesBefore ? 'cont-before' : ''} ${segment.continuesAfter ? 'cont-after' : ''} ${compact ? 'compact' : ''}`}
      style={{ gridColumn: `${segment.start + 1} / ${segment.end + 1}`, gridRow: segment.lane + 1, '--room': room.color } as CSSProperties}
      onClick={() => setSelectedId(item.id)}
      aria-label={label}
      title={label}
    >
      {item.status === 'Pending Approval' && <Clock size={11} aria-hidden />}
      {showRoom && <span className="cal-bar-room">{room.id.replace('Room ', 'R')}</span>}
      <span className="cal-bar-name">{item.guest}</span>
      {!compact && <span className="cal-bar-meta">{nights}n · {item.guests} guest{item.guests > 1 ? 's' : ''}</span>}
    </button>
  }

  return <>
    <div className="page-heading">
      <div>
        <p className="eyebrow">HOTEL OPERATIONS · ROOMS</p>
        <h1>Room calendar</h1>
        <p className="subheading">Reservations and stays across all suites. Use it to plan arrivals, departures and room preparation.</p>
      </div>
      <button className="button secondary" onClick={onBack}><ArrowLeft size={16} /> Back to rooms</button>
    </div>

    <div className="cal-room-filters" role="group" aria-label="Filter by room">
      <button className={`cal-room-filter ${roomFilter === 'all' ? 'active' : ''}`} aria-pressed={roomFilter === 'all'} onClick={() => setRoomFilter('all')}>
        <span className="cal-room-name"><BedDouble size={14} /> All rooms</span>
        <small>{rooms.length} suites</small>
      </button>
      {rooms.map(room => {
        const { current, upcoming } = getRoomReservations(room.id, reservations, today)
        return <button
          key={room.id}
          className={`cal-room-filter ${roomFilter === room.id ? 'active' : ''}`}
          aria-pressed={roomFilter === room.id}
          onClick={() => setRoomFilter(room.id)}
          style={{ '--room': room.color } as CSSProperties}
        >
          <span className="cal-room-name"><i className="cal-swatch" />{room.id} · {room.name}</span>
          <small>
            {current
              ? `In house until ${formatDate(current.checkOut, { month: 'short', day: 'numeric' })}`
              : upcoming[0] ? `Next arrival ${formatDate(upcoming[0].checkIn, { month: 'short', day: 'numeric' })}` : 'No upcoming bookings'}
          </small>
        </button>
      })}
    </div>

    <div className="card cal-card">
      <div className="cal-toolbar">
        <div className="cal-nav">
          <button className="button secondary" onClick={() => setCursor(today)}>Today</button>
          <button className="icon-button" onClick={() => navigate(-1)} aria-label={`Previous ${mode}`}><ChevronLeft size={18} /></button>
          <button className="icon-button" onClick={() => navigate(1)} aria-label={`Next ${mode}`}><ChevronRight size={18} /></button>
          <h2 aria-live="polite">{title}</h2>
        </div>
        <div className="cal-controls">
          <label className="cal-toggle">
            <input type="checkbox" checked={showCancelled} onChange={event => setShowCancelled(event.target.checked)} /> Show cancelled
          </label>
          <div className="segmented" role="group" aria-label="Calendar view">
            <button className={mode === 'month' ? 'active' : ''} aria-pressed={mode === 'month'} onClick={() => setMode('month')}>Month</button>
            <button className={mode === 'week' ? 'active' : ''} aria-pressed={mode === 'week'} onClick={() => setMode('week')}>Week</button>
          </div>
        </div>
      </div>

      {mode === 'month' ? (
        <div className="cal-month">
          <div className="cal-weekdays" aria-hidden>{WEEKDAYS.map(day => <span key={day}>{day}</span>)}</div>
          {Array.from({ length: weekCount }, (_, index) => {
            const start = addDays(gridStart, index * 7)
            const segments = layoutWeek(visible, start)
            const lanes = segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0)
            return <div className="cal-week" key={start}>
              <div className="cal-week-days">
                {Array.from({ length: 7 }, (_, day) => {
                  const date = addDays(start, day)
                  const outside = parseISODate(date).getMonth() !== cursorDate.getMonth()
                  return <div key={date} className={`cal-day ${outside ? 'outside' : ''} ${date === today ? 'today' : ''}`}>
                    <span className="cal-date" aria-label={formatDate(date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}>
                      {parseISODate(date).getDate() === 1 && !outside ? formatDate(date, { month: 'short', day: 'numeric' }) : parseISODate(date).getDate()}
                    </span>
                    {date === today && <span className="cal-today-label">Today</span>}
                  </div>
                })}
              </div>
              <div className="cal-bars" style={{ gridTemplateRows: `repeat(${Math.max(lanes, 1)}, 24px)` }}>
                {segments.map(segment => bar(segment, true, roomFilter === 'all'))}
              </div>
            </div>
          })}
        </div>
      ) : (
        <div className="cal-timeline-scroll">
          <div className="cal-timeline">
            <div className="cal-tl-corner">Room</div>
            {Array.from({ length: 7 }, (_, day) => {
              const date = addDays(weekStart, day)
              const arrivals = visible.filter(item => item.checkIn === date && item.status !== 'Cancelled').length
              const departures = visible.filter(item => item.checkOut === date && item.status !== 'Cancelled').length
              return <div key={date} className={`cal-tl-day ${date === today ? 'today' : ''}`}>
                <strong>{WEEKDAYS[day]} {parseISODate(date).getDate()}</strong>
                <small>
                  {arrivals > 0 && <span className="arr">{arrivals} in</span>}
                  {departures > 0 && <span className="dep">{departures} out</span>}
                  {!arrivals && !departures && <span>—</span>}
                </small>
              </div>
            })}
            {visibleRooms.map(room => {
              const segments = layoutWeek(visible.filter(item => item.room === room.id), weekStart)
              const lanes = segments.reduce((max, segment) => Math.max(max, segment.lane + 1), 0)
              return <div className="cal-tl-row" key={room.id} style={{ '--room': room.color } as CSSProperties}>
                <button className="cal-tl-room" onClick={() => onOpenSuite(room.id)} aria-label={`${room.id} ${room.name} suite details`}>
                  <span><i className="cal-swatch" />{room.id}</span>
                  <small>{room.name}</small>
                  <OperationalStatusPill status={room.status} />
                </button>
                <div className="cal-tl-track">
                  <div className="cal-tl-days" aria-hidden>
                    {Array.from({ length: 7 }, (_, day) => <span key={day} className={addDays(weekStart, day) === today ? 'today' : ''} />)}
                  </div>
                  <div className="cal-bars" style={{ gridTemplateRows: `repeat(${Math.max(lanes, 1)}, 40px)` }}>
                    {segments.map(segment => bar(segment, false, false))}
                  </div>
                </div>
              </div>
            })}
          </div>
        </div>
      )}

      {inPeriod.length === 0 && (
        <div className="cal-empty"><CalendarDays size={18} /> No reservations {roomFilter === 'all' ? '' : `for ${roomFilter} `}in this {mode}.</div>
      )}

      <div className="cal-legend">
        {RESERVATION_STATUSES.filter(status => showCancelled || status !== 'Cancelled').map(status => (
          <span key={status}><i className={`cal-bar legend ${status.toLowerCase().replaceAll(' ', '-')}`} />{status}</span>
        ))}
        <span className="cal-legend-note"><Info size={12} /> Bars run from the afternoon of check-in to the morning of check-out, so the check-out day stays open for a new arrival.</span>
      </div>
    </div>

    {selected && roomById.has(selected.room) && (
      <ReservationDetailsDialog
        reservation={selected}
        room={roomById.get(selected.room)!}
        role={role}
        onClose={() => setSelectedId(null)}
        onOpenSuite={() => { setSelectedId(null); onOpenSuite(selected.room) }}
        onOpenReservation={() => { setSelectedId(null); onOpenReservation(selected.id) }}
      />
    )}
  </>
}

function ReservationDetailsDialog({ reservation, room, role, onClose, onOpenSuite, onOpenReservation }: {
  reservation: Reservation
  room: HotelRoom
  role: Role
  onClose: () => void
  onOpenSuite: () => void
  onOpenReservation: () => void
}) {
  const perms = roomPermissions(role)
  const nights = daysBetween(reservation.checkIn, reservation.checkOut)
  const balance = reservation.total - reservation.paid
  const rows: [string, ReactNode][] = [
    ['Room', <><i className="cal-swatch" style={{ '--room': room.color } as CSSProperties} />{room.id} · {room.name}</>],
    ['Check-in', formatDate(reservation.checkIn, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })],
    ['Check-out', formatDate(reservation.checkOut, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })],
    ['Length of stay', `${nights} night${nights > 1 ? 's' : ''}`],
    ['Guests', `${reservation.guests} guest${reservation.guests > 1 ? 's' : ''}`],
    ['Booking source', reservation.source],
  ]
  if (perms.viewGuestFinancials) {
    rows.push(['Total amount', <>{money(reservation.total)} <small className="muted">· {money(reservation.ratePerNight)}/night</small></>])
    rows.push(['Payment', <>{reservation.paymentStatus}{balance > 0 && reservation.status !== 'Cancelled' && <small className="muted"> · balance {money(balance)}</small>}</>])
  }

  return <Dialog labelledBy="res-dialog-title" onRequestClose={onClose} className="res-dialog">
    <header className="suite-head plain">
      <div className="suite-head-copy">
        <p className="eyebrow">Reservation {reservation.id}</p>
        <h2 id="res-dialog-title">{reservation.guest}</h2>
        <div className="suite-head-meta"><ReservationStatusBadge status={reservation.status} /></div>
      </div>
      <button className="icon-close" onClick={onClose} aria-label="Close reservation details"><X size={18} /></button>
    </header>
    <div className="suite-body">
      {perms.viewGuestFinancials && (
        <div className="res-contact">
          {reservation.guestEmail && <a href={`mailto:${reservation.guestEmail}`}><Mail size={13} /> {reservation.guestEmail}</a>}
          {reservation.guestPhone && <a href={`tel:${reservation.guestPhone.replace(/\s/g, '')}`}><Phone size={13} /> {reservation.guestPhone}</a>}
        </div>
      )}
      <dl className="res-grid">
        {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
      {reservation.specialRequests && <div className="res-note"><strong>Notes & special requests</strong><p>{reservation.specialRequests}</p></div>}
      {reservation.status === 'Cancelled' && (
        <div className="suite-alert info"><Info size={14} /><p>Cancelled{reservation.cancellationReason ? ` · ${reservation.cancellationReason}` : ''}. These dates no longer block {room.id}.</p></div>
      )}
    </div>
    <footer className="suite-footer">
      <button className="text-button" onClick={onOpenSuite}><BedDouble size={14} /> Room details</button>
      <div>
        <button className="button secondary" onClick={onClose}>Close</button>
        {perms.openReservations && <button className="button primary" onClick={onOpenReservation} data-autofocus><ExternalLink size={14} /> Open in Reservations</button>}
      </div>
    </footer>
  </Dialog>
}
