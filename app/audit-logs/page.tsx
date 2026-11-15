import { HotelManagementApp } from '@/components/hotel-management-app'

export const metadata = {
  title: 'Audit Logs | Villa Tea Fields MIS',
  description: 'Compliance, security, financial authorizations, and immutable audit logs for Villa Tea Fields.'
}

export default function AuditLogsPage() {
  return <HotelManagementApp initialPage="Audit Logs" />
}
