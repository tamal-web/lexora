import type {
  Firm,
  User,
  Client,
  Matter,
  MatterAssignment,
  Deadline,
} from "./models"
import type {
  BillingRate,
  TimeEntry,
  Expense,
  Invoice,
  InvoiceLineItem,
  Payment,
  BillingArrangement,
} from "./models"

import { Document, DocumentVersion } from "./models"

const firm: Firm = {
  id: "firm_001",
  name: "Bhatt Sinha IP Partners",
  created_at: new Date("2015-04-01"),
}

const users: User[] = [
  {
    id: "usr_001",
    firmId: "firm_001",
    name: "Meera Sinha",
    email: "meera.sinha@bhattsinha.law",
    title: "Partner, Patents",
    isActive: true,
  },
  {
    id: "usr_002",
    firmId: "firm_001",
    name: "Daniel Okafor",
    email: "daniel.okafor@bhattsinha.law",
    title: "Senior Associate",
    isActive: true,
  },
  {
    id: "usr_003",
    firmId: "firm_001",
    name: "Anjali Bhatt",
    email: "anjali.bhatt@bhattsinha.law",
    title: "Partner, Trademarks",
    isActive: true,
  },
  {
    id: "usr_004",
    firmId: "firm_001",
    name: "Priya Raman",
    email: "priya.raman@bhattsinha.law",
    title: "Of Counsel",
    isActive: true,
  },
  {
    id: "usr_005",
    firmId: "firm_001",
    name: "Rohan Dutta",
    email: "rohan.dutta@bhattsinha.law",
    title: "Paralegal",
    isActive: true,
  },
  {
    id: "usr_006",
    firmId: "firm_001",
    name: "Elena Vogt",
    email: "elena.vogt@bhattsinha.law",
    title: "Docketing Clerk",
    isActive: true,
  },
  {
    id: "usr_007",
    firmId: "firm_001",
    name: "Karan Mehta",
    email: "karan.mehta@bhattsinha.law",
    title: "Paralegal",
    isActive: true,
  },
  {
    id: "usr_008",
    firmId: "firm_001",
    name: "Yuki Tanaka",
    email: "yuki.tanaka@foreign-assoc.jp",
    title: "Foreign Associate",
    isActive: true,
  },
]

const clients: Client[] = [
  {
    id: "cli_014",
    firmId: "firm_001",
    name: "NeuraCompress Inc.",
    primaryContactName: "Aditi Rao",
    primaryContactEmail: "aditi@neuracompress.ai",
    primaryContactPhone: "+1-415-555-0142",
  },
  {
    id: "cli_009",
    firmId: "firm_001",
    name: "VoltCell Automotive GmbH",
    primaryContactName: "Felix Brandt",
    primaryContactEmail: "f.brandt@voltcell.de",
    primaryContactPhone: "+49-30-555-0198",
  },
  {
    id: "cli_002",
    firmId: "firm_001",
    name: "Desyn Studio",
    primaryContactName: "Tamal Krishna",
    primaryContactEmail: "tamal@desynstudio.com",
    primaryContactPhone: "+91-98765-43210",
  },
  {
    id: "cli_021",
    firmId: "firm_001",
    name: "CertChain Labs",
    primaryContactName: "Ishaan Verma",
    primaryContactEmail: "ishaan@certchain.io",
    primaryContactPhone: "+91-99887-66554",
  },
  {
    id: "cli_006",
    firmId: "firm_001",
    name: "UpDesk Furnishings LLC",
    primaryContactName: "Rachel Kim",
    primaryContactEmail: "rachel@updesk.com",
    primaryContactPhone: "+1-312-555-0173",
  },
  {
    id: "cli_003",
    firmId: "firm_001",
    name: "SolTile Renewables",
    primaryContactName: "Grace Muthoni",
    primaryContactEmail: "grace@soltile.co",
    primaryContactPhone: "+254-70-555-0121",
  },
  {
    id: "cli_030",
    firmId: "firm_001",
    name: "Verity AI Labs",
    primaryContactName: "Sam Okonkwo",
    primaryContactEmail: "sam@verityai.dev",
    primaryContactPhone: "+1-628-555-0110",
  },
]

const matters: Matter[] = [
  {
    id: "mat_001",
    firmId: "firm_001",
    matter_number: "US-2024-0142",
    title: "Adaptive Neural Compression Codec",
    desc: "Utility patent application for a lossy compression method using learned latent priors",
    type: "PATENT_UTILITY",
    status: "PENDING",
    client_id: "cli_014",
    priority_date: new Date("2023-11-02"),
    filling_date: new Date("2024-01-15"),
    publication_date: new Date("2024-07-18"),
    grant_date: undefined,
    expiry_date: undefined,
    abandonment_date: undefined,
    country: "US",
    jurisdiction: "USPTO",
    art_unit: "2129",
    examiner: "T. Falkowski",
    application_number: "18/402,331",
    publication_number: "US2024/0231145A1",
    patent_number: undefined,
    registration_number: undefined,
    classes: ["G06N 3/08", "H03M 7/30"],
    tags: ["ai", "priority-client", "prosecution-active"],
    estimated_value: 45000,
    billing_code: "PAT-UTL-STD",
    is_archived: false,
    created_at: new Date("2023-11-05"),
    updated_at: new Date("2026-06-20"),
  },
  {
    id: "mat_002",
    firmId: "firm_001",
    matter_number: "EP-2023-0087",
    title: "Modular Battery Thermal Management Assembly",
    desc: "European validation of PCT application covering EV battery pack cooling architecture",
    type: "PATENT_UTILITY",
    status: "CLOSED",
    client_id: "cli_009",
    priority_date: new Date("2022-05-14"),
    filling_date: new Date("2023-05-12"),
    publication_date: new Date("2023-11-16"),
    grant_date: new Date("2026-02-04"),
    expiry_date: new Date("2043-05-12"),
    abandonment_date: undefined,
    country: "EP",
    jurisdiction: "EPO",
    art_unit: undefined,
    examiner: "H. Lindqvist",
    application_number: "23172044.1",
    publication_number: "EP4273456A1",
    patent_number: "EP4273456B1",
    registration_number: undefined,
    classes: ["H01M 10/613", "B60L 58/26"],
    tags: ["automotive", "validated-multi-country"],
    estimated_value: 120000,
    billing_code: "PAT-UTL-EP",
    is_archived: false,
    created_at: new Date("2022-05-20"),
    updated_at: new Date("2026-02-10"),
  },
  {
    id: "mat_003",
    firmId: "firm_001",
    matter_number: "IN-2024-0311",
    title: "DESYN — Word Mark",
    desc: "Trademark application for creative agency branding, Class 35 and 42",
    type: "TRADEMARK_APPLICATION",
    status: "PENDING",
    client_id: "cli_002",
    priority_date: undefined,
    filling_date: new Date("2024-03-09"),
    publication_date: undefined,
    grant_date: undefined,
    expiry_date: undefined,
    abandonment_date: undefined,
    country: "IN",
    jurisdiction: "IP India",
    art_unit: undefined,
    examiner: "S. Kulkarni",
    application_number: "5987421",
    publication_number: undefined,
    patent_number: undefined,
    registration_number: undefined,
    classes: ["35", "42"],
    tags: ["branding", "small-business"],
    estimated_value: 8000,
    billing_code: "TM-STD-IN",
    is_archived: false,
    created_at: new Date("2024-03-10"),
    updated_at: new Date("2026-05-01"),
  },
  {
    id: "mat_004",
    firmId: "firm_001",
    matter_number: "PCT-2025-0056",
    title: "Distributed Ledger Certificate Verification Protocol",
    desc: "PCT application covering blockchain-based academic credential verification system",
    type: "PATENT_PCT",
    status: "OPEN",
    client_id: "cli_021",
    priority_date: new Date("2024-08-22"),
    filling_date: new Date("2025-08-20"),
    publication_date: undefined,
    grant_date: undefined,
    expiry_date: undefined,
    abandonment_date: undefined,
    country: "WO",
    jurisdiction: "WIPO",
    art_unit: undefined,
    examiner: undefined,
    application_number: "PCT/IN2025/050612",
    publication_number: undefined,
    patent_number: undefined,
    registration_number: undefined,
    classes: ["G06Q 50/20", "H04L 9/32"],
    tags: ["blockchain", "edtech", "national-phase-pending"],
    estimated_value: 60000,
    billing_code: "PAT-PCT-STD",
    is_archived: false,
    created_at: new Date("2024-08-25"),
    updated_at: new Date("2026-08-01"),
  },
  {
    id: "mat_005",
    firmId: "firm_001",
    matter_number: "US-2021-0098",
    title: "Ergonomic Foldable Standing Desk Frame",
    desc: "Design patent covering ornamental features of a foldable desk frame",
    type: "PATENT_DESIGN",
    status: "CLOSED",
    client_id: "cli_006",
    priority_date: undefined,
    filling_date: new Date("2021-04-02"),
    publication_date: new Date("2021-09-14"),
    grant_date: new Date("2022-01-11"),
    expiry_date: new Date("2037-01-11"),
    abandonment_date: undefined,
    country: "US",
    jurisdiction: "USPTO",
    art_unit: "2913",
    examiner: "R. Delgado",
    application_number: "29/781,204",
    publication_number: "US2021/0287654S",
    patent_number: "US D945,231 S",
    registration_number: undefined,
    classes: ["D06/601"],
    tags: ["furniture", "low-priority"],
    estimated_value: 12000,
    billing_code: "PAT-DES-STD",
    is_archived: false,
    created_at: new Date("2021-04-05"),
    updated_at: new Date("2025-11-19"),
  },
  {
    id: "mat_006",
    firmId: "firm_001",
    matter_number: "US-2019-0245",
    title: "Passive Solar Roof Tile Substrate",
    desc: "Utility patent for a roofing substrate integrating passive thermal solar cells",
    type: "PATENT_UTILITY",
    status: "ABANDONED",
    client_id: "cli_003",
    priority_date: new Date("2018-06-01"),
    filling_date: new Date("2019-05-30"),
    publication_date: new Date("2019-12-05"),
    grant_date: new Date("2020-10-13"),
    expiry_date: new Date("2026-05-30"),
    abandonment_date: new Date("2026-06-01"),
    country: "US",
    jurisdiction: "USPTO",
    art_unit: "1794",
    examiner: "M. Osei",
    application_number: "16/425,110",
    publication_number: "US2019/0371488A1",
    patent_number: "US10,801,224 B2",
    registration_number: undefined,
    classes: ["F24S 25/60"],
    tags: ["cleantech", "renewal-lapsed"],
    estimated_value: 30000,
    billing_code: "PAT-UTL-STD",
    is_archived: true,
    created_at: new Date("2019-06-02"),
    updated_at: new Date("2026-06-01"),
  },
  {
    id: "mat_007",
    firmId: "firm_001",
    matter_number: "JP-2024-0019",
    title: "SUKOON — Device Mark",
    desc: "Japan trademark application for wellness coaching brand, national phase filing",
    type: "TRADEMARK_APPLICATION",
    status: "OPEN",
    client_id: "cli_002",
    priority_date: new Date("2023-10-04"),
    filling_date: new Date("2024-04-01"),
    publication_date: undefined,
    grant_date: undefined,
    expiry_date: undefined,
    abandonment_date: undefined,
    country: "JP",
    jurisdiction: "JPO",
    art_unit: undefined,
    examiner: undefined,
    application_number: "2024-039812",
    publication_number: undefined,
    patent_number: undefined,
    registration_number: undefined,
    classes: ["41", "44"],
    tags: ["wellness", "international-expansion"],
    estimated_value: 6000,
    billing_code: "TM-STD-JP",
    is_archived: false,
    created_at: new Date("2024-04-02"),
    updated_at: new Date("2026-03-15"),
  },
  {
    id: "mat_008",
    firmId: "firm_001",
    matter_number: "US-2025-0203",
    title: "Real-Time LLM Hallucination Audit Trail System",
    desc: "Provisional-to-nonprovisional utility application for auditing generative model outputs",
    type: "PATENT_PROVISIONAL",
    status: "OPEN",
    client_id: "cli_030",
    priority_date: new Date("2025-02-11"),
    filling_date: undefined,
    publication_date: undefined,
    grant_date: undefined,
    expiry_date: undefined,
    abandonment_date: undefined,
    country: "US",
    jurisdiction: "USPTO",
    art_unit: undefined,
    examiner: undefined,
    application_number: undefined,
    publication_number: undefined,
    patent_number: undefined,
    registration_number: undefined,
    classes: ["G06N 20/00"],
    tags: ["ai", "provisional-conversion-due"],
    estimated_value: 40000,
    billing_code: "PAT-UTL-STD",
    is_archived: false,
    created_at: new Date("2025-02-12"),
    updated_at: new Date("2026-08-05"),
  },
]

// Every matter/user pairing that used to live on Matter.responsible_attorney /
// billing_attorney / paralegal now lives here, keyed by matterId + role.
const matterAssignments: MatterAssignment[] = [
  {
    id: "ma_001",
    matterId: "mat_001",
    userId: "usr_001",
    userName: "Meera Sinha",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2023-11-05"),
  },
  {
    id: "ma_002",
    matterId: "mat_001",
    userId: "usr_001",
    userName: "Meera Sinha",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2023-11-05"),
  },
  {
    id: "ma_003",
    matterId: "mat_001",
    userId: "usr_005",
    userName: "Rohan Dutta",
    role: "PARALEGAL",
    created_at: new Date("2023-11-05"),
  },

  {
    id: "ma_004",
    matterId: "mat_002",
    userId: "usr_002",
    userName: "Daniel Okafor",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2022-05-20"),
  },
  {
    id: "ma_005",
    matterId: "mat_002",
    userId: "usr_004",
    userName: "Priya Raman",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2022-05-20"),
  },
  {
    id: "ma_006",
    matterId: "mat_002",
    userId: "usr_006",
    userName: "Elena Vogt",
    role: "PARALEGAL",
    created_at: new Date("2022-05-20"),
  },

  {
    id: "ma_007",
    matterId: "mat_003",
    userId: "usr_003",
    userName: "Anjali Bhatt",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2024-03-10"),
  },
  {
    id: "ma_008",
    matterId: "mat_003",
    userId: "usr_003",
    userName: "Anjali Bhatt",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2024-03-10"),
  },
  {
    id: "ma_009",
    matterId: "mat_003",
    userId: "usr_007",
    userName: "Karan Mehta",
    role: "PARALEGAL",
    created_at: new Date("2024-03-10"),
  },

  {
    id: "ma_010",
    matterId: "mat_004",
    userId: "usr_001",
    userName: "Meera Sinha",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2024-08-25"),
  },
  {
    id: "ma_011",
    matterId: "mat_004",
    userId: "usr_001",
    userName: "Meera Sinha",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2024-08-25"),
  },
  {
    id: "ma_012",
    matterId: "mat_004",
    userId: "usr_005",
    userName: "Rohan Dutta",
    role: "PARALEGAL",
    created_at: new Date("2024-08-25"),
  },
  {
    id: "ma_013",
    matterId: "mat_004",
    userId: "usr_007",
    userName: "Karan Mehta",
    role: "CASE_MANAGER",
    created_at: new Date("2025-01-10"),
  },

  {
    id: "ma_014",
    matterId: "mat_005",
    userId: "usr_002",
    userName: "Daniel Okafor",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2021-04-05"),
  },
  {
    id: "ma_015",
    matterId: "mat_005",
    userId: "usr_002",
    userName: "Daniel Okafor",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2021-04-05"),
  },
  {
    id: "ma_016",
    matterId: "mat_005",
    userId: "usr_006",
    userName: "Elena Vogt",
    role: "PARALEGAL",
    created_at: new Date("2021-04-05"),
  },

  {
    id: "ma_017",
    matterId: "mat_006",
    userId: "usr_004",
    userName: "Priya Raman",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2019-06-02"),
  },
  {
    id: "ma_018",
    matterId: "mat_006",
    userId: "usr_004",
    userName: "Priya Raman",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2019-06-02"),
  },
  {
    id: "ma_019",
    matterId: "mat_006",
    userId: "usr_007",
    userName: "Karan Mehta",
    role: "PARALEGAL",
    created_at: new Date("2019-06-02"),
  },

  {
    id: "ma_020",
    matterId: "mat_007",
    userId: "usr_003",
    userName: "Anjali Bhatt",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2024-04-02"),
  },
  {
    id: "ma_021",
    matterId: "mat_007",
    userId: "usr_003",
    userName: "Anjali Bhatt",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2024-04-02"),
  },
  {
    id: "ma_022",
    matterId: "mat_007",
    userId: "usr_008",
    userName: "Yuki Tanaka",
    role: "FOREIGN_ASSOCIATE",
    created_at: new Date("2024-04-02"),
  },

  {
    id: "ma_023",
    matterId: "mat_008",
    userId: "usr_001",
    userName: "Meera Sinha",
    role: "RESPONSIBLE_ATTORNEY",
    created_at: new Date("2025-02-12"),
  },
  {
    id: "ma_024",
    matterId: "mat_008",
    userId: "usr_001",
    userName: "Meera Sinha",
    role: "BILLING_ATTORNEY",
    created_at: new Date("2025-02-12"),
  },
  {
    id: "ma_025",
    matterId: "mat_008",
    userId: "usr_005",
    userName: "Rohan Dutta",
    role: "PARALEGAL",
    created_at: new Date("2025-02-12"),
  },
]

const deadlines: Deadline[] = [
  {
    id: "dl_001",
    matter_id: "mat_001",
    title: "Respond to Non-Final Office Action",
    description:
      "Examiner cited Wu et al. and Kaplan under §103; draft arguments and claim amendments",
    action_type: "OFFICE_ACTION_RESPONSE",
    status: "DUE_SOON",
    priorty: "CRITICAL",
    due_date: new Date("2026-09-22"),
    reminder_date: new Date("2026-09-08"),
    second_reminder_date: new Date("2026-09-18"),
    assigned_to: "usr_001",
    completed_by: undefined,
    notes:
      "Client wants to preserve broadest claim scope; discuss narrowing fallback with inventor before filing",
    is_court_deadline: false,
    fee_ammount: undefined,
    fee_curency: undefined,
    fee_status: "N/A",
    fee_paid_date: undefined,
    created_at: new Date("2026-06-22"),
    updated_at: new Date("2026-08-01"),
  },
  {
    id: "dl_002",
    matter_id: "mat_002",
    title: "Pay 3rd Year Renewal Fee (EP Validation)",
    description:
      "Annual renewal fee for European granted patent, national validation maintenance",
    action_type: "RENEWAL_MAINTENANCE_FEE",
    status: "UPCOMING",
    priorty: "STANDARD",
    due_date: new Date("2027-05-31"),
    reminder_date: new Date("2027-04-01"),
    second_reminder_date: new Date("2027-05-15"),
    assigned_to: "usr_006",
    completed_by: undefined,
    notes: "Confirm client billing PO before remitting fee to EPO",
    is_court_deadline: false,
    fee_ammount: 610,
    fee_curency: "EUR",
    fee_status: "UNPAID",
    fee_paid_date: undefined,
    created_at: new Date("2026-02-05"),
    updated_at: new Date("2026-02-05"),
  },
  {
    id: "dl_003",
    matter_id: "mat_003",
    title: "File Response to Examination Report",
    description:
      "Overcome Section 9(1)(a) descriptiveness objection raised by examiner",
    action_type: "OFFICE_ACTION_RESPONSE",
    status: "OVERDUE",
    priorty: "CRITICAL",
    due_date: new Date("2026-08-05"),
    reminder_date: new Date("2026-07-20"),
    second_reminder_date: new Date("2026-08-01"),
    assigned_to: "usr_003",
    completed_by: undefined,
    notes:
      "Escalated — client slow to provide evidence of acquired distinctiveness; consider extension request",
    is_court_deadline: false,
    fee_ammount: undefined,
    fee_curency: undefined,
    fee_status: "N/A",
    fee_paid_date: undefined,
    created_at: new Date("2026-05-06"),
    updated_at: new Date("2026-08-10"),
  },
  {
    id: "dl_004",
    matter_id: "mat_004",
    title: "PCT National Phase Entry Deadline — India",
    description:
      "30-month deadline to enter national phase before IP India from priority date",
    action_type: "FILING_DEADLINE",
    status: "UPCOMING",
    priorty: "CRITICAL",
    due_date: new Date("2027-02-22"),
    reminder_date: new Date("2026-12-01"),
    second_reminder_date: new Date("2027-01-22"),
    assigned_to: "usr_005",
    completed_by: undefined,
    notes:
      "Client also evaluating US and EP national phase entry — confirm target countries by Nov 2026",
    is_court_deadline: false,
    fee_ammount: undefined,
    fee_curency: undefined,
    fee_status: "N/A",
    fee_paid_date: undefined,
    created_at: new Date("2025-08-25"),
    updated_at: new Date("2026-07-30"),
  },
  {
    id: "dl_005",
    matter_id: "mat_005",
    title: "Pay 7.5-Year Maintenance Fee",
    description:
      "First maintenance fee window for granted design-adjacent utility rights bundle",
    action_type: "RENEWAL_MAINTENANCE_FEE",
    status: "COMPLETED",
    priorty: "STANDARD",
    due_date: new Date("2026-01-11"),
    reminder_date: new Date("2025-11-01"),
    second_reminder_date: new Date("2025-12-15"),
    assigned_to: "usr_006",
    completed_by: "usr_002",
    notes: "Paid via USPTO EFS-Web, confirmation #MF-2026-004471",
    is_court_deadline: false,
    fee_ammount: 2000,
    fee_curency: "USD",
    fee_status: "PAID",
    fee_paid_date: new Date("2025-12-20"),
    created_at: new Date("2025-07-11"),
    updated_at: new Date("2025-12-20"),
  },
  {
    id: "dl_006",
    matter_id: "mat_006",
    title: "Confirm Lapse — No Renewal Action",
    description:
      "Patent expired due to non-payment of maintenance fee; record status for archival",
    action_type: "INTERNAL_REVIEW",
    status: "COMPLETED",
    priorty: "SOFT",
    due_date: new Date("2026-05-30"),
    reminder_date: new Date("2026-04-15"),
    second_reminder_date: new Date("2026-05-20"),
    assigned_to: "usr_004",
    completed_by: "usr_004",
    notes:
      "Client confirmed in writing they do not wish to pay maintenance fee; matter moved to archived",
    is_court_deadline: false,
    fee_ammount: undefined,
    fee_curency: undefined,
    fee_status: "N/A",
    fee_paid_date: undefined,
    created_at: new Date("2026-03-01"),
    updated_at: new Date("2026-06-01"),
  },
  {
    id: "dl_007",
    matter_id: "mat_007",
    title: "Respond to JPO Notice of Refusal",
    description:
      "Similar mark cited under Article 4(1)(xi); prepare distinguishing argument and possible coexistence letter",
    action_type: "OFFICE_ACTION_RESPONSE",
    status: "DUE_SOON",
    priorty: "CRITICAL",
    due_date: new Date("2026-10-10"),
    reminder_date: new Date("2026-09-15"),
    second_reminder_date: new Date("2026-10-01"),
    assigned_to: "usr_008",
    completed_by: undefined,
    notes:
      "Local counsel in Tokyo drafting response; awaiting cited mark owner contact for coexistence discussion",
    is_court_deadline: false,
    fee_ammount: undefined,
    fee_curency: undefined,
    fee_status: "N/A",
    fee_paid_date: undefined,
    created_at: new Date("2026-07-10"),
    updated_at: new Date("2026-08-02"),
  },
  {
    id: "dl_008",
    matter_id: "mat_008",
    title: "File Nonprovisional Before Provisional Expires",
    description:
      "12-month deadline to convert provisional filing to nonprovisional utility application",
    action_type: "STATUTORY_BAR_DATE",
    status: "OVERDUE",
    priorty: "CRITICAL",
    due_date: new Date("2026-02-11"),
    reminder_date: new Date("2025-12-15"),
    second_reminder_date: new Date("2026-01-25"),
    assigned_to: "usr_001",
    completed_by: undefined,
    notes:
      "Full spec drafted, pending final inventor review and figures from illustrator",
    is_court_deadline: false,
    fee_ammount: 1820,
    fee_curency: "USD",
    fee_status: "UNPAID",
    fee_paid_date: undefined,
    created_at: new Date("2025-02-12"),
    updated_at: new Date("2026-08-05"),
  },
  {
    id: "dl_009",
    matter_id: "mat_001",
    title: "Extension of Time Request (1-Month)",
    description:
      "File petition for extension in case Office Action response is not ready by due date",
    action_type: "FILING_DEADLINE",
    status: "DOCKETED",
    priorty: "SOFT",
    due_date: new Date("2026-09-22"),
    reminder_date: new Date("2026-09-15"),
    second_reminder_date: undefined,
    assigned_to: "usr_005",
    completed_by: undefined,
    notes:
      "Contingency only — file if primary OA response cannot be finalized in time",
    is_court_deadline: false,
    fee_ammount: 220,
    fee_curency: "USD",
    fee_status: "UNPAID",
    fee_paid_date: undefined,
    created_at: new Date("2026-08-01"),
    updated_at: new Date("2026-08-01"),
  },
  {
    id: "dl_010",
    matter_id: "mat_002",
    title: "Opposition Period Monitoring — Close Out",
    description:
      "Monitor and confirm no third-party opposition filed within EPO 9-month opposition window",
    action_type: "INTERNAL_REVIEW",
    status: "DOCKETED",
    priorty: "STANDARD",
    due_date: new Date("2026-11-04"),
    reminder_date: new Date("2026-10-01"),
    second_reminder_date: new Date("2026-10-25"),
    assigned_to: "usr_002",
    completed_by: undefined,
    notes: "No opposition filed as of last EPO register check on Aug 8",
    is_court_deadline: true,
    fee_ammount: undefined,
    fee_curency: undefined,
    fee_status: "N/A",
    fee_paid_date: undefined,
    created_at: new Date("2026-02-04"),
    updated_at: new Date("2026-08-08"),
  },
]

// billingSeed.ts

// ============================================================
// BILLING RATES
// ============================================================

export const billingRates: BillingRate[] = [
  {
    id: "rate_001",
    firmId: "firm_001",
    userId: "usr_001", // Meera Sinha
    clientId: undefined,
    matterId: undefined,
    hourlyRate: 450,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
  {
    id: "rate_002",
    firmId: "firm_001",
    userId: "usr_001",
    clientId: "cli_014", // NeuraCompress
    matterId: undefined,
    hourlyRate: 475,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
  {
    id: "rate_003",
    firmId: "firm_001",
    userId: "usr_002", // Daniel Okafor
    clientId: undefined,
    matterId: undefined,
    hourlyRate: 350,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
  {
    id: "rate_004",
    firmId: "firm_001",
    userId: "usr_003", // Anjali Bhatt
    clientId: undefined,
    matterId: undefined,
    hourlyRate: 425,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
  {
    id: "rate_005",
    firmId: "firm_001",
    userId: "usr_004", // Priya Raman
    clientId: undefined,
    matterId: undefined,
    hourlyRate: 400,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
  {
    id: "rate_006",
    firmId: "firm_001",
    userId: "usr_005", // Rohan Dutta
    clientId: undefined,
    matterId: undefined,
    hourlyRate: 175,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
  {
    id: "rate_007",
    firmId: "firm_001",
    userId: "usr_007", // Karan Mehta
    clientId: undefined,
    matterId: undefined,
    hourlyRate: 160,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
  {
    id: "rate_008",
    firmId: "firm_001",
    userId: "usr_008", // Yuki Tanaka
    clientId: undefined,
    matterId: undefined,
    hourlyRate: 300,
    currency: "USD",
    effectiveFrom: new Date("2026-01-01"),
    effectiveTo: undefined,
    created_at: new Date("2025-12-15"),
  },
]

// ============================================================
// BILLING ARRANGEMENTS
// ============================================================

export const billingArrangements: BillingArrangement[] = [
  {
    id: "ba_001",
    matterId: "mat_001",
    method: "HOURLY",
    currency: "USD",
    flatFee: undefined,
    hourlyRate: 475,
    retainerAmount: undefined,
    billingCap: 15000,
    billingFrequency: "MONTHLY",
    created_at: new Date("2025-12-20"),
    updated_at: new Date("2026-01-01"),
  },
  {
    id: "ba_002",
    matterId: "mat_002",
    method: "HOURLY",
    currency: "EUR",
    flatFee: undefined,
    hourlyRate: 380,
    retainerAmount: undefined,
    billingCap: undefined,
    billingFrequency: "QUARTERLY",
    created_at: new Date("2025-01-10"),
    updated_at: new Date("2026-01-01"),
  },
  {
    id: "ba_003",
    matterId: "mat_003",
    method: "FLAT_FEE",
    currency: "INR",
    flatFee: 85000,
    hourlyRate: undefined,
    retainerAmount: undefined,
    billingCap: undefined,
    billingFrequency: "ON_DEMAND",
    created_at: new Date("2025-02-01"),
    updated_at: new Date("2026-01-01"),
  },
  {
    id: "ba_004",
    matterId: "mat_004",
    method: "RETAINER",
    currency: "USD",
    flatFee: undefined,
    hourlyRate: 475,
    retainerAmount: 10000,
    billingCap: undefined,
    billingFrequency: "MONTHLY",
    created_at: new Date("2025-09-01"),
    updated_at: new Date("2026-01-01"),
  },
  {
    id: "ba_005",
    matterId: "mat_007",
    method: "HOURLY",
    currency: "USD",
    flatFee: undefined,
    hourlyRate: 425,
    retainerAmount: undefined,
    billingCap: 8000,
    billingFrequency: "MONTHLY",
    created_at: new Date("2025-01-15"),
    updated_at: new Date("2026-01-01"),
  },
  {
    id: "ba_006",
    matterId: "mat_008",
    method: "FLAT_FEE",
    currency: "USD",
    flatFee: 6500,
    hourlyRate: undefined,
    retainerAmount: undefined,
    billingCap: undefined,
    billingFrequency: "ON_DEMAND",
    created_at: new Date("2026-02-01"),
    updated_at: new Date("2026-02-01"),
  },
]

// ============================================================
// TIME ENTRIES
// ============================================================

export const timeEntries: TimeEntry[] = [
  // ---------------------------
  // Matter 001 - NeuraCompress
  // ---------------------------
  {
    id: "te_001",
    firmId: "firm_001",
    matterId: "mat_001",
    userId: "usr_001",
    date: new Date("2026-08-03"),
    hours: 2.5,
    rate: 475,
    amount: 1187.5,
    description:
      "Reviewed examiner's non-final office action and cited references",
    status: "BILLED",
    invoiceId: "inv_001",
    created_at: new Date("2026-08-03"),
    updated_at: new Date("2026-08-05"),
  },
  {
    id: "te_002",
    firmId: "firm_001",
    matterId: "mat_001",
    userId: "usr_001",
    date: new Date("2026-08-06"),
    hours: 3.0,
    rate: 475,
    amount: 1425,
    description: "Prepared claim amendment strategy and response arguments",
    status: "BILLED",
    invoiceId: "inv_001",
    created_at: new Date("2026-08-06"),
    updated_at: new Date("2026-08-10"),
  },
  {
    id: "te_003",
    firmId: "firm_001",
    matterId: "mat_001",
    userId: "usr_005",
    date: new Date("2026-08-07"),
    hours: 1.5,
    rate: 175,
    amount: 262.5,
    description: "Patent file review and prior-art document organization",
    status: "BILLED",
    invoiceId: "inv_001",
    created_at: new Date("2026-08-07"),
    updated_at: new Date("2026-08-10"),
  },
  {
    id: "te_004",
    firmId: "firm_001",
    matterId: "mat_001",
    userId: "usr_001",
    date: new Date("2026-08-20"),
    hours: 1.0,
    rate: 475,
    amount: 475,
    description: "Call with inventor regarding fallback claim scope",
    status: "UNBILLED",
    invoiceId: undefined,
    created_at: new Date("2026-08-20"),
    updated_at: new Date("2026-08-20"),
  },

  // ---------------------------
  // Matter 002 - VoltCell
  // ---------------------------
  {
    id: "te_005",
    firmId: "firm_001",
    matterId: "mat_002",
    userId: "usr_002",
    date: new Date("2026-07-10"),
    hours: 2.0,
    rate: 380,
    amount: 760,
    description: "Reviewed European validation and renewal status",
    status: "BILLED",
    invoiceId: "inv_002",
    created_at: new Date("2026-07-10"),
    updated_at: new Date("2026-07-15"),
  },
  {
    id: "te_006",
    firmId: "firm_001",
    matterId: "mat_002",
    userId: "usr_004",
    date: new Date("2026-07-15"),
    hours: 1.5,
    rate: 380,
    amount: 570,
    description:
      "Client advisory call concerning European maintenance strategy",
    status: "BILLED",
    invoiceId: "inv_002",
    created_at: new Date("2026-07-15"),
    updated_at: new Date("2026-07-20"),
  },

  // ---------------------------
  // Matter 003 - DESYN trademark
  // ---------------------------
  {
    id: "te_007",
    firmId: "firm_001",
    matterId: "mat_003",
    userId: "usr_003",
    date: new Date("2026-08-04"),
    hours: 1.5,
    rate: 425,
    amount: 637.5,
    description: "Reviewed examination report and prepared response strategy",
    status: "BILLED",
    invoiceId: "inv_003",
    created_at: new Date("2026-08-04"),
    updated_at: new Date("2026-08-06"),
  },
  {
    id: "te_008",
    firmId: "firm_001",
    matterId: "mat_003",
    userId: "usr_007",
    date: new Date("2026-08-05"),
    hours: 2.0,
    rate: 160,
    amount: 320,
    description: "Trademark search and evidence collection",
    status: "BILLED",
    invoiceId: "inv_003",
    created_at: new Date("2026-08-05"),
    updated_at: new Date("2026-08-06"),
  },

  // ---------------------------
  // Matter 004 - CertChain
  // ---------------------------
  {
    id: "te_009",
    firmId: "firm_001",
    matterId: "mat_004",
    userId: "usr_001",
    date: new Date("2026-08-12"),
    hours: 2.5,
    rate: 475,
    amount: 1187.5,
    description: "Reviewed PCT national-phase strategy with client",
    status: "UNBILLED",
    invoiceId: undefined,
    created_at: new Date("2026-08-12"),
    updated_at: new Date("2026-08-12"),
  },
  {
    id: "te_010",
    firmId: "firm_001",
    matterId: "mat_004",
    userId: "usr_005",
    date: new Date("2026-08-15"),
    hours: 3.0,
    rate: 175,
    amount: 525,
    description: "Prepared national-phase filing checklist and deadline review",
    status: "UNBILLED",
    invoiceId: undefined,
    created_at: new Date("2026-08-15"),
    updated_at: new Date("2026-08-15"),
  },

  // ---------------------------
  // Matter 007 - SUKOON trademark
  // ---------------------------
  {
    id: "te_011",
    firmId: "firm_001",
    matterId: "mat_007",
    userId: "usr_003",
    date: new Date("2026-08-10"),
    hours: 1.75,
    rate: 425,
    amount: 743.75,
    description: "Reviewed JPO refusal and coordinated response strategy",
    status: "UNBILLED",
    invoiceId: undefined,
    created_at: new Date("2026-08-10"),
    updated_at: new Date("2026-08-10"),
  },

  // ---------------------------
  // Matter 008 - Verity AI
  // ---------------------------
  {
    id: "te_012",
    firmId: "firm_001",
    matterId: "mat_008",
    userId: "usr_001",
    date: new Date("2026-08-18"),
    hours: 2.0,
    rate: 475,
    amount: 950,
    description:
      "Reviewed provisional specification and nonprovisional filing strategy",
    status: "UNBILLED",
    invoiceId: undefined,
    created_at: new Date("2026-08-18"),
    updated_at: new Date("2026-08-18"),
  },
]

// ============================================================
// EXPENSES
// ============================================================

export const expenses: Expense[] = [
  {
    id: "exp_001",
    firmId: "firm_001",
    matterId: "mat_001",
    userId: "usr_005",
    date: new Date("2026-08-07"),
    description: "Patent document retrieval and certified copies",
    category: "FILING / DOCUMENT FEES",
    amount: 145,
    currency: "USD",
    isBillable: true,
    invoiceId: "inv_001",
    receiptUrl: "/receipts/exp_001.pdf",
    created_at: new Date("2026-08-07"),
  },
  {
    id: "exp_002",
    firmId: "firm_001",
    matterId: "mat_002",
    userId: "usr_006",
    date: new Date("2026-07-12"),
    description: "EPO registry and certified document retrieval",
    category: "DOCUMENT FEES",
    amount: 95,
    currency: "EUR",
    isBillable: true,
    invoiceId: "inv_002",
    receiptUrl: "/receipts/exp_002.pdf",
    created_at: new Date("2026-07-12"),
  },
  {
    id: "exp_003",
    firmId: "firm_001",
    matterId: "mat_003",
    userId: "usr_007",
    date: new Date("2026-08-05"),
    description: "Trademark evidence search service",
    category: "RESEARCH",
    amount: 1800,
    currency: "INR",
    isBillable: true,
    invoiceId: "inv_003",
    receiptUrl: "/receipts/exp_003.pdf",
    created_at: new Date("2026-08-05"),
  },
  {
    id: "exp_004",
    firmId: "firm_001",
    matterId: "mat_004",
    userId: "usr_005",
    date: new Date("2026-08-16"),
    description: "Certified translation of inventor declaration",
    category: "TRANSLATION",
    amount: 420,
    currency: "USD",
    isBillable: true,
    invoiceId: undefined,
    receiptUrl: "/receipts/exp_004.pdf",
    created_at: new Date("2026-08-16"),
  },
  {
    id: "exp_005",
    firmId: "firm_001",
    matterId: "mat_007",
    userId: "usr_008",
    date: new Date("2026-08-11"),
    description: "Tokyo local counsel document handling fee",
    category: "FOREIGN COUNSEL",
    amount: 275,
    currency: "USD",
    isBillable: true,
    invoiceId: undefined,
    receiptUrl: "/receipts/exp_005.pdf",
    created_at: new Date("2026-08-11"),
  },
  {
    id: "exp_006",
    firmId: "firm_001",
    matterId: "mat_001",
    userId: "usr_005",
    date: new Date("2026-08-18"),
    description: "Internal administrative expense - not client billable",
    category: "ADMINISTRATIVE",
    amount: 35,
    currency: "USD",
    isBillable: false,
    invoiceId: undefined,
    receiptUrl: undefined,
    created_at: new Date("2026-08-18"),
  },
]

// ============================================================
// INVOICES
// ============================================================

export const invoices: Invoice[] = [
  // ----------------------------------------------------------
  // Invoice 001 - NeuraCompress
  // ----------------------------------------------------------
  {
    id: "inv_001",
    firmId: "firm_001",
    clientId: "cli_014",
    invoiceNumber: "INV-2026-0041",
    issueDate: new Date("2026-08-12"),
    dueDate: new Date("2026-09-11"),
    subtotal: 3020,
    tax: 0,
    discount: 0,
    total: 3020,
    amountPaid: 1510,
    balanceDue: 1510,
    status: "PARTIALLY_PAID",
    notes: "August 2026 patent prosecution services",
    created_at: new Date("2026-08-12"),
    updated_at: new Date("2026-08-20"),
  },

  // ----------------------------------------------------------
  // Invoice 002 - VoltCell
  // ----------------------------------------------------------
  {
    id: "inv_002",
    firmId: "firm_001",
    clientId: "cli_009",
    invoiceNumber: "INV-2026-0042",
    issueDate: new Date("2026-07-31"),
    dueDate: new Date("2026-08-30"),
    subtotal: 1425,
    tax: 0,
    discount: 0,
    total: 1425,
    amountPaid: 1425,
    balanceDue: 0,
    status: "PAID",
    notes: "Q3 European validation and patent maintenance work",
    created_at: new Date("2026-07-31"),
    updated_at: new Date("2026-08-18"),
  },

  // ----------------------------------------------------------
  // Invoice 003 - Desyn
  // ----------------------------------------------------------
  {
    id: "inv_003",
    firmId: "firm_001",
    clientId: "cli_002",
    invoiceNumber: "INV-2026-0043",
    issueDate: new Date("2026-08-07"),
    dueDate: new Date("2026-08-22"),
    subtotal: 2757.5,
    tax: 0,
    discount: 0,
    total: 2757.5,
    amountPaid: 0,
    balanceDue: 2757.5,
    status: "OVERDUE",
    notes: "Trademark examination response services",
    created_at: new Date("2026-08-07"),
    updated_at: new Date("2026-08-23"),
  },

  // ----------------------------------------------------------
  // Invoice 004 - UpDesk
  // ----------------------------------------------------------
  {
    id: "inv_004",
    firmId: "firm_001",
    clientId: "cli_006",
    invoiceNumber: "INV-2026-0044",
    issueDate: new Date("2026-08-01"),
    dueDate: new Date("2026-08-31"),
    subtotal: 2400,
    tax: 0,
    discount: 150,
    total: 2250,
    amountPaid: 0,
    balanceDue: 2250,
    status: "SENT",
    notes: "Patent portfolio management and advisory services",
    created_at: new Date("2026-08-01"),
    updated_at: new Date("2026-08-01"),
  },

  // ----------------------------------------------------------
  // Invoice 005 - SolTile
  // ----------------------------------------------------------
  {
    id: "inv_005",
    firmId: "firm_001",
    clientId: "cli_003",
    invoiceNumber: "INV-2026-0045",
    issueDate: new Date("2026-06-01"),
    dueDate: new Date("2026-06-30"),
    subtotal: 1850,
    tax: 0,
    discount: 0,
    total: 1850,
    amountPaid: 1850,
    balanceDue: 0,
    status: "PAID",
    notes: "Final matter review and closure services",
    created_at: new Date("2026-06-01"),
    updated_at: new Date("2026-06-25"),
  },

  // ----------------------------------------------------------
  // Invoice 006 - CertChain
  // ----------------------------------------------------------
  {
    id: "inv_006",
    firmId: "firm_001",
    clientId: "cli_021",
    invoiceNumber: "INV-2026-0046",
    issueDate: new Date("2026-08-01"),
    dueDate: new Date("2026-08-31"),
    subtotal: 5000,
    tax: 0,
    discount: 0,
    total: 5000,
    amountPaid: 5000,
    balanceDue: 0,
    status: "PAID",
    notes: "Retainer replenishment",
    created_at: new Date("2026-08-01"),
    updated_at: new Date("2026-08-08"),
  },
]

// ============================================================
// INVOICE LINE ITEMS
// ============================================================

export const invoiceLineItems: InvoiceLineItem[] = [
  // Invoice 001 - NeuraCompress
  {
    id: "li_001",
    invoiceId: "inv_001",
    matterId: "mat_001",
    description: "Office action review and prior-art analysis",
    quantity: 2.5,
    unitPrice: 475,
    amount: 1187.5,
    type: "TIME",
    timeEntryId: "te_001",
    expenseId: undefined,
  },
  {
    id: "li_002",
    invoiceId: "inv_001",
    matterId: "mat_001",
    description: "Claim amendment strategy and response preparation",
    quantity: 3,
    unitPrice: 475,
    amount: 1425,
    type: "TIME",
    timeEntryId: "te_002",
    expenseId: undefined,
  },
  {
    id: "li_003",
    invoiceId: "inv_001",
    matterId: "mat_001",
    description: "Patent document retrieval and certified copies",
    quantity: 1,
    unitPrice: 145,
    amount: 145,
    type: "EXPENSE",
    timeEntryId: undefined,
    expenseId: "exp_001",
  },
  {
    id: "li_004",
    invoiceId: "inv_001",
    matterId: "mat_001",
    description: "Patent file review and document organization",
    quantity: 1.5,
    unitPrice: 175,
    amount: 262.5,
    type: "TIME",
    timeEntryId: "te_003",
    expenseId: undefined,
  },

  // Invoice 002 - VoltCell
  {
    id: "li_005",
    invoiceId: "inv_002",
    matterId: "mat_002",
    description: "European validation and renewal review",
    quantity: 2,
    unitPrice: 380,
    amount: 760,
    type: "TIME",
    timeEntryId: "te_005",
    expenseId: undefined,
  },
  {
    id: "li_006",
    invoiceId: "inv_002",
    matterId: "mat_002",
    description: "Client advisory call",
    quantity: 1.5,
    unitPrice: 380,
    amount: 570,
    type: "TIME",
    timeEntryId: "te_006",
    expenseId: undefined,
  },
  {
    id: "li_007",
    invoiceId: "inv_002",
    matterId: "mat_002",
    description: "EPO registry document retrieval",
    quantity: 1,
    unitPrice: 95,
    amount: 95,
    type: "EXPENSE",
    timeEntryId: undefined,
    expenseId: "exp_002",
  },

  // Invoice 003 - Desyn
  {
    id: "li_008",
    invoiceId: "inv_003",
    matterId: "mat_003",
    description: "Examination report review and response strategy",
    quantity: 1.5,
    unitPrice: 425,
    amount: 637.5,
    type: "TIME",
    timeEntryId: "te_007",
    expenseId: undefined,
  },
  {
    id: "li_009",
    invoiceId: "inv_003",
    matterId: "mat_003",
    description: "Trademark search and evidence collection",
    quantity: 2,
    unitPrice: 160,
    amount: 320,
    type: "TIME",
    timeEntryId: "te_008",
    expenseId: undefined,
  },
  {
    id: "li_010",
    invoiceId: "inv_003",
    matterId: "mat_003",
    description: "Trademark evidence search service",
    quantity: 1,
    unitPrice: 1800,
    amount: 1800,
    type: "EXPENSE",
    timeEntryId: undefined,
    expenseId: "exp_003",
  },

  // Invoice 004 - UpDesk
  {
    id: "li_011",
    invoiceId: "inv_004",
    matterId: "mat_005",
    description: "Patent portfolio management - August",
    quantity: 1,
    unitPrice: 2400,
    amount: 2400,
    type: "FLAT_FEE",
    timeEntryId: undefined,
    expenseId: undefined,
  },

  // Invoice 005 - SolTile
  {
    id: "li_012",
    invoiceId: "inv_005",
    matterId: "mat_006",
    description: "Matter closure and final patent status review",
    quantity: 3.5,
    unitPrice: 400,
    amount: 1400,
    type: "TIME",
    timeEntryId: undefined,
    expenseId: undefined,
  },
  {
    id: "li_013",
    invoiceId: "inv_005",
    matterId: "mat_006",
    description: "Client reporting and file archival",
    quantity: 450,
    unitPrice: 1,
    amount: 450,
    type: "OTHER",
    timeEntryId: undefined,
    expenseId: undefined,
  },

  // Invoice 006 - CertChain
  {
    id: "li_014",
    invoiceId: "inv_006",
    matterId: "mat_004",
    description: "Monthly retainer replenishment",
    quantity: 1,
    unitPrice: 5000,
    amount: 5000,
    type: "FLAT_FEE",
    timeEntryId: undefined,
    expenseId: undefined,
  },
]

// ============================================================
// PAYMENTS
// ============================================================

export const payments: Payment[] = [
  {
    id: "pay_001",
    firmId: "firm_001",
    invoiceId: "inv_001",
    clientId: "cli_014",
    amount: 1510,
    currency: "USD",
    paymentDate: new Date("2026-08-20"),
    method: "BANK_TRANSFER",
    reference: "WIRE-NC-20260820-01",
    notes: "Partial payment against August invoice",
    created_at: new Date("2026-08-20"),
  },
  {
    id: "pay_002",
    firmId: "firm_001",
    invoiceId: "inv_002",
    clientId: "cli_009",
    amount: 1425,
    currency: "EUR",
    paymentDate: new Date("2026-08-18"),
    method: "BANK_TRANSFER",
    reference: "VC-EUR-88142",
    notes: "Paid in full",
    created_at: new Date("2026-08-18"),
  },
  {
    id: "pay_003",
    firmId: "firm_001",
    invoiceId: "inv_005",
    clientId: "cli_003",
    amount: 1850,
    currency: "USD",
    paymentDate: new Date("2026-06-25"),
    method: "BANK_TRANSFER",
    reference: "SOL-0625-441",
    notes: "Paid in full",
    created_at: new Date("2026-06-25"),
  },
  {
    id: "pay_004",
    firmId: "firm_001",
    invoiceId: "inv_006",
    clientId: "cli_021",
    amount: 5000,
    currency: "USD",
    paymentDate: new Date("2026-08-08"),
    method: "BANK_TRANSFER",
    reference: "CCL-RET-0808",
    notes: "Retainer replenishment",
    created_at: new Date("2026-08-08"),
  },
]

// ============================================================
// DOCUMENTS
// ============================================================

export const documents: Document[] = [
  // ----------------------------------------------------------
  // Matter 001 - NeuraCompress
  // ----------------------------------------------------------
  {
    id: "doc_001",
    firmId: "firm_001",
    matterId: "mat_001",
    clientId: "cli_014",

    name: "Non-Final Office Action",
    description:
      "Non-final Office Action issued by the USPTO citing prior art under 35 USC 103.",

    type: "OFFICE_ACTION",
    status: "FINAL",

    spid: "file_sp_8f31a2c9",
    fileName: "US2024_0231145_Non_Final_Office_Action.pdf",
    mimeType: "application/pdf",
    fileSize: 2487314,

    version: 2,

    uploadedBy: "usr_006",

    tags: ["USPTO", "office-action", "prior-art", "response-required"],

    created_at: new Date("2026-06-22"),
    updated_at: new Date("2026-06-23"),
  },

  {
    id: "doc_002",
    firmId: "firm_001",
    matterId: "mat_001",
    clientId: "cli_014",

    name: "Patent Application Specification",
    description:
      "Filed specification describing the adaptive neural compression codec and related claims.",

    type: "APPLICATION",
    status: "FINAL",

    spid: "file_sp_23b91e77",
    fileName: "Adaptive_Neural_Compression_Codec_Specification.pdf",
    mimeType: "application/pdf",
    fileSize: 8945120,

    version: 3,

    uploadedBy: "usr_005",

    tags: ["application", "specification", "claims", "filed"],

    created_at: new Date("2024-01-15"),
    updated_at: new Date("2026-07-14"),
  },

  {
    id: "doc_003",
    firmId: "firm_001",
    matterId: "mat_001",
    clientId: "cli_014",

    name: "Response to Office Action - Draft",
    description:
      "Attorney draft response addressing cited references and proposed claim amendments.",

    type: "RESPONSE",
    status: "DRAFT",

    spid: "file_sp_d71820ac",
    fileName: "OA_Response_Draft_v3.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 183421,

    version: 3,

    uploadedBy: "usr_001",

    tags: ["draft", "office-action", "claims", "attorney-review"],

    created_at: new Date("2026-08-06"),
    updated_at: new Date("2026-08-20"),
  },

  {
    id: "doc_004",
    firmId: "firm_001",
    matterId: "mat_001",
    clientId: "cli_014",

    name: "Prior Art Reference - Wu et al.",
    description:
      "Prior-art publication cited by the examiner in the non-final Office Action.",

    type: "PRIOR_ART",
    status: "FINAL",

    spid: "file_sp_1cc84291",
    fileName: "Wu_Adaptive_Compression_2019.pdf",
    mimeType: "application/pdf",
    fileSize: 3412876,

    version: 1,

    uploadedBy: "usr_005",

    tags: ["prior-art", "examiner-cited", "reference"],

    created_at: new Date("2026-06-24"),
    updated_at: new Date("2026-06-24"),
  },

  // ----------------------------------------------------------
  // Matter 002 - VoltCell
  // ----------------------------------------------------------
  {
    id: "doc_005",
    firmId: "firm_001",
    matterId: "mat_002",
    clientId: "cli_009",

    name: "European Patent Grant",
    description:
      "Grant documentation for the European patent covering the battery thermal management assembly.",

    type: "NOTICE",
    status: "FINAL",

    spid: "file_sp_7a294e61",
    fileName: "EP4273456_B1_Grant_Document.pdf",
    mimeType: "application/pdf",
    fileSize: 1928450,

    version: 1,

    uploadedBy: "usr_004",

    tags: ["EPO", "grant", "patent", "validated"],

    created_at: new Date("2026-02-04"),
    updated_at: new Date("2026-02-04"),
  },

  {
    id: "doc_006",
    firmId: "firm_001",
    matterId: "mat_002",
    clientId: "cli_009",

    name: "EPO Renewal Fee Receipt",
    description:
      "Receipt confirming payment of the European patent maintenance fee.",

    type: "FILING_RECEIPT",
    status: "FINAL",

    spid: "file_sp_b49f17d2",
    fileName: "EPO_Renewal_Fee_Receipt_2026.pdf",
    mimeType: "application/pdf",
    fileSize: 784221,

    version: 1,

    uploadedBy: "usr_006",

    tags: ["EPO", "renewal", "fee", "receipt"],

    created_at: new Date("2026-01-05"),
    updated_at: new Date("2026-01-05"),
  },

  // ----------------------------------------------------------
  // Matter 003 - DESYN Trademark
  // ----------------------------------------------------------
  {
    id: "doc_007",
    firmId: "firm_001",
    matterId: "mat_003",
    clientId: "cli_002",

    name: "Trademark Examination Report",
    description:
      "Examination report raising a descriptiveness objection against the DESYN mark.",

    type: "OFFICE_ACTION",
    status: "FINAL",

    spid: "file_sp_51bd9d24",
    fileName: "DESYN_Examination_Report.pdf",
    mimeType: "application/pdf",
    fileSize: 1289450,

    version: 1,

    uploadedBy: "usr_007",

    tags: ["trademark", "examination", "section-9", "objection"],

    created_at: new Date("2026-05-06"),
    updated_at: new Date("2026-05-06"),
  },

  {
    id: "doc_008",
    firmId: "firm_001",
    matterId: "mat_003",
    clientId: "cli_002",

    name: "Evidence of Acquired Distinctiveness",
    description:
      "Marketing and commercial-use evidence collected to support the trademark response.",

    type: "EVIDENCE",
    status: "DRAFT",

    spid: "file_sp_9c0ad553",
    fileName: "DESYN_Acquired_Distinctiveness_Evidence.zip",
    mimeType: "application/zip",
    fileSize: 18492732,

    version: 2,

    uploadedBy: "usr_007",

    tags: ["trademark", "evidence", "distinctiveness", "client-materials"],

    created_at: new Date("2026-07-28"),
    updated_at: new Date("2026-08-11"),
  },

  // ----------------------------------------------------------
  // Matter 004 - CertChain
  // ----------------------------------------------------------
  {
    id: "doc_009",
    firmId: "firm_001",
    matterId: "mat_004",
    clientId: "cli_021",

    name: "PCT International Application",
    description:
      "Filed PCT application for the distributed ledger certificate verification protocol.",

    type: "APPLICATION",
    status: "FINAL",

    spid: "file_sp_4f81a720",
    fileName: "PCT_International_Application_2025.pdf",
    mimeType: "application/pdf",
    fileSize: 11284931,

    version: 2,

    uploadedBy: "usr_001",

    tags: ["PCT", "WIPO", "blockchain", "application"],

    created_at: new Date("2025-08-20"),
    updated_at: new Date("2026-03-12"),
  },

  {
    id: "doc_010",
    firmId: "firm_001",
    matterId: "mat_004",
    clientId: "cli_021",

    name: "Inventor Declaration",
    description:
      "Signed inventor declaration prepared for the PCT application.",

    type: "CORRESPONDENCE",
    status: "FINAL",

    spid: "file_sp_719bd083",
    fileName: "CertChain_Inventor_Declaration.pdf",
    mimeType: "application/pdf",
    fileSize: 628442,

    version: 1,

    uploadedBy: "usr_005",

    tags: ["inventor", "declaration", "signed", "pct"],

    created_at: new Date("2026-08-15"),
    updated_at: new Date("2026-08-15"),
  },

  {
    id: "doc_011",
    firmId: "firm_001",
    matterId: "mat_004",
    clientId: "cli_021",

    name: "National Phase Filing Instructions",
    description:
      "Client instructions identifying the countries under consideration for national phase entry.",

    type: "CORRESPONDENCE",
    status: "DRAFT",

    spid: "file_sp_0a62e9fc",
    fileName: "CertChain_National_Phase_Instructions.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 226814,

    version: 1,

    uploadedBy: "usr_005",

    tags: ["national-phase", "client-instructions", "countries"],

    created_at: new Date("2026-08-17"),
    updated_at: new Date("2026-08-17"),
  },

  // ----------------------------------------------------------
  // Matter 005 - UpDesk
  // ----------------------------------------------------------
  {
    id: "doc_012",
    firmId: "firm_001",
    matterId: "mat_005",
    clientId: "cli_006",

    name: "Design Patent Grant",
    description:
      "Issued US design patent documentation for the foldable standing desk frame.",

    type: "NOTICE",
    status: "FINAL",

    spid: "file_sp_c9e44210",
    fileName: "US_D945231_S_Grant.pdf",
    mimeType: "application/pdf",
    fileSize: 925418,

    version: 1,

    uploadedBy: "usr_002",

    tags: ["USPTO", "design-patent", "grant"],

    created_at: new Date("2022-01-11"),
    updated_at: new Date("2022-01-11"),
  },

  // ----------------------------------------------------------
  // Matter 006 - SolTile
  // ----------------------------------------------------------
  {
    id: "doc_013",
    firmId: "firm_001",
    matterId: "mat_006",
    clientId: "cli_003",

    name: "Maintenance Fee Abandonment Confirmation",
    description:
      "Client correspondence confirming that the maintenance fee will not be paid.",

    type: "CORRESPONDENCE",
    status: "FINAL",

    spid: "file_sp_4471fe91",
    fileName: "SolTile_Maintenance_Abandonment_Confirmation.pdf",
    mimeType: "application/pdf",
    fileSize: 442810,

    version: 1,

    uploadedBy: "usr_004",

    tags: ["abandonment", "client-confirmation", "maintenance-fee"],

    created_at: new Date("2026-05-28"),
    updated_at: new Date("2026-06-01"),
  },

  // ----------------------------------------------------------
  // Matter 007 - SUKOON
  // ----------------------------------------------------------
  {
    id: "doc_014",
    firmId: "firm_001",
    matterId: "mat_007",
    clientId: "cli_002",

    name: "JPO Notice of Refusal",
    description:
      "Japanese trademark refusal notice citing a potentially conflicting mark.",

    type: "OFFICIAL_LETTER",
    status: "FINAL",

    spid: "file_sp_2da71b84",
    fileName: "JPO_SUKOON_Notice_of_Refusal.pdf",
    mimeType: "application/pdf",
    fileSize: 1739845,

    version: 1,

    uploadedBy: "usr_008",

    tags: ["JPO", "trademark", "refusal", "foreign-counsel"],

    created_at: new Date("2026-07-10"),
    updated_at: new Date("2026-07-10"),
  },

  {
    id: "doc_015",
    firmId: "firm_001",
    matterId: "mat_007",
    clientId: "cli_002",

    name: "Coexistence Letter - Draft",
    description:
      "Draft correspondence proposing coexistence terms with the owner of the cited mark.",

    type: "CORRESPONDENCE",
    status: "DRAFT",

    spid: "file_sp_5c728e1a",
    fileName: "SUKOON_Coexistence_Letter_Draft.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 192442,

    version: 2,

    uploadedBy: "usr_008",

    tags: ["JPO", "coexistence", "draft", "foreign-counsel"],

    created_at: new Date("2026-08-01"),
    updated_at: new Date("2026-08-18"),
  },

  // ----------------------------------------------------------
  // Matter 008 - Verity AI
  // ----------------------------------------------------------
  {
    id: "doc_016",
    firmId: "firm_001",
    matterId: "mat_008",
    clientId: "cli_030",

    name: "Provisional Patent Specification",
    description:
      "Provisional specification covering the real-time LLM hallucination audit trail system.",

    type: "APPLICATION",
    status: "FINAL",

    spid: "file_sp_86d9137f",
    fileName: "LLM_Hallucination_Audit_Trail_Provisional.pdf",
    mimeType: "application/pdf",
    fileSize: 6721840,

    version: 1,

    uploadedBy: "usr_001",

    tags: ["AI", "provisional", "specification", "LLM"],

    created_at: new Date("2025-02-11"),
    updated_at: new Date("2025-02-11"),
  },
]

// ============================================================
// DOCUMENT VERSIONS
// ============================================================

export const documentVersions: DocumentVersion[] = [
  // ----------------------------------------------------------
  // Document 001 - Office Action
  // ----------------------------------------------------------
  {
    id: "dv_001",
    documentId: "doc_001",
    versionNumber: 1,

    spid: "file_sp_8f31a2c9_v1",
    fileName: "US2024_0231145_Non_Final_Office_Action.pdf",
    mimeType: "application/pdf",
    fileSize: 2478910,

    uploadedBy: "usr_006",

    changeNote: "Initial Office Action uploaded from USPTO correspondence.",

    created_at: new Date("2026-06-22"),
  },

  {
    id: "dv_002",
    documentId: "doc_001",
    versionNumber: 2,

    spid: "file_sp_8f31a2c9_v2",
    fileName: "US2024_0231145_Non_Final_Office_Action_Annotated.pdf",
    mimeType: "application/pdf",
    fileSize: 2487314,

    uploadedBy: "usr_005",

    changeNote: "Added internal annotations and examiner citation references.",

    created_at: new Date("2026-06-23"),
  },

  // ----------------------------------------------------------
  // Document 002 - Application Specification
  // ----------------------------------------------------------
  {
    id: "dv_003",
    documentId: "doc_002",
    versionNumber: 1,

    spid: "file_sp_23b91e77_v1",
    fileName: "Adaptive_Neural_Compression_Codec_Specification.pdf",
    mimeType: "application/pdf",
    fileSize: 8421901,

    uploadedBy: "usr_001",

    changeNote: "Original filed specification.",

    created_at: new Date("2024-01-15"),
  },

  {
    id: "dv_004",
    documentId: "doc_002",
    versionNumber: 2,

    spid: "file_sp_23b91e77_v2",
    fileName: "Adaptive_Neural_Compression_Codec_Specification_Amended.pdf",
    mimeType: "application/pdf",
    fileSize: 8784210,

    uploadedBy: "usr_001",

    changeNote: "Updated specification following examiner correspondence.",

    created_at: new Date("2025-06-11"),
  },

  {
    id: "dv_005",
    documentId: "doc_002",
    versionNumber: 3,

    spid: "file_sp_23b91e77_v3",
    fileName: "Adaptive_Neural_Compression_Codec_Specification_Filed.pdf",
    mimeType: "application/pdf",
    fileSize: 8945120,

    uploadedBy: "usr_005",

    changeNote: "Filed version uploaded to matter file.",

    created_at: new Date("2026-07-14"),
  },

  // ----------------------------------------------------------
  // Document 003 - Response Draft
  // ----------------------------------------------------------
  {
    id: "dv_006",
    documentId: "doc_003",
    versionNumber: 1,

    spid: "file_sp_d71820ac_v1",
    fileName: "OA_Response_Draft_v1.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 143820,

    uploadedBy: "usr_001",

    changeNote: "Initial response draft prepared.",

    created_at: new Date("2026-08-06"),
  },

  {
    id: "dv_007",
    documentId: "doc_003",
    versionNumber: 2,

    spid: "file_sp_d71820ac_v2",
    fileName: "OA_Response_Draft_v2.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 165214,

    uploadedBy: "usr_001",

    changeNote: "Revised claim amendments after attorney review.",

    created_at: new Date("2026-08-12"),
  },

  {
    id: "dv_008",
    documentId: "doc_003",
    versionNumber: 3,

    spid: "file_sp_d71820ac_v3",
    fileName: "OA_Response_Draft_v3.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 183421,

    uploadedBy: "usr_001",

    changeNote: "Added fallback arguments and updated claim chart.",

    created_at: new Date("2026-08-20"),
  },

  // ----------------------------------------------------------
  // Document 008 - Distinctiveness Evidence
  // ----------------------------------------------------------
  {
    id: "dv_009",
    documentId: "doc_008",
    versionNumber: 1,

    spid: "file_sp_9c0ad553_v1",
    fileName: "DESYN_Acquired_Distinctiveness_Evidence.zip",
    mimeType: "application/zip",
    fileSize: 15124840,

    uploadedBy: "usr_007",

    changeNote: "Initial evidence package from client.",

    created_at: new Date("2026-07-28"),
  },

  {
    id: "dv_010",
    documentId: "doc_008",
    versionNumber: 2,

    spid: "file_sp_9c0ad553_v2",
    fileName: "DESYN_Acquired_Distinctiveness_Evidence_Updated.zip",
    mimeType: "application/zip",
    fileSize: 18492732,

    uploadedBy: "usr_007",

    changeNote: "Added additional marketing materials and invoices.",

    created_at: new Date("2026-08-11"),
  },

  // ----------------------------------------------------------
  // Document 009 - PCT Application
  // ----------------------------------------------------------
  {
    id: "dv_011",
    documentId: "doc_009",
    versionNumber: 1,

    spid: "file_sp_4f81a720_v1",
    fileName: "PCT_International_Application_2025.pdf",
    mimeType: "application/pdf",
    fileSize: 10831421,

    uploadedBy: "usr_001",

    changeNote: "Initial PCT filing package.",

    created_at: new Date("2025-08-20"),
  },

  {
    id: "dv_012",
    documentId: "doc_009",
    versionNumber: 2,

    spid: "file_sp_4f81a720_v2",
    fileName: "PCT_International_Application_2025_Filed.pdf",
    mimeType: "application/pdf",
    fileSize: 11284931,

    uploadedBy: "usr_001",

    changeNote: "Final filed copy uploaded after WIPO filing.",

    created_at: new Date("2026-03-12"),
  },

  // ----------------------------------------------------------
  // Document 011 - National Phase Instructions
  // ----------------------------------------------------------
  {
    id: "dv_013",
    documentId: "doc_011",
    versionNumber: 1,

    spid: "file_sp_0a62e9fc_v1",
    fileName: "CertChain_National_Phase_Instructions.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 198442,

    uploadedBy: "usr_005",

    changeNote: "Initial country selection instructions.",

    created_at: new Date("2026-08-17"),
  },

  // ----------------------------------------------------------
  // Document 015 - Coexistence Letter
  // ----------------------------------------------------------
  {
    id: "dv_014",
    documentId: "doc_015",
    versionNumber: 1,

    spid: "file_sp_5c728e1a_v1",
    fileName: "SUKOON_Coexistence_Letter_Draft_v1.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 162310,

    uploadedBy: "usr_008",

    changeNote: "Initial coexistence proposal drafted by Japanese counsel.",

    created_at: new Date("2026-08-01"),
  },

  {
    id: "dv_015",
    documentId: "doc_015",
    versionNumber: 2,

    spid: "file_sp_5c728e1a_v2",
    fileName: "SUKOON_Coexistence_Letter_Draft_v2.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    fileSize: 192442,

    uploadedBy: "usr_008",

    changeNote: "Updated proposed coexistence terms following client comments.",

    created_at: new Date("2026-08-18"),
  },

  // ----------------------------------------------------------
  // Document 016 - Provisional Specification
  // ----------------------------------------------------------
  {
    id: "dv_016",
    documentId: "doc_016",
    versionNumber: 1,

    spid: "file_sp_86d9137f_v1",
    fileName: "LLM_Hallucination_Audit_Trail_Provisional.pdf",
    mimeType: "application/pdf",
    fileSize: 6721840,

    uploadedBy: "usr_001",

    changeNote: "Original provisional specification.",

    created_at: new Date("2025-02-11"),
  },
]

export { firm, users, clients, matters, matterAssignments, deadlines }
