import { notFound } from "next/navigation"
import type { Matter } from "@/lib/models"
import { MatterDetail } from "./matter-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getMatter(id: string): Promise<Matter> {
  const res = await fetch(`http://localhost:8000/api/matters/${id}`, { cache: "no-store" })
  if (!res.ok) {
    if (res.status === 404) notFound()
    throw new Error("Failed to fetch matter")
  }
  const m = await res.json()
  
  return {
    ...m,
    filling_date: m.filing_date ? new Date(m.filing_date) : undefined,
    priority_date: m.priority_date ? new Date(m.priority_date) : undefined,
  } as Matter
}

export default async function MatterPage({ params }: PageProps) {
  const { id } = await params
  const matter = await getMatter(id)

  return <MatterDetail matter={matter} />
}
