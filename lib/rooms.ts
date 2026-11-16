// Room domain model, mock data and date helpers for the Rooms module.
//
// Two concepts are deliberately kept apart:
//  - OperationalStatus: an internal, staff-managed state (Not Reserved / Reserved / Ready / Occupied).
//    It is only changed by an employee and is never shown to guests.
//  - Booking availability: derived from the reservation data for a date range. This is what a
//    guest-facing channel would show ("Available" / "Booked"), see `getGuestAvailability`.

import type { Reservation, RoomInfo, Role } from '@/components/reservations-view'

export const OPERATIONAL_STATUSES = ['Not Reserved', 'Reserved', 'Ready', 'Occupied'] as const
export type OperationalStatus = (typeof OPERATIONAL_STATUSES)[number]

export const STATUS_META: Record<OperationalStatus, { className: string; description: string }> = {
  'Not Reserved': { className: 'not-reserved', description: 'No active reservation at the moment.' },
  Reserved: { className: 'reserved', description: 'An upcoming reservation is assigned.' },
  Ready: { className: 'ready', description: 'Prepared and ready to welcome a guest.' },
  Occupied: { className: 'occupied', description: 'A guest is currently staying.' },
}

export interface RoomPhoto {
  id: string
  /** Remote URL or a client-side data URL produced from an uploaded file. */
  src: string
}

export interface HousekeepingNote {
  id: string
  text: string
  author: string
  createdAt: string // ISO timestamp
}

export interface HotelRoom {
  /** Identifier used by reservations, e.g. "Room 01". */
  id: string
  name: string
  type: string
  description: string
  maxOccupancy: number
  bedConfiguration: string
  amenities: string[]
  /** Nightly rate in LKR. */
  price: number
  photos: RoomPhoto[]
  primaryPhotoId: string | null
  status: OperationalStatus
  statusUpdatedAt: string // ISO timestamp
  statusUpdatedBy: string
  notes: HousekeepingNote[]
  /** Colour used to tell rooms apart on the calendar. */
  color: string
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`

export const initialRooms: HotelRoom[] = [
  {
    id: 'Room 01',
    name: 'Single Tree Deluxe',
    type: 'Deluxe Double Room',
    description: 'A cosy double room facing the lone mara tree on the eastern lawn. Warm timber floors, a reading nook by the window and quick access to the breakfast verandah.',
    maxOccupancy: 2,
    bedConfiguration: '1 Queen bed',
    amenities: ['Garden view', 'Hot water shower', 'Electric blanket', 'Wi-Fi', 'Tea & coffee station', 'Complimentary breakfast'],
    price: 22800,
    photos: [
      { id: 'p01-1', src: unsplash('photo-1611892440504-42a792e24d32') },
      { id: 'p01-2', src: unsplash('photo-1505693416388-ac5ce068fe85') },
      { id: 'p01-3', src: unsplash('photo-1584622650111-993a426fbf0a') },
    ],
    primaryPhotoId: 'p01-1',
    status: 'Reserved',
    statusUpdatedAt: '2026-11-15T16:40:00',
    statusUpdatedBy: 'Mira Jayasinghe (Manager)',
    notes: [
      { id: 'n01-1', text: 'Extra pillows requested by next guest — place before arrival.', author: 'Sewwandi Silva (Housekeeper)', createdAt: '2026-11-15T10:05:00' },
    ],
    color: '#27877D',
  },
  {
    id: 'Room 02',
    name: "Planter's Vista",
    type: 'Mountain View Double',
    description: "Upper-floor room with a wide window over the tea terraces towards Pidurutalagala. Styled after a colonial planter's study with a writing desk and heritage prints.",
    maxOccupancy: 2,
    bedConfiguration: '1 King bed',
    amenities: ['Mountain view', 'Writing desk', 'Hot water shower', 'Room heater', 'Wi-Fi', 'Complimentary breakfast'],
    price: 22800,
    photos: [
      { id: 'p02-1', src: unsplash('photo-1616594039964-ae9021a400a0') },
      { id: 'p02-2', src: unsplash('photo-1522771739844-6a9f6d5f14af') },
      { id: 'p02-3', src: unsplash('photo-1595526114035-0d45ed16cfbf') },
    ],
    primaryPhotoId: 'p02-1',
    status: 'Occupied',
    statusUpdatedAt: '2026-11-14T14:15:00',
    statusUpdatedBy: 'Mira Jayasinghe (Manager)',
    notes: [
      { id: 'n02-1', text: 'Guest asked for an extra wool blanket and hot water bottle in the evenings.', author: 'Lakmali Fernando (Housekeeper)', createdAt: '2026-11-15T19:30:00' },
    ],
    color: '#3B6FD4',
  },
  {
    id: 'Room 03',
    name: 'Highland Heritage',
    type: 'Heritage Suite',
    description: 'A quiet suite in the original 1930s bungalow wing with a private sitting area, fireplace and antique furniture. Ideal for longer, slower stays.',
    maxOccupancy: 3,
    bedConfiguration: '1 King bed + 1 Day bed',
    amenities: ['Fireplace', 'Private sitting area', 'Bathtub', 'Electric blanket', 'Wi-Fi', 'Complimentary breakfast'],
    price: 26000,
    photos: [
      { id: 'p03-1', src: unsplash('photo-1618221195710-dd6b41faaea6') },
      { id: 'p03-2', src: unsplash('photo-1540518614846-7eded433c457') },
      { id: 'p03-3', src: unsplash('photo-1586023492125-27b2c045efd7') },
    ],
    primaryPhotoId: 'p03-1',
    status: 'Ready',
    statusUpdatedAt: '2026-11-15T11:20:00',
    statusUpdatedBy: 'Ruwan Perera (Deputy Manager)',
    notes: [],
    color: '#B5651D',
  },
  {
    id: 'Room 04',
    name: 'Pedro Valley Suite',
    type: 'Family Suite',
    description: 'The largest suite, overlooking the Pedro valley and tea estate. Two sleeping areas make it the best choice for families and small groups.',
    maxOccupancy: 4,
    bedConfiguration: '1 King bed + 2 Single beds',
    amenities: ['Valley view', 'Family layout', 'Bathtub', 'Room heater', 'Wi-Fi', 'Complimentary breakfast'],
    price: 28000,
    photos: [
      { id: 'p04-1', src: unsplash('photo-1616486338812-3dadae4b4ace') },
      { id: 'p04-2', src: unsplash('photo-1590490360182-c33d57733427') },
      { id: 'p04-3', src: unsplash('photo-1631049307264-da0ec9d70304') },
    ],
    primaryPhotoId: 'p04-1',
    status: 'Occupied',
    statusUpdatedAt: '2026-11-15T15:05:00',
    statusUpdatedBy: 'Mira Jayasinghe (Manager)',
    notes: [
      { id: 'n04-1', text: 'Extra bed set up for teenager. Check bathroom tap (repaired Nov 9) on next service.', author: 'Sewwandi Silva (Housekeeper)', createdAt: '2026-11-15T12:10:00' },
    ],
    color: '#8E44AD',
  },
]

export const PLACEHOLDER_PHOTO = '/placeholder.jpg'

export const primaryPhoto = (room: HotelRoom): string =>
  room.photos.find(photo => photo.id === room.primaryPhotoId)?.src ?? room.photos[0]?.src ?? PLACEHOLDER_PHOTO

/** Shape expected by the existing Reservations module (keeps its booking rates in sync). */
export const toRoomCatalog = (rooms: HotelRoom[]): RoomInfo[] =>
  rooms.map(room => ({
    name: room.id,
    type: room.name,
    rate: room.price,
    capacity: room.maxOccupancy,
    status: room.status === 'Occupied' ? 'Occupied' : room.status === 'Reserved' ? 'Reserved' : 'Available',
  }))

// ---------- Permissions ----------

export const roomPermissions = (role: Role) => ({
  /** Pricing is a commercial decision: Owner and Manager only. */
  editPrice: role === 'Owner' || role === 'Manager',
  /** Descriptive details, amenities, capacity and photos. */
  editDetails: role === 'Owner' || role === 'Manager' || role === 'Deputy Manager',
  /** Every role, incl. housekeepers, can update status and housekeeping notes. */
  editStatus: true,
  addNotes: true,
  /** Housekeepers do not see guest contact details or booking amounts. */
  viewGuestFinancials: role !== 'Housekeeper',
  openReservations: role !== 'Housekeeper',
})

export const STAFF_NAME: Record<Role, string> = {
  Owner: 'Anushka Senanayake',
  Manager: 'Mira Jayasinghe',
  'Deputy Manager': 'Ruwan Perera',
  Housekeeper: 'Sewwandi Silva',
}

// ---------- Dates (all hotel dates are local calendar dates, "YYYY-MM-DD") ----------

export const toISODate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export const parseISODate = (value: string) => {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayISO = () => toISODate(new Date())

export const addDays = (value: string, days: number) => {
  const date = parseISODate(value)
  date.setDate(date.getDate() + days)
  return toISODate(date)
}

export const daysBetween = (from: string, to: string) =>
  Math.round((parseISODate(to).getTime() - parseISODate(from).getTime()) / 86400000)

export const formatDate = (value: string, options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  parseISODate(value).toLocaleDateString('en-US', options)

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })

// ---------- Reservation helpers ----------

/** Reservations that still hold a room (cancelled ones never block dates). */
export const isBlocking = (reservation: Reservation) => reservation.status !== 'Cancelled'

/**
 * A guest occupies the nights from check-in up to, but not including, the check-out date.
 */
export const occupiesNight = (reservation: Reservation, date: string) =>
  isBlocking(reservation) && reservation.checkIn <= date && date < reservation.checkOut

export interface RoomReservationSummary {
  current?: Reservation
  upcoming: Reservation[]
}

export const getRoomReservations = (roomId: string, reservations: Reservation[], today = todayISO()): RoomReservationSummary => {
  const forRoom = reservations
    .filter(item => item.room === roomId && isBlocking(item) && item.status !== 'Checked Out')
    .sort((a, b) => a.checkIn.localeCompare(b.checkIn))
  const current = forRoom.find(item => item.checkIn <= today && today < item.checkOut)
  const upcoming = forRoom.filter(item => item !== current && item.checkIn >= today)
  return { current, upcoming }
}

/** What a guest-facing booking channel would show: no internal status, only availability. */
export const getGuestAvailability = (roomId: string, reservations: Reservation[], date = todayISO()) => {
  const booked = reservations.some(item => item.room === roomId && occupiesNight(item, date))
  if (!booked) return { available: true, label: 'Available tonight' }
  let next = date
  for (let i = 0; i < 365; i += 1) {
    next = addDays(next, 1)
    if (!reservations.some(item => item.room === roomId && occupiesNight(item, next))) break
  }
  return { available: false, label: `Booked tonight · next available ${formatDate(next, { month: 'short', day: 'numeric' })}` }
}

// ---------- Calendar layout ----------

export const startOfWeek = (iso: string) => addDays(iso, -((parseISODate(iso).getDay() + 6) % 7)) // Monday

export interface CalendarSegment {
  reservation: Reservation
  /** Half-day columns within a week (0..14). Day d spans column 2d (morning) and 2d+1 (afternoon). */
  start: number
  end: number
  continuesBefore: boolean
  continuesAfter: boolean
  lane: number
}

/**
 * Lays reservations out on a 7-day row. Each bar starts in the afternoon of the check-in day and ends
 * in the morning of the check-out day, so the check-out day is never shown as fully reserved and a
 * same-day arrival sits next to a departure without overlapping.
 */
export function layoutWeek(reservations: Reservation[], weekStart: string): CalendarSegment[] {
  const segments = reservations.flatMap(reservation => {
    const start = daysBetween(weekStart, reservation.checkIn) * 2 + 1
    const end = daysBetween(weekStart, reservation.checkOut) * 2 + 1
    if (end <= 0 || start >= 14) return []
    return [{ reservation, start: Math.max(0, start), end: Math.min(14, end), continuesBefore: start < 0, continuesAfter: end > 14, lane: 0 }]
  }).sort((a, b) => a.start - b.start || b.end - a.end)

  const laneEnds: number[] = []
  segments.forEach(segment => {
    let lane = laneEnds.findIndex(end => end <= segment.start)
    if (lane === -1) { lane = laneEnds.length; laneEnds.push(0) }
    laneEnds[lane] = segment.end
    segment.lane = lane
  })
  return segments
}

// ---------- Client-side image handling ----------

export const MAX_PHOTOS = 10
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
const MAX_DIMENSION = 1400

/**
 * Reads an image file in the browser and downsizes it to a JPEG data URL so it can be kept in
 * application state (and localStorage) without a backend upload service.
 */
export const fileToPhotoDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) return reject(new Error(`"${file.name}" is not an image file.`))
    if (file.size > MAX_UPLOAD_BYTES) return reject(new Error(`"${file.name}" is larger than 10 MB.`))
    const reader = new FileReader()
    reader.onerror = () => reject(new Error(`Could not read "${file.name}".`))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error(`"${file.name}" could not be decoded as an image.`))
      image.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * scale)
        canvas.height = Math.round(image.height * scale)
        const context = canvas.getContext('2d')
        if (!context) return reject(new Error('Image processing is not supported in this browser.'))
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })

export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
