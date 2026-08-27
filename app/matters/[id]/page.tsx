import { notFound } from "next/navigation"

import { matters } from "@/lib/data"
import type { Matter } from "@/lib/models"

import { MatterDetail } from "./matter-detail"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getMatter(id: string): Promise<Matter> {
  const matter = matters.find((item) => item.id === id)

  if (!matter) {
    notFound()
  }

  return matter
}

export default async function MatterPage({ params }: PageProps) {
  const { id } = await params
  const matter = await getMatter(id)

  return <MatterDetail matter={matter} />
}
