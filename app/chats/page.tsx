"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  Clock,
  Loader2,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { TopNavBar } from "@/components/TopNavBarComp"
import {
  apiListConversations,
  apiCreateConversation,
  apiDeleteConversation,
  ConversationMeta,
} from "@/components/agent-chat"
import { cn } from "@/lib/utils"

function timeAgo(iso: string): string {
  const now = Date.now()
  const then = new Date(iso).getTime()
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export default function ChatsPage() {
  const router = useRouter()
  const [convs, setConvs] = useState<ConversationMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      const data = await apiListConversations()
      setConvs(data)
    } catch {
      setError("Could not load chats. Make sure the backend is running on port 8000.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const createNew = async () => {
    setCreating(true)
    try {
      const conv = await apiCreateConversation("New Chat")
      router.push(`/chats/${conv.id}`)
    } catch {
      setCreating(false)
    }
  }

  const del = async (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm("Delete this conversation?")) return
    setDeleting(id)
    await apiDeleteConversation(id)
    setConvs((prev) => prev.filter((c) => c.id !== id))
    setDeleting(null)
  }

  return (
    <div className="flex flex-col">
      <TopNavBar className="sticky top-0 z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-4" />
            <h1 className="font-medium">AI Chats</h1>
          </div>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={createNew}
            disabled={creating}
          >
            {creating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Plus className="size-3.5" />
            )}
            New chat
          </Button>
        </div>
      </TopNavBar>

      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Empty */}
        {!loading && !error && convs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-border bg-muted/40">
              <Sparkles className="size-7 text-violet-500" />
            </div>
            <h2 className="text-lg font-semibold">No chats yet</h2>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Start a conversation with Lexora AI from the home dashboard.
            </p>
            <Button className="mt-6 gap-1.5" onClick={createNew} disabled={creating}>
              {creating ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
              Start new chat
            </Button>
          </div>
        )}

        {/* List */}
        {!loading && convs.length > 0 && (
          <div className="space-y-2">
            {convs.map((conv) => (
              <Link
                key={conv.id}
                href={`/chats/${conv.id}`}
                className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-3.5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:hover:border-violet-700"
              >
                {/* Icon */}
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40">
                  <Sparkles className="size-4 text-violet-500" />
                </div>

                {/* Text */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[0.875rem] font-semibold text-foreground">
                      {conv.title}
                    </p>
                    <span className="shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] text-muted-foreground">
                      {conv.message_count} msg{conv.message_count !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className="mt-0.5 truncate text-[0.78rem] text-muted-foreground">
                      <span className={cn(
                        "mr-1 font-medium",
                        conv.last_role === "assistant" ? "text-violet-500" : "text-foreground"
                      )}>
                        {conv.last_role === "assistant" ? "AI:" : "You:"}
                      </span>
                      {conv.last_message}
                    </p>
                  )}
                </div>

                {/* Time + actions */}
                <div className="flex shrink-0 items-center gap-2">
                  <div className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
                    <Clock className="size-3" />
                    {timeAgo(conv.updated_at)}
                  </div>
                  <button
                    onClick={(e) => del(e, conv.id)}
                    className="rounded-md p-1 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                    title="Delete conversation"
                  >
                    {deleting === conv.id ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                  </button>
                  <ChevronRight className="size-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
