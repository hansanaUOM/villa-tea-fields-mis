'use client'

import React, { useState, useMemo } from 'react'
import {
  Download,
  Search,
  Filter,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  Briefcase,
  Users,
  Copy,
  ArrowRight,
  ShieldCheck
} from 'lucide-react'

export interface AuditLogEntry {
  id: string
  timestamp: string
  displayTime: string
  assignedWorkGroup:
    | 'Owner Works'
    | 'Manager Works'
    | 'Deputy Manager Works'
    | 'Housekeeper 1 Works'
    | 'Housekeeper 2 Works'
    | 'Automated System Tasks'
  actor: {
    name: string
    role: string
    initials: string
    email: string
    isSystem?: boolean
  }
  action: string
  category: string
  severity: 'Critical' | 'Warning' | 'Standard' | 'Info'
  target: string
  targetId?: string
  description: string
  ipAddress: string
  location: string
  device: string
  changes?: {
    field: string
    before: string
    after: string
  }[]
  metadata?: Record<string, string | number>
}

export const auditLogData: AuditLogEntry[] = [
  // 1. Owner: Anushka Senanayake - Payment verification
  {
    id: 'AUD-9852',
    timestamp: '2026-11-14T09:42:15+05:30',
    displayTime: 'Today, 9:42 AM',
    assignedWorkGroup: 'Owner Works',
    actor: {
      name: 'Anushka Senanayake',
      role: 'Owner',
      initials: 'AS',
      email: 'anushka@villateafields.lk'
    },
    action: 'Payment Verified & Approved',
    category: 'Finance',
    severity: 'Standard',
    target: 'Reservation VT-2482 (Nimal Perera)',
    targetId: 'VT-2482',
    description: 'Bank transfer receipt of LKR 45,600 verified against Commercial Bank transaction ref #CB-99410. Booking marked Confirmed.',
    ipAddress: '192.168.1.104',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Safari 18.1 · macOS',
    changes: [
      { field: 'paymentStatus', before: 'Unverified', after: 'Verified' },
      { field: 'paidAmount', before: 'LKR 0', after: 'LKR 45,600' }
    ],
    metadata: {
      bankReference: 'CB-99410',
      totalValue: 'LKR 45,600'
    }
  },

  // 2. Owner: Anushka Senanayake - Reservation approval
  {
    id: 'AUD-9851',
    timestamp: '2026-11-14T08:16:30+05:30',
    displayTime: 'Today, 8:16 AM',
    assignedWorkGroup: 'Owner Works',
    actor: {
      name: 'Anushka Senanayake',
      role: 'Owner',
      initials: 'AS',
      email: 'anushka@villateafields.lk'
    },
    action: 'Reservation Request Approved',
    category: 'Reservations',
    severity: 'Standard',
    target: 'Reservation VT-2481 (Amelia Hart)',
    targetId: 'VT-2481',
    description: 'Direct booking request for Room 02 (Nov 14 – Nov 17 · 3 nights) approved. Housekeeping notified for VIP arrival.',
    ipAddress: '192.168.1.104',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Safari 18.1 · macOS',
    changes: [
      { field: 'status', before: 'Pending Approval', after: 'Confirmed' },
      { field: 'roomAssigned', before: 'Room 02 (Tentative)', after: 'Room 02 (Locked)' }
    ],
    metadata: {
      guestName: 'Amelia Hart',
      stayLength: '3 Nights',
      totalLKR: '68,400'
    }
  },

  // 3. Housekeeper 1: Sewwandi Silva - Departure clean
  {
    id: 'AUD-9850',
    timestamp: '2026-11-14T08:02:44+05:30',
    displayTime: 'Today, 8:02 AM',
    assignedWorkGroup: 'Housekeeper 1 Works',
    actor: {
      name: 'Sewwandi Silva',
      role: 'Housekeeper 1',
      initials: 'SS',
      email: 'sewwandi@villateafields.lk'
    },
    action: 'Departure Clean Completed & Submitted for Inspection',
    category: 'Housekeeping',
    severity: 'Info',
    target: 'Room 03 (Tea Garden View)',
    targetId: 'Room 03',
    description: 'Departure clean and linen change completed. Submitted checklist for manager inspection sign-off.',
    ipAddress: '172.22.64.12',
    location: 'Villa Staff Wi-Fi',
    device: 'Villa Mobile App · Android',
    changes: [
      { field: 'roomStatus', before: 'Cleaning In Progress', after: 'Inspection Required' }
    ],
    metadata: {
      shift: 'Morning Shift',
      cleaningDuration: '42 mins'
    }
  },

  // 4. Manager: Mira Jayasinghe - Rate override
  {
    id: 'AUD-9849',
    timestamp: '2026-11-14T07:45:10+05:30',
    displayTime: 'Today, 7:45 AM',
    assignedWorkGroup: 'Manager Works',
    actor: {
      name: 'Mira Jayasinghe',
      role: 'Manager',
      initials: 'MJ',
      email: 'mira@villateafields.lk'
    },
    action: 'Repeat Guest Loyalty Discount Applied',
    category: 'Pricing',
    severity: 'Warning',
    target: 'Room 01 (Nuwara Valley Suite)',
    targetId: 'Room 01',
    description: '10% loyalty repeat guest rate concession authorized for Nimal Perera. Room daily rate adjusted from LKR 22,800 to LKR 20,520.',
    ipAddress: '192.168.1.112',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Chrome 131 · Windows 11',
    changes: [
      { field: 'dailyRate', before: 'LKR 22,800', after: 'LKR 20,520' }
    ],
    metadata: {
      discount: '10% Loyalty Concession',
      authorizedBy: 'Mira Jayasinghe (Manager)'
    }
  },

  // 5. Owner: Anushka Senanayake - PII export
  {
    id: 'AUD-9848',
    timestamp: '2026-11-13T21:18:22+05:30',
    displayTime: 'Yesterday, 9:18 PM',
    assignedWorkGroup: 'Owner Works',
    actor: {
      name: 'Anushka Senanayake',
      role: 'Owner',
      initials: 'AS',
      email: 'anushka@villateafields.lk'
    },
    action: 'Guest Directory Exported (PII Access)',
    category: 'Security',
    severity: 'Critical',
    target: 'Guest Registry (186 Profiles)',
    description: 'Full customer database exported as password-encrypted CSV for year-end compliance reporting. Verified via hardware 2FA.',
    ipAddress: '192.168.1.104',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Safari 18.1 · macOS',
    changes: [
      { field: 'exportAccess', before: 'Restricted', after: 'Encrypted CSV Generated' }
    ],
    metadata: {
      profilesCount: 186,
      authMethod: 'Hardware 2FA Key'
    }
  },

  // 6. System: OTA Sync
  {
    id: 'AUD-9847',
    timestamp: '2026-11-13T19:34:02+05:30',
    displayTime: 'Yesterday, 7:34 PM',
    assignedWorkGroup: 'Automated System Tasks',
    actor: {
      name: 'System Channel Sync',
      role: 'Automated Service',
      initials: 'SYS',
      email: 'sync@villateafields.lk',
      isSystem: true
    },
    action: 'OTA Inbound Booking Synced (Agoda)',
    category: 'Channels',
    severity: 'Info',
    target: 'Reservation VT-2487 (Maya & Leo Chen)',
    targetId: 'VT-2487',
    description: 'New booking ingested from Agoda. Room 04 calendar automatically locked across Booking.com and Airbnb.',
    ipAddress: '35.187.240.11',
    location: 'Cloud Gateway',
    device: 'API Webhook Connector',
    changes: [
      { field: 'room04Availability', before: 'Available', after: 'Reserved' }
    ]
  },

  // 7. Manager: Mira Jayasinghe - Guest profile & dietary
  {
    id: 'AUD-9846',
    timestamp: '2026-11-13T16:38:50+05:30',
    displayTime: 'Yesterday, 4:38 PM',
    assignedWorkGroup: 'Manager Works',
    actor: {
      name: 'Mira Jayasinghe',
      role: 'Manager',
      initials: 'MJ',
      email: 'mira@villateafields.lk'
    },
    action: 'Guest Dietary Preference & Allergy Logged',
    category: 'Operations',
    severity: 'Info',
    target: 'Guest Profile #GP-109 (Sophie Laurent)',
    description: 'Updated meal notes: "Celiac (Strict gluten-free required) + prefers Ceylon Earl Grey with organic honey". Notified kitchen.',
    ipAddress: '192.168.1.112',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Chrome 131 · Windows 11',
    changes: [
      { field: 'dietaryFlag', before: 'None', after: 'Gluten-Free / Celiac Alert' }
    ]
  },

  // 8. Owner: Anushka Senanayake - Refund
  {
    id: 'AUD-9845',
    timestamp: '2026-11-13T14:12:05+05:30',
    displayTime: 'Yesterday, 2:12 PM',
    assignedWorkGroup: 'Owner Works',
    actor: {
      name: 'Anushka Senanayake',
      role: 'Owner',
      initials: 'AS',
      email: 'anushka@villateafields.lk'
    },
    action: 'Guest Refund Executed',
    category: 'Finance',
    severity: 'Warning',
    target: 'Reservation VT-2470 (Priya Wickramasinghe)',
    targetId: 'VT-2470',
    description: 'Refund of LKR 12,000 approved and executed via PayHere gateway following cancellation within policy grace period.',
    ipAddress: '192.168.1.104',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Safari 18.1 · macOS',
    changes: [
      { field: 'refundStatus', before: 'Pending', after: 'Completed (PayHere)' }
    ],
    metadata: {
      refundAmount: 'LKR 12,000',
      reason: 'Medical travel postponement'
    }
  },

  // 9. Housekeeper 2: Lakmali Fernando - Arrival staging
  {
    id: 'AUD-9844',
    timestamp: '2026-11-13T13:40:15+05:30',
    displayTime: 'Yesterday, 1:40 PM',
    assignedWorkGroup: 'Housekeeper 2 Works',
    actor: {
      name: 'Lakmali Fernando',
      role: 'Housekeeper 2',
      initials: 'LF',
      email: 'lakmali@villateafields.lk'
    },
    action: 'Room Arrival Staging & Fresh Flowers Setup',
    category: 'Housekeeping',
    severity: 'Info',
    target: 'Room 01 (Nuwara Valley Suite)',
    targetId: 'Room 01',
    description: 'Staged room for guest arrival: placed fresh hydrangeas, preset room heater to 21°C, and placed welcome fruit basket.',
    ipAddress: '172.22.64.14',
    location: 'Villa Staff Wi-Fi',
    device: 'Villa Mobile App · Android',
    changes: [
      { field: 'roomReadiness', before: 'Cleaned', after: 'Staged & Ready' }
    ]
  },

  // 10. System: Security lockout
  {
    id: 'AUD-9843',
    timestamp: '2026-11-13T11:05:40+05:30',
    displayTime: 'Yesterday, 11:05 AM',
    assignedWorkGroup: 'Automated System Tasks',
    actor: {
      name: 'System Security Guard',
      role: 'Automated Service',
      initials: 'SEC',
      email: 'security@villateafields.lk',
      isSystem: true
    },
    action: 'Repeated Failed Login Lockout Triggered',
    category: 'Security',
    severity: 'Critical',
    target: 'User Account (ruwan.p@villateafields.lk)',
    description: '4 consecutive invalid password attempts detected from external cellular IP. Account locked for 15 minutes per security policy.',
    ipAddress: '112.134.78.22',
    location: 'Cellular Gateway',
    device: 'Mobile Safari / iOS'
  },

  // 11. Deputy Manager: Ruwan Perera - Housekeeping inspection
  {
    id: 'AUD-9842',
    timestamp: '2026-11-12T17:40:00+05:30',
    displayTime: 'Nov 12, 5:40 PM',
    assignedWorkGroup: 'Deputy Manager Works',
    actor: {
      name: 'Ruwan Perera',
      role: 'Deputy Manager',
      initials: 'RP',
      email: 'ruwan@villateafields.lk'
    },
    action: 'Housekeeping Inspection Quality Sign-off',
    category: 'Housekeeping',
    severity: 'Standard',
    target: 'Room 02 (Highland Vista)',
    targetId: 'Room 02',
    description: 'Deputy Manager inspection completed: fresh bed linens, tea basket, water carafes, and fireplace logs verified. Room ready for arrival.',
    ipAddress: '192.168.1.115',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'iPad Pro · Safari',
    changes: [
      { field: 'inspectionStatus', before: 'Pending Inspection', after: 'Passed 100%' }
    ]
  },

  // 12. System: Night audit closure
  {
    id: 'AUD-9841',
    timestamp: '2026-11-12T23:59:59+05:30',
    displayTime: 'Nov 12, 11:59 PM',
    assignedWorkGroup: 'Automated System Tasks',
    actor: {
      name: 'Automated System Daemon',
      role: 'Automated Service',
      initials: 'SYS',
      email: 'daemon@villateafields.lk',
      isSystem: true
    },
    action: 'Daily Night Audit & Day-End Ledger Closure',
    category: 'Finance',
    severity: 'Info',
    target: 'Daily Ledger (Nov 12, 2026)',
    description: 'Automated daily closure completed: revenue tallied LKR 124,000, daily occupancy 75%, database snapshot encrypted and archived.',
    ipAddress: '127.0.0.1',
    location: 'Local MIS Server',
    device: 'Night Daemon v2.4'
  },

  // 13. Housekeeper 2: Lakmali Fernando - Maintenance defect flag
  {
    id: 'AUD-9840',
    timestamp: '2026-11-12T16:10:20+05:30',
    displayTime: 'Nov 12, 4:10 PM',
    assignedWorkGroup: 'Housekeeper 2 Works',
    actor: {
      name: 'Lakmali Fernando',
      role: 'Housekeeper 2',
      initials: 'LF',
      email: 'lakmali@villateafields.lk'
    },
    action: 'Maintenance Defect Flagged: Room 04 Tap Leak',
    category: 'Housekeeping',
    severity: 'Warning',
    target: 'Room 04 (Bathroom Tap)',
    targetId: 'Room 04',
    description: 'Noticed persistent water drip from hot water basin mixer during bathroom wipe-down. Maintenance ticket dispatched to Deputy Manager.',
    ipAddress: '172.22.64.14',
    location: 'Villa Staff Wi-Fi',
    device: 'Villa Mobile App · Android',
    changes: [
      { field: 'maintenanceTicket', before: 'None', after: 'Pending Plumbing Repair' }
    ]
  },

  // 14. System: Webhook deposit capture
  {
    id: 'AUD-9839',
    timestamp: '2026-11-12T12:04:19+05:30',
    displayTime: 'Nov 12, 12:04 PM',
    assignedWorkGroup: 'Automated System Tasks',
    actor: {
      name: 'PayHere Webhook',
      role: 'Automated Service',
      initials: 'PH',
      email: 'notifications@payhere.lk',
      isSystem: true
    },
    action: 'Direct Gateway 50% Deposit Captured',
    category: 'Finance',
    severity: 'Standard',
    target: 'Reservation VT-2483 (Sophie Laurent)',
    targetId: 'VT-2483',
    description: 'Online card payment of LKR 56,000 received via PayHere gateway. Assigned automatically to reservation deposit balance.',
    ipAddress: '13.250.144.89',
    location: 'Payment Gateway Node',
    device: 'HTTPS API Webhook'
  },

  // 15. Manager: Mira Jayasinghe - Breakfast manifest
  {
    id: 'AUD-9838',
    timestamp: '2026-11-12T08:30:00+05:30',
    displayTime: 'Nov 12, 8:30 AM',
    assignedWorkGroup: 'Manager Works',
    actor: {
      name: 'Mira Jayasinghe',
      role: 'Manager',
      initials: 'MJ',
      email: 'mira@villateafields.lk'
    },
    action: 'Morning Breakfast Manifest Finalized with Kitchen',
    category: 'Operations',
    severity: 'Info',
    target: 'Daily Kitchen Breakfast Manifest',
    description: 'Adjusted breakfast count to 7 covers; confirmed 2 guests requested Sri Lankan String Hoppers with Kiri Hodi and 1 celiac preparation.',
    ipAddress: '192.168.1.112',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Chrome 131 · Windows 11',
    changes: [
      { field: 'breakfastCovers', before: '4 Covers', after: '7 Covers' }
    ]
  },

  // 16. Owner: Anushka Senanayake - Security policy
  {
    id: 'AUD-9837',
    timestamp: '2026-11-11T18:10:45+05:30',
    displayTime: 'Nov 11, 6:10 PM',
    assignedWorkGroup: 'Owner Works',
    actor: {
      name: 'Anushka Senanayake',
      role: 'Owner',
      initials: 'AS',
      email: 'anushka@villateafields.lk'
    },
    action: 'Staff Session Idle Timeout Policy Updated',
    category: 'Security',
    severity: 'Warning',
    target: 'System Authentication Policy',
    description: 'Idle session timeout reduced from 120 minutes to 45 minutes for all front desk and mobile staff terminals.',
    ipAddress: '192.168.1.104',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Safari 18.1 · macOS',
    changes: [
      { field: 'sessionTimeout', before: '120 Minutes', after: '45 Minutes' }
    ]
  },

  // 17. Housekeeper 1: Sewwandi Silva - Tea amenities
  {
    id: 'AUD-9836',
    timestamp: '2026-11-11T14:22:10+05:30',
    displayTime: 'Nov 11, 2:22 PM',
    assignedWorkGroup: 'Housekeeper 1 Works',
    actor: {
      name: 'Sewwandi Silva',
      role: 'Housekeeper 1',
      initials: 'SS',
      email: 'sewwandi@villateafields.lk'
    },
    action: 'Ceylon Tea Station & Amenities Replenished',
    category: 'Housekeeping',
    severity: 'Info',
    target: 'Room 04 (Grand Master Suite)',
    targetId: 'Room 04',
    description: 'Restocked estate Broken Orange Pekoe (BOP) tea, Jasmine green tea, freshly roasted coffee pods, and crystal sugar sticks.',
    ipAddress: '172.22.64.12',
    location: 'Villa Staff Wi-Fi',
    device: 'Villa Mobile App · Android',
    changes: [
      { field: 'teaStationStock', before: 'Low', after: 'Full Replenishment' }
    ]
  },

  // 18. Deputy Manager: Ruwan Perera - Shift handover
  {
    id: 'AUD-9835',
    timestamp: '2026-11-11T20:00:15+05:30',
    displayTime: 'Nov 11, 8:00 PM',
    assignedWorkGroup: 'Deputy Manager Works',
    actor: {
      name: 'Ruwan Perera',
      role: 'Deputy Manager',
      initials: 'RP',
      email: 'ruwan@villateafields.lk'
    },
    action: 'Evening Shift Handover & Keycard Re-audit',
    category: 'Front Desk',
    severity: 'Standard',
    target: 'Front Desk Keycard Terminal & Cash Drawer',
    description: 'Evening shift handover completed. Audited room keys and keycard batch. Cash drawer balance of LKR 18,500 reconciled with zero discrepancy.',
    ipAddress: '192.168.1.115',
    location: 'Nuwara Eliya, Sri Lanka',
    device: 'Front Desk iPad Terminal',
    changes: [
      { field: 'shiftSupervisor', before: 'Mira (GM)', after: 'Ruwan (Duty Mgr)' }
    ]
  }
]

export function AuditLogsView({ notify }: { notify?: (msg: string) => void }) {
  const [search, setSearch] = useState('')
  const [assignedWorkFilter, setAssignedWorkFilter] = useState('All Assigned Works')
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [copied, setCopied] = useState(false)
  const itemsPerPage = 8

  const showToast = (message: string) => {
    if (notify) {
      notify(message)
    } else {
      alert(message)
    }
  }

  // Filter logs based on search and assigned work dropdown
  const filteredLogs = useMemo(() => {
    return auditLogData.filter((log) => {
      // 1. Search query
      const q = search.toLowerCase()
      const matchesSearch =
        !search.trim() ||
        log.id.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.actor.name.toLowerCase().includes(q) ||
        log.actor.role.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.category.toLowerCase().includes(q)

      // 2. Assigned work dropdown filter
      let matchesWork = true
      if (assignedWorkFilter === 'Owner Works') {
        matchesWork = log.assignedWorkGroup === 'Owner Works'
      } else if (assignedWorkFilter === 'Manager Works') {
        matchesWork = log.assignedWorkGroup === 'Manager Works'
      } else if (assignedWorkFilter === 'Deputy Manager Works') {
        matchesWork = log.assignedWorkGroup === 'Deputy Manager Works'
      } else if (assignedWorkFilter === 'Housekeeper 1 Works') {
        matchesWork = log.assignedWorkGroup === 'Housekeeper 1 Works'
      } else if (assignedWorkFilter === 'Housekeeper 2 Works') {
        matchesWork = log.assignedWorkGroup === 'Housekeeper 2 Works'
      } else if (assignedWorkFilter === 'Automated System Tasks') {
        matchesWork = log.assignedWorkGroup === 'Automated System Tasks'
      }

      return matchesSearch && matchesWork
    })
  }, [search, assignedWorkFilter])

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredLogs.slice(start, start + itemsPerPage)
  }, [filteredLogs, currentPage])

  // Count by work group
  const workCounts = useMemo(() => {
    return {
      all: auditLogData.length,
      owner: auditLogData.filter((l) => l.assignedWorkGroup === 'Owner Works').length,
      manager: auditLogData.filter((l) => l.assignedWorkGroup === 'Manager Works').length,
      deputy: auditLogData.filter((l) => l.assignedWorkGroup === 'Deputy Manager Works').length,
      hk1: auditLogData.filter((l) => l.assignedWorkGroup === 'Housekeeper 1 Works').length,
      hk2: auditLogData.filter((l) => l.assignedWorkGroup === 'Housekeeper 2 Works').length,
      system: auditLogData.filter((l) => l.assignedWorkGroup === 'Automated System Tasks').length
    }
  }, [])

  const handleExportCSV = () => {
    const headers = ['Audit ID', 'Timestamp', 'Staff Member', 'Role', 'Assigned Work Action', 'Category', 'Target', 'Severity']
    const rows = filteredLogs.map((l) => [
      l.id,
      l.timestamp,
      `"${l.actor.name}"`,
      `"${l.actor.role}"`,
      `"${l.action}"`,
      `"${l.category}"`,
      `"${l.target}"`,
      l.severity
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `villa_tea_fields_audit_log.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Audit log exported successfully as CSV')
  }

  const copyCitation = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    showToast('Copied record details to clipboard')
  }

  return (
    <div>
      {/* Clean Page Heading */}
      <div className="page-heading">
        <div>
          <p className="eyebrow">ADMINISTRATION</p>
          <h1>Audit logs</h1>
          <p className="subheading">
            Track actions and assigned works divided across the Owner, Manager, Deputy Manager, and Two Housekeepers.
          </p>
        </div>

        <button className="button secondary" onClick={handleExportCSV}>
          <Download size={15} />
          <span>Export log</span>
        </button>
      </div>

      {/* Clean 4-Card Summary Strip */}
      <div className="reservation-summary" style={{ marginBottom: '16px' }}>
        <div>
          <span>Total Audit Logs</span>
          <strong>{workCounts.all} records</strong>
        </div>
        <div>
          <span>Owner Approvals & Finance</span>
          <strong className="gold-text">{workCounts.owner} actions</strong>
        </div>
        <div>
          <span>Operations & Front Desk</span>
          <strong>{workCounts.manager + workCounts.deputy} actions</strong>
        </div>
        <div>
          <span>Housekeeping Cleans & Prep</span>
          <strong>{workCounts.hk1 + workCounts.hk2} tasks</strong>
        </div>
      </div>

      {/* Main Card with Dropdown Filter & Table */}
      <section className="card" style={{ padding: '0 16px' }}>
        {/* Simple & Clean Filter Row */}
        <div className="filter-row">
          {/* Search */}
          <label className="table-search" style={{ width: '280px' }}>
            <Search size={15} />
            <input
              placeholder="Search by action, staff, or ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <X size={13} style={{ color: '#888' }} />
              </button>
            )}
          </label>

          {/* User Requested: Dropdown to filter by Assigned Work */}
          <label className="status-filter" style={{ minWidth: '320px' }}>
            <Briefcase size={14} style={{ color: '#416849', flexShrink: 0 }} />
            <select
              value={assignedWorkFilter}
              onChange={(e) => {
                setAssignedWorkFilter(e.target.value)
                setCurrentPage(1)
              }}
              style={{ width: '100%', fontWeight: 600, color: '#314436' }}
              aria-label="Filter by Assigned Work"
            >
              <option value="All Assigned Works">
                All Assigned Works ({workCounts.all})
              </option>
              <option value="Owner Works">
                Owner Works — Approvals, Finance & Security (Anushka) ({workCounts.owner})
              </option>
              <option value="Manager Works">
                Manager Works — Operations, F&B & Loyalty (Mira) ({workCounts.manager})
              </option>
              <option value="Deputy Manager Works">
                Deputy Manager Works — Inspections & Front Desk (Ruwan) ({workCounts.deputy})
              </option>
              <option value="Housekeeper 1 Works">
                Housekeeper 1 Works — Departure Cleans & Tea Station (Sewwandi) ({workCounts.hk1})
              </option>
              <option value="Housekeeper 2 Works">
                Housekeeper 2 Works — Arrival Prep & Turndown (Lakmali) ({workCounts.hk2})
              </option>
              <option value="Automated System Tasks">
                Automated System Tasks — OTA Sync & Night Audit ({workCounts.system})
              </option>
            </select>
          </label>

          {/* Reset button if filter is active */}
          {(search || assignedWorkFilter !== 'All Assigned Works') && (
            <button
              className="button secondary"
              onClick={() => {
                setSearch('')
                setAssignedWorkFilter('All Assigned Works')
                setCurrentPage(1)
                showToast('Filters reset')
              }}
              style={{ height: '32px', fontSize: '9px' }}
            >
              Reset filters
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '9px', color: '#8c958e' }}>
            Showing <strong>{filteredLogs.length}</strong> of {auditLogData.length} entries
          </div>
        </div>

        {/* Clean Data Table */}
        <div className="table-wrap">
          <table className="reservation-table">
            <thead>
              <tr>
                <th style={{ width: '90px' }}>LOG ID</th>
                <th>ASSIGNED WORK ACTION</th>
                <th>STAFF MEMBER</th>
                <th>TARGET / RESOURCE</th>
                <th>CATEGORY</th>
                <th>DATE & TIME</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => {
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedEntry(log)}
                    style={{ cursor: 'pointer' }}
                    className="hover:bg-stone-50/70 transition-colors"
                  >
                    {/* Log ID */}
                    <td>
                      <strong className="id-text" style={{ fontFamily: 'monospace', fontSize: '9px' }}>
                        {log.id}
                      </strong>
                    </td>

                    {/* Action */}
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '9.5px', color: '#273429' }}>
                          {log.action}
                        </strong>
                        <span style={{ fontSize: '8px', color: '#889188' }}>
                          {log.assignedWorkGroup}
                        </span>
                      </div>
                    </td>

                    {/* Staff Member */}
                    <td>
                      <div className="guest-cell">
                        <div
                          className="guest-avatar"
                          style={{
                            backgroundColor: log.actor.isSystem
                              ? '#eff1f4'
                              : log.actor.role === 'Owner'
                              ? '#edf4ed'
                              : log.actor.role === 'Manager'
                              ? '#edf3f6'
                              : log.actor.role === 'Deputy Manager'
                              ? '#f7f2e8'
                              : '#f4efed',
                            color: log.actor.isSystem
                              ? '#506673'
                              : log.actor.role === 'Owner'
                              ? '#32583e'
                              : log.actor.role === 'Manager'
                              ? '#4f7287'
                              : log.actor.role === 'Deputy Manager'
                              ? '#967438'
                              : '#8a5c54'
                          }}
                        >
                          {log.actor.initials}
                        </div>
                        <div>
                          <strong>{log.actor.name}</strong>
                          <small>{log.actor.role}</small>
                        </div>
                      </div>
                    </td>

                    {/* Target */}
                    <td>
                      <span style={{ fontSize: '9px', fontWeight: 600, color: '#38433a', display: 'block' }}>
                        {log.target}
                      </span>
                      {log.targetId && (
                        <small style={{ fontSize: '8px', color: '#8c958e', fontFamily: 'monospace' }}>
                          {log.targetId}
                        </small>
                      )}
                    </td>

                    {/* Category */}
                    <td>
                      <span
                        style={{
                          fontSize: '8px',
                          background: '#f2f5f1',
                          color: '#466249',
                          padding: '3px 7px',
                          borderRadius: '10px',
                          fontWeight: 600
                        }}
                      >
                        {log.category}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td>
                      <span style={{ fontSize: '9px', color: '#3d483f' }}>{log.displayTime}</span>
                    </td>

                    {/* Action */}
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="button secondary"
                        style={{ height: '26px', padding: '0 8px', fontSize: '8px' }}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedEntry(log)
                        }}
                      >
                        <Eye size={12} />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filteredLogs.length === 0 && (
            <div className="empty-state">
              <Search size={24} />
              <strong>No logs found for this work filter</strong>
              <span>Try selecting another assigned work option from the dropdown.</span>
              <button
                className="button secondary"
                onClick={() => {
                  setSearch('')
                  setAssignedWorkFilter('All Assigned Works')
                  setCurrentPage(1)
                }}
                style={{ marginTop: '6px' }}
              >
                Clear filter
              </button>
            </div>
          )}
        </div>

        {/* Pager Footer */}
        <div className="table-footer">
          <span>
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
          </span>
          <div className="pager">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              aria-label="Previous Page"
              style={{ opacity: currentPage === 1 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={currentPage === i + 1 ? 'page-current' : ''}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next Page"
              style={{ opacity: currentPage === totalPages ? 0.4 : 1 }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Clean Detail Inspection Modal */}
      {selectedEntry && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedEntry(null)
          }}
        >
          <section className="modal" style={{ width: 'min(520px, 95vw)' }}>
            {/* Header */}
            <div className="modal-head">
              <div>
                <p className="eyebrow">AUDIT RECORD DETAILS · {selectedEntry.id}</p>
                <h2 style={{ fontSize: '17px', margin: 0 }}>{selectedEntry.action}</h2>
              </div>
              <button
                className="icon-button"
                onClick={() => setSelectedEntry(null)}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Narrative */}
              <div style={{ background: '#f8faf7', border: '1px solid #edf1eb', borderRadius: '7px', padding: '12px' }}>
                <span style={{ fontSize: '8px', color: '#889189', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '4px' }}>
                  Action Summary
                </span>
                <p style={{ margin: 0, fontSize: '9.5px', color: '#2d382f', lineHeight: 1.5 }}>
                  {selectedEntry.description}
                </p>
              </div>

              {/* 2-column info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#fff', border: '1px solid #edf0eb', borderRadius: '6px', padding: '10px' }}>
                  <span style={{ fontSize: '8px', color: '#889188', textTransform: 'uppercase', display: 'block' }}>
                    Staff Actor
                  </span>
                  <strong style={{ fontSize: '10px', color: '#273429', display: 'block', marginTop: '2px' }}>
                    {selectedEntry.actor.name}
                  </strong>
                  <span style={{ fontSize: '8.5px', color: '#68736a' }}>
                    {selectedEntry.actor.role}
                  </span>
                </div>

                <div style={{ background: '#fff', border: '1px solid #edf0eb', borderRadius: '6px', padding: '10px' }}>
                  <span style={{ fontSize: '8px', color: '#889188', textTransform: 'uppercase', display: 'block' }}>
                    Assigned Work Scope
                  </span>
                  <strong style={{ fontSize: '10px', color: '#273429', display: 'block', marginTop: '2px' }}>
                    {selectedEntry.assignedWorkGroup}
                  </strong>
                  <span style={{ fontSize: '8.5px', color: '#68736a' }}>
                    {selectedEntry.category}
                  </span>
                </div>

                <div style={{ background: '#fff', border: '1px solid #edf0eb', borderRadius: '6px', padding: '10px' }}>
                  <span style={{ fontSize: '8px', color: '#889188', textTransform: 'uppercase', display: 'block' }}>
                    Target Resource
                  </span>
                  <strong style={{ fontSize: '10px', color: '#273429', display: 'block', marginTop: '2px' }}>
                    {selectedEntry.target}
                  </strong>
                  {selectedEntry.targetId && (
                    <span style={{ fontSize: '8.5px', color: '#68736a', fontFamily: 'monospace' }}>
                      {selectedEntry.targetId}
                    </span>
                  )}
                </div>

                <div style={{ background: '#fff', border: '1px solid #edf0eb', borderRadius: '6px', padding: '10px' }}>
                  <span style={{ fontSize: '8px', color: '#889188', textTransform: 'uppercase', display: 'block' }}>
                    Time & Origin
                  </span>
                  <strong style={{ fontSize: '10px', color: '#273429', display: 'block', marginTop: '2px' }}>
                    {selectedEntry.displayTime}
                  </strong>
                  <span style={{ fontSize: '8.5px', color: '#68736a', fontFamily: 'monospace' }}>
                    {selectedEntry.ipAddress}
                  </span>
                </div>
              </div>

              {/* State Changes Diff if present */}
              {selectedEntry.changes && selectedEntry.changes.length > 0 && (
                <div style={{ border: '1px solid #edf0eb', borderRadius: '6px', overflow: 'hidden' }}>
                  <table style={{ margin: 0, fontSize: '8.5px' }}>
                    <thead style={{ background: '#f6f8f5' }}>
                      <tr>
                        <th style={{ padding: '6px 8px' }}>FIELD</th>
                        <th style={{ padding: '6px 8px' }}>BEFORE</th>
                        <th style={{ padding: '6px 8px' }}>AFTER</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEntry.changes.map((diff, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '6px 8px', fontWeight: 600 }}>{diff.field}</td>
                          <td style={{ padding: '6px 8px', color: '#965a50' }}>{diff.before}</td>
                          <td style={{ padding: '6px 8px', color: '#3d6c44', fontWeight: 600 }}>{diff.after}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="modal-footer" style={{ marginTop: '16px' }}>
              <button className="button secondary" onClick={() => setSelectedEntry(null)}>
                Close
              </button>
              <button
                className="button primary"
                onClick={() =>
                  copyCitation(
                    `[${selectedEntry.id}] ${selectedEntry.action} by ${selectedEntry.actor.name} (${selectedEntry.actor.role})`
                  )
                }
              >
                {copied ? <Check size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Copied Citation' : 'Copy Citation'}</span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
