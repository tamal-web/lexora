"use client"

import * as React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { UserRound, Send } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// ---------------------------------------------------------------------------
// Types + hardcoded data (swap this out for real group members later)
// ---------------------------------------------------------------------------

interface User {
  id: string
  name: string
  avatarUrl?: string
}

const USERS: User[] = [
  { id: "1", name: "Tamal Krishna", avatarUrl: "" },
  { id: "2", name: "Parul Rastogi", avatarUrl: "" },
  {
    id: "3",
    name: "Aditi Sharma",
    avatarUrl: "https://i.pravatar.cc/150?img=5",
  },
  {
    id: "4",
    name: "Rohan Mehta",
    avatarUrl: "https://i.pravatar.cc/150?img=8",
  },
  { id: "5", name: "Ishaan Kapoor", avatarUrl: "" },
]

// Raw SVG for the lucide "UserRound" icon, used for chips inserted
// imperatively into the DOM (can't mount a React component there directly).
const USER_ROUND_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M18 20a6 6 0 0 0-12 0"/>
  <circle cx="12" cy="10" r="4"/>
</svg>`

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface MentionInputProps {
  onSend?: (text: string, mentionedUserIds: string[]) => void
}

export default function MentionInput({ onSend }: MentionInputProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [activeIndex, setActiveIndex] = useState(0)
  const [coords, setCoords] = useState({ top: 0, left: 0 })

  const filtered = USERS.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 6)

  // -------------------------------------------------------------------------
  // Detect "@query" typed right before the caret, and position the dropdown
  // -------------------------------------------------------------------------
  const checkForMentionTrigger = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !editorRef.current) {
      setOpen(false)
      return
    }

    const range = sel.getRangeAt(0)
    if (!editorRef.current.contains(range.endContainer)) {
      setOpen(false)
      return
    }

    // Grab all text from the start of the editor up to the caret.
    const preRange = range.cloneRange()
    preRange.selectNodeContents(editorRef.current)
    preRange.setEnd(range.endContainer, range.endOffset)
    const textBeforeCursor = preRange.toString()

    const match = textBeforeCursor.match(/(?:^|\s)@([a-zA-Z0-9_]*)$/)

    if (!match) {
      setOpen(false)
      return
    }

    setQuery(match[1])
    setActiveIndex(0)
    setOpen(true)

    // Position the dropdown just under the caret.
    const rects = range.getClientRects()
    const rect = rects[rects.length - 1] ?? range.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (rect && containerRect) {
      setCoords({
        top: rect.bottom - containerRect.top + 6,
        left: rect.left - containerRect.left,
      })
    }
  }, [])

  const handleInput = () => checkForMentionTrigger()

  // -------------------------------------------------------------------------
  // Insert a chip at the current "@query" location
  // -------------------------------------------------------------------------
  const insertMention = useCallback((user: User) => {
    const sel = window.getSelection()
    if (!sel || !sel.rangeCount || !editorRef.current) return

    const range = sel.getRangeAt(0)
    const textNode = range.endContainer
    if (textNode.nodeType !== Node.TEXT_NODE) return

    const text = textNode.textContent ?? ""
    const cursorOffset = range.endOffset
    const textBefore = text.slice(0, cursorOffset)
    const match = textBefore.match(/@([a-zA-Z0-9_]*)$/)
    if (!match) return

    const startOffset = cursorOffset - match[0].length
    const beforeText = text.slice(0, startOffset)
    const afterText = text.slice(cursorOffset)

    const parent = textNode.parentNode
    if (!parent) return

    // Build the chip (non-editable so it acts as a single atomic token)
    const chip = document.createElement("span")
    chip.contentEditable = "false"
    chip.dataset.mentionId = user.id
    chip.dataset.mentionName = user.name
    chip.className =
      "inline-flex items-center gap-1.5 bg-neutral-900 text-white text-sm px-2 py-1 rounded-full align-middle select-none mx-0.5"

    const avatarWrap = document.createElement("span")
    avatarWrap.className =
      "flex items-center justify-center h-4 w-4 rounded-full overflow-hidden bg-neutral-700 shrink-0"

    if (user.avatarUrl) {
      const img = document.createElement("img")
      img.src = user.avatarUrl
      img.alt = user.name
      img.className = "h-full w-full object-cover"
      avatarWrap.appendChild(img)
    } else {
      avatarWrap.innerHTML = USER_ROUND_SVG
    }

    const nameSpan = document.createElement("span")
    nameSpan.textContent = user.name

    chip.appendChild(avatarWrap)
    chip.appendChild(nameSpan)

    // Split the text node around the match and splice the chip in
    const beforeNode = document.createTextNode(beforeText)
    // A trailing space/nbsp keeps the caret from getting "stuck" inside the chip
    const afterNode = document.createTextNode(
      afterText.startsWith(" ") ? afterText : "\u00A0" + afterText
    )

    parent.replaceChild(afterNode, textNode)
    parent.insertBefore(chip, afterNode)
    parent.insertBefore(beforeNode, chip)

    // Move caret to just after the inserted space, inside afterNode
    const newRange = document.createRange()
    newRange.setStart(afterNode, 1)
    newRange.collapse(true)
    sel.removeAllRanges()
    sel.addRange(newRange)

    setOpen(false)
    editorRef.current.focus()
  }, [])

  // -------------------------------------------------------------------------
  // Keyboard handling: navigate dropdown, or send on Enter
  // -------------------------------------------------------------------------
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (open) {
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
        if (filtered[activeIndex]) insertMention(filtered[activeIndex])
        return
      }
      if (e.key === "Escape") {
        setOpen(false)
        return
      }
    }

    if (e.key === "Enter" && !e.shiftKey && !open) {
      e.preventDefault()
      handleSend()
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", onClick)
    return () => document.removeEventListener("mousedown", onClick)
  }, [])

  // -------------------------------------------------------------------------
  // Serialize contentEditable content -> plain text + mention id list
  // -------------------------------------------------------------------------
  const handleSend = () => {
    if (!editorRef.current) return
    let text = ""
    const mentionIds: string[] = []

    editorRef.current.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        text += node.textContent ?? ""
      } else if (node instanceof HTMLElement && node.dataset.mentionId) {
        text += `@${node.dataset.mentionName}`
        mentionIds.push(node.dataset.mentionId)
      }
    })

    text = text.trim()
    if (!text) return

    onSend?.(text, mentionIds)
    editorRef.current.innerHTML = ""
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-lg">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onKeyUp={checkForMentionTrigger}
        onClick={checkForMentionTrigger}
        data-placeholder="Type a message… use @ to mention someone"
        className={cn(
          "min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm",
          "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
          "leading-6 break-words whitespace-pre-wrap",
          "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]"
        )}
      />

      {open && filtered.length > 0 && (
        <div
          className="absolute z-50 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ top: coords.top, left: coords.left }}
        >
          {filtered.map((user, i) => (
            <button
              key={user.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault() // keep editor focus/caret
                insertMention(user)
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm",
                i === activeIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-800 text-white">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound className="h-3.5 w-3.5" />
                )}
              </span>
              <span>{user.name}</span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-2 flex justify-end">
        <Button size="sm" onClick={handleSend}>
          <Send className="mr-1 h-4 w-4" />
          Send
        </Button>
      </div>
    </div>
  )
}
