"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  Edit2,
  Loader2,
  MessageSquare,
  Sparkles,
  Check,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChatInterface } from "@/components/chat-interface"
import {
  apiGetConversation,
  apiRenameConversation,
  apiDeleteConversation,
  apiMsgToBlock,
  ConversationDetail,
  MessageBlock,
} from "@/components/agent-chat"

export default function ChatDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [conv, setConv] = useState<ConversationDetail | null>(null)
  const [initialMessages, setInitialMessages] = useState<MessageBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Rename state
  const [editing, setEditing] = useState(false)
  const [titleInput, setTitleInput] = useState("")
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    apiGetConversation(id)
      .then((data) => {
        setConv(data)
        setTitleInput(data.title)
        setInitialMessages(data.messages.map(apiMsgToBlock))

        // Check if there is an initial prompt handed off from the home page
        const initData = sessionStorage.getItem("init_prompt_" + id)
        if (initData) {
          sessionStorage.removeItem("init_prompt_" + id)
          try {
            const parsed = JSON.parse(initData)
            if (parsed.text) {
              // We set a flag or just use a ref to trigger send inside ChatInterface
              // But we don't have direct access to 'send' here because ChatInterface owns the hook.
              // We can pass it as a prop to ChatInterface!
              setPendingPrompt(parsed)
            }
          } catch {}
        }
      })
      .catch(() => setError("Conversation not found or backend is offline."))
      .finally(() => setLoading(false))
  }, [id])

  const [pendingPrompt, setPendingPrompt] = useState<{ text: string; context?: string } | null>(null)

  const saveTitle = async () => {
    if (!titleInput.trim() || !conv) return
    setSaving(true)
    await apiRenameConversation(id, titleInput.trim())
    setConv((c) => c ? { ...c, title: titleInput.trim() } : c)
    setEditing(false)
    setSaving(false)
  }

  const deleteConv = async () => {
    if (!confirm("Delete this conversation permanently?")) return
    await apiDeleteConversation(id)
    router.push("/chats")
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !conv) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <MessageSquare className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{error ?? "Conversation not found."}</p>
        <Button variant="outline" size="sm" onClick={() => router.push("/chats")}>
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to chats
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          className="size-7 shrink-0"
          onClick={() => router.push("/chats")}
        >
          <ArrowLeft className="size-3.5" />
        </Button>

        <div className="flex size-7 items-center justify-center rounded-full border border-border bg-muted/40">
          <Sparkles className="size-3.5 text-violet-500" />
        </div>

        {/* Title / inline editor */}
        {editing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") setEditing(false) }}
              className="h-7 flex-1 text-sm"
              autoFocus
            />
            <Button size="icon" variant="ghost" className="size-7" onClick={saveTitle} disabled={saving}>
              {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5 text-emerald-600" />}
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <h1 className="truncate text-sm font-semibold text-foreground">{conv.title}</h1>
            <button
              onClick={() => setEditing(true)}
              className="shrink-0 rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100 hover:opacity-100"
              title="Rename"
            >
              <Edit2 className="size-3" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-1 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground">
            {conv.messages.length} messages
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 text-muted-foreground hover:text-destructive"
            onClick={deleteConv}
            title="Delete conversation"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* ── Chat area ───────────────────────────────────────────────────── */}
      <ChatInterface
        conversationId={id}
        initialMessages={initialMessages}
        title={conv.title}
        autoSendPrompt={pendingPrompt}
      />
    </div>
  )
}
