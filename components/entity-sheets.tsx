// @ts-nocheck
"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  ApiMatter,
  ApiDeadline,
  ApiClient,
  ApiTimeEntry,
  ApiExpense,
  ApiInvoice,
} from "@/lib/api"

const BASE = "http://localhost:8000"

async function apiFetch(path: string, method: string, body?: object) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err)
  }
  if (res.status === 204) return null
  return res.json()
}

/* ─── shared ────────────────────────────────────────────────────────────── */

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}

function SaveButton({ loading }: { loading: boolean }) {
  return (
    <Button type="submit" disabled={loading} className="w-full">
      {loading ? "Saving…" : "Save"}
    </Button>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   MATTER SHEET
   ═══════════════════════════════════════════════════════════════════════════ */

const MATTER_TYPES = [
  "PATENT_UTILITY",
  "PATENT_DESIGN",
  "PATENT_PROVISIONAL",
  "PATENT_PCT",
  "PATENT_NATIONAL_PHASE",
  "TRADEMARK_APPLICATION",
  "TRADEMARK_OPPOSITION",
  "TRADEMARK_RENEWAL",
  "COPYRIGHT_REGISTRATION",
  "IP_LITIGATION",
  "CIVIL_LITIGATION",
  "LICENSING_TRANSACTIONAL",
  "TRADE_SECRET",
  "PORTFOLIO_MANAGEMENT",
  "CLIENT_COUNSELING",
  "OTHER",
]
const MATTER_STATUSES = [
  "OPEN",
  "PENDING",
  "ON_HOLD",
  "ABANDONED",
  "CLOSED",
  "ARCHIVED",
]

export function MatterSheet({
  open,
  onClose,
  initial,
  clients,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: ApiMatter | null
  clients: ApiClient[]
  onSaved: (m: ApiMatter) => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    title: "",
    type: "PATENT_UTILITY",
    status: "OPEN",
    client_id: "",
    country: "US",
    desc: "",
    matter_number: "",
    filing_date: "",
    priority_date: "",
    application_number: "",
    estimated_value: "",
    billing_code: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title ?? "",
        type: initial.type ?? "PATENT_UTILITY",
        status: initial.status ?? "OPEN",
        client_id: initial.client_id ?? "",
        country: initial.country ?? "US",
        desc: initial.desc ?? "",
        matter_number: initial.matter_number ?? "",
        filing_date: initial.filing_date
          ? initial.filing_date.slice(0, 10)
          : "",
        priority_date: initial.priority_date
          ? initial.priority_date.slice(0, 10)
          : "",
        application_number: initial.application_number ?? "",
        estimated_value:
          initial.estimated_value != null
            ? String(initial.estimated_value)
            : "",
        billing_code: initial.billing_code ?? "",
      })
    } else {
      setForm({
        title: "",
        type: "PATENT_UTILITY",
        status: "OPEN",
        client_id: "",
        country: "US",
        desc: "",
        matter_number: "",
        filing_date: "",
        priority_date: "",
        application_number: "",
        estimated_value: "",
        billing_code: "",
      })
    }
    setError("")
  }, [initial, open])

  const set =
    (k: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        type: form.type,
        status: form.status,
        country: form.country || "US",
        client_id: form.client_id || undefined,
        desc: form.desc || undefined,
        matter_number: form.matter_number || undefined,
        filing_date: form.filing_date || undefined,
        priority_date: form.priority_date || undefined,
        application_number: form.application_number || undefined,
        estimated_value: form.estimated_value
          ? parseFloat(form.estimated_value)
          : undefined,
        billing_code: form.billing_code || undefined,
      }
      const result = isEdit
        ? await apiFetch(`/api/matters/${initial!.id}`, "PATCH", body)
        : await apiFetch("/api/matters", "POST", body)
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Matter" : "New Matter"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <Field label="Title *">
            <Input
              required
              value={form.title}
              onChange={set("title")}
              placeholder="Matter title"
            />
          </Field>
          <Field label="Matter Number">
            <Input
              value={form.matter_number}
              onChange={set("matter_number")}
              placeholder="Auto-generated if empty"
            />
          </Field>
          <Field label="Type *">
            <Select
              value={form.type}
              onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATTER_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATTER_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Client">
            <Select
              value={form.client_id || "_none"}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, client_id: v === "_none" ? "" : v }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="No client" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="_none">No client</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Country">
            <Input
              value={form.country}
              onChange={set("country")}
              placeholder="US"
            />
          </Field>
          <Field label="Application Number">
            <Input
              value={form.application_number}
              onChange={set("application_number")}
            />
          </Field>
          <Field label="Filing Date">
            <Input
              type="date"
              value={form.filing_date}
              onChange={set("filing_date")}
            />
          </Field>
          <Field label="Priority Date">
            <Input
              type="date"
              value={form.priority_date}
              onChange={set("priority_date")}
            />
          </Field>
          <Field label="Estimated Value (USD)">
            <Input
              type="number"
              value={form.estimated_value}
              onChange={set("estimated_value")}
            />
          </Field>
          <Field label="Billing Code">
            <Input value={form.billing_code} onChange={set("billing_code")} />
          </Field>
          <Field label="Description">
            <Textarea value={form.desc} onChange={set("desc")} rows={3} />
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <SheetFooter className="pt-2">
            <SaveButton loading={loading} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   DEADLINE SHEET
   ═══════════════════════════════════════════════════════════════════════════ */

const DEADLINE_TYPES = [
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
]
const DEADLINE_STATUSES = [
  "DOCKETED",
  "UPCOMING",
  "DUE_SOON",
  "OVERDUE",
  "COMPLETED",
  "EXTENDED",
  "WAIVED",
]
const DEADLINE_PRIORITIES = ["CRITICAL", "STANDARD", "SOFT"]
const FEE_STATUSES = ["N/A", "UNPAID", "PAID", "WAIVED"]

export function DeadlineSheet({
  open,
  onClose,
  initial,
  matters,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: ApiDeadline | null
  matters: ApiMatter[]
  onSaved: (d: ApiDeadline) => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    matter_id: "",
    title: "",
    action_type: "FILING_DEADLINE",
    due_date: "",
    status: "UPCOMING",
    priority: "STANDARD",
    description: "",
    assigned_to: "",
    is_court_deadline: false,
    fee_amount: "",
    fee_currency: "USD",
    fee_status: "N/A",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (initial) {
      setForm({
        matter_id: initial.matter_id ?? "",
        title: initial.title ?? "",
        action_type: initial.action_type ?? "FILING_DEADLINE",
        due_date: initial.due_date ? initial.due_date.slice(0, 10) : "",
        status: initial.status ?? "UPCOMING",
        priority: initial.priority ?? "STANDARD",
        description: initial.description ?? "",
        assigned_to: initial.assigned_to ?? "",
        is_court_deadline: initial.is_court_deadline ?? false,
        fee_amount:
          initial.fee_amount != null ? String(initial.fee_amount) : "",
        fee_currency: initial.fee_currency ?? "USD",
        fee_status: initial.fee_status ?? "N/A",
        notes: initial.notes ?? "",
      })
    } else {
      setForm({
        matter_id: "",
        title: "",
        action_type: "FILING_DEADLINE",
        due_date: "",
        status: "UPCOMING",
        priority: "STANDARD",
        description: "",
        assigned_to: "",
        is_court_deadline: false,
        fee_amount: "",
        fee_currency: "USD",
        fee_status: "N/A",
        notes: "",
      })
    }
    setError("")
  }, [initial, open])

  const set =
    (k: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.due_date) {
      setError("Due date is required")
      return
    }
    setLoading(true)
    setError("")
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        action_type: form.action_type,
        due_date: form.due_date,
        status: form.status,
        priority: form.priority,
        description: form.description || undefined,
        assigned_to: form.assigned_to || undefined,
        is_court_deadline: form.is_court_deadline,
        fee_amount: form.fee_amount ? parseFloat(form.fee_amount) : undefined,
        fee_currency: form.fee_currency || "USD",
        fee_status: form.fee_status,
        notes: form.notes || undefined,
      }
      if (!isEdit) (body as Record<string, unknown>).matter_id = form.matter_id
      const result = isEdit
        ? await apiFetch(`/api/deadlines/${initial!.id}`, "PATCH", body)
        : await apiFetch("/api/deadlines", "POST", body)
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Deadline" : "New Deadline"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {!isEdit && (
            <Field label="Matter *">
              <Select
                value={form.matter_id}
                onValueChange={(v) => setForm((f) => ({ ...f, matter_id: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select matter" />
                </SelectTrigger>
                <SelectContent>
                  {matters.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Title *">
            <Input
              required
              value={form.title}
              onChange={set("title")}
              placeholder="Deadline title"
            />
          </Field>
          <Field label="Action Type">
            <Select
              value={form.action_type}
              onValueChange={(v) => setForm((f) => ({ ...f, action_type: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEADLINE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Due Date *">
            <Input
              required
              type="date"
              value={form.due_date}
              onChange={set("due_date")}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEADLINE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Priority">
            <Select
              value={form.priority}
              onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEADLINE_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Description">
            <Textarea
              value={form.description}
              onChange={set("description")}
              rows={2}
            />
          </Field>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={set("notes")} rows={2} />
          </Field>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={form.is_court_deadline}
              onChange={(e) =>
                setForm((f) => ({ ...f, is_court_deadline: e.target.checked }))
              }
            />
            <Label className="text-sm">Court Deadline</Label>
          </div>
          <Field label="Fee Amount">
            <Input
              type="number"
              value={form.fee_amount}
              onChange={set("fee_amount")}
              placeholder="0.00"
            />
          </Field>
          <Field label="Fee Currency">
            <Input
              value={form.fee_currency}
              onChange={set("fee_currency")}
              placeholder="USD"
            />
          </Field>
          <Field label="Fee Status">
            <Select
              value={form.fee_status}
              onValueChange={(v) => setForm((f) => ({ ...f, fee_status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FEE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <SheetFooter className="pt-2">
            <SaveButton loading={loading} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   CLIENT SHEET
   ═══════════════════════════════════════════════════════════════════════════ */

export function ClientSheet({
  open,
  onClose,
  initial,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: ApiClient | null
  onSaved: (c: ApiClient) => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    name: "",
    primary_contact_name: "",
    primary_contact_email: "",
    primary_contact_phone: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setForm({
      name: initial?.name ?? "",
      primary_contact_name: initial?.primary_contact_name ?? "",
      primary_contact_email: initial?.primary_contact_email ?? "",
      primary_contact_phone: initial?.primary_contact_phone ?? "",
    })
    setError("")
  }, [initial, open])

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const result = isEdit
        ? await apiFetch(`/api/clients/${initial!.id}`, "PATCH", form)
        : await apiFetch("/api/clients", "POST", form)
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Client" : "New Client"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          <Field label="Company / Name *">
            <Input
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Acme Inc."
            />
          </Field>
          <Field label="Primary Contact Name">
            <Input
              value={form.primary_contact_name}
              onChange={set("primary_contact_name")}
            />
          </Field>
          <Field label="Contact Email">
            <Input
              type="email"
              value={form.primary_contact_email}
              onChange={set("primary_contact_email")}
            />
          </Field>
          <Field label="Contact Phone">
            <Input
              type="tel"
              value={form.primary_contact_phone}
              onChange={set("primary_contact_phone")}
            />
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <SheetFooter className="pt-2">
            <SaveButton loading={loading} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   TIME ENTRY SHEET
   ═══════════════════════════════════════════════════════════════════════════ */

const TIME_ENTRY_STATUSES = ["DRAFT", "UNBILLED", "BILLED", "NON_BILLABLE"]

export function TimeEntrySheet({
  open,
  onClose,
  initial,
  matters,
  users,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: ApiTimeEntry | null
  matters: ApiMatter[]
  users: { id: string; name: string }[]
  onSaved: (e: ApiTimeEntry) => void
}) {
  const isEdit = !!initial
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    matter_id: "",
    user_id: "",
    date: today,
    hours: "",
    rate: "",
    description: "",
    status: "UNBILLED",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setForm({
      matter_id: initial?.matter_id ?? "",
      user_id: initial?.user_id ?? "",
      date: initial?.date ? initial.date.slice(0, 10) : today,
      hours: initial?.hours != null ? String(initial.hours) : "",
      rate: initial?.rate != null ? String(initial.rate) : "",
      description: initial?.description ?? "",
      status: initial?.status ?? "UNBILLED",
    })
    setError("")
  }, [initial, open])

  const set =
    (k: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const body: Record<string, unknown> = {
        hours: parseFloat(form.hours),
        rate: parseFloat(form.rate),
        description: form.description,
        status: form.status,
      }
      if (!isEdit) {
        body.matter_id = form.matter_id
        body.user_id = form.user_id
        body.date = form.date
      }
      const result = isEdit
        ? await apiFetch(
          `/api/billing/time-entries/${initial!.id}`,
          "PATCH",
          body
        )
        : await apiFetch("/api/billing/time-entries", "POST", body)
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit Time Entry" : "New Time Entry"}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {!isEdit && (
            <>
              <Field label="Matter *">
                <Select
                  value={form.matter_id}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, matter_id: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select matter" />
                  </SelectTrigger>
                  <SelectContent>
                    {matters.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="User *">
                <Select
                  value={form.user_id}
                  onValueChange={(v) => setForm((f) => ({ ...f, user_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date *">
                <Input
                  type="date"
                  required
                  value={form.date}
                  onChange={set("date")}
                />
              </Field>
            </>
          )}
          <Field label="Hours *">
            <Input
              required
              type="number"
              step="0.25"
              value={form.hours}
              onChange={set("hours")}
              placeholder="1.5"
            />
          </Field>
          <Field label="Rate ($/hr) *">
            <Input
              required
              type="number"
              step="0.01"
              value={form.rate}
              onChange={set("rate")}
              placeholder="250.00"
            />
          </Field>
          <Field label="Description *">
            <Textarea
              required
              value={form.description}
              onChange={set("description")}
              rows={3}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIME_ENTRY_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <SheetFooter className="pt-2">
            <SaveButton loading={loading} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXPENSE SHEET
   ═══════════════════════════════════════════════════════════════════════════ */

const EXPENSE_CATS = [
  "FILING_FEES",
  "TRANSLATION",
  "COURIER",
  "TRAVEL",
  "SEARCH_FEES",
  "EXPERT_FEES",
  "COURT_FEES",
  "OTHER",
]
const EXPENSE_STATUSES = ["UNBILLED", "BILLED", "NON_BILLABLE", "REIMBURSED"]

export function ExpenseSheet({
  open,
  onClose,
  initial,
  matters,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: ApiExpense | null
  matters: ApiMatter[]
  onSaved: (e: ApiExpense) => void
}) {
  const isEdit = !!initial
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    matter_id: "",
    date: today,
    category: "FILING_FEES",
    amount: "",
    currency: "USD",
    description: "",
    status: "UNBILLED",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setForm({
      matter_id: initial?.matter_id ?? "",
      date: initial?.date ? initial.date.slice(0, 10) : today,
      category: initial?.category ?? "FILING_FEES",
      amount: initial?.amount != null ? String(initial.amount) : "",
      currency: initial?.currency ?? "USD",
      description: initial?.description ?? "",
      status: initial?.status ?? "UNBILLED",
    })
    setError("")
  }, [initial, open])

  const set =
    (k: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const body: Record<string, unknown> = {
        category: form.category,
        amount: parseFloat(form.amount),
        description: form.description,
        status: form.status,
      }
      if (!isEdit) {
        body.matter_id = form.matter_id
        body.date = form.date
        body.currency = form.currency
      }
      const result = isEdit
        ? await apiFetch(`/api/billing/expenses/${initial!.id}`, "PATCH", body)
        : await apiFetch("/api/billing/expenses", "POST", body)
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Expense" : "New Expense"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {!isEdit && (
            <>
              <Field label="Matter *">
                <Select
                  value={form.matter_id}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, matter_id: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select matter" />
                  </SelectTrigger>
                  <SelectContent>
                    {matters.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date *">
                <Input
                  type="date"
                  required
                  value={form.date}
                  onChange={set("date")}
                />
              </Field>
              <Field label="Currency">
                <Input
                  value={form.currency}
                  onChange={set("currency")}
                  placeholder="USD"
                />
              </Field>
            </>
          )}
          <Field label="Category">
            <Select
              value={form.category}
              onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_CATS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Amount *">
            <Input
              required
              type="number"
              step="0.01"
              value={form.amount}
              onChange={set("amount")}
              placeholder="0.00"
            />
          </Field>
          <Field label="Description *">
            <Textarea
              required
              value={form.description}
              onChange={set("description")}
              rows={3}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <SheetFooter className="pt-2">
            <SaveButton loading={loading} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

/* ═══════════════════════════════════════════════════════════════════════════
   INVOICE SHEET
   ═══════════════════════════════════════════════════════════════════════════ */

const INVOICE_STATUSES = [
  "DRAFT",
  "SENT",
  "PAID",
  "PARTIALLY_PAID",
  "OVERDUE",
  "VOID",
]

export function InvoiceSheet({
  open,
  onClose,
  initial,
  matters,
  clients,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  initial?: ApiInvoice | null
  matters: ApiMatter[]
  clients: ApiClient[]
  onSaved: (i: ApiInvoice) => void
}) {
  const isEdit = !!initial
  const today = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState({
    matter_id: "",
    client_id: "",
    invoice_number: "",
    issue_date: today,
    due_date: "",
    total_amount: "",
    currency: "USD",
    status: "DRAFT",
    paid_amount: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setForm({
      matter_id: initial?.matter_id ?? "",
      client_id: initial?.client_id ?? "",
      invoice_number: initial?.invoice_number ?? "",
      issue_date: initial?.issue_date ? initial.issue_date.slice(0, 10) : today,
      due_date: initial?.due_date ? initial.due_date.slice(0, 10) : "",
      total_amount:
        initial?.total_amount != null ? String(initial.total_amount) : "",
      currency: initial?.currency ?? "USD",
      status: initial?.status ?? "DRAFT",
      paid_amount:
        initial?.paid_amount != null ? String(initial.paid_amount) : "",
      notes: initial?.notes ?? "",
    })
    setError("")
  }, [initial, open])

  const set =
    (k: string) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      const body: Record<string, unknown> = {
        status: form.status,
        due_date: form.due_date || undefined,
        notes: form.notes || undefined,
      }
      if (isEdit) {
        body.paid_amount = form.paid_amount
          ? parseFloat(form.paid_amount)
          : undefined
      } else {
        body.matter_id = form.matter_id
        body.client_id = form.client_id || undefined
        body.invoice_number = form.invoice_number || undefined
        body.issue_date = form.issue_date
        body.total_amount = parseFloat(form.total_amount)
        body.currency = form.currency
      }
      const result = isEdit
        ? await apiFetch(`/api/billing/invoices/${initial!.id}`, "PATCH", body)
        : await apiFetch("/api/billing/invoices", "POST", body)
      onSaved(result)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-6">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit Invoice" : "New Invoice"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5">
          {!isEdit && (
            <>
              <Field label="Matter *">
                <Select
                  value={form.matter_id}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, matter_id: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select matter" />
                  </SelectTrigger>
                  <SelectContent>
                    {matters.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Client">
                <Select
                  value={form.client_id || "_none"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      client_id: v === "_none" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="No client" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">No client</SelectItem>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Invoice Number">
                <Input
                  value={form.invoice_number}
                  onChange={set("invoice_number")}
                  placeholder="Auto-generated"
                />
              </Field>
              <Field label="Issue Date *">
                <Input
                  required
                  type="date"
                  value={form.issue_date}
                  onChange={set("issue_date")}
                />
              </Field>
              <Field label="Total Amount *">
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={form.total_amount}
                  onChange={set("total_amount")}
                />
              </Field>
              <Field label="Currency">
                <Input
                  value={form.currency}
                  onChange={set("currency")}
                  placeholder="USD"
                />
              </Field>
            </>
          )}
          {isEdit && (
            <Field label="Paid Amount">
              <Input
                type="number"
                step="0.01"
                value={form.paid_amount}
                onChange={set("paid_amount")}
              />
            </Field>
          )}
          <Field label="Due Date">
            <Input
              type="date"
              value={form.due_date}
              onChange={set("due_date")}
            />
          </Field>
          <Field label="Status">
            <Select
              value={form.status}
              onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Notes">
            <Textarea value={form.notes} onChange={set("notes")} rows={2} />
          </Field>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <SheetFooter className="pt-2">
            <SaveButton loading={loading} />
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
