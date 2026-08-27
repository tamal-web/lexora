// schemas.ts

export interface Firm {
  id: string
  name: string
  created_at: Date
}

export interface User {
  id: string
  firmId: string
  name: string
  email: string
  title: string
  isActive: boolean
}

export interface Client {
  id: string
  firmId: string
  name: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
}

export type FirmRole =
  | "RESPONSIBLE_ATTORNEY"
  | "BILLING_ATTORNEY"
  | "ORIGINATING_ATTORNEY"
  | "SUPERVISING_ATTORNEY"
  | "PARALEGAL"
  | "DOCKETING_CLERK"
  | "CASE_MANAGER"
  | "FOREIGN_ASSOCIATE"

// Junction table linking a Matter to the Users working on it.
// One matter can have many assignments (one per user per role); one user
// can be assigned to many matters. Replaces the old Matter.responsible_attorney /
// billing_attorney / paralegal string fields.
export interface MatterAssignment {
  id: string
  matterId: string
  userId: string
  userName: string // denormalized for easy display
  role: FirmRole
  created_at: Date
}

export type MatterType =
  | "PATENT_UTILITY"
  | "PATENT_DESIGN"
  | "PATENT_PROVISIONAL"
  | "PATENT_PCT"
  | "PATENT_NATIONAL_PHASE"
  | "TRADEMARK_APPLICATION"
  | "TRADEMARK_OPPOSITION"
  | "TRADEMARK_RENEWAL"
  | "COPYRIGHT_REGISTRATION"
  | "IP_LITIGATION"
  | "CIVIL_LITIGATION"
  | "LICENSING_TRANSACTIONAL"
  | "TRADE_SECRET"
  | "PORTFOLIO_MANAGEMENT"
  | "CLIENT_COUNSELING"
  | "OTHER"

export type MatterStatus =
  "OPEN" | "PENDING" | "ON_HOLD" | "ABANDONED" | "CLOSED" | "ARCHIVED"

export interface Matter {
  id: string
  firmId: string
  matter_number: string
  title: string
  desc: string | undefined
  type: MatterType
  status: MatterStatus
  client_id: string | undefined
  // responsible_attorney / billing_attorney / paralegal removed —
  // resolve via MatterAssignment[] where matterId === this.id
  priority_date: Date | undefined
  filling_date: Date | undefined
  publication_date: Date | undefined
  grant_date: Date | undefined
  expiry_date: Date | undefined
  abandonment_date: Date | undefined
  country: string
  jurisdiction: string | undefined
  art_unit: string | undefined
  examiner: string | undefined
  application_number: string | undefined
  publication_number: string | undefined
  patent_number: string | undefined
  registration_number: string | undefined
  classes: string[] | undefined
  tags: string[] | undefined
  estimated_value: number | undefined
  billing_code: string | undefined
  is_archived: boolean
  created_at: Date
  updated_at: Date
}

export type DeadlineType =
  | "STATUTORY_BAR_DATE"
  | "OFFICE_ACTION_RESPONSE"
  | "RENEWAL_MAINTENANCE_FEE"
  | "PRIORITY_DEADLINE"
  | "FILING_DEADLINE"
  | "DISCOVERY_DEADLINE"
  | "COURT_HEARING"
  | "COURT_FILING"
  | "CLIENT_REPORTING"
  | "INTERNAL_REVIEW"

export type DeadlineStatus =
  | "DOCKETED"
  | "UPCOMING"
  | "DUE_SOON"
  | "OVERDUE"
  | "COMPLETED"
  | "EXTENDED"
  | "WAIVED"

export type DeadlinePriority = "CRITICAL" | "STANDARD" | "SOFT"

export type FeeStatus = "N/A" | "UNPAID" | "PAID" | "WAIVED"

export interface Deadline {
  id: string
  matter_id: string
  title: string
  description: string | undefined
  action_type: DeadlineType
  status: DeadlineStatus
  priorty: DeadlinePriority
  due_date: Date
  reminder_date: Date | undefined
  second_reminder_date: Date | undefined
  assigned_to: string | undefined // User.id
  completed_by: string | undefined // User.id
  notes: string | undefined
  is_court_deadline: boolean
  fee_ammount: number | undefined
  fee_curency: string | undefined
  fee_status: FeeStatus
  fee_paid_date: Date | undefined
  created_at: Date
  updated_at: Date
}

export interface BillingRate {
  id: string
  firmId: string
  userId: string | undefined
  clientId: string | undefined
  matterId: string | undefined

  hourlyRate: number
  currency: string

  effectiveFrom: Date
  effectiveTo: Date | undefined

  created_at: Date
}

export type TimeEntryStatus = "DRAFT" | "UNBILLED" | "BILLED" | "NON_BILLABLE"

export interface TimeEntry {
  id: string
  firmId: string

  matterId: string
  userId: string

  date: Date

  hours: number
  rate: number
  amount: number

  description: string

  status: TimeEntryStatus

  invoiceId: string | undefined

  created_at: Date
  updated_at: Date
}

export interface Expense {
  id: string
  firmId: string

  matterId: string
  userId: string | undefined

  date: Date
  description: string

  category: string

  amount: number
  currency: string

  isBillable: boolean

  invoiceId: string | undefined

  receiptUrl: string | undefined

  created_at: Date
}

export type InvoiceStatus =
  "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "VOID"

export interface Invoice {
  id: string
  firmId: string

  clientId: string

  invoiceNumber: string

  issueDate: Date
  dueDate: Date

  subtotal: number
  tax: number
  discount: number
  total: number

  amountPaid: number
  balanceDue: number

  status: InvoiceStatus

  notes: string | undefined

  created_at: Date
  updated_at: Date
}

export interface InvoiceLineItem {
  id: string
  invoiceId: string

  matterId: string | undefined

  description: string

  quantity: number
  unitPrice: number
  amount: number

  type: "TIME" | "EXPENSE" | "FEE" | "FLAT_FEE" | "OTHER"

  timeEntryId: string | undefined
  expenseId: string | undefined
}

export interface Payment {
  id: string
  firmId: string

  invoiceId: string
  clientId: string

  amount: number
  currency: string

  paymentDate: Date

  method: "CHECK" | "BANK_TRANSFER" | "CARD" | "CASH" | "OTHER"

  reference: string | undefined

  notes: string | undefined

  created_at: Date
}

export type BillingMethod =
  "HOURLY" | "FLAT_FEE" | "RETAINER" | "CONTINGENCY" | "CAPPED" | "BLENDED"

export interface BillingArrangement {
  id: string
  matterId: string

  method: BillingMethod

  currency: string

  flatFee: number | undefined
  hourlyRate: number | undefined
  retainerAmount: number | undefined
  billingCap: number | undefined

  billingFrequency: "MONTHLY" | "QUARTERLY" | "ON_DEMAND"

  created_at: Date
  updated_at: Date
}

export type DocumentStatus = "DRAFT" | "FINAL" | "ARCHIVED"

export type DocumentType =
  | "OFFICE_ACTION"
  | "APPLICATION"
  | "RESPONSE"
  | "AMENDMENT"
  | "FILING_RECEIPT"
  | "NOTICE"
  | "ASSIGNMENT"
  | "PRIORITY_DOCUMENT"
  | "PRIOR_ART"
  | "SEARCH_REPORT"
  | "OFFICIAL_LETTER"
  | "COURT_FILING"
  | "COURT_ORDER"
  | "CONTRACT"
  | "AGREEMENT"
  | "CORRESPONDENCE"
  | "INVOICE"
  | "RECEIPT"
  | "EVIDENCE"
  | "OTHER"
export interface Document {
  id: string

  firmId: string

  matterId: string | undefined
  clientId: string | undefined

  name: string
  description: string | undefined

  type: DocumentType
  status: DocumentStatus

  spid: string // ID of the file in the document storage service provider

  fileName: string
  mimeType: string
  fileSize: number

  version: number

  uploadedBy: string // User.id

  tags: string[] | undefined

  created_at: Date
  updated_at: Date
}

export interface DocumentVersion {
  id: string

  documentId: string

  versionNumber: number

  spid: string // ID of this version's file in the storage provider

  fileName: string
  mimeType: string
  fileSize: number

  uploadedBy: string

  changeNote: string | undefined

  created_at: Date
}
