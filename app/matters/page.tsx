"use client"
import { Deadline, Matter } from "@/lib/models"
import { BriefcaseBusiness, TargetIcon, X, Loader2, Pencil, Plus } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TopNavBar } from "@/components/TopNavBarComp"
import { useRouter } from "next/navigation"
import { useClient } from "../client-context"
import { useApi } from "@/lib/use-api"
import { api, ApiClient, ApiMatter, ApiDeadline } from "@/lib/api"
import { MatterSheet, DeadlineSheet } from "@/components/entity-sheets"

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
]
const statusList = [
  { id: "OPEN", title: "Open" },
  { id: "PENDING", title: "Pending" },
  { id: "ON_HOLD", title: "On Hold" },
  { id: "ABANDONED", title: "Abandoned" },
  { id: "CLOSED", title: "Closed" },
  { id: "ARCHIVED", title: "Archived" },
]

const countryList = ["US"]

export function DeadlineBox({
  d,
  className,
  onEdit,
}: {
  className?: string
  d: Deadline
  onEdit?: (d: Deadline) => void
}) {
  return (
    <div
      className={
        "group flex cursor-pointer flex-row items-center justify-between rounded-[0.75rem] border-1 p-3 hover:bg-gray-100 dark:hover:bg-neutral-900" +
        " " +
        className
      }
    >
      <div className="flex flex-row items-center justify-start gap-2">
        <div className="size-4 rounded-full border-2"></div>
        <h1 className="text-[0.8rem] leading-tight">{d.title}</h1>
      </div>
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(d) }}
          className="ml-2 shrink-0 rounded p-1 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        >
          <Pencil className="size-3 text-muted-foreground" />
        </button>
      )}
    </div>
  )
}

export function MatterBox({ 
  m,
  allClients,
  allDeadlines = [],
  onEdit,
  onEditDeadline,
}: { 
  m: Matter;
  allClients: ApiClient[];
  allDeadlines?: Deadline[];
  onEdit?: (m: Matter) => void;
  onEditDeadline?: (d: Deadline) => void;
}) {
  const router = useRouter()
  return (
    <div
      className="group relative max-w-[25rem] min-w-[24rem] flex-1 cursor-pointer rounded-[1rem] border border-black/20 bg-transparent p-1 dark:border-white/10 dark:bg-neutral-800"
      onClick={() => router.push(`/matters/${m.id}`)}
    >
      {/* Edit button */}
      {onEdit && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(m) }}
          className="absolute top-2 left-2 z-10 rounded p-1.5 opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
        >
          <Pencil className="size-3.5 text-muted-foreground" />
        </button>
      )}
      <div className="absolute top-6 right-0 z-1 rounded-l-full border-y-1 border-l-1 border-black/20 bg-gray-200 py-1 pr-2 pl-3 dark:border-white/10 dark:bg-neutral-900">
        <h1 className="text-[0.8rem] font-medium">{m.status}</h1>
      </div>
      <div className="dark:bg-neutral-900:dis w-full rounded-[0.75rem] border-1 dark:bg-neutral-900">
        <div className="px-4 pt-6 pb-6">
          <Link
            href={`/clients/analytics`}
            className="text-[0.74rem] underline-offset-3 opacity-45 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {allClients.find((c) => c.id == m.client_id)?.name}
          </Link>
          <div className="mt-5 flex flex-col gap-3">
            <h1 className="text-[0.95rem] leading-tight">
              <span className="font-semibold">{m.type}</span>
              {": "}
              {m.title}
            </h1>
            <p className="text-[0.8rem] leading-tight opacity-60">{m.desc}</p>
            <div className="mt-5 grid w-fit grid-cols-4 grid-rows-2 gap-x-3 opacity-70">
              <h1 className="col-span-2 text-[0.9rem]">Filed Date: </h1>
              <h1 className="opacity-65dis col-span-2 text-[0.9rem] font-medium">
                {m.filling_date
                  ? m.filling_date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : "-"}{" "}
              </h1>
              <h1 className="col-span-2 text-[0.9rem]">Priority Date: </h1>
              <h1 className="opacity-65dis col-span-2 text-[0.9rem] font-medium">
                {m.priority_date
                  ? m.priority_date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : "-"}{" "}
              </h1>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col gap-2 p-1">
        <div className="flex flex-row items-center justify-between">
          <div className="ml-2 flex flex-row items-center justify-start gap-1 opacity-70">
            <TargetIcon className="size-4" />
            <h1 className="text-[0.9rem] font-medium">Deadlines</h1>
          </div>
        </div>

        <div className="flex max-h-[12rem] flex-col items-stretch justify-start gap-1 overflow-scroll">
          {allDeadlines
            .filter((x) => x.matter_id == m.id)
            .map((d, i) => (
              <DeadlineBox d={d} key={i} onEdit={onEditDeadline} />
            ))}
        </div>
      </div>
    </div>
  )
}

export default function MatterPage() {
  const { client } = useClient()
  const [search, setSearch] = useState("")
  const [type, setType] = useState<{ id: string; title: string } | null>(null)
  const [status, setStatus] = useState<{ id: string; title: string } | null>(null)
  const [country, setCountry] = useState("")
  const [archived, setArchived] = useState(false)

  // Sheet state
  const [matterSheet, setMatterSheet] = useState(false)
  const [editingMatter, setEditingMatter] = useState<ApiMatter | null>(null)
  const [deadlineSheet, setDeadlineSheet] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState<ApiDeadline | null>(null)

  const { data: rawMatters, loading: loadingMatters, error: errorMatters, refetch: refetchMatters } = useApi(api.matters)
  const { data: clientsData, loading: loadingClients, error: errorClients } = useApi(api.clients)
  const { data: rawDeadlines, loading: loadingDeadlines, error: errorDeadlines, refetch: refetchDeadlines } = useApi(api.deadlines)

  if (loadingMatters || loadingClients || loadingDeadlines) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
      </div>
    )
  }

  if (errorMatters || errorClients || errorDeadlines) {
    return <div className="p-8 text-red-500">Failed to load data</div>
  }

  const allClients = clientsData || []
  const rawApiMatters = rawMatters || []
  const mappedMatters: Matter[] = rawApiMatters.map((m: any) => ({
    ...m,
    filling_date: m.filing_date ? new Date(m.filing_date) : undefined,
    priority_date: m.priority_date ? new Date(m.priority_date) : undefined,
  }))

  const mappedDeadlines: Deadline[] = (rawDeadlines || []).map((d: any) => ({
    ...d,
    due_date: new Date(d.due_date),
    priorty: d.priority,
    fee_ammount: d.fee_amount,
    fee_curency: d.fee_currency,
  }))

  const handleEditMatter = (m: Matter) => {
    const raw = rawApiMatters.find((r: ApiMatter) => r.id === m.id) ?? null
    setEditingMatter(raw)
    setMatterSheet(true)
  }

  const handleEditDeadline = (d: Deadline) => {
    const raw = (rawDeadlines || []).find((r: ApiDeadline) => r.id === d.id) ?? null
    setEditingDeadline(raw)
    setDeadlineSheet(true)
  }

  return (
    <div className="relative flex flex-col items-center! justify-center">
      <TopNavBar className="sticky top-0">
        <div className="flex flex-col items-start justify-start gap-3 w-full">
          <div className="flex flex-row items-center justify-between w-full gap-2">
            <div className="flex flex-row items-center gap-2">
              <BriefcaseBusiness />
              <h1 className="font-medium">Matters</h1>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => { setEditingDeadline(null); setDeadlineSheet(true) }}>
                <Plus className="mr-1.5 size-3.5" /> New Deadline
              </Button>
              <Button size="sm" onClick={() => { setEditingMatter(null); setMatterSheet(true) }}>
                <Plus className="mr-1.5 size-3.5" /> New Matter
              </Button>
            </div>
          </div>
          <div className="flex flex-row items-center justify-start gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(x) => setSearch(x.target.value)}
            />
            <div className="flex flex-row items-center justify-start gap-1">
              <Select value={type as any} onValueChange={(x) => setType(x as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type">
                    {type?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {typesList.map((t, i) => (
                    <SelectItem value={t as any} key={i}>
                      {t.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {type && (
                <button
                  onClick={() => setType(null)}
                  className="rounded-full p-1 hover:bg-secondary"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
            <div className="flex flex-row items-center justify-start gap-1">
              <Select value={status as any} onValueChange={(x) => setStatus(x as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status">
                    {status?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statusList.map((s, i) => (
                    <SelectItem value={s as any} key={i}>
                      {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {status && (
                <button
                  onClick={() => setStatus(null)}
                  className="rounded-full p-1 hover:bg-secondary"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>
          </div>
        </div>
      </TopNavBar>

      <div className="m-2 flex max-w-[90%] flex-col items-stretch px-5 pt-4">
        <div className="flex w-fit flex-row flex-wrap justify-center gap-6">
          {mappedMatters
            .filter((x) =>
              client == "all-clients" ? true : x.client_id == client
            )
            .filter((x) => x.title.toLowerCase().includes(search.toLowerCase()))
            .filter((x) => (type ? x.type == type.id : true))
            .filter((x) => (status ? x.status == status.id : true))
            .filter((x) => (country ? x.country == country : true))
            .map((m, i) => (
              <MatterBox m={m} allClients={allClients} allDeadlines={mappedDeadlines} key={i} onEdit={handleEditMatter} onEditDeadline={handleEditDeadline} />
            ))}
        </div>
      </div>
      
      <MatterSheet
        open={matterSheet}
        onClose={() => setMatterSheet(false)}
        initial={editingMatter}
        clients={allClients}
        onSaved={() => { refetchMatters(); setMatterSheet(false) }}
      />
      <DeadlineSheet
        open={deadlineSheet}
        onClose={() => setDeadlineSheet(false)}
        initial={editingDeadline}
        matters={rawApiMatters}
        onSaved={() => { refetchDeadlines(); setDeadlineSheet(false) }}
      />
    </div>
  )
}
