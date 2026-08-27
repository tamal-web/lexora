"use client"
import { BorderBeam } from "border-beam"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  ArrowUp,
  AtSignIcon,
  FileIcon,
  FolderIcon,
  MailIcon,
  Mic,
  Pause,
  PlusIcon,
  TargetIcon,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { MetalFx } from "metal-fx"
import { Liquid } from "liquid-gooey"
import { useTheme } from "next-themes"
import { useEffect } from "react"
import { deadlines, matters } from "@/lib/data"
import { DeadlineBox } from "./matters/page"
import { FileTree } from "@/components/file-tree"
import { Matter } from "@/lib/models"
import { MatterTree } from "@/components/matter-tree"

export default function Page() {
  const { resolvedTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [selectedMatter, setSM] = useState<Matter | null>(null)
  // const [strength, setStrentch] = useState(0)
  const [] = useState()
  const [errMsg, setErrMsg] = useState("")
  const [speechStarted, setSpeechStarted] = useState<boolean>(false)
  const [prompt, setPrompt] = useState("")
  const recognitionRef = useRef<any>(null)
  const submit = async () => {
    try {
      const res = await fetch("http://192.168.1.1", {})
    } catch (e) {
      setErrMsg(`Unexpected Error: ${e}`)
    }
  }

  useEffect(() => {
    const SpeechRecognition =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition)

    if (!SpeechRecognition) return

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    // recognition.continuous = true
    // recognition.interimResults = true

    recognition.continuous = false
    recognition.interimResults = true

    recognition.onstart = () => {
      setSpeechStarted(true)
    }

    recognition.onend = () => {
      // If the server dropped the connection but your UI button state is still active, safely boot it back up!
      if (speechStarted) {
        try {
          // recognitionRef.current.start()
        } catch (e) {
          console.error("Auto-recovery collision prevented:", e)
        }
      } else {
        setSpeechStarted(false)
      }

      // setSpeechStarted(false)
    }

    recognition.onerror = (event: any) => {
      console.log("Speech recognition error:", event.error)
      if (event.error === "network") {
        // Prevent UI locking up, force toggle it
        setSpeechStarted(false)
      }
    }

    // 🔥 FIXED: Accessing the nested array entry [0] correctly
    recognition.onresult = (event: any) => {
      let finalTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        // Check if the current chunk of speech is finished processing
        if (event.results[i].isFinal) {
          // [0] targets the highest-confidence match alternative returned by the engine
          finalTranscript += event.results[i][0].transcript + " "
        }
      }

      if (finalTranscript) {
        // Safely appends the clean text to your prompt state
        setPrompt((prev) => prev + finalTranscript)
      }
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleSpeak = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported or initialized.")
      return
    }

    if (speechStarted) {
      recognitionRef.current.stop()
      // Do NOT call setSpeechStarted(false) here! Let onend handle it.
    } else {
      try {
        recognitionRef.current.start()
        // Do NOT call setSpeechStarted(true) here! Let onstart handle it.
      } catch (error) {
        console.error("Catching native engine sync glitch:", error)
      }
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8">
      <div className="hidden">
        <div className="absolute top-1/2 left-1/2 z-0 h-100 w-100 -translate-1/2 transform rounded-full bg-blue-500 opacity-100 blur-[9rem] dark:opacity-60"></div>
        <div className="hidden- absolute top-1/2 left-1/2 z-0 h-55 w-55 -translate-1/2 transform rounded-full bg-[#FF3BF3] opacity-100 blur-[9rem] dark:opacity-60"></div>
      </div>

      <div className="hidde">
        <div className="absolute top-1/2 left-1/2 z-0 h-100 w-100 -translate-1/2 transform rounded-full bg-[#8376EE] opacity-100 blur-[9rem] dark:bg-[#6759D3] dark:opacity-60"></div>
        <div className="hidden- absolute top-1/2 left-1/2 z-0 h-55 w-55 -translate-1/2 transform rounded-full bg-[#8376EE] opacity-100 blur-[9rem] dark:bg-[#6759D3] dark:opacity-60"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 z-0 hidden h-55 w-55 -translate-x-[120%] -translate-y-[90%] transform rounded-full bg-[#FF3BF3] opacity-100 blur-[9rem] dark:opacity-60"></div>

      <div className="justfiy-center z-1 flex flex-row items-stretch gap-2 rounded-[1rem] border border-border/70 bg-white p-2 shadow-sm dark:bg-neutral-900">
        <div className="flex flex-col items-start justify-start gap-2 p-2">
          <div className="ml-2 flex flex-row items-center justify-start gap-1 opacity-70">
            <FolderIcon className="size-4" />
            <h1 className="text-[0.9rem] font-medium">Matters</h1>
          </div>

          <div className="shadow-sm- -dark:bg-neutral-900 -bg-white flex max-h-[20rem]! flex-col items-stretch justify-start gap-2 overflow-y-scroll! overscroll-none rounded-[1rem] p-2">
            <div className="flex flex-row items-center justify-start"></div>
            <MatterTree />
          </div>
        </div>
        <div className="flex flex-col items-start justify-start gap-2 p-2">
          <div className="ml-2 flex flex-row items-center justify-start gap-1 opacity-70">
            <TargetIcon className="size-4" />
            <h1 className="text-[0.9rem] font-medium">Deadlines</h1>
          </div>

          <div className="shadow-sm- -dark:bg-neutral-900 -bg-white flex max-h-[20rem]! flex-col items-stretch justify-start gap-2 overflow-y-scroll! overscroll-none rounded-[1rem] p-2">
            {deadlines.map((d, i) => (
              <DeadlineBox
                d={d}
                key={i}
                className="hover:dark:bg-neutral-800"
              />
            ))}
          </div>
        </div>
      </div>
      <div className="justfiy-center fle z-1 hidden flex-row items-stretch gap-2">
        <div className="flex flex-col items-start justify-start gap-2 p-2">
          <div className="ml-2 flex flex-row items-center justify-start gap-1 opacity-70">
            <FolderIcon className="size-4" />
            <h1 className="text-[0.9rem] font-medium">Matters</h1>
          </div>

          <div className="shadow-sm- flex max-h-[20rem]! flex-col items-stretch justify-start gap-2 overflow-y-scroll! overscroll-none rounded-[1rem] bg-white p-2 dark:bg-neutral-900">
            <div className="flex flex-row items-center justify-start"></div>
            <MatterTree />
          </div>
        </div>
        <div className="flex flex-col items-start justify-start gap-2 p-2">
          <div className="ml-2 flex flex-row items-center justify-start gap-1 opacity-70">
            <TargetIcon className="size-4" />
            <h1 className="text-[0.9rem] font-medium">Deadlines</h1>
          </div>

          <div className="shadow-sm- flex max-h-[20rem]! flex-col items-stretch justify-start gap-2 overflow-y-scroll! overscroll-none rounded-[1rem] bg-white p-2 dark:bg-neutral-900">
            {deadlines.map((d, i) => (
              <DeadlineBox
                d={d}
                key={i}
                className="hover:dark:bg-neutral-800"
              />
            ))}
          </div>
        </div>
      </div>
      <BorderBeam
        strength={speechStarted ? 1 : 0}
        className="overflow-visible!"
      >
        <div className="relative flex flex-col rounded-[1.5rem] border border-border/80 bg-white p-3 shadow-[0_0_13px_rgba(0,0,0,0.08)] dark:border-border/50 dark:bg-neutral-900 dark:shadow-none">
          <div className="text-whit relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mb-[0.5rem] max-h-40 min-h-2 w-[28rem] resize-none border-0! bg-transparent! pt-2 pb-2 text-[0.94rem]! ring-0! outline-0!"
              name=""
              placeholder="Enter your prompt..."
            />

            <div className="pointer-events-none absolute right-0 bottom-0 left-0 hidden h-8 bg-gradient-to-t from-white to-transparent dark:from-neutral-900"></div>
          </div>
          <div className="flex flex-row items-center justify-between">
            <Liquid
              blur={0} // keep zero for safety
              fill={`${resolvedTheme == "dark" ? "#262626" : "#F3F4F6"}`}
              // fill="#F3F4F6"
              // shadow="Figma soft"
              contrast={4} // fixed
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
                </Button>{" "}
              </Liquid.Item>

              <Liquid.Item className="absolute z-1">
                <Button
                  onClick={() => setOpen(open ? false : true)}
                  size="icon"
                  className={`round-btn z-2 size-8! ${open ? "rotate-45" : "rotate-0"} transform rounded-full border-2 border-gray-100 bg-gray-50 hover:bg-gray-100 dark:border-neutral-900 dark:bg-neutral-800`}
                  variant={"secondary"}
                >
                  <PlusIcon />
                </Button>
              </Liquid.Item>
            </Liquid>

            { }
            <div className="flex flex-row items-center justify-end gap-2">
              <Button
                className={
                  "size-8! rounded-full border-none dark:bg-transparent dark:hover:bg-neutral-800"
                }
                onClick={toggleSpeak}
                size={"icon"}
                variant={"outline"}
              >
                {speechStarted ? (
                  <Pause />
                ) : (
                  <Mic className="size-[1.085rem]! text-black dark:text-white" />
                )}
              </Button>
              <MetalFx
                preset="chromatic"
                strength={speechStarted ? 0 : 1}
                theme="light"
                className="flex! dark:hidden!"
              >
                <Button
                  type="submit"
                  onClick={submit}
                  className={"size-8! rounded-full"}
                  size={"icon"}
                >
                  <ArrowUp className="size-4! text-black dark:text-white" />
                </Button>
              </MetalFx>
              <MetalFx
                preset="chromatic"
                strength={speechStarted ? 0 : 1}
                theme="dark"
                className="z-100 hidden! dark:flex!"
              >
                <Button
                  type="submit"
                  className={"size-8! rounded-full"}
                  size={"icon"}
                >
                  <ArrowUp className="size-4! text-black dark:text-white" />
                </Button>
              </MetalFx>
            </div>
          </div>
        </div>
      </BorderBeam>
    </div>
  )
}
