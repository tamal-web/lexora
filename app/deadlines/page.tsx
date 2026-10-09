"use client"
import { BriefcaseBusiness, Target, X, Loader2, Plus } from "lucide-react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { TopNavBar } from "@/components/TopNavBarComp"
import { Deadline } from "@/lib/models"
import { Table, type Column, fromIdTitleList } from "@/components/table"
import { useClient } from "../client-context"
import { useApi } from "@/lib/use-api"
import { api, ApiDeadline } from "@/lib/api"
import { DeadlineSheet } from "@/components/entity-sheets"

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

const priorityList = [
  { id: "CRITICAL", title: "Critical" },
  { id: "STANDARD", title: "Standard" },
  { id: "SOFT", title: "Soft" },
] as const

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
    key: "priorty",
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
      value !== undefined && value !== null ? `$${value.toLocaleString()}` : "—",
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
  const { client } = useClient()

  // Sheet state
  const [deadlineSheet, setDeadlineSheet] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState<ApiDeadline | null>(null)

  const { data: rawMatters, loading: loadingMatters, error: errorMatters } = useApi(api.matters)
  const { data: rawDeadlines, loading: loadingDeadlines, error: errorDeadlines, refetch: refetchDeadlines } = useApi(api.deadlines)

  if (loadingMatters || loadingDeadlines) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (errorMatters || errorDeadlines) {
    return <div className="p-8 text-red-500">Failed to load data</div>
  }

  const matters = rawMatters || []
  const rawApiDeadlines = rawDeadlines || []
  const mappedDeadlines: Deadline[] = rawApiDeadlines.map((d: any) => ({
    ...d,
    due_date: new Date(d.due_date),
    priorty: d.priority,
    fee_ammount: d.fee_amount,
    fee_curency: d.fee_currency,
  }))

  const handleEditDeadline = (d: Deadline) => {
    const raw = rawApiDeadlines.find((r: ApiDeadline) => r.id === d.id) ?? null
    setEditingDeadline(raw)
    setDeadlineSheet(true)
  }

  return (
    <div className="px-8">
      <TopNavBar className="sticky top-0">
        <div className="flex flex-col items-start justify-start gap-3 w-full">
          <div className="flex flex-row items-center justify-between w-full gap-2">
            <div className="flex flex-row items-center gap-2">
              <Target />
              <h1 className="font-medium">Deadlines</h1>
            </div>
            <Button size="sm" onClick={() => { setEditingDeadline(null); setDeadlineSheet(true) }}>
              <Plus className="mr-1.5 size-3.5" /> New Deadline
            </Button>
          </div>
          <div className="flex flex-row items-center justify-start gap-2">
            <div className="flex flex-row items-center justify-start gap-1">
              <Select value={mi as any} onValueChange={(x) => setMi(x as any)}>
                <SelectTrigger className={"min-w-[17rem]"}>
                  <SelectValue placeholder="Select Matter">
                    {mi?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {matters.map((t: any, i: number) => (
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
        data={mappedDeadlines
          .filter((d) => {
            if (client === "all-clients") return true;
            if (matters.find((m: any) => m.id == d.matter_id)?.client_id == client) {
              return true
            } else {
              return false
            }
          })
          .filter((f) => (mi ? f.matter_id == mi.id : true))}
        columns={deadlineColumns}
        getRowId={(d) => d.id}
        pageSize={20}
        onRowClick={handleEditDeadline}
      />
      <DeadlineSheet
        open={deadlineSheet}
        onClose={() => setDeadlineSheet(false)}
        initial={editingDeadline}
        matters={matters}
        onSaved={() => { refetchDeadlines(); setDeadlineSheet(false) }}
      />
    </div>
  )
}
