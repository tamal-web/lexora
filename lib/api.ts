/**
 * Central API client for Lexora backend.
 * All pages should import from here instead of from lib/data.ts.
 *
 * Backend runs at http://localhost:8000
 * Data returned is snake_case to match the SQLModel output.
 */

const BASE = "http://localhost:8000"

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApiMatter {
  id: string
  matter_number: string
  title: string
  desc: string | null
  type: string
  status: string
  client_id: string | null
  country: string
  jurisdiction: string | null
  application_number: string | null
  filing_date: string | null
  priority_date: string | null
  publication_date: string | null
  grant_date: string | null
  expiry_date: string | null
  abandonment_date: string | null
  art_unit: string | null
  examiner: string | null
  patent_number: string | null
  publication_number: string | null
  registration_number: string | null
  tags: string[] | null
  classes: string[] | null
  estimated_value: number | null
  billing_code: string | null
  is_archived: boolean
  firm_id: string
  created_at: string
  updated_at: string
}

export interface ApiClient {
  id: string
  name: string
  firm_id: string
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone: string
}

export interface ApiDeadline {
  id: string
  matter_id: string
  title: string
  description: string | null
  action_type: string
  status: string
  priority: string
  due_date: string
  reminder_date: string | null
  second_reminder_date: string | null
  assigned_to: string | null
  completed_by: string | null
  notes: string | null
  is_court_deadline: boolean
  fee_amount: number | null
  fee_currency: string | null
  fee_status: string
  fee_paid_date: string | null
  created_at: string
  updated_at: string
  // enriched fields from /api/deadlines/:id
  matter_title?: string | null
  matter_number?: string | null
}

export interface ApiUser {
  id: string
  name: string
  email: string
  title: string
  is_active: boolean
  firm_id: string
}

export interface ApiMatterAssignment {
  id: string
  matter_id: string
  user_id: string
  user_name: string
  role: string
  created_at: string
}

export interface ApiTimeEntry {
  id: string
  matter_id: string
  user_id: string
  date: string
  hours: number
  rate: number
  amount: number
  description: string
  status: string
  invoice_id: string | null
  firm_id: string
  created_at: string
  updated_at: string
}

export interface ApiExpense {
  id: string
  matter_id: string
  user_id: string | null
  date: string
  category: string
  amount: number
  currency: string
  description: string
  status: string
  invoice_id: string | null
  firm_id: string
  created_at: string
  updated_at: string
}

export interface ApiInvoice {
  id: string
  matter_id: string
  client_id: string | null
  invoice_number: string
  status: string
  issue_date: string
  due_date: string | null
  total_amount: number
  paid_amount: number
  currency: string
  notes: string | null
  firm_id: string
  created_at: string
  updated_at: string
}

export interface ApiInvoiceLineItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  line_type: string
}

export interface ApiPayment {
  id: string
  invoice_id: string
  matter_id: string | null
  amount: number
  currency: string
  payment_date: string
  payment_method: string
  reference: string | null
  notes: string | null
  firm_id: string
  created_at: string
}

export interface ApiBillingRate {
  id: string
  user_id: string | null
  client_id: string | null
  matter_id: string | null
  hourly_rate: number
  currency: string
  effective_from: string
  effective_to: string | null
  firm_id: string
  created_at: string
}

export interface ApiBillingArrangement {
  id: string
  matter_id: string
  arrangement_type: string
  billing_frequency: string | null
  flat_fee: number | null
  retainer_amount: number | null
  currency: string
  notes: string | null
  firm_id: string
  created_at: string
  updated_at: string
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export const api = {
  matters: () => get<ApiMatter[]>("/api/matters"),
  matter: (id: string) => get<ApiMatter>(`/api/matters/${id}`),
  clients: () => get<ApiClient[]>("/api/clients"),
  client: (id: string) => get<ApiClient>(`/api/clients/${id}`),
  deadlines: (params?: { date?: string; matter_id?: string }) => {
    const qs = new URLSearchParams()
    if (params?.date) qs.set("date", params.date)
    if (params?.matter_id) qs.set("matter_id", params.matter_id)
    const q = qs.toString()
    return get<ApiDeadline[]>(`/api/deadlines${q ? "?" + q : ""}`)
  },
  deadline: (id: string) => get<ApiDeadline>(`/api/deadlines/${id}`),
  users: () => get<ApiUser[]>("/api/users"),
  assignments: (matter_id?: string) =>
    get<ApiMatterAssignment[]>(`/api/matter-assignments${matter_id ? `?matter_id=${matter_id}` : ""}`),

  // billing
  billingRates: () => get<ApiBillingRate[]>("/api/billing/rates"),
  billingArrangements: () => get<ApiBillingArrangement[]>("/api/billing/arrangements"),
  timeEntries: (matter_id?: string) =>
    get<ApiTimeEntry[]>(`/api/billing/time-entries${matter_id ? `?matter_id=${matter_id}` : ""}`),
  expenses: (matter_id?: string) =>
    get<ApiExpense[]>(`/api/billing/expenses${matter_id ? `?matter_id=${matter_id}` : ""}`),
  invoices: (matter_id?: string) =>
    get<ApiInvoice[]>(`/api/billing/invoices${matter_id ? `?matter_id=${matter_id}` : ""}`),
  lineItems: (invoice_id: string) =>
    get<ApiInvoiceLineItem[]>(`/api/billing/invoices/${invoice_id}/line-items`),
  documents: (matter_id?: string) => get<ApiDocument[]>(`/api/documents${matter_id ? "?matter_id=" + matter_id : ""}`),
  documentVersions: (document_id: string) => get<ApiDocumentVersion[]>(`/api/documents/${document_id}/versions`),
  payments: (matter_id?: string) =>
    get<ApiPayment[]>(`/api/billing/payments${matter_id ? `?matter_id=${matter_id}` : ""}`),
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Simple data fetching hook. Returns { data, loading, error }.
 * Use in "use client" components.
 */
export function useApi<T>(fetcher: () => Promise<T>) {
  // This is a re-export shim — the real hook lives in lib/use-api.ts
  // so pages can import it without circular deps.
  throw new Error("Import useApi from @/lib/use-api instead")
}

export interface ApiDocument {
  id: string
  matter_id: string
  client_id: string | null
  title: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  status: string
  document_type: string
  tags: string[] | null
  created_by: string
  firm_id: string
  created_at: string
  updated_at: string
}

export interface ApiDocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_name: string
  file_size: number
  file_url: string
  created_by: string
  firm_id: string
  created_at: string
}

export interface ApiDocument {
  id: string
  matter_id: string
  client_id: string | null
  title: string
  file_name: string
  file_type: string
  file_size: number
  file_url: string
  status: string
  document_type: string
  tags: string[] | null
  created_by: string
  firm_id: string
  created_at: string
  updated_at: string
}

export interface ApiDocumentVersion {
  id: string
  document_id: string
  version_number: number
  file_name: string
  file_size: number
  file_url: string
  created_by: string
  firm_id: string
  created_at: string
}
