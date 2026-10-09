"use client"

/**
 * MentionPicker
 *
 * Drop-in component that wraps a <textarea> and adds @-mention autocomplete.
 *
 * Usage:
 *   <MentionPicker
 *     value={prompt}
 *     onChange={setPrompt}
 *     onKeyDown={handleKeyDown}
 *     placeholder="…"
 *     className="…"
 *   />
 *
 * When the user types "@" a floating picker appears listing matters,
 * deadlines, clients, and users. Selecting one inserts a pill like:
 *   @Adaptive Neural Compression Codec
 * into the textarea and the full mention (with id) is available in the
 * resolved mentions list via onMentionsChange.
 */

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
  TextareaHTMLAttributes,
} from "react"
import {
  BriefcaseBusiness,
  Building2,
  Target,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  matters as allMatters,
  deadlines as allDeadlines,
  clients as allClients,
  users as allUsers,
} from "@/lib/data"

// ---------------------------------------------------------------------------
// Mention item types
// ---------------------------------------------------------------------------

export type MentionType = "matter" | "deadline" | "client" | "user"

export interface MentionItem {
  id: string
  type: MentionType
  label: string          // displayed in pill + picker
  sublabel?: string      // secondary info shown in picker
}

// Build a flat searchable list from static data
const ALL_MENTIONS: MentionItem[] = [
  ...allMatters.map((m) => ({
    id: m.id,
    type: "matter" as MentionType,
    label: m.title,
    sublabel: `${m.matter_number} · ${m.status}`,
  })),
  ...allDeadlines.map((d) => ({
    id: d.id,
    type: "deadline" as MentionType,
    label: d.title,
    sublabel: `Due ${d.due_date instanceof Date ? d.due_date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : d.due_date} · ${d.status}`,
  })),
  ...allClients.map((c) => ({
    id: c.id,
    type: "client" as MentionType,
    label: c.name,
    sublabel: c.primaryContactName,
  })),
  ...allUsers.map((u) => ({
    id: u.id,
    type: "user" as MentionType,
    label: u.name,
    sublabel: u.title,
  })),
]

// ---------------------------------------------------------------------------
// Icon + colour per mention type
// ---------------------------------------------------------------------------

const TYPE_META: Record<MentionType, { icon: React.ReactNode; color: string; bg: string }> = {
  matter: {
    icon: <BriefcaseBusiness className="size-3.5" />,
    color: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-100 dark:bg-violet-900/40",
  },
  deadline: {
    icon: <Target className="size-3.5" />,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/40",
  },
  client: {
    icon: <Building2 className="size-3.5" />,
    color: "text-sky-600 dark:text-sky-400",
    bg: "bg-sky-100 dark:bg-sky-900/40",
  },
  user: {
    icon: <User className="size-3.5" />,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-100 dark:bg-emerald-900/40",
  },
}

// ---------------------------------------------------------------------------
// Helper: find the active @-query inside the current value
// Returns { query, triggerIndex } or null if cursor is not inside @…
// ---------------------------------------------------------------------------

function findActiveMention(
  value: string,
  cursorPos: number
): { query: string; triggerIndex: number } | null {
  // Walk backward from cursor to find the last "@"
  const textBefore = value.slice(0, cursorPos)
  const atIdx = textBefore.lastIndexOf("@")
  if (atIdx === -1) return null

  // There must be no space between "@" and cursor (mention is a single token)
  const fragment = textBefore.slice(atIdx + 1)
  if (/\s/.test(fragment)) return null

  return { query: fragment.toLowerCase(), triggerIndex: atIdx }
}

// ---------------------------------------------------------------------------
// MentionPicker component
// ---------------------------------------------------------------------------

interface MentionPickerProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value: string
  onChange: (val: string) => void
  onMentionsChange?: (mentions: MentionItem[]) => void
}

export function MentionPicker({
  value,
  onChange,
  onMentionsChange,
  onKeyDown,
  className,
  ...rest
}: MentionPickerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Picker state
  const [pickerOpen, setPickerOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [triggerIndex, setTriggerIndex] = useState(-1)
  const [activeIndex, setActiveIndex] = useState(0)
  const [pickerPos, setPickerPos] = useState({ bottom: 0, left: 0 })

  // Resolved mentions (for parent to use in prompt enrichment)
  const [mentions, setMentions] = useState<MentionItem[]>([])

  // Filtered list
  const filtered = query
    ? ALL_MENTIONS.filter(
        (m) =>
          m.label.toLowerCase().includes(query) ||
          (m.sublabel?.toLowerCase() ?? "").includes(query)
      ).slice(0, 12)
    : ALL_MENTIONS.slice(0, 10)

  // ── Open/close picker based on cursor position ───────────────────────────

  const updatePicker = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    const result = findActiveMention(ta.value, ta.selectionStart ?? 0)
    if (result) {
      setQuery(result.query)
      setTriggerIndex(result.triggerIndex)
      setActiveIndex(0)
      setPickerOpen(true)

      // Position: above textarea
      const rect = ta.getBoundingClientRect()
      setPickerPos({
        bottom: window.innerHeight - rect.top + 8,
        left: rect.left,
      })
    } else {
      setPickerOpen(false)
    }
  }, [])

  // ── Insert selected mention ───────────────────────────────────────────────

  const selectMention = useCallback(
    (item: MentionItem) => {
      const ta = textareaRef.current
      if (!ta || triggerIndex === -1) return

      // Replace "@<query>" with "@LabelText "
      const before = value.slice(0, triggerIndex)
      const after = value.slice(ta.selectionStart ?? 0)
      const inserted = `@${item.label} `
      const newValue = before + inserted + after
      onChange(newValue)

      // Track resolved mentions
      const next = [...mentions.filter((m) => m.id !== item.id), item]
      setMentions(next)
      onMentionsChange?.(next)

      setPickerOpen(false)

      // Restore focus + move cursor after the inserted pill
      setTimeout(() => {
        ta.focus()
        const cursorAt = before.length + inserted.length
        ta.setSelectionRange(cursorAt, cursorAt)
      }, 0)
    },
    [value, triggerIndex, mentions, onChange, onMentionsChange]
  )

  // ── Keyboard navigation inside picker ────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (pickerOpen) {
        if (e.key === "ArrowDown") {
          e.preventDefault()
          setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
          return
        }
        if (e.key === "ArrowUp") {
          e.preventDefault()
          setActiveIndex((i) => Math.max(i - 1, 0))
          return
        }
        if (e.key === "Enter" || e.key === "Tab") {
          e.preventDefault()
          if (filtered[activeIndex]) selectMention(filtered[activeIndex])
          return
        }
        if (e.key === "Escape") {
          e.preventDefault()
          setPickerOpen(false)
          return
        }
      }
      onKeyDown?.(e)
    },
    [pickerOpen, filtered, activeIndex, selectMention, onKeyDown]
  )

  // ── Close picker on outside click ────────────────────────────────────────

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(e.target as Node) &&
        !textareaRef.current?.contains(e.target as Node)
      ) {
        setPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // ── Scroll active item into view ─────────────────────────────────────────

  useEffect(() => {
    const picker = pickerRef.current
    if (!picker) return
    const active = picker.querySelector(`[data-active="true"]`) as HTMLElement
    active?.scrollIntoView({ block: "nearest" })
  }, [activeIndex, pickerOpen])

  // ── Group filtered items by type for nicer display ───────────────────────

  const groups: { type: MentionType; items: MentionItem[] }[] = []
  const types: MentionType[] = ["matter", "deadline", "client", "user"]
  for (const t of types) {
    const items = filtered.filter((m) => m.type === t)
    if (items.length > 0) groups.push({ type: t, items })
  }

  // flat index mapping for keyboard nav
  const flatFiltered = groups.flatMap((g) => g.items)

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          updatePicker()
        }}
        onKeyDown={handleKeyDown}
        onClick={updatePicker}
        onFocus={updatePicker}
        className={className}
        {...rest}
      />

      {/* ── Picker dropdown ───────────────────────────────────────────── */}
      {pickerOpen && flatFiltered.length > 0 && (
        <div
          ref={pickerRef}
          className="absolute bottom-[calc(100%+0.5rem)] left-0 z-50 w-80 overflow-hidden rounded-xl border border-border bg-popover shadow-xl"
        >
          {/* Header */}
          <div className="border-b border-border/60 px-3 py-2">
            <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Mention — matters, deadlines, clients, users
            </p>
          </div>

          {/* Groups */}
          <div className="max-h-72 overflow-y-auto py-1">
            {groups.map(({ type, items }) => {
              const meta = TYPE_META[type]
              return (
                <div key={type}>
                  <div className="px-3 py-1.5">
                    <p className={cn("flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-widest", meta.color)}>
                      {meta.icon}
                      {type}s
                    </p>
                  </div>
                  {items.map((item) => {
                    const flatIdx = flatFiltered.indexOf(item)
                    const isActive = flatIdx === activeIndex
                    return (
                      <button
                        key={item.id}
                        data-active={isActive}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          selectMention(item)
                        }}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        className={cn(
                          "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors",
                          isActive ? "bg-accent" : "hover:bg-accent/50"
                        )}
                      >
                        {/* Type icon badge */}
                        <span
                          className={cn(
                            "flex size-6 shrink-0 items-center justify-center rounded-md",
                            meta.bg,
                            meta.color
                          )}
                        >
                          {meta.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[0.8rem] font-medium text-foreground">
                            {item.label}
                          </span>
                          {item.sublabel && (
                            <span className="block truncate text-[0.68rem] text-muted-foreground">
                              {item.sublabel}
                            </span>
                          )}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Footer hint */}
          <div className="border-t border-border/60 px-3 py-1.5">
            <p className="text-[0.65rem] text-muted-foreground">
              ↑↓ navigate · Enter/Tab select · Esc close
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
