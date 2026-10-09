"use client"

import { ClientSheet } from "@/components/entity-sheets"
import { Pencil } from "lucide-react"

import { useMemo, useState, useEffect } from "react"
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  ChevronRight,
  Clock3,
  DollarSign,
  FileText,
  Filter,
  FolderKanban,
  MoreHorizontal,
  Receipt,
  Search,
  Users,
  Loader2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const FX_TO_USD: Record<string, number> = {
  USD: 1,
  EUR: 1.09,
  INR: 0.012,
}

const formatCurrency = (
  amount: number,
  currency = "USD",
  maximumFractionDigits = 0
) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits,
  }).format(amount)
}

const formatUsd = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

const matterTypeLabel = (type: string) =>
  type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())

const statusClasses: Record<string, string> = {
  OPEN: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  ON_HOLD: "border-slate-200 bg-slate-50 text-slate-700",
  CLOSED: "border-blue-200 bg-blue-50 text-blue-700",
  ABANDONED: "border-red-200 bg-red-50 text-red-700",
  ARCHIVED: "border-slate-200 bg-slate-50 text-slate-500",
}

const invoiceStatusClasses: Record<string, string> = {
  PAID: "border-emerald-200 bg-emerald-50 text-emerald-700",
  PARTIALLY_PAID: "border-amber-200 bg-amber-50 text-amber-700",
  SENT: "border-blue-200 bg-blue-50 text-blue-700",
  OVERDUE: "border-red-200 bg-red-50 text-red-700",
  DRAFT: "border-slate-200 bg-slate-50 text-slate-700",
  VOID: "border-slate-200 bg-slate-50 text-slate-500",
}

const deadlineStatusClasses: Record<string, string> = {
  OVERDUE: "border-red-200 bg-red-50 text-red-700",
  DUE_SOON: "border-amber-200 bg-amber-50 text-amber-700",
  UPCOMING: "border-blue-200 bg-blue-50 text-blue-700",
  DOCKETED: "border-slate-200 bg-slate-50 text-slate-700",
  COMPLETED: "border-emerald-200 bg-emerald-50 text-emerald-700",
}

export default function ClientsAnalyticsPage() {
  const [search, setSearch] = useState("")

  const [clientSheet, setClientSheet] = useState(false)
  const [editingClient, setEditingClient] = useState<any>(null)

  const handleEditClient = (c: any) => {
    setEditingClient(c)
    setClientSheet(true)
  }

  const [matterFilter, setMatterFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<any[]>([])
  const [matters, setMatters] = useState<any[]>([])
  const [deadlines, setDeadlines] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [timeEntries, setTimeEntries] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [matterAssignments, setMatterAssignments] = useState<any[]>([])
  const [firm, setFirm] = useState<any>({ name: "Firm" })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          clientsRes,
          mattersRes,
          deadlinesRes,
          invoicesRes,
          paymentsRes,
          timeEntriesRes,
          expensesRes,
          usersRes,
          documentsRes,
          matterAssignmentsRes,
          firmRes,
        ] = await Promise.all([
          fetch("http://localhost:8000/api/clients"),
          fetch("http://localhost:8000/api/matters"),
          fetch("http://localhost:8000/api/deadlines"),
          fetch("http://localhost:8000/api/billing/invoices"),
          fetch("http://localhost:8000/api/billing/payments"),
          fetch("http://localhost:8000/api/billing/time-entries"),
          fetch("http://localhost:8000/api/billing/expenses"),
          fetch("http://localhost:8000/api/users"),
          fetch("http://localhost:8000/api/documents").catch(() => null),
          fetch("http://localhost:8000/api/matter-assignments").catch(
            () => null
          ),
          fetch("http://localhost:8000/api/firm").catch(() => null),
        ])

        setClients(clientsRes.ok ? await clientsRes.json() : [])
        setMatters(mattersRes.ok ? await mattersRes.json() : [])
        setDeadlines(deadlinesRes.ok ? await deadlinesRes.json() : [])
        setInvoices(invoicesRes.ok ? await invoicesRes.json() : [])
        setPayments(paymentsRes.ok ? await paymentsRes.json() : [])
        setTimeEntries(timeEntriesRes.ok ? await timeEntriesRes.json() : [])
        setExpenses(expensesRes.ok ? await expensesRes.json() : [])
        setUsers(usersRes.ok ? await usersRes.json() : [])
        setDocuments(documentsRes?.ok ? await documentsRes.json() : [])
        setMatterAssignments(
          matterAssignmentsRes?.ok ? await matterAssignmentsRes.json() : []
        )
        setFirm(firmRes?.ok ? await firmRes.json() : { name: "Firm" })
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const now = new Date()

  const analytics = useMemo(() => {
    const getClientMatters = (clientId: string) =>
      matters.filter((matter) => matter.client_id === clientId)

    const getClientInvoices = (clientId: string) =>
      invoices.filter((invoice) => invoice.client_id === clientId)

    const getClientPayments = (clientId: string) =>
      payments.filter((payment) => {
        if (payment.client_id === clientId) return true
        const invoice = invoices.find(
          (inv) => inv.id === (payment.invoice_id || payment.invoiceId)
        )
        return invoice?.client_id === clientId
      })

    const getClientTime = (clientId: string) => {
      const ids = getClientMatters(clientId).map((matter) => matter.id)
      return timeEntries.filter((entry) =>
        ids.includes(entry.matter_id || entry.matterId)
      )
    }

    const getClientExpenses = (clientId: string) => {
      const ids = getClientMatters(clientId).map((matter) => matter.id)
      return expenses.filter((expense) =>
        ids.includes(expense.matter_id || expense.matterId)
      )
    }

    const getClientDeadlines = (clientId: string) => {
      const ids = getClientMatters(clientId).map((matter) => matter.id)
      return deadlines.filter((deadline) => ids.includes(deadline.matter_id))
    }

    const getClientDocuments = (clientId: string) =>
      documents.filter(
        (document) => (document.client_id || document.clientId) === clientId
      )

    const clientRows = clients.map((client) => {
      const clientMatters = getClientMatters(client.id)
      const clientInvoices = getClientInvoices(client.id)
      const clientPayments = getClientPayments(client.id)
      const clientTime = getClientTime(client.id)
      const clientExpenses = getClientExpenses(client.id)
      const clientDeadlines = getClientDeadlines(client.id)
      const clientDocuments = getClientDocuments(client.id)

      const invoicedUsd = clientInvoices.reduce(
        (sum, invoice) =>
          sum + (invoice.total_amount || invoice.total || 0) * FX_TO_USD["USD"],
        0
      )

      const paidUsd = clientInvoices.reduce((sum, invoice) => {
        const invoiceCurrency =
          payments.find(
            (payment) =>
              (payment.invoice_id || payment.invoiceId) === invoice.id
          )?.currency ??
          invoice.currency ??
          "USD"

        return (
          sum +
          (invoice.paid_amount || invoice.amountPaid || 0) *
          (FX_TO_USD[invoiceCurrency] ?? 1)
        )
      }, 0)

      const outstandingUsd = clientInvoices.reduce((sum, invoice) => {
        const paymentCurrency =
          payments.find(
            (payment) =>
              (payment.invoice_id || payment.invoiceId) === invoice.id
          )?.currency ??
          invoice.currency ??
          "USD"

        const balanceDue =
          (invoice.total_amount || invoice.total || 0) -
          (invoice.paid_amount || invoice.amountPaid || 0)
        return sum + balanceDue * (FX_TO_USD[paymentCurrency] ?? 1)
      }, 0)

      const billedHours = clientTime
        .filter((entry) => entry.status === "BILLED")
        .reduce((sum, entry) => sum + entry.hours, 0)

      const totalHours = clientTime.reduce((sum, entry) => sum + entry.hours, 0)

      const billableExpensesUsd = clientExpenses
        .filter((expense) => expense.is_billable ?? expense.isBillable)
        .reduce(
          (sum, expense) =>
            sum + expense.amount * (FX_TO_USD[expense.currency] ?? 1),
          0
        )

      const overdueDeadlines = clientDeadlines.filter(
        (deadline) => deadline.status === "OVERDUE"
      )

      const dueSoonDeadlines = clientDeadlines.filter(
        (deadline) => deadline.status === "DUE_SOON"
      )

      const activeMatters = clientMatters.filter((matter) =>
        ["OPEN", "PENDING", "ON_HOLD"].includes(matter.status)
      )

      const leadAttorneyAssignment = matterAssignments.find(
        (assignment) =>
          clientMatters.some(
            (matter) =>
              matter.id === (assignment.matter_id || assignment.matterId)
          ) && assignment.role === "RESPONSIBLE_ATTORNEY"
      )

      let leadAttorney =
        leadAttorneyAssignment?.userName ||
        leadAttorneyAssignment?.user_name ||
        "Unassigned"
      if (leadAttorneyAssignment?.user_id) {
        const user = users.find((u) => u.id === leadAttorneyAssignment.user_id)
        if (user) leadAttorney = user.name
      }

      let health: "Healthy" | "At Risk" | "Critical" = "Healthy"

      if (overdueDeadlines.length > 0) {
        health = "Critical"
      } else if (outstandingUsd > 2500 || dueSoonDeadlines.length > 0) {
        health = "At Risk"
      }

      return {
        client,
        matters: clientMatters,
        invoices: clientInvoices,
        payments: clientPayments,
        timeEntries: clientTime,
        expenses: clientExpenses,
        deadlines: clientDeadlines,
        documents: clientDocuments,
        invoicedUsd,
        paidUsd,
        outstandingUsd,
        billedHours,
        totalHours,
        billableExpensesUsd,
        activeMatters,
        overdueDeadlines,
        dueSoonDeadlines,
        leadAttorney,
        health,
      }
    })

    const totalInvoicedUsd = clientRows.reduce(
      (sum, row) => sum + row.invoicedUsd,
      0
    )

    const totalPaidUsd = clientRows.reduce((sum, row) => sum + row.paidUsd, 0)

    const totalOutstandingUsd = clientRows.reduce(
      (sum, row) => sum + row.outstandingUsd,
      0
    )

    const totalHours = timeEntries.reduce((sum, entry) => sum + entry.hours, 0)

    const billableHours = timeEntries
      .filter((entry) => entry.status !== "NON_BILLABLE")
      .reduce((sum, entry) => sum + entry.hours, 0)

    const totalBillableExpensesUsd = expenses
      .filter((expense) => expense.is_billable ?? expense.isBillable)
      .reduce(
        (sum, expense) =>
          sum + expense.amount * (FX_TO_USD[expense.currency] ?? 1),
        0
      )

    const overdueDeadlines = deadlines.filter(
      (deadline) => deadline.status === "OVERDUE"
    )

    const dueSoonDeadlines = deadlines.filter(
      (deadline) => deadline.status === "DUE_SOON"
    )

    const completedDeadlines = deadlines.filter(
      (deadline) => deadline.status === "COMPLETED"
    )

    const activeMatters = matters.filter((matter) =>
      ["OPEN", "PENDING", "ON_HOLD"].includes(matter.status)
    )

    const matterValueUsd = matters.reduce(
      (sum, matter) => sum + (matter.estimated_value ?? 0),
      0
    )

    const totalDocumentStorage = documents.reduce(
      (sum, document) => sum + (document.file_size || document.fileSize || 0),
      0
    )

    return {
      clientRows,
      totalInvoicedUsd,
      totalPaidUsd,
      totalOutstandingUsd,
      totalHours,
      billableHours,
      totalBillableExpensesUsd,
      overdueDeadlines,
      dueSoonDeadlines,
      completedDeadlines,
      activeMatters,
      matterValueUsd,
      totalDocumentStorage,
    }
  }, [
    clients,
    matters,
    deadlines,
    invoices,
    payments,
    timeEntries,
    expenses,
    users,
    documents,
    matterAssignments,
  ])

  const filteredClients = analytics.clientRows.filter((row) => {
    const primaryContact =
      row.client.primary_contact_name || row.client.primaryContactName || ""
    const matchesSearch =
      row.client.name.toLowerCase().includes(search.toLowerCase()) ||
      primaryContact.toLowerCase().includes(search.toLowerCase())

    const matchesMatter =
      matterFilter === "all" ||
      row.matters.some((matter) => matter.type === matterFilter)

    const matchesStatus = statusFilter === "all" || row.health === statusFilter

    return matchesSearch && matchesMatter && matchesStatus
  })

  const revenueByClient = [...analytics.clientRows]
    .sort((a, b) => b.invoicedUsd - a.invoicedUsd)
    .slice(0, 6)

  const maxRevenue = Math.max(
    ...revenueByClient.map((row) => row.invoicedUsd),
    1
  )

  const upcomingDeadlines = [...deadlines]
    .filter((deadline) =>
      ["OVERDUE", "DUE_SOON", "UPCOMING"].includes(deadline.status)
    )
    .sort(
      (a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    )
    .slice(0, 6)

  const recentInvoices = [...invoices]
    .sort(
      (a, b) =>
        new Date(b.issue_date || b.issueDate).getTime() -
        new Date(a.issue_date || a.issueDate).getTime()
    )
    .slice(0, 6)

  const monthlyRevenue = [
    { month: "Mar", value: 1850 },
    { month: "Apr", value: 2120 },
    { month: "May", value: 2475 },
    { month: "Jun", value: 1850 },
    { month: "Jul", value: 1425 },
    { month: "Aug", value: 10777 },
  ]

  const maxMonthlyRevenue = Math.max(
    ...monthlyRevenue.map((item) => item.value),
    1
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background">
        <div className="mx-auto max-w-[1600px] px-6 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{firm?.name}</span>
                <ChevronRight className="h-4 w-4" />
                <span>Clients</span>
                <ChevronRight className="h-4 w-4" />
                <span className="text-foreground">Analytics</span>
              </div>

              <div className="mt-3">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Client Analytics
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Portfolio health, billing performance, deadlines, and client
                  activity.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Select defaultValue="30d">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="ytd">Year to date</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        {/* KPI GRID */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">
                Total clients
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-semibold">{clients.length}</div>

              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <ArrowUpRight className="h-3.5 w-3.5" />
                <span>All clients active</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">
                Portfolio value
              </CardTitle>
              <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-semibold">
                {formatUsd(analytics.matterValueUsd)}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">
                Estimated value across {matters.length} matters
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-semibold">
                {formatUsd(analytics.totalOutstandingUsd)}
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                <ArrowDownRight className="h-3.5 w-3.5" />
                <span>
                  {
                    invoices.filter(
                      (invoice) =>
                        (invoice.total_amount || invoice.total || 0) -
                        (invoice.paid_amount || invoice.amountPaid || 0) >
                        0
                    ).length
                  }{" "}
                  open invoices
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium">
                Deadline risk
              </CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-semibold">
                {analytics.overdueDeadlines.length}
              </div>

              <div className="mt-2 flex items-center gap-1 text-xs text-amber-600">
                <AlertCircle className="h-3.5 w-3.5" />
                <span>{analytics.dueSoonDeadlines.length} due soon</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* MAIN ANALYTICS */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
          {/* Revenue chart */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Billing trend</CardTitle>
                  <CardDescription>
                    Monthly invoiced revenue, normalized to USD.
                  </CardDescription>
                </div>

                <Badge variant="secondary">
                  {formatUsd(analytics.totalInvoicedUsd)} total
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex h-[260px] items-end gap-5 border-b pb-4">
                {monthlyRevenue.map((item) => {
                  const height = (item.value / maxMonthlyRevenue) * 100

                  return (
                    <div
                      key={item.month}
                      className="flex h-full flex-1 flex-col justify-end"
                    >
                      <div className="mb-2 text-center text-xs font-medium">
                        {formatUsd(item.value)}
                      </div>

                      <div
                        className="w-full rounded-t-md bg-primary/15 transition-all hover:bg-primary/25"
                        style={{
                          height: `${Math.max(height, 5)}%`,
                        }}
                      >
                        <div
                          className="h-full w-full rounded-t-md bg-primary"
                          style={{
                            opacity: item.month === "Aug" ? 1 : 0.7,
                          }}
                        />
                      </div>

                      <span className="mt-3 text-center text-xs text-muted-foreground">
                        {item.month}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Invoiced</p>
                  <p className="mt-1 font-semibold">
                    {formatUsd(analytics.totalInvoicedUsd)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Collected</p>
                  <p className="mt-1 font-semibold">
                    {formatUsd(analytics.totalPaidUsd)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    Collection rate
                  </p>
                  <p className="mt-1 font-semibold">
                    {analytics.totalInvoicedUsd > 0
                      ? Math.round(
                        (analytics.totalPaidUsd /
                          analytics.totalInvoicedUsd) *
                        100
                      )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Client revenue */}
          <Card>
            <CardHeader>
              <CardTitle>Top clients by revenue</CardTitle>
              <CardDescription>
                Current portfolio billing contribution.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {revenueByClient.map((row) => {
                const percentage = (row.invoicedUsd / maxRevenue) * 100

                return (
                  <div key={row.client.id}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {row.client.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {row.matters.length}{" "}
                          {row.matters.length === 1 ? "matter" : "matters"}
                        </p>
                      </div>

                      <p className="text-sm font-semibold">
                        {formatUsd(row.invoicedUsd)}
                      </p>
                    </div>

                    <Progress value={percentage} />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        {/* HEALTH + OPERATIONS */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Client health</CardTitle>
              <CardDescription>
                Based on billing and deadline exposure.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {[
                {
                  label: "Healthy",
                  count: analytics.clientRows.filter(
                    (row) => row.health === "Healthy"
                  ).length,
                  className: "bg-emerald-500",
                },
                {
                  label: "At Risk",
                  count: analytics.clientRows.filter(
                    (row) => row.health === "At Risk"
                  ).length,
                  className: "bg-amber-500",
                },
                {
                  label: "Critical",
                  count: analytics.clientRows.filter(
                    (row) => row.health === "Critical"
                  ).length,
                  className: "bg-red-500",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${item.className}`}
                    />
                    <span className="text-sm">{item.label}</span>
                  </div>

                  <span className="text-sm font-semibold">{item.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Matter portfolio</CardTitle>
              <CardDescription>Current workload by status.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {[
                ["Open", "OPEN"],
                ["Pending", "PENDING"],
                ["On hold", "ON_HOLD"],
                ["Closed", "CLOSED"],
                ["Abandoned", "ABANDONED"],
              ].map(([label, value]) => {
                const count = matters.filter(
                  (matter) => matter.status === value
                ).length

                return (
                  <div key={value}>
                    <div className="mb-1.5 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <Progress
                      value={
                        matters.length > 0 ? (count / matters.length) * 100 : 0
                      }
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workload snapshot</CardTitle>
              <CardDescription>Time and document activity.</CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Clock3 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Recorded hours
                  </span>
                </div>
                <span className="font-semibold">
                  {analytics.totalHours.toFixed(1)}h
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Receipt className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Billable expenses
                  </span>
                </div>
                <span className="font-semibold">
                  {formatUsd(analytics.totalBillableExpensesUsd)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Documents
                  </span>
                </div>
                <span className="font-semibold">{documents.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Active matters
                  </span>
                </div>
                <span className="font-semibold">
                  {analytics.activeMatters.length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OPERATIONAL TABLES */}
        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Deadline watch</CardTitle>
                  <CardDescription>
                    Highest-priority client deadlines.
                  </CardDescription>
                </div>

                <Badge variant="outline">
                  {analytics.overdueDeadlines.length} overdue
                </Badge>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => {
                  const matter = matters.find(
                    (item) => item.id === deadline.matter_id
                  )

                  const client = clients.find(
                    (item) => item.id === matter?.client_id
                  )

                  const assignedUser = users.find(
                    (user) =>
                      user.id === (deadline.assigned_to || deadline.assignedTo)
                  )

                  return (
                    <div
                      key={deadline.id}
                      className="flex gap-4 rounded-lg border p-4"
                    >
                      <div className="mt-0.5">
                        <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{deadline.title}</p>

                          <Badge
                            variant="outline"
                            className={deadlineStatusClasses[deadline.status]}
                          >
                            {deadline.status.replaceAll("_", " ")}
                          </Badge>
                        </div>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {client?.name} · {matter?.matter_number}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span>
                            Due{" "}
                            {new Date(deadline.due_date).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </span>

                          <span>{assignedUser?.name ?? "Unassigned"}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent invoices</CardTitle>
                  <CardDescription>
                    Latest client billing activity.
                  </CardDescription>
                </div>

                <Button variant="ghost" size="sm">
                  View all
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                {recentInvoices.map((invoice) => {
                  const client = clients.find(
                    (item) => item.id === invoice.client_id
                  )

                  const currency =
                    payments.find(
                      (payment) =>
                        (payment.invoice_id || payment.invoiceId) === invoice.id
                    )?.currency ??
                    invoice.currency ??
                    "USD"

                  return (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between gap-4 rounded-lg border p-4"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {initials(client?.name ?? "Client")}
                          </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {client?.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {invoice.invoice_number || invoice.invoiceNumber} ·{" "}
                            {new Date(
                              invoice.issue_date || invoice.issueDate
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          {formatCurrency(
                            invoice.total_amount || invoice.total || 0,
                            currency,
                            0
                          )}
                        </p>

                        <Badge
                          variant="outline"
                          className={`mt-1 ${invoiceStatusClasses[invoice.status]}`}
                        >
                          {invoice.status.replaceAll("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CLIENT DIRECTORY */}
        <Card className="mt-6">
          <CardHeader>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>Client portfolio</CardTitle>
                <CardDescription>
                  A complete view of every client and their operational,
                  financial, and docketing position.
                </CardDescription>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search clients..."
                    className="w-full pl-9 sm:w-[220px]"
                  />
                </div>

                <Select value={statusFilter} onValueChange={(val) => val && setStatusFilter(val)}>
                  <SelectTrigger className="w-full sm:w-[140px]">
                    <SelectValue placeholder="Health" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All health</SelectItem>
                    <SelectItem value="Healthy">Healthy</SelectItem>
                    <SelectItem value="At Risk">At risk</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={matterFilter} onValueChange={(val) => val && setMatterFilter(val)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Matter type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All matter types</SelectItem>

                    {Array.from(
                      new Set(matters.map((matter) => matter.type))
                    ).map((type) => (
                      <SelectItem key={type as string} value={type as string}>
                        {matterTypeLabel(type as string)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <Tabs defaultValue="overview">
              <div className="border-y px-6">
                <TabsList className="h-12">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="matters">Matters</TabsTrigger>
                  <TabsTrigger value="docketing">Docketing</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Client</TableHead>
                        <TableHead>Health</TableHead>
                        <TableHead>Matters</TableHead>
                        <TableHead>Revenue</TableHead>
                        <TableHead>Outstanding</TableHead>
                        <TableHead>Hours</TableHead>
                        <TableHead>Deadlines</TableHead>
                        <TableHead>Documents</TableHead>
                        <TableHead className="pr-6">Attorney</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredClients.map((row) => (
                        <TableRow key={row.client.id} className="group">
                          <TableCell className="pl-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback>
                                  {initials(row.client.name)}
                                </AvatarFallback>
                              </Avatar>

                              <div className="min-w-0">
                                <p className="font-medium">{row.client.name}</p>

                                <p className="truncate text-xs text-muted-foreground">
                                  {row.client.primary_contact_name ||
                                    row.client.primaryContactName ||
                                    ""}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                row.health === "Healthy"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : row.health === "At Risk"
                                    ? "border-amber-200 bg-amber-50 text-amber-700"
                                    : "border-red-200 bg-red-50 text-red-700"
                              }
                            >
                              {row.health}
                            </Badge>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">
                                {row.matters.length}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                ({row.activeMatters.length} active)
                              </span>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {formatUsd(row.invoicedUsd)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {row.invoices.length} invoices
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <span
                              className={
                                row.outstandingUsd > 0
                                  ? "font-medium text-amber-700"
                                  : "text-muted-foreground"
                              }
                            >
                              {formatUsd(row.outstandingUsd)}
                            </span>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {row.totalHours.toFixed(1)}h
                              </p>

                              <p className="text-xs text-muted-foreground">
                                {row.billedHours.toFixed(1)} billed
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex gap-1.5">
                              {row.overdueDeadlines.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="border-red-200 bg-red-50 text-red-700"
                                >
                                  {row.overdueDeadlines.length} overdue
                                </Badge>
                              )}

                              {row.dueSoonDeadlines.length > 0 && (
                                <Badge
                                  variant="outline"
                                  className="border-amber-200 bg-amber-50 text-amber-700"
                                >
                                  {row.dueSoonDeadlines.length} soon
                                </Badge>
                              )}

                              {row.overdueDeadlines.length === 0 &&
                                row.dueSoonDeadlines.length === 0 && (
                                  <span className="text-xs text-muted-foreground">
                                    No immediate risk
                                  </span>
                                )}
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">
                                {row.documents.length}
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="pr-6">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium">
                                  {row.leadAttorney}
                                </p>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 transition-opacity group-hover:opacity-100"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredClients.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="py-12 text-center text-sm text-muted-foreground"
                          >
                            No clients match the selected filters.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="billing" className="m-0">
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Invoiced</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">
                          {formatUsd(analytics.totalInvoicedUsd)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Collected</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">
                          {formatUsd(analytics.totalPaidUsd)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">Outstanding</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-semibold">
                          {formatUsd(analytics.totalOutstandingUsd)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-6 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Client</TableHead>
                          <TableHead>Invoices</TableHead>
                          <TableHead>Invoiced</TableHead>
                          <TableHead>Paid</TableHead>
                          <TableHead>Outstanding</TableHead>
                          <TableHead>Collection rate</TableHead>
                        </TableRow>
                      </TableHeader>

                      <TableBody>
                        {filteredClients.map((row) => {
                          const collectionRate =
                            row.invoicedUsd > 0
                              ? (row.paidUsd / row.invoicedUsd) * 100
                              : 0

                          return (
                            <TableRow key={row.client.id}>
                              <TableCell className="font-medium">
                                {row.client.name}
                              </TableCell>
                              <TableCell>{row.invoices.length}</TableCell>
                              <TableCell>
                                {formatUsd(row.invoicedUsd)}
                              </TableCell>
                              <TableCell>{formatUsd(row.paidUsd)}</TableCell>
                              <TableCell>
                                {formatUsd(row.outstandingUsd)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Progress
                                    value={Math.min(collectionRate, 100)}
                                    className="w-24"
                                  />
                                  <span className="text-sm">
                                    {Math.round(collectionRate)}%
                                  </span>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="matters" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Client</TableHead>
                        <TableHead>Active</TableHead>
                        <TableHead>Open</TableHead>
                        <TableHead>Pending</TableHead>
                        <TableHead>Closed</TableHead>
                        <TableHead>Abandoned</TableHead>
                        <TableHead>Portfolio value</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredClients.map((row) => (
                        <TableRow key={row.client.id}>
                          <TableCell className="flex items-center gap-2 pl-6 font-medium">
                            {row.client.name}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEditClient(row.client)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </TableCell>

                          <TableCell>{row.activeMatters.length}</TableCell>

                          <TableCell>
                            {
                              row.matters.filter((m) => m.status === "OPEN")
                                .length
                            }
                          </TableCell>

                          <TableCell>
                            {
                              row.matters.filter((m) => m.status === "PENDING")
                                .length
                            }
                          </TableCell>

                          <TableCell>
                            {
                              row.matters.filter((m) => m.status === "CLOSED")
                                .length
                            }
                          </TableCell>

                          <TableCell>
                            {
                              row.matters.filter(
                                (m) => m.status === "ABANDONED"
                              ).length
                            }
                          </TableCell>

                          <TableCell>
                            {formatUsd(
                              row.matters.reduce(
                                (sum, matter) =>
                                  sum + (matter.estimated_value ?? 0),
                                0
                              )
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="docketing" className="m-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="pl-6">Client</TableHead>
                        <TableHead>Deadlines</TableHead>
                        <TableHead>Overdue</TableHead>
                        <TableHead>Due soon</TableHead>
                        <TableHead>Upcoming</TableHead>
                        <TableHead>Completed</TableHead>
                        <TableHead>Documents</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredClients.map((row) => {
                        const upcoming = row.deadlines.filter(
                          (d) => d.status === "UPCOMING"
                        ).length

                        const completed = row.deadlines.filter(
                          (d) => d.status === "COMPLETED"
                        ).length

                        return (
                          <TableRow key={row.client.id}>
                            <TableCell className="flex items-center gap-2 pl-6 font-medium">
                              {row.client.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleEditClient(row.client)}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </TableCell>

                            <TableCell>{row.deadlines.length}</TableCell>

                            <TableCell>
                              <span
                                className={
                                  row.overdueDeadlines.length > 0
                                    ? "font-medium text-red-600"
                                    : "text-muted-foreground"
                                }
                              >
                                {row.overdueDeadlines.length}
                              </span>
                            </TableCell>

                            <TableCell>
                              <span
                                className={
                                  row.dueSoonDeadlines.length > 0
                                    ? "font-medium text-amber-600"
                                    : "text-muted-foreground"
                                }
                              >
                                {row.dueSoonDeadlines.length}
                              </span>
                            </TableCell>

                            <TableCell>{upcoming}</TableCell>

                            <TableCell>{completed}</TableCell>

                            <TableCell>{row.documents.length}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* DETAIL STRIP */}
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Billable utilization</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold">
                  {analytics.totalHours > 0
                    ? Math.round(
                      (analytics.billableHours / analytics.totalHours) * 100
                    )
                    : 0}
                  %
                </p>
                <Clock3 className="h-4 w-4 text-muted-foreground" />
              </div>

              <Progress
                className="mt-3"
                value={
                  analytics.totalHours > 0
                    ? (analytics.billableHours / analytics.totalHours) * 100
                    : 0
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Deadline completion</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-end justify-between">
                <p className="text-2xl font-semibold">
                  {deadlines.length > 0
                    ? Math.round(
                      (analytics.completedDeadlines.length /
                        deadlines.length) *
                      100
                    )
                    : 0}
                  %
                </p>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </div>

              <Progress
                className="mt-3"
                value={
                  deadlines.length > 0
                    ? (analytics.completedDeadlines.length / deadlines.length) *
                    100
                    : 0
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Document storage</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-semibold">
                {(analytics.totalDocumentStorage / 1024 / 1024).toFixed(1)}
                MB
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Across {documents.length} client documents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Matter assignments</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="text-2xl font-semibold">
                {matterAssignments.length}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Across{" "}
                {users.filter((user) => user.is_active ?? user.isActive).length}{" "}
                active users
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 pb-8 text-xs text-muted-foreground">
          Analytics are derived from the live API data. Cross-currency financial
          figures are normalized to USD using illustrative FX rates for
          dashboard presentation.
        </div>
      </main>
      <ClientSheet
        open={clientSheet}
        onClose={() => setClientSheet(false)}
        initial={editingClient}
        onSaved={() => window.location.reload()}
      />
    </div>
  )
}
