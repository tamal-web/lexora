"use client"

import { useMemo, useState } from "react"
import {
  ChevronRight,
  Download,
  FileArchive,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  FolderOpen,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
} from "lucide-react"

import { FileTree } from "@/components/file-tree"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Input } from "@/components/ui/input"

import { ScrollArea } from "@/components/ui/scroll-area"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Separator } from "@/components/ui/separator"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import type { Document, DocumentType, DocumentStatus } from "@/lib/models"

import {
  documents,
  documentVersions,
  matters,
  users,
  clients,
} from "@/lib/data"

import type { TreeNode } from "../page"

/* ============================================================
   MATTER TREE
============================================================ */

const fileTreeData: TreeNode[] = [
  {
    name: "All Matters",
    isFolder: true,
    children: matters.map((matter) => ({
      name: matter.matter_number,
      isFolder: false,
    })),
  },
]

/* ============================================================
   HELPERS
============================================================ */

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function getMatter(matterId?: string) {
  return matters.find((matter) => matter.id === matterId)
}

function getClient(clientId?: string) {
  return clients.find((client) => client.id === clientId)
}

function getUser(userId?: string) {
  return users.find((user) => user.id === userId)
}

function getFileIcon(mimeType: string) {
  if (mimeType === "application/pdf") {
    return <FileText className="h-4 w-4 text-red-500" />
  }

  if (mimeType.includes("word")) {
    return <FileType className="h-4 w-4 text-blue-500" />
  }

  if (mimeType === "application/zip") {
    return <FileArchive className="h-4 w-4 text-yellow-600" />
  }

  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) {
    return <FileSpreadsheet className="h-4 w-4 text-green-600" />
  }

  if (mimeType.includes("image")) {
    return <FileImage className="h-4 w-4 text-purple-500" />
  }

  return <FileText className="h-4 w-4" />
}

function documentTypeLabel(type: DocumentType) {
  return type
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function statusBadge(status: DocumentStatus) {
  switch (status) {
    case "FINAL":
      return (
        <Badge variant="secondary" className="font-normal">
          Final
        </Badge>
      )

    case "DRAFT":
      return (
        <Badge variant="outline" className="font-normal">
          Draft
        </Badge>
      )

    case "ARCHIVED":
      return (
        <Badge variant="outline" className="font-normal text-muted-foreground">
          Archived
        </Badge>
      )
  }
}

/* ============================================================
   PAGE
============================================================ */

export default function DocumentsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const [selectedMatterId] = useState<string>("ALL")

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  )

  const [search, setSearch] = useState("")

  const [typeFilter, setTypeFilter] = useState("ALL")

  const [statusFilter, setStatusFilter] = useState("ALL")

  /* ============================================================
     FILTER DOCUMENTS
  ============================================================ */

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase()

    return documents
      .filter((document) => {
        if (
          selectedMatterId !== "ALL" &&
          document.matterId !== selectedMatterId
        ) {
          return false
        }

        if (typeFilter !== "ALL" && document.type !== typeFilter) {
          return false
        }

        if (statusFilter !== "ALL" && document.status !== statusFilter) {
          return false
        }

        if (!query) {
          return true
        }

        const matter = getMatter(document.matterId)
        const client = getClient(document.clientId)

        return [
          document.name,
          document.fileName,
          document.description,
          matter?.matter_number,
          matter?.title,
          client?.name,
          ...(document.tags ?? []),
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      })
      .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime())
  }, [search, selectedMatterId, typeFilter, statusFilter])

  /* ============================================================
     STATS
  ============================================================ */

  const finalDocuments = documents.filter(
    (document) => document.status === "FINAL"
  ).length

  const draftDocuments = documents.filter(
    (document) => document.status === "DRAFT"
  ).length

  const recentlyUpdated = documents.filter((document) => {
    const diff = Date.now() - document.updated_at.getTime()

    const days = diff / (1000 * 60 * 60 * 24)

    return days <= 30
  }).length

  const selectedMatter =
    selectedMatterId === "ALL" ? undefined : getMatter(selectedMatterId)

  /* ============================================================
     SELECTED DOCUMENT VERSIONS
  ============================================================ */

  const selectedVersions = selectedDocument
    ? documentVersions
      .filter((version) => version.documentId === selectedDocument.id)
      .sort((a, b) => b.versionNumber - a.versionNumber)
    : []

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-hidden">
      <SidebarProvider
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        className="flex h-full min-h-0 w-full min-w-0 flex-1 overflow-hidden"
      >
        {/* ======================================================
          MATTER SIDEBAR
      ====================================================== */}

        <Sidebar variant="floating" collapsible="none" className="shrink-0">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2 py-2">
              <FolderOpen className="h-4 w-4 shrink-0" />

              <span className="truncate text-sm font-semibold">Matters</span>
            </div>
          </SidebarHeader>

          <SidebarContent className="min-w-0 overflow-x-hidden">
            <ScrollArea className="h-full w-full">
              <div className="px-2 py-3">
                <FileTree data={fileTreeData} />
              </div>
            </ScrollArea>
          </SidebarContent>

          <SidebarFooter className="border-t">
            <div className="truncate px-3 py-3 text-xs text-muted-foreground">
              {matters.length} matters
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

        <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
            {/* HEADER */}
            <header className="shrink-0 border-b bg-background">
              <div className="flex min-w-0 items-center justify-between gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground">
                    <span className="shrink-0">Documents</span>

                    {selectedMatter && (
                      <>
                        <ChevronRight className="h-3.5 w-3.5 shrink-0" />

                        <span className="truncate">
                          {selectedMatter.matter_number}
                        </span>
                      </>
                    )}
                  </div>

                  <h1 className="mt-1 truncate text-xl font-semibold tracking-tight">
                    {selectedMatter ? selectedMatter.title : "All Documents"}
                  </h1>

                  {selectedMatter && (
                    <p className="truncate text-sm text-muted-foreground">
                      {getClient(selectedMatter.client_id)?.name} ·{" "}
                      {selectedMatter.matter_number}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>

                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    New Document
                  </Button>
                </div>
              </div>
            </header>

            {/* SCROLLABLE CONTENT */}
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="min-w-0 space-y-6 p-6">
                  {/* STATS */}
                  <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="min-w-0">
                      <CardContent className="p-5">
                        <p className="truncate text-sm text-muted-foreground">
                          Total Documents
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                          {documents.length}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          Across all matters
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="min-w-0">
                      <CardContent className="p-5">
                        <p className="truncate text-sm text-muted-foreground">
                          Final
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                          {finalDocuments}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          Approved documents
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="min-w-0">
                      <CardContent className="p-5">
                        <p className="truncate text-sm text-muted-foreground">
                          Drafts
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                          {draftDocuments}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          Require review
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="min-w-0">
                      <CardContent className="p-5">
                        <p className="truncate text-sm text-muted-foreground">
                          Recently Updated
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                          {recentlyUpdated}
                        </p>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          Updated in the last 30 days
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* DOCUMENT TABLE */}
                  <div className="max-w-full min-w-0 overflow-hidden rounded-xl border bg-background">
                    <div className="flex min-w-0 flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="relative w-full min-w-0 lg:max-w-sm">
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                        <Input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Search documents..."
                          className="w-full pl-9"
                        />
                      </div>

                      <div className="flex min-w-0 flex-wrap gap-2">
                        <Select
                          value={typeFilter}
                          onValueChange={setTypeFilter}
                        >
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Document type" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="ALL">All types</SelectItem>
                            <SelectItem value="OFFICE_ACTION">
                              Office Action
                            </SelectItem>
                            <SelectItem value="APPLICATION">
                              Application
                            </SelectItem>
                            <SelectItem value="RESPONSE">Response</SelectItem>
                            <SelectItem value="AMENDMENT">Amendment</SelectItem>
                            <SelectItem value="PRIOR_ART">Prior Art</SelectItem>
                            <SelectItem value="CORRESPONDENCE">
                              Correspondence
                            </SelectItem>
                            <SelectItem value="EVIDENCE">Evidence</SelectItem>
                            <SelectItem value="NOTICE">Notice</SelectItem>
                            <SelectItem value="FILING_RECEIPT">
                              Filing Receipt
                            </SelectItem>
                            <SelectItem value="OFFICIAL_LETTER">
                              Official Letter
                            </SelectItem>
                          </SelectContent>
                        </Select>

                        <Select
                          value={statusFilter}
                          onValueChange={setStatusFilter}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="ALL">All statuses</SelectItem>
                            <SelectItem value="FINAL">Final</SelectItem>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center justify-between gap-3 border-b px-4 py-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <FolderOpen className="h-4 w-4 shrink-0 text-muted-foreground" />

                        <span className="shrink-0 text-sm font-medium">
                          {selectedMatter
                            ? selectedMatter.matter_number
                            : "All matters"}
                        </span>

                        {selectedMatter && (
                          <>
                            <span className="shrink-0 text-muted-foreground">
                              ·
                            </span>

                            <span className="truncate text-sm text-muted-foreground">
                              {getClient(selectedMatter.client_id)?.name}
                            </span>
                          </>
                        )}
                      </div>

                      <span className="shrink-0 text-xs text-muted-foreground">
                        {filteredDocuments.length} documents
                      </span>
                    </div>

                    <div className="w-full max-w-full overflow-x-auto">
                      <Table className="min-w-[900px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[34%] min-w-[280px]">
                              Document
                            </TableHead>

                            <TableHead className="w-[15%]">Type</TableHead>

                            {!selectedMatter && (
                              <TableHead className="w-[20%]">Matter</TableHead>
                            )}

                            <TableHead className="w-[10%]">Status</TableHead>

                            <TableHead className="w-[10%]">Version</TableHead>

                            <TableHead className="w-[12%]">Modified</TableHead>

                            <TableHead className="w-12" />
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {filteredDocuments.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={selectedMatter ? 6 : 7}
                                className="h-32 text-center"
                              >
                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                  <FileText className="mb-2 h-8 w-8 opacity-40" />

                                  <p className="text-sm font-medium">
                                    No documents found
                                  </p>

                                  <p className="text-xs">
                                    Try changing your search or filters.
                                  </p>
                                </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredDocuments.map((document) => {
                              const matter = getMatter(document.matterId)

                              return (
                                <TableRow
                                  key={document.id}
                                  className="cursor-pointer"
                                  onClick={() => setSelectedDocument(document)}
                                >
                                  <TableCell>
                                    <div className="flex min-w-0 items-center gap-3">
                                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                                        {getFileIcon(document.mimeType)}
                                      </div>

                                      <div className="min-w-0">
                                        <div className="truncate font-medium">
                                          {document.name}
                                        </div>

                                        <div className="truncate text-xs text-muted-foreground">
                                          {document.fileName}
                                        </div>
                                      </div>
                                    </div>
                                  </TableCell>

                                  <TableCell>
                                    <span className="text-sm whitespace-nowrap">
                                      {documentTypeLabel(document.type)}
                                    </span>
                                  </TableCell>

                                  {!selectedMatter && (
                                    <TableCell>
                                      <div className="max-w-[240px] min-w-0">
                                        <p className="truncate text-sm">
                                          {matter?.matter_number}
                                        </p>

                                        <p className="truncate text-xs text-muted-foreground">
                                          {getClient(matter?.client_id)?.name}
                                        </p>
                                      </div>
                                    </TableCell>
                                  )}

                                  <TableCell>
                                    {statusBadge(document.status)}
                                  </TableCell>

                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className="font-normal"
                                    >
                                      v{document.version}
                                    </Badge>
                                  </TableCell>

                                  <TableCell>
                                    <span className="text-sm whitespace-nowrap text-muted-foreground">
                                      {formatDate(document.updated_at)}
                                    </span>
                                  </TableCell>

                                  <TableCell
                                    onClick={(event) => event.stopPropagation()}
                                  >
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8"
                                        >
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>

                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                          Open document
                                        </DropdownMenuItem>

                                        <DropdownMenuItem>
                                          Download
                                        </DropdownMenuItem>

                                        <DropdownMenuItem>
                                          Upload new version
                                        </DropdownMenuItem>

                                        <DropdownMenuSeparator />

                                        <DropdownMenuItem>
                                          Rename
                                        </DropdownMenuItem>

                                        <DropdownMenuItem>
                                          Move to matter
                                        </DropdownMenuItem>

                                        <DropdownMenuItem className="text-destructive">
                                          Archive
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </main>

        {/* KEEP YOUR EXISTING SHEET HERE */}
        <Sheet
          open={!!selectedDocument}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedDocument(null)
            }
          }}
        >
          {/* Your existing SheetContent */}
        </Sheet>
      </SidebarProvider>
    </div>
  )
}
