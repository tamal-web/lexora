"use client"
import { Deadline, Matter } from "@/lib/models"
import { matters, deadlines } from "@/lib/data"
import { BriefcaseBusiness, CrossIcon, TargetIcon, X } from "lucide-react"
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
import { TopNavBar } from "@/components/TopNavBarComp"
import { useRouter } from "next/navigation"
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
}: {
  className?: string
  d: Deadline
}) {
  return (
    <div
      className={
        "flex cursor-pointer flex-row items-center justify-between rounded-[0.75rem] border-1 p-3 hover:bg-gray-100 dark:hover:bg-neutral-900" +
        " " +
        className
      }
    >
      <div className="flex flex-row items-center justify-start gap-2">
        <div className="size-4 rounded-full border-2"></div>
        <h1 className="text-[0.8rem] leading-tight">{d.title}</h1>
      </div>
    </div>
  )
}

export function MatterBox({ m }: { m: Matter }) {
  const router = useRouter()
  return (
    <div
      onClick={() => router.push(`/matters/${m.id}`)}
      className="relative max-w-[25rem] min-w-[24rem] flex-1 cursor-pointer rounded-[1rem] border border-black/20 bg-transparent p-1 dark:border-white/10 dark:bg-neutral-800"
    >
      <div className="absolute top-6 right-0 z-1 rounded-l-full border-y-1 border-l-1 border-black/20 bg-gray-200 py-1 pr-2 pl-3 dark:border-white/10 dark:bg-neutral-900">
        <h1 className="text-[0.8rem] font-medium">{m.status}</h1>
      </div>
      <div className="dark:bg-neutral-900:dis w-full rounded-[0.75rem] border-1 dark:bg-neutral-900">
        <div className="px-4 pt-6 pb-6">
          <Link
            href={""}
            className="text-[0.8rem] underline-offset-3 opacity-45 hover:underline"
          >
            {m.client_id}
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
          <div className="flex flex-row items-center justify-end gap-2"></div>
        </div>

        <div className="flex max-h-[12rem] flex-col items-stretch justify-start gap-1 overflow-scroll">
          {deadlines
            .filter((x) => x.matter_id == m.id)
            .map((d, i) => (
              <DeadlineBox d={d} key={i} />
            ))}
        </div>
      </div>
    </div>
  )
}

export default function MatterPage() {
  const { client } = useClient()
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [type, setType] = useState<{ id: string; title: string } | null>(null)
  const [status, setStatus] = useState<{ id: string; title: string } | null>(
    null
  )
  const [clients, setClients] = useState<string | null>(null)
  const [country, setCountry] = useState("")
  const [archived, setArchived] = useState(false)
  return (
    <div className="relative flex flex-col items-center! justify-center">
      <TopNavBar className="sticky top-0">
        <div className="flex flex-col items-start justify-start gap-3">
          <div className="flex flex-row items-center justify-start gap-2">
            <BriefcaseBusiness />
            <h1 className="font-medium">Matters</h1>
          </div>
          <div className="flex flex-row items-center justify-start gap-2">
            <Input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(x) => setSearch(x.target.value)}
            />
            <div className="flex flex-row items-center justify-start gap-1">
              <Select value={type} onValueChange={(x) => setType(x)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type">
                    {type?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {/*
              <SelectItem value={null}>Select Title</SelectItem>
               */}
                  {typesList.map((t, i) => (
                    <SelectItem value={t} key={i}>
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
              <Select value={status} onValueChange={(x) => setStatus(x)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status">
                    {status?.title}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {/*
              <SelectItem value={null}>Select Status</SelectItem>
                */}

                  {statusList.map((s, i) => (
                    <SelectItem value={s} key={i}>
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
          {matters
            .filter((x) => x.client_id == client)
            .filter((x) => x.title.toLowerCase().includes(search.toLowerCase()))
            .filter((x) => (type ? x.type == type.id : true))
            .filter((x) => (status ? x.status == status.id : true))
            .filter((x) => (country ? x.country == country : true))
            .map((m, i) => (
              <MatterBox m={m} key={i} />
            ))}
        </div>
      </div>
    </div>
  )
}
