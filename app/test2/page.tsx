"use client"

import { BorderBeam } from "border-beam"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowUp,
  AtSignIcon,
  Circle,
  FileIcon,
  FolderIcon,
  MailIcon,
  Mic,
  Pause,
  PlusIcon,
  RotateCcw,
  Square,
  TargetIcon,
  X,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { MetalFx } from "metal-fx"
import { Liquid } from "liquid-gooey"
import { useTheme } from "next-themes"
import { deadlines } from "@/lib/data"
import { DeadlineBox } from "../matters/page"
import { MatterTree } from "@/components/matter-tree"
import { MessageBubble, useAgentChat } from "@/components/agent-chat"
import { cn } from "@/lib/utils"

export default function Page() {
  const { resolvedTheme } = useTheme()
  const { messages, isStreaming, backendOnline, send, stop, clear } =
    useAgentChat()

  const [open, setOpen] = useState(false)
  const [speechStarted, setSpeechStarted] = useState<boolean>(false)
  const [prompt, setPrompt] = useState("")
  const [context, setContext] = useState("") // pasted email / document text
  const recognitionRef = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  const hasChat = messages.length > 0

  // ── Auto-scroll to the newest message ────────────────────────────────────
  useEffect(() => {
    if (hasChat)
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [messages, hasChat])

  // ── Speech recognition ───────────────────────────────────────────────────
  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition)
    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => setSpeechStarted(true)
    recognition.onend = () => setSpeechStarted(false)
    recognition.onerror = (event: any) => {
      console.log("Speech recognition error:", event.error)
      setSpeechStarted(false)
    }
    recognition.onresult = (event: any) => {
      let finalTranscript = ""
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + " "
        }
      }
      if (finalTranscript) setPrompt((prev) => prev + finalTranscript)
    }

    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [])

  const toggleSpeak = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.")
      return
    }
    if (speechStarted) {
      recognitionRef.current.stop()
    } else {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error("Speech start glitch:", error)
      }
    }
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const submit = () => {
    if (isStreaming) return stop()
    const text = prompt.trim()
    if (!text) return
    setPrompt("")
    send(text, context)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const attachContext = () => {
    const text = window.prompt("Paste email or document text:")
    if (text) setContext(text)
    setOpen(false)
  }

  // ── Matters + Deadlines box ──────────────────────────────────────────────
  const dashboardBox = (
    <div className="z-1 flex flex-row items-stretch justify-center gap-2 self-center rounded-[1rem] border border-border/70 bg-white p-2 shadow-sm dark:bg-neutral-900">
      <div className="flex flex-col items-start justify-start gap-2 p-2">
        <div className="ml-2 flex flex-row items-center justify-start gap-1 opacity-70">
          <FolderIcon className="size-4" />
          <h1 className="text-[0.9rem] font-medium">Matters</h1>
        </div>
        <div className="flex max-h-[20rem]! flex-col items-stretch justify-start gap-2 overflow-y-scroll! overscroll-none rounded-[1rem] p-2">
          <MatterTree />
        </div>
      </div>
      <div className="flex flex-col items-start justify-start gap-2 p-2">
        <div className="ml-2 flex flex-row items-center justify-start gap-1 opacity-70">
          <TargetIcon className="size-4" />
          <h1 className="text-[0.9rem] font-medium">Deadlines</h1>
        </div>
        <div className="flex max-h-[20rem]! flex-col items-stretch justify-start gap-2 overflow-y-scroll! overscroll-none rounded-[1rem] p-2">
          {deadlines.map((d, i) => (
            <DeadlineBox d={d} key={i} className="hover:dark:bg-neutral-800" />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative flex min-h-full flex-1 flex-col">
      {/* background glow (fixed to the viewport so it doesn't scroll) */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 h-100 w-100 -translate-1/2 transform rounded-full bg-[#8376EE] opacity-100 blur-[9rem] dark:bg-[#6759D3] dark:opacity-60" />
      </div>

      {/* ── Content: box + messages (the page itself scrolls) ──────────── */}
      <div className="relative z-1 flex flex-1 flex-col">
        <div
          className={cn(
            "mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-6",
            !hasChat && "justify-center"
          )}
        >
          {/* Matters + deadlines (above the chat) */}
          {dashboardBox}

          {/* Chat messages (below the box — scroll down to read) */}
          {hasChat && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[0.7rem]">
                  {backendOnline !== null && (
                    <>
                      <Circle
                        className={cn(
                          "size-2 fill-current",
                          backendOnline
                            ? "text-emerald-500"
                            : "text-destructive"
                        )}
                      />
                      <span className="text-muted-foreground">
                        {backendOnline ? "Backend online" : "Backend offline"}
                      </span>
                    </>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 text-xs"
                  onClick={clear}
                  disabled={isStreaming}
                >
                  <RotateCcw className="size-3.5" />
                  Clear chat
                </Button>
              </div>

              {messages.map((msg) => (
                <MessageBubble key={msg.id} msg={msg} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Sticky prompt bar (always pinned to the bottom of the view) ── */}
      <div
        ref={bottomRef}
        className="sticky bottom-0 z-10 flex shrink-0 flex-col items-center gap-2 bg-gradient-to-t from-background via-background/90 to-transparent px-4 pt-6 pb-4"
      >
        {context && (
          <div className="flex w-full max-w-[34rem] items-start gap-2 rounded-lg border border-border/60 bg-white p-2 text-xs dark:bg-neutral-900">
            <FileIcon className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
            <p className="line-clamp-2 flex-1 text-muted-foreground">
              {context}
            </p>
            <button
              onClick={() => setContext("")}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        <BorderBeam
          strength={speechStarted || isStreaming ? 1 : 0}
          className="w-full max-w-[34rem] overflow-visible!"
        >
          <div className="relative flex w-full flex-col rounded-[1.5rem] border border-border/80 bg-white p-3 shadow-[0_0_13px_rgba(0,0,0,0.08)] dark:border-border/50 dark:bg-neutral-900 dark:shadow-none">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              className="mb-[0.5rem] max-h-40 min-h-2 w-full resize-none border-0! bg-transparent! pt-2 pb-2 text-[0.94rem]! ring-0! outline-0!"
              placeholder="Ask about cases, deadlines, or tell me to draft a document…"
            />

            <div className="flex flex-row items-center justify-between">
              <Liquid
                blur={0}
                fill={`${resolvedTheme == "dark" ? "#262626" : "#F3F4F6"}`}
                contrast={4}
                className="relative flex flex-row items-center"
              >
                <Liquid.Item
                  x={open ? -54 : 0}
                  y={open ? -34 : 0}
                  scale={open ? 1.6 : 1}
                  transition="snappy"
                  className="absolute"
                >
                  <Button
                    size="icon"
                    className="round-btn rounded-full shadow-lg"
                    variant={"secondary"}
                    onClick={attachContext}
                    title="Attach document text"
                  >
                    <FileIcon className="size-4!" />
                  </Button>
                </Liquid.Item>
                <Liquid.Item
                  x={0}
                  y={open ? -64 : 0}
                  scale={open ? 1.6 : 1}
                  transition="snappy"
                  delay={40}
                  className="absolute"
                >
                  <Button
                    size="icon"
                    className="round-btn rounded-full shadow-lg"
                    variant={"secondary"}
                    onClick={attachContext}
                    title="Attach email text"
                  >
                    <MailIcon />
                  </Button>
                </Liquid.Item>
                <Liquid.Item
                  x={open ? 54 : 0}
                  y={open ? -44 : 0}
                  scale={open ? 1.6 : 1}
                  transition="snappy"
                  delay={40}
                  className="absolute"
                >
                  <Button
                    size="icon"
                    className="round-btn rounded-full border-2 shadow-lg"
                    variant={"secondary"}
                  >
                    <AtSignIcon />
                  </Button>
                </Liquid.Item>

                <Liquid.Item className="absolute z-1">
                  <Button
                    onClick={() => setOpen(!open)}
                    size="icon"
                    className={`round-btn z-2 size-8! ${open ? "rotate-45" : "rotate-0"} transform rounded-full border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 dark:border-neutral-900 dark:bg-neutral-800`}
                    variant={"secondary"}
                  >
                    <PlusIcon />
                  </Button>
                </Liquid.Item>
              </Liquid>

              <div className="flex flex-row items-center justify-end gap-2">
                <Button
                  className="size-8! rounded-full border-none dark:bg-transparent dark:hover:bg-neutral-800"
                  onClick={toggleSpeak}
                  size="icon"
                  variant="outline"
                >
                  {speechStarted ? (
                    <Pause />
                  ) : (
                    <Mic className="size-[1.085rem]! text-black dark:text-white" />
                  )}
                </Button>

                {isStreaming ? (
                  /* Stop button: solid white */
                  <Button
                    type="button"
                    onClick={submit}
                    className="size-8! rounded-full border border-neutral-300 bg-white text-black shadow-sm hover:bg-neutral-100"
                    size="icon"
                    title="Stop generating"
                  >
                    <Square className="size-3.5! fill-black text-black" />
                  </Button>
                ) : (
                  <>
                    {/* Send — light theme */}
                    <MetalFx
                      preset="chromatic"
                      strength={speechStarted ? 0 : 1}
                      theme="light"
                      className="flex! dark:hidden!"
                    >
                      <Button
                        type="button"
                        onClick={submit}
                        disabled={!prompt.trim()}
                        className="size-8! rounded-full"
                        size="icon"
                      >
                        <ArrowUp className="size-4! text-black dark:text-white" />
                      </Button>
                    </MetalFx>

                    {/* Send — dark theme */}
                    <MetalFx
                      preset="chromatic"
                      strength={speechStarted ? 0 : 1}
                      theme="dark"
                      className="z-100 hidden! dark:flex!"
                    >
                      <Button
                        type="button"
                        onClick={submit}
                        disabled={!prompt.trim()}
                        className="size-8! rounded-full"
                        size="icon"
                      >
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
