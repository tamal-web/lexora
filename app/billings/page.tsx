"use client"

import * as React from "react"
import {
  ArrowUpRight,
  Clock3,
  CreditCard,
  DollarSign,
  FileText,
  MoreHorizontal,
  Receipt,
  Search,
  Timer,
  WalletCards,
} from "lucide-react"

import {
  users,
  clients,
  matters,
  billingRates,
  billingArrangements,
  timeEntries,
  expenses,
  invoices,
  invoiceLineItems,
  payments,
} from "@/lib/data"

import type {
  BillingArrangement,
  BillingRate,
  Expense,
  Invoice,
  InvoiceLineItem,
  Payment,
  TimeEntry,
} from "@/lib/models"

import type { ColumnDef } from "@tanstack/react-table"

import { DataTable } from "./data-table"

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
/* Lookup helpers                                                             */
/* -------------------------------------------------------------------------- */

function getUserName(userId: string) {
  return users.find((user) => user.id === userId)?.name ?? userId
}

function getClientName(clientId: string) {
  return clients.find((client) => client.id === clientId)?.name ?? clientId
}

function getMatterName(matterId: string) {
  return matters.find((matter) => matter.id === matterId)?.title ?? matterId
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

function formatMoney(value: number, currency = "USD") {
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
/* Invoice columns                                                            */
/* -------------------------------------------------------------------------- */

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <div>
        <div className="font-medium">{row.original.invoiceNumber}</div>

        <div className="text-xs text-muted-foreground">
          {getClientName(row.original.clientId)}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "issueDate",
    header: "Issued",
    cell: ({ row }) => formatDate(row.original.issueDate),
  },
  {
    accessorKey: "dueDate",
    header: "Due",
    cell: ({ row }) => formatDate(row.original.dueDate),
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.total.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "amountPaid",
    header: "Paid",
    cell: ({ row }) => row.original.amountPaid.toLocaleString(),
  },
  {
    accessorKey: "balanceDue",
    header: "Balance",
    cell: ({ row }) => (
      <span
        className={
          row.original.balanceDue > 0 ? "font-medium" : "text-muted-foreground"
        }
      >
        {row.original.balanceDue.toLocaleString()}
      </span>
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
  {
    id: "actions",
    cell: () => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem>View invoice</DropdownMenuItem>

          <DropdownMenuItem>Edit invoice</DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem>Record payment</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

/* -------------------------------------------------------------------------- */
/* Time entry columns                                                         */
/* -------------------------------------------------------------------------- */

const timeColumns: ColumnDef<TimeEntry>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) => getUserName(row.original.userId),
  },
  {
    accessorKey: "matterId",
    header: "Matter",
    cell: ({ row }) => (
      <div className="max-w-[240px]">
        <div className="truncate font-medium">
          {getMatterName(row.original.matterId)}
        </div>

        <div className="text-xs text-muted-foreground">
          {row.original.matterId}
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
    cell: ({ row }) => `${row.original.hours.toFixed(2)}h`,
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
]

/* -------------------------------------------------------------------------- */
/* Expense columns                                                            */
/* -------------------------------------------------------------------------- */

const expenseColumns: ColumnDef<Expense>[] = [
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
    accessorKey: "matterId",
    header: "Matter",
    cell: ({ row }) => getMatterName(row.original.matterId),
  },
  {
    accessorKey: "userId",
    header: "Added by",
    cell: ({ row }) =>
      row.original.userId ? getUserName(row.original.userId) : "—",
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
    accessorKey: "isBillable",
    header: "Billable",
    cell: ({ row }) => (
      <Badge variant={row.original.isBillable ? "secondary" : "outline"}>
        {row.original.isBillable ? "Billable" : "Non-billable"}
      </Badge>
    ),
  },
  {
    accessorKey: "invoiceId",
    header: "Invoice",
    cell: ({ row }) =>
      row.original.invoiceId ? row.original.invoiceId : "Unbilled",
  },
]

/* -------------------------------------------------------------------------- */
/* Payment columns                                                            */
/* -------------------------------------------------------------------------- */

const paymentColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "paymentDate",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.paymentDate),
  },
  {
    accessorKey: "clientId",
    header: "Client",
    cell: ({ row }) => getClientName(row.original.clientId),
  },
  {
    accessorKey: "invoiceId",
    header: "Invoice",
    cell: ({ row }) => row.original.invoiceId,
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
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => formatLabel(row.original.method),
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
]

/* -------------------------------------------------------------------------- */
/* Billing rate columns                                                       */
/* -------------------------------------------------------------------------- */

const rateColumns: ColumnDef<BillingRate>[] = [
  {
    accessorKey: "userId",
    header: "User",
    cell: ({ row }) =>
      row.original.userId ? getUserName(row.original.userId) : "All users",
  },
  {
    accessorKey: "clientId",
    header: "Client",
    cell: ({ row }) =>
      row.original.clientId ? getClientName(row.original.clientId) : "Default",
  },
  {
    accessorKey: "matterId",
    header: "Matter",
    cell: ({ row }) =>
      row.original.matterId
        ? getMatterName(row.original.matterId)
        : "All matters",
  },
  {
    accessorKey: "hourlyRate",
    header: "Hourly rate",
    cell: ({ row }) => (
      <span className="font-medium">
        {formatMoney(row.original.hourlyRate, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "effectiveFrom",
    header: "Effective from",
    cell: ({ row }) => formatDate(row.original.effectiveFrom),
  },
  {
    accessorKey: "effectiveTo",
    header: "Effective to",
    cell: ({ row }) =>
      row.original.effectiveTo
        ? formatDate(row.original.effectiveTo)
        : "Current",
  },
]

/* -------------------------------------------------------------------------- */
/* Billing arrangement columns                                                */
/* -------------------------------------------------------------------------- */

const arrangementColumns: ColumnDef<BillingArrangement>[] = [
  {
    accessorKey: "matterId",
    header: "Matter",
    cell: ({ row }) => (
      <div className="max-w-[280px]">
        <div className="truncate font-medium">
          {getMatterName(row.original.matterId)}
        </div>

        <div className="text-xs text-muted-foreground">
          {row.original.matterId}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "method",
    header: "Method",
    cell: ({ row }) => (
      <Badge variant="secondary">{formatLabel(row.original.method)}</Badge>
    ),
  },
  {
    accessorKey: "hourlyRate",
    header: "Hourly rate",
    cell: ({ row }) =>
      row.original.hourlyRate
        ? formatMoney(row.original.hourlyRate, row.original.currency)
        : "—",
  },
  {
    accessorKey: "flatFee",
    header: "Flat fee",
    cell: ({ row }) =>
      row.original.flatFee
        ? formatMoney(row.original.flatFee, row.original.currency)
        : "—",
  },
  {
    accessorKey: "retainerAmount",
    header: "Retainer",
    cell: ({ row }) =>
      row.original.retainerAmount
        ? formatMoney(row.original.retainerAmount, row.original.currency)
        : "—",
  },
  {
    accessorKey: "billingCap",
    header: "Billing cap",
    cell: ({ row }) =>
      row.original.billingCap
        ? formatMoney(row.original.billingCap, row.original.currency)
        : "—",
  },
  {
    accessorKey: "billingFrequency",
    header: "Frequency",
    cell: ({ row }) => formatLabel(row.original.billingFrequency),
  },
]

/* -------------------------------------------------------------------------- */
/* Invoice line item columns                                                   */
/* -------------------------------------------------------------------------- */

const lineItemColumns: ColumnDef<InvoiceLineItem>[] = [
  {
    accessorKey: "invoiceId",
    header: "Invoice",
    cell: ({ row }) => row.original.invoiceId,
  },
  {
    accessorKey: "matterId",
    header: "Matter",
    cell: ({ row }) =>
      row.original.matterId ? getMatterName(row.original.matterId) : "—",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge variant="outline">{formatLabel(row.original.type)}</Badge>
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
    accessorKey: "quantity",
    header: "Qty",
  },
  {
    accessorKey: "unitPrice",
    header: "Unit price",
    cell: ({ row }) => row.original.unitPrice.toLocaleString(),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className="font-medium">
        {row.original.amount.toLocaleString()}
      </span>
    ),
  },
]

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

  const outstandingAmount = invoices.reduce(
    (sum, invoice) => sum + invoice.balanceDue,
    0
  )

  const unbilledTime = timeEntries.filter(
    (entry) => entry.status === "UNBILLED"
  )

  const unbilledTimeAmount = unbilledTime.reduce(
    (sum, entry) => sum + entry.amount,
    0
  )

  const unbilledExpenses = expenses.filter(
    (expense) => expense.isBillable && !expense.invoiceId
  )

  const unbilledExpenseAmount = unbilledExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  )

  const paymentsReceived = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0
  )

  /*
   * Filter each dataset using its actual related
   * records from @/lib/data.
   */

  const filteredInvoices = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return invoices

    return invoices.filter((invoice) => {
      return (
        invoice.invoiceNumber.toLowerCase().includes(query) ||
        getClientName(invoice.clientId).toLowerCase().includes(query)
      )
    })
  }, [search])

  const filteredTimeEntries = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return timeEntries

    return timeEntries.filter((entry) => {
      return (
        entry.description.toLowerCase().includes(query) ||
        getUserName(entry.userId).toLowerCase().includes(query) ||
        getMatterName(entry.matterId).toLowerCase().includes(query)
      )
    })
  }, [search])

  const filteredExpenses = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return expenses

    return expenses.filter((expense) => {
      return (
        expense.description.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        getMatterName(expense.matterId).toLowerCase().includes(query)
      )
    })
  }, [search])

  const filteredPayments = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return payments

    return payments.filter((payment) => {
      return (
        getClientName(payment.clientId).toLowerCase().includes(query) ||
        payment.invoiceId.toLowerCase().includes(query) ||
        (payment.reference ?? "").toLowerCase().includes(query)
      )
    })
  }, [search])

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
          description={`${invoices.filter((invoice) => invoice.status === "OVERDUE").length
            } overdue invoices`}
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
          description={`${invoices.filter((invoice) => invoice.status === "PAID").length
            } invoices fully paid`}
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
            <Button variant="outline">
              <Timer className="mr-2 h-4 w-4" />
              Add time
            </Button>

            <Button variant="outline">
              <Receipt className="mr-2 h-4 w-4" />
              Add expense
            </Button>

            <Button variant="outline">
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

              <TabsTrigger value="line-items">Line items</TabsTrigger>
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

            <TabsContent value="line-items" className="mt-0">
              <DataTable columns={lineItemColumns} data={invoiceLineItems} />
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
    </div>
  )
}
