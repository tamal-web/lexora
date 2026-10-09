"use client"

/**
 * Reusable full-page chat interface — used by both /chats/[id]
 * and (in future) anywhere you want an embedded agent chat.
 *
 * Props:
 *  conversationId  — existing conversation to load & continue
 *  initialMessages — pre-loaded messages from the server
 *  title           — displayed in the header
 */

import { useEffect, useRef, useState } from "react"
import {
  ArrowUp,
  AtSignIcon,
  FileIcon,
  MailIcon,
  Mic,
  Pause,
  PlusIcon,
  RotateCcw,
  Sparkles,
  Square,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { BorderBeam } from "border-beam"
import { MetalFx } from "metal-fx"
import { Liquid } from "liquid-gooey"
import { useTheme } from "next-themes"
import { MessageBubble, MessageBlock, useAgentChat } from "@/components/agent-chat"
import { MentionPicker, MentionItem } from "@/components/mention-picker"
import { cn } from "@/lib/utils"

interface ChatInterfaceProps {
  conversationId: string
  initialMessages?: MessageBlock[]
  title?: string
  autoSendPrompt?: { text: string; context?: string } | null
}

export function ChatInterface({ conversationId, initialMessages, title, autoSendPrompt }: ChatInterfaceProps) {
  const { resolvedTheme } = useTheme()
  const { messages, isStreaming, send, stop, clear } = useAgentChat({
    conversationId,
    initialMessages: initialMessages ?? [],
  })

  const [open, setOpen] = useState(false)
  const [speechStarted, setSpeechStarted] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [context, setContext] = useState("")
  const [mentions, setMentions] = useState<MentionItem[]>([])
  const recognitionRef = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasAutoSent = useRef(false)

  // auto-send handed off prompt
  useEffect(() => {
    if (autoSendPrompt && !hasAutoSent.current) {
      hasAutoSent.current = true
      send(autoSendPrompt.text, autoSendPrompt.context)
    }
  }, [autoSendPrompt, send])

  // auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages])

  // speech
  useEffect(() => {
    const SR = typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    if (!SR) return
    const rec = new SR()
    rec.lang = "en-US"
    rec.continuous = false
    rec.interimResults = true
    rec.onstart = () => setSpeechStarted(true)
    rec.onend = () => setSpeechStarted(false)
    rec.onerror = () => setSpeechStarted(false)
    rec.onresult = (e: any) => {
      let t = ""
      for (let i = e.resultIndex; i < e.results.length; ++i)
        if (e.results[i].isFinal) t += e.results[i][0].transcript + " "
      if (t) setPrompt((p) => p + t)
    }
    recognitionRef.current = rec
    return () => rec.stop()
  }, [])

  const toggleSpeak = () => {
    if (!recognitionRef.current) return
    if (speechStarted) recognitionRef.current.stop()
    else try { recognitionRef.current.start() } catch {}
  }

  const submit = () => {
    if (isStreaming) return stop()
    const text = prompt.trim()
    if (!text) return
    setPrompt("")
    let mentionCtx = context
    if (mentions.length > 0) {
      const lines = mentions.map((m) => `- @${m.label} → type: ${m.type}, id: ${m.id}`)
      mentionCtx = (mentionCtx + `\n\n[Mentioned entities]\n${lines.join("\n")}`).trim()
    }
    send(text, mentionCtx || undefined)
    setMentions([])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit() }
  }

  const attachContext = () => {
    const text = window.prompt("Paste email or document text:")
    if (text) setContext(text)
    setOpen(false)
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      {/* bg glow */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8376EE] opacity-60 blur-[9rem] dark:bg-[#6759D3] dark:opacity-40" />
      </div>

      {/* Messages */}
      <div className="relative z-1 flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
                <Sparkles className="size-6 text-violet-500" />
              </div>
              <h3 className="text-base font-semibold">Continue the conversation</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">
                Type a prompt below to continue chatting with Lexora AI.
              </p>
            </div>
          )}
          <div className="space-y-5 pb-40">
            {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            <div ref={bottomRef} />
          </div>
        </div>
      </div>

      {/* Sticky prompt bar */}
      <div className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center gap-2 bg-gradient-to-t from-background via-background/90 to-transparent px-4 pt-6 pb-4">
        {context && (
          <div className="flex w-full max-w-[34rem] items-start gap-2 rounded-lg border border-border/60 bg-white p-2 text-xs dark:bg-neutral-900">
            <FileIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <p className="line-clamp-2 flex-1 text-muted-foreground">{context}</p>
            <button onClick={() => setContext("")} className="shrink-0 text-muted-foreground hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <BorderBeam strength={speechStarted || isStreaming ? 1 : 0} className="w-full max-w-[34rem] overflow-visible!">
          <div className="relative flex w-full flex-col rounded-[1.5rem] border border-border/80 bg-white p-3 shadow-[0_0_13px_rgba(0,0,0,0.08)] dark:border-border/50 dark:bg-neutral-900 dark:shadow-none">
            <MentionPicker
              value={prompt}
              onChange={setPrompt}
              onMentionsChange={setMentions}
              onKeyDown={handleKeyDown}
              className="mb-[0.5rem] max-h-40 min-h-2 w-full resize-none border-0! bg-transparent! pt-2 pb-2 text-[0.94rem]! ring-0! outline-0!"
              placeholder="Continue the conversation… type @ to mention a matter, person, or deadline"
            />

            <div className="flex flex-row items-center justify-between">
              <Liquid blur={0} fill={resolvedTheme === "dark" ? "#262626" : "#F3F4F6"} contrast={4} className="relative flex flex-row items-center">
                <Liquid.Item x={open ? -54 : 0} y={open ? -34 : 0} scale={open ? 1.6 : 1} transition="snappy" className="absolute">
                  <Button size="icon" className="round-btn rounded-full shadow-lg" variant="secondary" onClick={attachContext} title="Attach document text">
                    <FileIcon className="size-4!" />
                  </Button>
                </Liquid.Item>
                <Liquid.Item x={0} y={open ? -64 : 0} scale={open ? 1.6 : 1} transition="snappy" delay={40} className="absolute">
                  <Button size="icon" className="round-btn rounded-full shadow-lg" variant="secondary" onClick={attachContext} title="Attach email text">
                    <MailIcon />
                  </Button>
                </Liquid.Item>
                <Liquid.Item x={open ? 54 : 0} y={open ? -44 : 0} scale={open ? 1.6 : 1} transition="snappy" delay={40} className="absolute">
                  <Button size="icon" className="round-btn rounded-full border-2 shadow-lg" variant="secondary">
                    <AtSignIcon />
                  </Button>
                </Liquid.Item>
                <Liquid.Item className="absolute z-1">
                  <Button
                    onClick={() => setOpen(!open)}
                    size="icon"
                    className={`round-btn z-2 size-8! ${open ? "rotate-45" : "rotate-0"} transform rounded-full border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 dark:border-neutral-900 dark:bg-neutral-800`}
                    variant="secondary"
                  >
                    <PlusIcon />
                  </Button>
                </Liquid.Item>
              </Liquid>

              <div className="flex flex-row items-center justify-end gap-2">
                <Button className="size-8! rounded-full border-none dark:bg-transparent dark:hover:bg-neutral-800" onClick={toggleSpeak} size="icon" variant="outline">
                  {speechStarted ? <Pause /> : <Mic className="size-[1.085rem]! text-black dark:text-white" />}
                </Button>

                {isStreaming ? (
                  <Button type="button" onClick={submit} className="size-8! rounded-full border border-neutral-300 bg-white text-black shadow-sm hover:bg-neutral-100" size="icon" title="Stop generating">
                    <Square className="size-3.5! fill-black text-black" />
                  </Button>
                ) : (
                  <>
                    <MetalFx preset="chromatic" strength={speechStarted ? 0 : 1} theme="light" className="flex! dark:hidden!">
                      <Button type="button" onClick={submit} disabled={!prompt.trim()} className="size-8! rounded-full" size="icon">
                        <ArrowUp className="size-4! text-black dark:text-white" />
                      </Button>
                    </MetalFx>
                    <MetalFx preset="chromatic" strength={speechStarted ? 0 : 1} theme="dark" className="z-100 hidden! dark:flex!">
                      <Button type="button" onClick={submit} disabled={!prompt.trim()} className="size-8! rounded-full" size="icon">
                        <ArrowUp className="size-4! text-black dark:text-white" />
                      </Button>
                    </MetalFx>
                  </>
                )}
              </div>
            </div>
          </div>
        </BorderBeam>
      </div>
    </div>
  )
}
