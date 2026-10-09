"use client"

import * as React from "react"
import {
  ArrowUpRight,
  Clock3,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  MoreHorizontal,
  Receipt,
  Search,
  Timer,
  WalletCards,
} from "lucide-react"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "./data-table"
import { InvoiceSheet, TimeEntrySheet, ExpenseSheet } from "@/components/entity-sheets"
import { Pencil } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatDate(date: Date | string) {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

function formatMoney(value: number, currency = "USD") {
  if (value === undefined || value === null) return "—"
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${currency} ${value.toLocaleString()}`
  }
}

function formatLabel(value: string) {
  if (!value) return "—"
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function getStatusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "PAID":
      return "default"

    case "OVERDUE":
      return "destructive"

    case "PARTIALLY_PAID":
    case "SENT":
    case "UNBILLED":
      return "secondary"

    default:
      return "outline"
  }
}

/* -------------------------------------------------------------------------- */
/* Stat card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>

        <div className="rounded-md border p-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>

        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function BillingsPage() {
  const [search, setSearch] = React.useState("")

  const [invoiceSheet, setInvoiceSheet] = React.useState(false)
  const [timeSheet, setTimeSheet] = React.useState(false)
  const [expenseSheet, setExpenseSheet] = React.useState(false)
  const [editingInvoice, setEditingInvoice] = React.useState<any>(null)
  const [editingTime, setEditingTime] = React.useState<any>(null)
  const [editingExpense, setEditingExpense] = React.useState<any>(null)

  const handleEditInvoice = (inv: any) => { setEditingInvoice(inv); setInvoiceSheet(true); }
  const handleEditTime = (te: any) => { setEditingTime(te); setTimeSheet(true); }
  const handleEditExpense = (ex: any) => { setEditingExpense(ex); setExpenseSheet(true); }

  const [loading, setLoading] = React.useState(true)

  const [users, setUsers] = React.useState<any[]>([])
  const [clients, setClients] = React.useState<any[]>([])
  const [matters, setMatters] = React.useState<any[]>([])
  const [billingRates, setBillingRates] = React.useState<any[]>([])
  const [billingArrangements, setBillingArrangements] = React.useState<any[]>([])
  const [timeEntries, setTimeEntries] = React.useState<any[]>([])
  const [expenses, setExpenses] = React.useState<any[]>([])
  const [invoices, setInvoices] = React.useState<any[]>([])
  const [payments, setPayments] = React.useState<any[]>([])

  const fetchData = React.useCallback(async () => {
      try {
        const [
          usersRes,
          clientsRes,
          mattersRes,
          ratesRes,
          arrangementsRes,
          timeEntriesRes,
          expensesRes,
          invoicesRes,
          paymentsRes,
        ] = await Promise.all([
          fetch("http://localhost:8000/api/users"),
          fetch("http://localhost:8000/api/clients"),
          fetch("http://localhost:8000/api/matters"),
          fetch("http://localhost:8000/api/billing/rates"),
          fetch("http://localhost:8000/api/billing/arrangements"),
          fetch("http://localhost:8000/api/billing/time-entries"),
          fetch("http://localhost:8000/api/billing/expenses"),
          fetch("http://localhost:8000/api/billing/invoices"),
          fetch("http://localhost:8000/api/billing/payments"),
        ])

        setUsers(await usersRes.json())
        setClients(await clientsRes.json())
        setMatters(await mattersRes.json())
        setBillingRates(await ratesRes.json())
        setBillingArrangements(await arrangementsRes.json())
        setTimeEntries(await timeEntriesRes.json())
        setExpenses(await expensesRes.json())
        setInvoices(await invoicesRes.json())
        setPayments(await paymentsRes.json())
      } catch (error) {
        console.error("Failed to fetch billing data", error)
      } finally {
        setLoading(false)
      }
  }, []);

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const getUserName = React.useCallback(
    (userId: string) => users.find((user) => user.id === userId)?.name ?? userId,
    [users]
  )

  const getClientName = React.useCallback(
    (clientId: string) => clients.find((client) => client.id === clientId)?.name ?? clientId,
    [clients]
  )

  const getMatterName = React.useCallback(
    (matterId: string) => matters.find((matter) => matter.id === matterId)?.title ?? matterId,
    [matters]
  )

  /* -------------------------------------------------------------------------- */
  /* Columns                                                                    */
  /* -------------------------------------------------------------------------- */

  const invoiceColumns = React.useMemo<ColumnDef<any, any>[]>(() => [
    {
      accessorKey: "invoice_number",
      header: "Invoice",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.invoice_number}</div>
          <div className="text-xs text-muted-foreground">
            {getClientName(row.original.client_id)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "issue_date",
      header: "Issued",
      cell: ({ row }) => formatDate(row.original.issue_date),
    },
    {
      accessorKey: "due_date",
      header: "Due",
      cell: ({ row }) => formatDate(row.original.due_date),
    },
    {
      accessorKey: "total_amount",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-medium">{(row.original.total_amount || 0).toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "paid_amount",
      header: "Paid",
      cell: ({ row }) => (row.original.paid_amount || 0).toLocaleString(),
    },
    {
      id: "balanceDue",
      header: "Balance",
      cell: ({ row }) => {
        const balance = (row.original.total_amount || 0) - (row.original.paid_amount || 0)
        return (
          <span
            className={
              balance > 0 ? "font-medium" : "text-muted-foreground"
            }
          >
            {balance.toLocaleString()}
          </span>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {formatLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: () => (
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 text-sm font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View invoice</DropdownMenuItem>
            <DropdownMenuItem>Edit invoice</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Record payment</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ], [getClientName])

  const timeColumns = React.useMemo<ColumnDef<any, any>[]>(() => [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "user_id",
      header: "User",
      cell: ({ row }) => getUserName(row.original.user_id),
    },
    {
      accessorKey: "matter_id",
      header: "Matter",
      cell: ({ row }) => (
        <div className="max-w-[240px]">
          <div className="truncate font-medium">
            {getMatterName(row.original.matter_id)}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.matter_id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="max-w-[320px] truncate">{row.original.description}</div>
      ),
    },
    {
      accessorKey: "hours",
      header: "Hours",
      cell: ({ row }) => `${Number(row.original.hours || 0).toFixed(2)}h`,
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => formatMoney(row.original.rate),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">{formatMoney(row.original.amount)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={getStatusVariant(row.original.status)}>
          {formatLabel(row.original.status)}
        </Badge>
      ),
    },
  ], [getUserName, getMatterName])

  const expenseColumns = React.useMemo<ColumnDef<any, any>[]>(() => [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.date),
    },
    {
      accessorKey: "description",
      header: "Expense",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.description}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.category}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "matter_id",
      header: "Matter",
      cell: ({ row }) => getMatterName(row.original.matter_id),
    },
    {
      accessorKey: "user_id",
      header: "Added by",
      cell: ({ row }) =>
        row.original.user_id ? getUserName(row.original.user_id) : "—",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatMoney(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "is_billable",
      header: "Billable",
      cell: ({ row }) => {
        const isBillable = row.original.is_billable ?? row.original.isBillable;
        return (
          <Badge variant={isBillable ? "secondary" : "outline"}>
            {isBillable ? "Billable" : "Non-billable"}
          </Badge>
        )
      },
    },
    {
      accessorKey: "invoice_id",
      header: "Invoice",
      cell: ({ row }) =>
        row.original.invoice_id ? row.original.invoice_id : "Unbilled",
    },
  ], [getMatterName, getUserName])

  const paymentColumns = React.useMemo<ColumnDef<any, any>[]>(() => [
    {
      accessorKey: "payment_date",
      header: "Date",
      cell: ({ row }) => formatDate(row.original.payment_date),
    },
    {
      accessorKey: "client_id",
      header: "Client",
      cell: ({ row }) => getClientName(row.original.client_id || row.original.clientId),
    },
    {
      accessorKey: "invoice_id",
      header: "Invoice",
      cell: ({ row }) => row.original.invoice_id,
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatMoney(row.original.amount, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "Method",
      cell: ({ row }) => formatLabel(row.original.payment_method || row.original.method),
    },
    {
      accessorKey: "reference",
      header: "Reference",
      cell: ({ row }) => row.original.reference ?? "—",
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => (
        <div className="max-w-[240px] truncate text-muted-foreground">
          {row.original.notes ?? "—"}
        </div>
      ),
    },
  ], [getClientName])

  const rateColumns = React.useMemo<ColumnDef<any, any>[]>(() => [
    {
      accessorKey: "user_id",
      header: "User",
      cell: ({ row }) =>
        row.original.user_id ? getUserName(row.original.user_id) : "All users",
    },
    {
      accessorKey: "client_id",
      header: "Client",
      cell: ({ row }) =>
        row.original.client_id ? getClientName(row.original.client_id) : "Default",
    },
    {
      accessorKey: "matter_id",
      header: "Matter",
      cell: ({ row }) =>
        row.original.matter_id
          ? getMatterName(row.original.matter_id)
          : "All matters",
    },
    {
      accessorKey: "hourly_rate",
      header: "Hourly rate",
      cell: ({ row }) => (
        <span className="font-medium">
          {formatMoney(row.original.hourly_rate, row.original.currency)}
        </span>
      ),
    },
    {
      accessorKey: "effective_from",
      header: "Effective from",
      cell: ({ row }) => formatDate(row.original.effective_from || row.original.effectiveFrom),
    },
    {
      accessorKey: "effective_to",
      header: "Effective to",
      cell: ({ row }) =>
        (row.original.effective_to || row.original.effectiveTo)
          ? formatDate(row.original.effective_to || row.original.effectiveTo)
          : "Current",
    },
  ], [getUserName, getClientName, getMatterName])

  const arrangementColumns = React.useMemo<ColumnDef<any, any>[]>(() => [
    {
      accessorKey: "matter_id",
      header: "Matter",
      cell: ({ row }) => (
        <div className="max-w-[280px]">
          <div className="truncate font-medium">
            {getMatterName(row.original.matter_id)}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.matter_id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "arrangement_type",
      header: "Method",
      cell: ({ row }) => (
        <Badge variant="secondary">{formatLabel(row.original.arrangement_type || row.original.method)}</Badge>
      ),
    },
    {
      accessorKey: "hourly_rate",
      header: "Hourly rate",
      cell: ({ row }) =>
        row.original.hourly_rate
          ? formatMoney(row.original.hourly_rate, row.original.currency)
          : "—",
    },
    {
      accessorKey: "flat_fee",
      header: "Flat fee",
      cell: ({ row }) =>
        row.original.flat_fee
          ? formatMoney(row.original.flat_fee, row.original.currency)
          : "—",
    },
    {
      accessorKey: "retainer_amount",
      header: "Retainer",
      cell: ({ row }) =>
        row.original.retainer_amount
          ? formatMoney(row.original.retainer_amount, row.original.currency)
          : "—",
    },
    {
      accessorKey: "billing_cap",
      header: "Billing cap",
      cell: ({ row }) =>
        row.original.billing_cap || row.original.billingCap
          ? formatMoney(row.original.billing_cap || row.original.billingCap, row.original.currency)
          : "—",
    },
    {
      accessorKey: "billing_frequency",
      header: "Frequency",
      cell: ({ row }) => formatLabel(row.original.billing_frequency),
    },
  ], [getMatterName])

  const outstandingAmount = invoices.reduce(
    (sum, invoice) => sum + ((invoice.total_amount || 0) - (invoice.paid_amount || 0)),
    0
  )

  const unbilledTime = timeEntries.filter(
    (entry) => entry.status === "UNBILLED"
  )

  const unbilledTimeAmount = unbilledTime.reduce(
    (sum, entry) => sum + (entry.amount || 0),
    0
  )

  const unbilledExpenses = expenses.filter(
    (expense) => (expense.is_billable ?? expense.isBillable) && !expense.invoice_id
  )

  const unbilledExpenseAmount = unbilledExpenses.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  )

  const paymentsReceived = payments.reduce(
    (sum, payment) => sum + (payment.amount || 0),
    0
  )

  const filteredInvoices = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return invoices

    return invoices.filter((invoice) => {
      return (
        (invoice.invoice_number || "").toLowerCase().includes(query) ||
        getClientName(invoice.client_id).toLowerCase().includes(query)
      )
    })
  }, [search, invoices, getClientName])

  const filteredTimeEntries = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return timeEntries

    return timeEntries.filter((entry) => {
      return (
        (entry.description || "").toLowerCase().includes(query) ||
        getUserName(entry.user_id).toLowerCase().includes(query) ||
        getMatterName(entry.matter_id).toLowerCase().includes(query)
      )
    })
  }, [search, timeEntries, getUserName, getMatterName])

  const filteredExpenses = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return expenses

    return expenses.filter((expense) => {
      return (
        (expense.description || "").toLowerCase().includes(query) ||
        (expense.category || "").toLowerCase().includes(query) ||
        getMatterName(expense.matter_id).toLowerCase().includes(query)
      )
    })
  }, [search, expenses, getMatterName])

  const filteredPayments = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return payments

    return payments.filter((payment) => {
      return (
        getClientName(payment.client_id || payment.clientId).toLowerCase().includes(query) ||
        (payment.invoice_id || "").toLowerCase().includes(query) ||
        (payment.reference ?? "").toLowerCase().includes(query)
      )
    })
  }, [search, payments, getClientName])

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>

            <Badge variant="secondary">Financial workspace</Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage time, expenses, invoices, payments, and billing arrangements.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Timer className="mr-2 h-4 w-4" />
            Start timer
          </Button>

          <Button>
            <FileText className="mr-2 h-4 w-4" />
            Create invoice
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Outstanding"
          value={outstandingAmount.toLocaleString()}
          description={`${invoices.filter((invoice) => invoice.status === "OVERDUE").length} overdue invoices`}
          icon={DollarSign}
        />

        <StatCard
          title="Unbilled time"
          value={unbilledTimeAmount.toLocaleString()}
          description={`${unbilledTime.length} unbilled entries`}
          icon={Clock3}
        />

        <StatCard
          title="Unbilled expenses"
          value={unbilledExpenseAmount.toLocaleString()}
          description={`${unbilledExpenses.length} billable expenses`}
          icon={Receipt}
        />

        <StatCard
          title="Payments received"
          value={paymentsReceived.toLocaleString()}
          description={`${invoices.filter((invoice) => invoice.status === "PAID").length} invoices fully paid`}
          icon={CreditCard}
        />
      </div>

      {/* Secondary overview */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Billing activity
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold">
                  {timeEntries.length}
                </div>

                <p className="text-xs text-muted-foreground">
                  Total time entries
                </p>
              </div>

              <Clock3 className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground"
                style={{
                  width: `${timeEntries.length
                    ? (timeEntries.filter(
                      (entry) => entry.status === "BILLED"
                    ).length /
                      timeEntries.length) *
                    100
                    : 0
                    }%`,
                }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>
                {
                  timeEntries.filter((entry) => entry.status === "BILLED")
                    .length
                }{" "}
                billed
              </span>

              <span>{unbilledTime.length} unbilled</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Invoice collection
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-semibold">{invoices.length}</div>

                <p className="text-xs text-muted-foreground">Total invoices</p>
              </div>

              <WalletCards className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Badge variant="outline">
                {
                  invoices.filter((invoice) => invoice.status === "DRAFT")
                    .length
                }{" "}
                draft
              </Badge>

              <Badge variant="secondary">
                {invoices.filter((invoice) => invoice.status === "SENT").length}{" "}
                sent
              </Badge>

              <Badge>
                {invoices.filter((invoice) => invoice.status === "PAID").length}{" "}
                paid
              </Badge>

              <Badge variant="destructive">
                {
                  invoices.filter((invoice) => invoice.status === "OVERDUE")
                    .length
                }{" "}
                overdue
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Quick actions</CardTitle>
          </CardHeader>

          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => { setEditingTime(null); setTimeSheet(true) }}>
              <Timer className="mr-2 h-4 w-4" />
              Add time
            </Button>

            <Button variant="outline" onClick={() => { setEditingExpense(null); setExpenseSheet(true) }}>
              <Receipt className="mr-2 h-4 w-4" />
              Add expense
            </Button>

            <Button variant="outline" onClick={() => { setEditingInvoice(null); setInvoiceSheet(true) }}>
              <FileText className="mr-2 h-4 w-4" />
              New invoice
            </Button>

            <Button variant="outline">
              <CreditCard className="mr-2 h-4 w-4" />
              Payment
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Billing tables */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Billing records</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                View and manage all billing records.
              </p>
            </div>

            <div className="relative w-full lg:w-[320px]">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search billing records..."
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="invoices" className="w-full">
            <TabsList className="mb-6 h-auto w-full justify-start overflow-x-auto">
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="expenses">Expenses</TabsTrigger>
              <TabsTrigger value="payments">Payments</TabsTrigger>
              <TabsTrigger value="rates">Rates</TabsTrigger>
              <TabsTrigger value="arrangements">Arrangements</TabsTrigger>
            </TabsList>

            <TabsContent value="invoices" className="mt-0">
              <DataTable columns={invoiceColumns} data={filteredInvoices} />
            </TabsContent>

            <TabsContent value="time" className="mt-0">
              <DataTable columns={timeColumns} data={filteredTimeEntries} />
            </TabsContent>

            <TabsContent value="expenses" className="mt-0">
              <DataTable columns={expenseColumns} data={filteredExpenses} />
            </TabsContent>

            <TabsContent value="payments" className="mt-0">
              <DataTable columns={paymentColumns} data={filteredPayments} />
            </TabsContent>

            <TabsContent value="rates" className="mt-0">
              <DataTable columns={rateColumns} data={billingRates} />
            </TabsContent>

            <TabsContent value="arrangements" className="mt-0">
              <DataTable
                columns={arrangementColumns}
                data={billingArrangements}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Bottom summary */}
      <div className="flex flex-col gap-3 rounded-lg border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium">
            {unbilledTime.length + unbilledExpenses.length} records ready to
            bill
          </p>

          <p className="text-xs text-muted-foreground">
            Review unbilled work and expenses before creating the next invoice.
          </p>
        </div>

        <Button>
          Review unbilled
          <ArrowUpRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    
      <InvoiceSheet open={invoiceSheet} onClose={() => setInvoiceSheet(false)} initial={editingInvoice} matters={matters} clients={clients} onSaved={(i) => { setInvoiceSheet(false); fetchData(); }} />
      <TimeEntrySheet open={timeSheet} onClose={() => setTimeSheet(false)} initial={editingTime} matters={matters} users={users} onSaved={(i) => { setTimeSheet(false); fetchData(); }} />
      <ExpenseSheet open={expenseSheet} onClose={() => setExpenseSheet(false)} initial={editingExpense} matters={matters} onSaved={(i) => { setExpenseSheet(false); fetchData(); }} />
    </div>
  )
}
