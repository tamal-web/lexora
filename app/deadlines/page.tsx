"use client"
import { BriefcaseBusiness, Target, X } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { TopNavBar } from "@/components/TopNavBarComp"
import { Deadline } from "@/lib/models"
import { Table, type Column, fromIdTitleList } from "@/components/table"
import { deadlines, matters } from "@/lib/data"
import { useClient } from "../client-context"

const typesList = [
  { id: "PATENT_UTILITY", title: "Utility Patent" },
  { id: "PATENT_DESIGN", title: "Design Patent" },
  { id: "PATENT_PROVISIONAL", title: "Provisional Patent" },
  { id: "PATENT_PCT", title: "PCT Patent" },
  { id: "PATENT_NATIONAL_PHASE", title: "National Phase Patent" },
  { id: "TRADEMARK_APPLICATION", title: "Trademark Application" },
  { id: "TRADEMARK_OPPOSITION", title: "Trademark Opposition" },
  { id: "TRADEMARK_RENEWAL", title: "Trademark Renewal" },
  { id: "COPYRIGHT_REGISTRATION", title: "Copyright Registration" },
  { id: "IP_LITIGATION", title: "IP Litigation" },
  { id: "CIVIL_LITIGATION", title: "Civil Litigation" },
  { id: "LICENSING_TRANSACTIONAL", title: "Licensing & Transactional" },
  { id: "TRADE_SECRET", title: "Trade Secret" },
  { id: "PORTFOLIO_MANAGEMENT", title: "Portfolio Management" },
  { id: "CLIENT_COUNSELING", title: "Client Counseling" },
  { id: "OTHER", title: "Other" },
] as const

const statusList = [
  { id: "OPEN", title: "Open" },
  { id: "PENDING", title: "Pending" },
  { id: "ON_HOLD", title: "On Hold" },
  { id: "ABANDONED", title: "Abandoned" },
  { id: "CLOSED", title: "Closed" },
  { id: "ARCHIVED", title: "Archived" },
] as const

// New: title list for the Deadline "priorty" column
const priorityList = [
  { id: "CRITICAL", title: "Critical" },
  { id: "STANDARD", title: "Standard" },
  { id: "SOFT", title: "Soft" },
] as const

// typesList / statusList above use a different id set than DeadlineType /
// DeadlineStatus (they look like matter type/status, not deadline type/status),
// so they can't be reused for the action_type / status columns. Until real
// display titles for DeadlineType/DeadlineStatus are available, humanize()
// auto-generates a readable label from the raw enum value as a placeholder —
// swap this out for a real { id, title } list + fromIdTitleList the same way
// priorityList is used below, once you have one.
function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ")
}

const actionTypeOptions = [
  "STATUTORY_BAR_DATE",
  "OFFICE_ACTION_RESPONSE",
  "RENEWAL_MAINTENANCE_FEE",
  "PRIORITY_DEADLINE",
  "FILING_DEADLINE",
  "DISCOVERY_DEADLINE",
  "COURT_HEARING",
  "COURT_FILING",
  "CLIENT_REPORTING",
  "INTERNAL_REVIEW",
] as const

const deadlineStatusOptions = [
  "DOCKETED",
  "UPCOMING",
  "DUE_SOON",
  "OVERDUE",
  "COMPLETED",
  "EXTENDED",
  "WAIVED",
] as const

const deadlineColumns: Column<Deadline>[] = [
  {
    key: "title",
    header: "Title",
    type: "string",
    sortable: true,
    filterable: true,
  },
  {
    key: "action_type",
    header: "Type",
    type: "union",
    options: actionTypeOptions,
    labels: Object.fromEntries(actionTypeOptions.map((o) => [o, humanize(o)])),
    sortable: true,
    filterable: true,
  },
  {
    key: "status",
    header: "Status",
    type: "union",
    options: deadlineStatusOptions,
    labels: Object.fromEntries(
      deadlineStatusOptions.map((o) => [o, humanize(o)])
    ),
    sortable: true,
    filterable: true,
  },
  {
    key: "priorty", // matches the typo in the interface — see note below
    header: "Priority",
    type: "union",
    ...fromIdTitleList(priorityList),
    sortable: true,
    filterable: true,
    render: (value) => (
      <span
        style={{
          fontWeight: value === "CRITICAL" ? 700 : 400,
          color: value === "CRITICAL" ? "crimson" : undefined,
        }}
      >
        {priorityList.find((p) => p.id === value)?.title ?? value}
      </span>
    ),
  },
  {
    key: "due_date",
    header: "Due Date",
    type: "date",
    sortable: true,
    filterable: true,
    render: (value) => value.toLocaleDateString(),
  },
  {
    key: "assigned_to",
    header: "Assigned To",
    type: "string",
    sortable: true,
    filterable: true,
    render: (value) => value ?? "Unassigned",
  },
  {
    key: "is_court_deadline",
    header: "Court Deadline",
    type: "boolean",
    filterable: true,
    render: (value) => (value ? "Yes" : "No"),
  },
  {
    key: "fee_ammount",
    header: "Fee",
    type: "number",
    sortable: true,
    filterable: true,
    render: (value) =>
      value !== undefined ? `$${value.toLocaleString()}` : "—",
  },
  {
    key: "fee_status",
    header: "Fee Status",
    type: "union",
    options: ["N/A", "UNPAID", "PAID", "WAIVED"] as const,
    sortable: true,
    filterable: true,
  },
]

export default function DeadlinesPage() {
  const [mi, setMi] = useState<{ title: string; id: string } | null>(null)
  const [status, setStatus] = useState<{ title: string; id: string } | null>(
    null
  )
  const { client } = useClient()
  return (
    <div className="px-8">
      <TopNavBar className="sticky top-0">
        <div className="flex flex-col items-start justify-start gap-3">
          <div className="flex flex-row items-center justify-start gap-2">
            <Target />
            <h1 className="font-medium">Deadlines</h1>
          </div>
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="flex flex-row items-center justify-start gap-1">
              <Select value={mi} onValueChange={(x) => setMi(x)}>
                <SelectTrigger className={"min-w-[17rem]"}>
                  <SelectValue placeholder="Select Matter">
                    {mi?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {matters.map((t, i) => (
                    <SelectItem value={t} key={i}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {mi && (
                <button
                  onClick={() => setMi(null)}
                  className="rounded-full p-1 hover:bg-secondary"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </TopNavBar>
      <Table
        data={deadlines
          .filter((d) => {
            if (matters.find((m) => m.id == d.matter_id)?.client_id == client) {
              return true
            } else {
              return false
            }
          })
          .filter((f) => (mi ? f.matter_id == mi.id : true))}
        columns={deadlineColumns}
        getRowId={(d) => d.id}
        pageSize={20}
      />
    </div>
  )
}
