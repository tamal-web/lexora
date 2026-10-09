"use client"

import * as React from "react"
import { Folder, FolderOpen, ChevronRight, ChevronDown, Loader2 } from "lucide-react"
import { useApi } from "@/lib/use-api"
import { api } from "@/lib/api"
import Link from "next/link"

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

function MatterNode({ m }: { m: { id: string; title: string; status: string } }) {
  return (
    <Link
      href={`/matters/${m.id}`}
      className="flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium transition-colors select-none hover:bg-accent hover:text-accent-foreground"
    >
      <div className="rounded-sm p-0.5 text-muted-foreground/70 hover:bg-muted"></div>
      <FolderOpen className="size-4! fill-purple-400/20 text-purple-400" />
      <span className="line-clamp-1 text-[0.8rem]">{m.title}</span>
      <span className="ml-auto text-[0.7rem] text-muted-foreground opacity-60">{m.status}</span>
    </Link>
  )
}

function FileTreeNode({
  title,
  id,
  matters,
}: {
  title: string
  id: string
  matters: { id: string; title: string; type: string; status: string }[]
}) {
  const [isOpen, setIsOpen] = React.useState(false)
  const filtered = matters.filter((m) => m.type === id)
  if (filtered.length === 0) return null

  return (
    <div className="w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex cursor-pointer items-center gap-1 rounded-sm px-2 py-1 text-sm font-medium transition-colors select-none hover:bg-accent hover:text-accent-foreground"
      >
        <div className="rounded-sm p-0.5 text-muted-foreground/70 hover:bg-muted">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </div>

        {isOpen ? (
          <FolderOpen className="h-4 w-4 fill-purple-400/20 text-purple-400" />
        ) : (
          <Folder className="h-4 w-4 fill-purple-400/20 text-purple-400" />
        )}

        <span>{title}</span>
        <span className="ml-auto text-[0.7rem] text-muted-foreground opacity-60">{filtered.length}</span>
      </div>

      {isOpen && (
        <div className="relative mt-0.5 ml-[14px] flex flex-col gap-0.5 border-l border-border/60 pl-4">
          {filtered.map((m, index) => (
            <MatterNode m={m} key={index} />
          ))}
        </div>
      )}
    </div>
  )
}

export function MatterTree() {
  const { data: rawMatters, loading } = useApi(api.matters)
  const matters = (rawMatters || []) as { id: string; title: string; type: string; status: string }[]

  if (loading) {
    return (
      <div className="flex w-72 items-center justify-center py-4">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="w-72">
      <div className="flex flex-col gap-0.5">
        {typesList.map((t, index) => (
          <FileTreeNode key={index} title={t.title} id={t.id} matters={matters} />
        ))}
      </div>
    </div>
  )
}
