"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Cpu,
  ExternalLink,
  FileText,
  Hammer,
  Loader2,
  Sparkles,
  Terminal,
  Wrench,
  Calendar,
  User,
  Building2,
  BriefcaseBusiness,
  Target,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export const API_BASE = "http://localhost:8000"

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type SSEEventType =
  "thinking" | "token" | "tool_call" | "tool_result" | "done" | "error"

export interface SSEEvent {
  type: SSEEventType
  node?: string
  data?: unknown
}

export interface ToolCallStep {
  id: string
  tool: string
  args: Record<string, unknown>
  result?: unknown
  status: "running" | "done" | "error"
}

export interface MessageBlock {
  id: string
  role: "user" | "assistant"
  content: string
  steps: ToolCallStep[]
  streaming: boolean
  error?: string
}

export interface ConversationMeta {
  id: string
  title: string
  created_at: string
  updated_at: string
  message_count: number
  last_message: string | null
  last_role: string | null
}

export interface ConversationDetail extends ConversationMeta {
  messages: ApiMessage[]
}

export interface ApiMessage {
  id: string
  conversation_id: string
  role: string
  content: string
  steps: ToolCallStep[]
  error: string | null
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat API helpers
// ─────────────────────────────────────────────────────────────────────────────

export async function apiCreateConversation(title?: string): Promise<{ id: string; title: string }> {
  const res = await fetch(`${API_BASE}/api/conversations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: title ?? "New Chat" }),
  })
  if (!res.ok) throw new Error("Failed to create conversation")
  return res.json()
}

export async function apiAppendMessage(
  convId: string,
  role: "user" | "assistant",
  content: string,
  steps?: ToolCallStep[],
  error?: string,
): Promise<void> {
  await fetch(`${API_BASE}/api/conversations/${convId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      role,
      content,
      steps_json: steps && steps.length > 0 ? JSON.stringify(steps) : undefined,
      error: error ?? undefined,
    }),
  })
}

export async function apiListConversations(): Promise<ConversationMeta[]> {
  const res = await fetch(`${API_BASE}/api/conversations`)
  if (!res.ok) throw new Error("Failed to fetch conversations")
  return res.json()
}

export async function apiGetConversation(id: string): Promise<ConversationDetail> {
  const res = await fetch(`${API_BASE}/api/conversations/${id}`)
  if (!res.ok) throw new Error("Conversation not found")
  return res.json()
}

export async function apiRenameConversation(id: string, title: string): Promise<void> {
  await fetch(`${API_BASE}/api/conversations/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  })
}

export async function apiDeleteConversation(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/conversations/${id}`, { method: "DELETE" })
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const finishSteps = (steps: ToolCallStep[]): ToolCallStep[] =>
  steps.map((s) =>
    s.status === "running" ? { ...s, status: "done" as const } : s
  )

/** Convert an ApiMessage (from the DB) into a MessageBlock (for the UI). */
export function apiMsgToBlock(m: ApiMessage): MessageBlock {
  return {
    id: m.id,
    role: m.role as "user" | "assistant",
    content: m.content,
    steps: m.steps ?? [],
    streaming: false,
    error: m.error ?? undefined,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main hook
// ─────────────────────────────────────────────────────────────────────────────

interface UseAgentChatOptions {
  /** If provided, messages are persisted under this conversation. */
  conversationId?: string
  /** Called when a new conversation is auto-created. */
  onConversationCreated?: (id: string) => void
  /** Initial messages to pre-load (e.g. from history). */
  initialMessages?: MessageBlock[]
}

export function useAgentChat(opts: UseAgentChatOptions = {}) {
  const { conversationId: externalConvId, onConversationCreated, initialMessages } = opts

  const [messages, setMessages] = useState<MessageBlock[]>(initialMessages ?? [])
  const [isStreaming, setIsStreaming] = useState(false)
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null)
  // The active conversation id — either passed in or created on first send
  const convIdRef = useRef<string | undefined>(externalConvId)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/`)
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false))
  }, [])

  // Keep ref in sync if the parent passes a new id
  useEffect(() => {
    if (externalConvId) convIdRef.current = externalConvId
  }, [externalConvId])

  const send = useCallback(
    async (text: string, context?: string) => {
      text = text.trim()
      if (!text || isStreaming) return

      // ── Ensure we have a conversation to write to ─────────────────────────
      if (!convIdRef.current) {
        try {
          const conv = await apiCreateConversation()
          convIdRef.current = conv.id
          onConversationCreated?.(conv.id)
        } catch {
          // silently continue even if chat persistence fails
        }
      }

      const assistantId = crypto.randomUUID()
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "user",
          content: text,
          steps: [],
          streaming: false,
        },
        {
          id: assistantId,
          role: "assistant",
          content: "",
          steps: [],
          streaming: true,
        },
      ])
      setIsStreaming(true)

      // ── Persist user message right away ───────────────────────────────────
      if (convIdRef.current) {
        apiAppendMessage(convIdRef.current, "user", text).catch(() => {})
      }

      const controller = new AbortController()
      abortRef.current = controller

      // We accumulate the full assistant reply here so we can save it once done
      let finalContent = ""
      let finalSteps: ToolCallStep[] = []
      let finalError: string | undefined

      try {
        const res = await fetch(`${API_BASE}/api/agent/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text, context: context || undefined }),
          signal: controller.signal,
        })

        if (!res.ok) throw new Error(`Backend error: ${res.status}`)
        if (!res.body) throw new Error("No response body")

        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split("\n")
          buffer = lines.pop() ?? ""

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue
            const raw = line.slice(6).trim()
            if (!raw) continue

            let event: SSEEvent
            try {
              event = JSON.parse(raw)
            } catch {
              continue
            }

            setMessages((prev) => {
              const next = [...prev]
              const idx = next.findIndex((m) => m.id === assistantId)
              if (idx === -1) return prev
              const msg = { ...next[idx] }

              if (event.type === "token") {
                const chunk = (event.data as string) ?? ""
                msg.content += chunk
                finalContent += chunk
              } else if (event.type === "tool_call") {
                const tc = (event.data ?? {}) as {
                  tool?: string; name?: string
                  args?: Record<string, unknown>; id?: string
                }
                const toolName = tc.tool || tc.name
                if (toolName) {
                  let i = tc.id
                    ? msg.steps.findIndex((s) => s.id === tc.id)
                    : -1
                  if (i === -1 && !tc.id)
                    i = msg.steps.findIndex((s) => s.tool === toolName && s.status === "running")
                  if (i === -1) {
                    msg.steps = [
                      ...msg.steps,
                      { id: tc.id || crypto.randomUUID(), tool: toolName, args: tc.args ?? {}, status: "running" },
                    ]
                  } else if (tc.args && Object.keys(tc.args).length > 0) {
                    msg.steps = msg.steps.map((s, k) => k === i ? { ...s, args: tc.args! } : s)
                  }
                }
              } else if (event.type === "tool_result") {
                const tr = (event.data ?? {}) as {
                  tool?: string; result?: unknown; tool_call_id?: string
                }
                let i = msg.steps.findIndex((s) => s.id === tr.tool_call_id)
                if (i === -1) i = msg.steps.findIndex((s) => s.tool === tr.tool && s.status === "running")
                if (i === -1) i = msg.steps.findIndex((s) => s.status === "running")
                if (i !== -1)
                  msg.steps = msg.steps.map((s, k) => k === i ? { ...s, result: tr.result, status: "done" as const } : s)
              } else if (event.type === "error") {
                finalError = typeof event.data === "string" ? event.data : "Something went wrong."
                msg.error = finalError
                msg.streaming = false
                msg.steps = finishSteps(msg.steps)
              } else if (event.type === "done") {
                msg.streaming = false
                msg.steps = finishSteps(msg.steps)
              }

              // Keep live snapshot for the final save
              finalSteps = finishSteps(msg.steps)
              next[idx] = msg
              return next
            })
          }
        }
      } catch (err: any) {
        if (err.name === "AbortError") return
        finalError = err.message?.includes("fetch")
          ? "Could not connect to the backend. Make sure it's running on port 8000."
          : err.message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, streaming: false, steps: finishSteps(m.steps), error: finalError }
              : m
          )
        )
      } finally {
        setIsStreaming(false)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, streaming: false, steps: finishSteps(m.steps) }
              : m
          )
        )

        // ── Persist assistant message once stream is finished ──────────────
        if (convIdRef.current && (finalContent || finalError)) {
          apiAppendMessage(
            convIdRef.current,
            "assistant",
            finalContent,
            finalSteps.length > 0 ? finalSteps : undefined,
            finalError,
          ).catch(() => {})
        }
      }
    },
    [isStreaming, onConversationCreated]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setIsStreaming(false)
    setMessages((prev) =>
      prev.map((m) =>
        m.streaming ? { ...m, streaming: false, steps: finishSteps(m.steps) } : m
      )
    )
  }, [])

  const clear = useCallback(() => {
    setMessages([])
    convIdRef.current = externalConvId
  }, [externalConvId])

  return {
    messages,
    isStreaming,
    backendOnline,
    send,
    stop,
    clear,
    conversationId: convIdRef.current,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tool icons + accordion card
// ─────────────────────────────────────────────────────────────────────────────

const TOOL_ICONS: Record<string, React.ReactNode> = {
  get_deadlines_for_date: <FileText className="size-3.5" />,
  get_upcoming_deadlines: <FileText className="size-3.5" />,
  get_overdue_deadlines: <FileText className="size-3.5" />,
  get_deadlines_for_matter: <FileText className="size-3.5" />,
  add_deadline: <Hammer className="size-3.5" />,
  update_deadline_status: <Wrench className="size-3.5" />,
  list_matters: <Terminal className="size-3.5" />,
  get_matter_details: <Terminal className="size-3.5" />,
  add_matter: <Hammer className="size-3.5" />,
  update_matter: <Wrench className="size-3.5" />,
  list_clients: <Terminal className="size-3.5" />,
  get_client_details: <Terminal className="size-3.5" />,
  add_client: <Hammer className="size-3.5" />,
  update_client: <Wrench className="size-3.5" />,
  get_matter_context_for_drafting: <FileText className="size-3.5" />,
  search_matters: <Terminal className="size-3.5" />,
  get_system_summary: <Cpu className="size-3.5" />,
}

const getToolIcon = (tool: string) =>
  TOOL_ICONS[tool] ?? <Wrench className="size-3.5" />

function ToolCallCard({ step }: { step: ToolCallStep }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="my-1 overflow-hidden rounded-lg border border-border/60 bg-muted/40 text-[0.78rem]">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full flex-row items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-muted/60"
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-background text-muted-foreground">
          {getToolIcon(step.tool)}
        </span>
        <span className="flex-1 font-mono font-medium text-foreground">
          {step.tool}
        </span>
        <span className="shrink-0">
          {step.status === "running" ? (
            <Loader2 className="size-3.5 animate-spin text-amber-500" />
          ) : (
            <CircleCheck className="size-3.5 text-emerald-500" />
          )}
        </span>
        <span className="shrink-0 text-muted-foreground">
          {expanded ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        </span>
      </button>

      {expanded && (
        <div className="space-y-2 border-t border-border/60 px-3 py-2">
          {Object.keys(step.args).length > 0 && (
            <div>
              <p className="mb-1 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">Arguments</p>
              <pre className="overflow-x-auto rounded bg-background p-2 text-[0.73rem] leading-relaxed text-foreground">
                {JSON.stringify(step.args, null, 2)}
              </pre>
            </div>
          )}
          {step.result !== undefined && (
            <div>
              <p className="mb-1 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">Result</p>
              <pre className="max-h-52 overflow-auto rounded bg-background p-2 text-[0.73rem] leading-relaxed text-foreground">
                {typeof step.result === "string" ? step.result : JSON.stringify(step.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Markdown formatter
// ─────────────────────────────────────────────────────────────────────────────

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

export function formatMarkdown(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1 py-0.5 font-mono text-xs">$1</code>')
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-semibold mt-3 mb-1">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-semibold mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold mt-3 mb-1">$1</h1>')
    .replace(/^[-*] (.+)$/gm, '<li class="ml-4 list-disc leading-relaxed">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal leading-relaxed">$1</li>')
    .replace(/^---$/gm, '<hr class="my-2 border-border" />')
    .replace(/\n\n/g, "</p><p class='mt-2'>")
    .replace(/^(.+)$/, "<p>$1</p>")
}

// ─────────────────────────────────────────────────────────────────────────────
// Result Cards
// ─────────────────────────────────────────────────────────────────────────────

const deadlineStatusColor: Record<string, string> = {
  DOCKETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  UPCOMING: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  DUE_SOON: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  OVERDUE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  EXTENDED: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  WAIVED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

const priorityBadge: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  STANDARD: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  SOFT: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

const matterStatusColor: Record<string, string> = {
  OPEN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  ON_HOLD: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  ABANDONED: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  CLOSED: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  ARCHIVED: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
}

function DeadlineResultCard({ d }: { d: Record<string, any> }) {
  const router = useRouter()
  const statusCls = deadlineStatusColor[d.status] ?? "bg-muted text-muted-foreground"
  const priorityCls = priorityBadge[d.priority] ?? "bg-muted text-muted-foreground"

  return (
    <div
      onClick={() => d.matter_id && router.push(`/matters/${d.matter_id}`)}
      className="group cursor-pointer rounded-xl border border-border/70 bg-card p-3.5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:hover:border-violet-700"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Target className="size-3.5 shrink-0 text-violet-500" />
          <span className="text-[0.82rem] font-semibold leading-tight text-foreground">{d.title}</span>
        </div>
        <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {d.matter_title && (
        <p className="mb-2 text-[0.72rem] text-muted-foreground">
          Matter: <span className="font-medium text-foreground">{d.matter_title}</span>
        </p>
      )}
      <div className="mb-2 flex flex-wrap gap-1.5">
        <span className={cn("rounded-full px-2 py-0.5 text-[0.68rem] font-medium", statusCls)}>{d.status}</span>
        {d.priority && <span className={cn("rounded-full px-2 py-0.5 text-[0.68rem] font-medium", priorityCls)}>{d.priority}</span>}
        {d.action_type && <span className="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] text-muted-foreground">{d.action_type.replace(/_/g, " ")}</span>}
      </div>
      {d.due_date && (
        <div className="flex items-center gap-1.5 text-[0.73rem]">
          <Calendar className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Due:</span>
          <span className="font-medium text-foreground">{d.due_date}</span>
        </div>
      )}
    </div>
  )
}

function MatterResultCard({ m }: { m: Record<string, any> }) {
  const router = useRouter()
  const statusCls = matterStatusColor[m.status] ?? "bg-muted text-muted-foreground"

  return (
    <div
      onClick={() => m.id && router.push(`/matters/${m.id}`)}
      className="group cursor-pointer rounded-xl border border-border/70 bg-card p-3.5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:hover:border-violet-700"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <BriefcaseBusiness className="size-3.5 shrink-0 text-violet-500" />
          <span className="text-[0.82rem] font-semibold leading-tight text-foreground">{m.title}</span>
        </div>
        <ExternalLink className="size-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      {m.client_name && (
        <p className="mb-2 text-[0.72rem] text-muted-foreground">
          Client: <span className="font-medium text-foreground">{m.client_name}</span>
        </p>
      )}
      <div className="mb-2 flex flex-wrap gap-1.5">
        <span className={cn("rounded-full px-2 py-0.5 text-[0.68rem] font-medium", statusCls)}>{m.status}</span>
        {m.type && <span className="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] text-muted-foreground">{m.type.replace(/_/g, " ")}</span>}
        {m.country && <span className="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] font-medium text-foreground">{m.country}</span>}
      </div>
      {m.matter_number && (
        <p className="text-[0.72rem] text-muted-foreground">
          # <span className="font-mono font-medium text-foreground">{m.matter_number}</span>
        </p>
      )}
      {m.filing_date && (
        <div className="mt-1 flex items-center gap-1.5 text-[0.73rem]">
          <Calendar className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">Filed:</span>
          <span className="font-medium text-foreground">{m.filing_date}</span>
        </div>
      )}
    </div>
  )
}

function ClientResultCard({ c }: { c: Record<string, any> }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-sm transition-all hover:border-violet-300 hover:shadow-md dark:hover:border-violet-700">
      <div className="mb-2 flex items-center gap-1.5">
        <Building2 className="size-3.5 shrink-0 text-violet-500" />
        <span className="text-[0.82rem] font-semibold text-foreground">{c.name}</span>
      </div>
      {c.primary_contact_name && (
        <div className="flex items-center gap-1.5 text-[0.72rem]">
          <User className="size-3 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">{c.primary_contact_name}</span>
          {c.primary_contact_email && <span className="text-muted-foreground">· {c.primary_contact_email}</span>}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ data }: { data: Record<string, any> }) {
  return (
    <div className="rounded-xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-1.5">
        <Cpu className="size-3.5 text-violet-500" />
        <span className="text-[0.82rem] font-semibold text-foreground">System Summary</span>
        <span className="ml-auto text-[0.7rem] text-muted-foreground">{data.current_date}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {[
          { label: "Total Matters", value: data.total_matters },
          { label: "Total Clients", value: data.total_clients },
          { label: "Total Deadlines", value: data.total_deadlines },
          { label: "Overdue", value: data.overdue_deadlines, warn: data.overdue_deadlines > 0 },
          { label: "Due This Week", value: data.due_this_week, warn: data.due_this_week > 0 },
          { label: "Critical Open", value: data.critical_open_deadlines, warn: data.critical_open_deadlines > 0 },
        ].map(({ label, value, warn }) => (
          <div key={label} className={cn("rounded-lg border px-3 py-2", warn ? "border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-900/20" : "border-border/60 bg-muted/30")}>
            <p className="text-[0.68rem] text-muted-foreground">{label}</p>
            <p className={cn("text-xl font-bold", warn ? "text-amber-600 dark:text-amber-400" : "text-foreground")}>{value ?? "-"}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function extractResultEntities(steps: ToolCallStep[]) {
  const deadlines: Record<string, any>[] = []
  const matters: Record<string, any>[] = []
  const clients: Record<string, any>[] = []
  let summary: Record<string, any> | null = null

  for (const step of steps) {
    if (step.status !== "done" || !step.result) continue
    let parsed: any = step.result
    if (typeof parsed === "string") {
      try { parsed = JSON.parse(parsed) } catch { continue }
    }
    if (step.tool.includes("deadline") || ["get_deadlines_for_date","get_upcoming_deadlines","get_overdue_deadlines","get_deadlines_for_matter"].includes(step.tool)) {
      if (parsed?.deadlines && Array.isArray(parsed.deadlines)) deadlines.push(...parsed.deadlines)
    }
    if (["list_matters","search_matters"].includes(step.tool)) {
      if (parsed?.matters && Array.isArray(parsed.matters)) matters.push(...parsed.matters)
    }
    if (["get_matter_details","get_matter_context_for_drafting"].includes(step.tool)) {
      if (parsed?.id) matters.push(parsed)
      if (parsed?.matter?.id) matters.push(parsed.matter)
    }
    if (step.tool === "list_clients") {
      if (parsed?.clients && Array.isArray(parsed.clients)) clients.push(...parsed.clients)
    }
    if (step.tool === "get_client_details" && parsed?.id) clients.push(parsed)
    if (step.tool === "get_system_summary") summary = parsed
  }
  return { deadlines, matters, clients, summary }
}

export function ResultCards({ steps }: { steps: ToolCallStep[] }) {
  const { deadlines, matters, clients, summary } = extractResultEntities(steps)
  const hasCards = deadlines.length > 0 || matters.length > 0 || clients.length > 0 || !!summary
  if (!hasCards) return null

  return (
    <div className="mt-3 space-y-4">
      {summary && <SummaryCard data={summary} />}
      {deadlines.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
            <Target className="size-3" />{deadlines.length} Deadline{deadlines.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-2">
            {deadlines.map((d, i) => <DeadlineResultCard key={d.id ?? i} d={d} />)}
          </div>
        </div>
      )}
      {matters.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
            <BriefcaseBusiness className="size-3" />{matters.length} Matter{matters.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-2">
            {matters.map((m, i) => <MatterResultCard key={m.id ?? i} m={m} />)}
          </div>
        </div>
      )}
      {clients.length > 0 && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">
            <Building2 className="size-3" />{clients.length} Client{clients.length > 1 ? "s" : ""}
          </p>
          <div className="grid gap-2">
            {clients.map((c, i) => <ClientResultCard key={c.id ?? i} c={c} />)}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Message bubble
// ─────────────────────────────────────────────────────────────────────────────

export function MessageBubble({ msg }: { msg: MessageBlock }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-primary-foreground">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-background shadow-sm">
        <Sparkles className="size-3.5 text-violet-500" />
      </div>
      <div className="min-w-0 flex-1">
        {msg.steps.length > 0 && (
          <div className="mb-2 space-y-1">
            <p className="mb-1 text-[0.7rem] font-semibold tracking-wider text-muted-foreground uppercase">Agent Steps</p>
            {msg.steps.map((step) => <ToolCallCard key={step.id} step={step} />)}
          </div>
        )}

        {!msg.streaming && <ResultCards steps={msg.steps} />}

        {(msg.content || msg.streaming) && (
          <div className="mt-2 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-4 py-3 shadow-sm">
            {msg.content ? (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-[0.88rem] leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
              />
            ) : null}
            {msg.streaming && (
              <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" />
                <span>Thinking…</span>
              </span>
            )}
          </div>
        )}

        {msg.error && (
          <div className="mt-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {msg.error}
          </div>
        )}
      </div>
    </div>
  )
}
