// @ts-nocheck
"use client"

import { useMemo, useState } from "react"

import {
  AlertCircle,
  Archive,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  FileText,
  Filter,
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react"

import { useApi } from "@/lib/use-api"
import { api } from "@/lib/api"
import type { Deadline, Document, Matter, MatterAssignment } from "@/lib/models"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MatterDetailProps {
  matter: Matter
}

const matterTypeLabels: Record<Matter["type"], string> = {
  PATENT_UTILITY: "Patent — Utility",
  PATENT_DESIGN: "Patent — Design",
  PATENT_PROVISIONAL: "Patent — Provisional",
  PATENT_PCT: "Patent — PCT",
  PATENT_NATIONAL_PHASE: "Patent — National Phase",
  TRADEMARK_APPLICATION: "Trademark Application",
  TRADEMARK_OPPOSITION: "Trademark Opposition",
  TRADEMARK_RENEWAL: "Trademark Renewal",
  COPYRIGHT_REGISTRATION: "Copyright Registration",
  IP_LITIGATION: "IP Litigation",
  CIVIL_LITIGATION: "Civil Litigation",
  LICENSING_TRANSACTIONAL: "Licensing / Transactional",
  TRADE_SECRET: "Trade Secret",
  PORTFOLIO_MANAGEMENT: "Portfolio Management",
  CLIENT_COUNSELING: "Client Counseling",
  OTHER: "Other",
}

const statusLabels: Record<Matter["status"], string> = {
  OPEN: "Open",
  PENDING: "Pending",
  ON_HOLD: "On Hold",
  ABANDONED: "Abandoned",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
}

const deadlineStatusLabels: Record<Deadline["status"], string> = {
  DOCKETED: "Docketed",
  UPCOMING: "Upcoming",
  DUE_SOON: "Due Soon",
  OVERDUE: "Overdue",
  COMPLETED: "Completed",
  EXTENDED: "Extended",
  WAIVED: "Waived",
}

const deadlineTypeLabels: Record<Deadline["action_type"], string> = {
  STATUTORY_BAR_DATE: "Statutory Bar Date",
  OFFICE_ACTION_RESPONSE: "Office Action Response",
  RENEWAL_MAINTENANCE_FEE: "Renewal / Maintenance Fee",
  PRIORITY_DEADLINE: "Priority Deadline",
  FILING_DEADLINE: "Filing Deadline",
  DISCOVERY_DEADLINE: "Discovery Deadline",
  COURT_HEARING: "Court Hearing",
  COURT_FILING: "Court Filing",
  CLIENT_REPORTING: "Client Reporting",
  INTERNAL_REVIEW: "Internal Review",
}

const documentStatusLabels: Record<Document["status"], string> = {
  DRAFT: "Draft",
  FINAL: "Final",
  ARCHIVED: "Archived",
}

function formatDate(date: Date | undefined) {
  if (!date) return "—"

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date))
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function getDeadlineStatusClass(status: Deadline["status"]) {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
    case "OVERDUE":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
    case "DUE_SOON":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
    case "UPCOMING":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
    default:
      return "border-border bg-muted text-foreground/80"
  }
}

function getMatterStatusClass(status: Matter["status"]) {
  switch (status) {
    case "OPEN":
      return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
    case "PENDING":
      return "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400"
    case "ON_HOLD":
      return "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
    case "ABANDONED":
      return "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400"
    case "CLOSED":
      return "border-border bg-muted text-foreground/80"
    case "ARCHIVED":
      return "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-400"
  }
}

export function MatterDetail({ matter: initialMatter }: MatterDetailProps) {
  const { data: clientsData } = useApi(api.clients)
  const clients = clientsData || []
  
  const { data: rawDeadlines } = useApi(api.deadlines)
  const deadlines = (rawDeadlines || []).map(d => ({ 
    ...d, 
    due_date: new Date(d.due_date),
    priorty: d.priority as any,
    fee_ammount: d.fee_amount,
    fee_curency: d.fee_currency
  })) as any[]
  
  const { data: docsData } = useApi(api.documents)
  const documents = (docsData || []).map(d => ({
    ...d,
    matterId: d.matter_id,
    fileName: d.file_name,
    fileType: d.file_type,
    fileSize: d.file_size,
    documentType: d.document_type,
    createdBy: d.created_by,
    createdAt: new Date(d.created_at),
    updatedAt: new Date(d.updated_at),
  }))
  
  const { data: usersData } = useApi(api.users)
  const users = usersData || []
  
  const { data: assignData } = useApi(api.assignments)
  const matterAssignments = assignData || []
  
  const { data: mattersData } = useApi(api.matters)
  const matters = mattersData || []
  
  const firm = { id: "firm_001", name: "Bhatt Sinha IP Partners" }
  
  // Use initialMatter if we don't refetch, or we could refetch matter
  const matter = initialMatter;

  const [selectedDeadlineId, setSelectedDeadlineId] = useState<string | null>(
    null
  )
  const [searchQuery, setSearchQuery] = useState("")

  const client = useMemo(
    () => clients.find((item) => item.id === matter.client_id),
    [matter.client_id]
  )

  const matterDeadlineRecords = useMemo(
    () => deadlines.filter((item) => item.matter_id === matter.id),
    [matter.id]
  )

  const matterDocumentRecords = useMemo(
    () =>
      documents.filter(
        (item) =>
          item.matterId === matter.id ||
          (item.matterId === undefined && item.clientId === matter.client_id)
      ),
    [matter.id, matter.client_id]
  )

  const assignments = useMemo(
    () =>
      matterAssignments.filter(
        (assignment) => assignment.matterId === matter.id
      ),
    [matter.id]
  )

  const responsibleAssignments = assignments.filter(
    (assignment) => assignment.role === "RESPONSIBLE_ATTORNEY"
  )

  const billingAssignments = assignments.filter(
    (assignment) => assignment.role === "BILLING_ATTORNEY"
  )

  const paralegalAssignments = assignments.filter(
    (assignment) => assignment.role === "PARALEGAL"
  )

  const relatedMatters = useMemo(() => {
    if (!matter.client_id) return []

    return matters.filter(
      (item) => item.client_id === matter.client_id && item.id !== matter.id
    )
  }, [matter.client_id, matter.id])

  const visibleDeadlines = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return matterDeadlineRecords

    return matterDeadlineRecords.filter((deadline) =>
      [
        deadline.title,
        deadline.description,
        deadlineStatusLabels[deadline.status],
        deadlineTypeLabels[deadline.action_type],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [matterDeadlineRecords, searchQuery])

  const visibleDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) return matterDocumentRecords

    return matterDocumentRecords.filter((document) =>
      [
        document.name,
        document.description,
        document.fileName,
        document.type,
        documentStatusLabels[document.status],
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    )
  }, [matterDocumentRecords, searchQuery])

  const selectedDeadline = useMemo(() => {
    if (selectedDeadlineId) {
      return (
        matterDeadlineRecords.find(
          (deadline) => deadline.id === selectedDeadlineId
        ) ?? matterDeadlineRecords[0]
      )
    }

    return (
      matterDeadlineRecords.find(
        (deadline) =>
          deadline.status === "OVERDUE" ||
          deadline.status === "DUE_SOON" ||
          deadline.status === "UPCOMING"
      ) ?? matterDeadlineRecords[0]
    )
  }, [matterDeadlineRecords, selectedDeadlineId])

  const selectedAssignee = useMemo(() => {
    if (!selectedDeadline?.assigned_to) return undefined

    return users.find((user) => user.id === selectedDeadline.assigned_to)
  }, [selectedDeadline])

  return (
    <main className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="mx-auto max-w-[1600px] px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h1 className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {matter.matter_number}
                </h1>

                <Badge
                  variant="outline"
                  className={getMatterStatusClass(matter.status)}
                >
                  {statusLabels[matter.status]}
                </Badge>
              </div>

              <p className="mt-1 max-w-3xl text-sm text-muted-foreground">
                {matter.title}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>

              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border border-input bg-transparent px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none">
                  More
                  <ChevronDown className="ml-2 h-4 w-4" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Mail className="mr-2 h-4 w-4" />
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-6">
        {/* Matter Overview */}
        <Card className="overflow-hidden border-border shadow-sm">
          <CardContent className="p-0">
            <div className="grid grid-cols-1 divide-y lg:grid-cols-[1fr_300px] lg:divide-x lg:divide-y-0">
              <div className="p-6">
                <div className="grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-3 xl:grid-cols-4">
                  <InfoField
                    label="Matter Type"
                    value={matterTypeLabels[matter.type]}
                  />

                  <InfoField
                    label="Matter Sub Type"
                    value={
                      matter.type.startsWith("PATENT_") ? "Patent" : "Matter"
                    }
                  />

                  <InfoField label="Client" value={client?.name} />

                  <InfoField label="Jurisdiction" value={matter.jurisdiction} />

                  <InfoField label="Country" value={matter.country} />

                  <InfoField
                    label="Application Number"
                    value={matter.application_number}
                  />

                  <InfoField
                    label="Publication Number"
                    value={matter.publication_number}
                  />

                  <InfoField
                    label="Patent / Registration Number"
                    value={matter.patent_number ?? matter.registration_number}
                  />

                  <InfoField
                    label="Filing Date"
                    value={formatDate(matter.filling_date)}
                  />

                  <InfoField
                    label="Priority Date"
                    value={formatDate(matter.priority_date)}
                  />

                  <InfoField
                    label="Publication Date"
                    value={formatDate(matter.publication_date)}
                  />

                  <InfoField
                    label="Expiry Date"
                    value={formatDate(matter.expiry_date)}
                  />

                  <InfoField label="Art Unit" value={matter.art_unit} />

                  <InfoField label="Examiner" value={matter.examiner} />

                  <InfoField
                    label="Responsible Attorney"
                    value={responsibleAssignments
                      .map((item) => item.userName)
                      .join(", ")}
                  />

                  <InfoField
                    label="Paralegal"
                    value={paralegalAssignments
                      .map((item) => item.userName)
                      .join(", ")}
                  />
                </div>

                {matter.desc && (
                  <div className="mt-7 border-t pt-5">
                    <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                      Description
                    </p>
                    <p className="max-w-4xl text-sm leading-6 text-muted-foreground">
                      {matter.desc}
                    </p>
                  </div>
                )}

                {(matter.tags?.length ?? 0) > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {matter.tags?.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-muted/70 p-6">
                <div className="mb-5 flex items-center gap-2">
                  <BriefcaseBusiness className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">
                    Matter Summary
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <SummaryMetric
                    icon={<CalendarClock className="h-4 w-4" />}
                    value={matterDeadlineRecords.length}
                    label="Docket(s)"
                  />

                  <SummaryMetric
                    icon={<FileText className="h-4 w-4" />}
                    value={matterDocumentRecords.length}
                    label="Document(s)"
                  />

                  <SummaryMetric
                    icon={<UsersRound className="h-4 w-4" />}
                    value={relatedMatters.length}
                    label="Related Matter(s)"
                  />

                  <SummaryMetric
                    icon={<UserRound className="h-4 w-4" />}
                    value={assignments.length}
                    label="Assignment(s)"
                  />
                </div>

                <div className="mt-6 rounded-lg border bg-card p-4">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Law Firm
                  </p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {firm.name}
                  </p>

                  {billingAssignments.length > 0 && (
                    <div className="mt-4 border-t pt-4">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Billing Attorney
                      </p>
                      <p className="mt-1 text-sm text-foreground/80">
                        {billingAssignments
                          .map((item) => item.userName)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Tabs */}
        <Card className="mt-6 border-border shadow-sm">
          <Tabs defaultValue="dockets">
            <div className="border-b px-4">
              <TabsList className="h-12 bg-transparent">
                <TabsTrigger value="dockets">Dockets</TabsTrigger>

                <TabsTrigger value="documents">Documents</TabsTrigger>

                <TabsTrigger value="related">Related Matters</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dockets" className="m-0">
              <div className="border-b px-5 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-1 items-center gap-2 md:max-w-lg">
                    <div className="relative w-full">
                      <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search dockets"
                        className="pl-9"
                      />
                    </div>

                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon">
                      <SlidersHorizontal className="h-4 w-4" />
                    </Button>

                    <Button variant="outline" size="icon">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>

                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Docket
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Docket</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {visibleDeadlines.map((deadline) => {
                      const assignedUser = deadline.assigned_to
                        ? users.find((user) => user.id === deadline.assigned_to)
                        : undefined

                      const isSelected = deadline.id === selectedDeadline?.id

                      return (
                        <TableRow
                          key={deadline.id}
                          onClick={() => setSelectedDeadlineId(deadline.id)}
                          className={`cursor-pointer ${isSelected ? "bg-blue-50/70 dark:bg-blue-950/30" : ""
                            }`}
                        >
                          <TableCell>
                            <div
                              className={`h-2.5 w-2.5 rounded-full ${deadline.status === "OVERDUE"
                                ? "bg-red-500"
                                : deadline.status === "DUE_SOON"
                                  ? "bg-amber-500"
                                  : deadline.status === "COMPLETED"
                                    ? "bg-emerald-500"
                                    : "bg-blue-500"
                                }`}
                            />
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">
                                {deadline.title}
                              </p>

                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {deadline.id}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell className="whitespace-nowrap">
                            {deadlineTypeLabels[deadline.action_type]}
                          </TableCell>

                          <TableCell className="font-medium whitespace-nowrap">
                            {formatDate(deadline.due_date)}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="outline"
                              className={getDeadlineStatusClass(
                                deadline.status
                              )}
                            >
                              {deadlineStatusLabels[deadline.status]}
                            </Badge>
                          </TableCell>

                          <TableCell className="capitalize">
                            {deadline.priorty.toLowerCase()}
                          </TableCell>

                          <TableCell>{assignedUser?.name ?? "—"}</TableCell>

                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                onClick={(event) => event.stopPropagation()}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </DropdownMenuTrigger>

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Open</DropdownMenuItem>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>
                                  Mark Completed
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}

                    {visibleDeadlines.length === 0 && (
                      <EmptyTableRow message="No dockets found." />
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="documents" className="m-0">
              <div className="border-b px-5 py-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-lg">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                    <Input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search documents"
                      className="pl-9"
                    />
                  </div>

                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Document
                  </Button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {visibleDocuments.map((document) => {
                      const uploader = users.find(
                        (user) => user.id === document.uploadedBy
                      )

                      return (
                        <TableRow key={document.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                              </div>

                              <div>
                                <p className="font-medium text-foreground">
                                  {document.name}
                                </p>

                                <p className="text-xs text-muted-foreground">
                                  {document.fileName}
                                </p>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            {document.type.replaceAll("_", " ")}
                          </TableCell>

                          <TableCell>
                            <Badge variant="secondary">
                              {documentStatusLabels[document.status]}
                            </Badge>
                          </TableCell>

                          <TableCell>v{document.version}</TableCell>

                          <TableCell>
                            {formatBytes(document.fileSize)}
                          </TableCell>

                          <TableCell>
                            <div>
                              <p>{formatDate(document.created_at)}</p>
                              <p className="text-xs text-muted-foreground">
                                {uploader?.name ?? "Unknown"}
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}

                    {visibleDocuments.length === 0 && (
                      <EmptyTableRow message="No documents found." />
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="related" className="m-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Matter</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Jurisdiction</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Filing Date</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {relatedMatters.map((relatedMatter) => (
                      <TableRow key={relatedMatter.id}>
                        <TableCell className="font-medium">
                          {relatedMatter.matter_number}
                        </TableCell>

                        <TableCell>{relatedMatter.title}</TableCell>

                        <TableCell>
                          {matterTypeLabels[relatedMatter.type]}
                        </TableCell>

                        <TableCell>
                          {relatedMatter.jurisdiction ?? "—"}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getMatterStatusClass(
                              relatedMatter.status
                            )}
                          >
                            {statusLabels[relatedMatter.status]}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {formatDate(relatedMatter.filling_date)}
                        </TableCell>
                      </TableRow>
                    ))}

                    {relatedMatters.length === 0 && (
                      <EmptyTableRow message="No related matters found for this client." />
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Active Deadline + Notes */}
        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.45fr_1fr]">
          <Card className="border-border shadow-sm">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Docket Details
                </CardTitle>

                {selectedDeadline && (
                  <Badge
                    variant="outline"
                    className={getDeadlineStatusClass(selectedDeadline.status)}
                  >
                    {deadlineStatusLabels[selectedDeadline.status]}
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {selectedDeadline ? (
                <>
                  <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
                    <DetailField
                      label="Docket Code"
                      value={selectedDeadline.id}
                    />

                    <DetailField
                      label="Docket Type"
                      value={deadlineTypeLabels[selectedDeadline.action_type]}
                    />

                    <DetailField
                      label="Docket Name"
                      value={selectedDeadline.title}
                    />

                    <DetailField
                      label="Priority"
                      value={selectedDeadline.priorty}
                    />

                    <DetailField
                      label="Due Date"
                      value={formatDate(selectedDeadline.due_date)}
                    />

                    <DetailField
                      label="Assigned To"
                      value={selectedAssignee?.name ?? "—"}
                    />

                    <DetailField
                      label="Reminder"
                      value={formatDate(selectedDeadline.reminder_date)}
                    />

                    <DetailField
                      label="Second Reminder"
                      value={formatDate(selectedDeadline.second_reminder_date)}
                    />

                    <DetailField
                      label="Court Deadline"
                      value={selectedDeadline.is_court_deadline ? "Yes" : "No"}
                    />

                    <DetailField
                      label="Fee Status"
                      value={selectedDeadline.fee_status}
                    />

                    <DetailField
                      label="Fee Amount"
                      value={
                        selectedDeadline.fee_ammount !== undefined
                          ? `${selectedDeadline.fee_curency ?? ""} ${selectedDeadline.fee_ammount}`
                          : "—"
                      }
                    />

                    <DetailField
                      label="Fee Paid Date"
                      value={formatDate(selectedDeadline.fee_paid_date)}
                    />
                  </div>

                  {selectedDeadline.description && (
                    <div className="mt-6 border-t pt-5">
                      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        Description
                      </p>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {selectedDeadline.description}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex min-h-64 items-center justify-center text-sm text-muted-foreground">
                  No deadline available for this matter.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="border-b px-5 py-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold text-foreground">
                  Notes
                </CardTitle>

                <Button variant="ghost" size="sm">
                  <Plus className="mr-1.5 h-4 w-4" />
                  New Note
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5">
              {selectedDeadline?.notes ? (
                <div className="rounded-lg border border-border bg-muted p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Deadline Note
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {selectedDeadline.id}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-6 text-muted-foreground">
                    {selectedDeadline.notes}
                  </p>
                </div>
              ) : (
                <div className="flex min-h-64 flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-secondary">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>

                  <p className="text-sm font-medium text-foreground/80">
                    No notes available
                  </p>

                  <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                    There are no notes attached to the selected deadline.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

function InfoField({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-foreground">
        {value || "—"}
      </p>
    </div>
  )
}

function DetailField({
  label,
  value,
}: {
  label: string
  value?: string | null
}) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-foreground">{value || "—"}</p>
    </div>
  )
}

function SummaryMetric({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number
  label: string
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2 text-blue-600">
        {icon}
        <span className="text-lg font-semibold text-foreground">{value}</span>
      </div>

      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  )
}

function EmptyTableRow({ message }: { message: string }) {
  return (
    <TableRow>
      <TableCell colSpan={8}>
        <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
          {message}
        </div>
      </TableCell>
    </TableRow>
  )
}
