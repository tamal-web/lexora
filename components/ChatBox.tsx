import { BorderBeam } from "border-beam"
import { MetalFx } from "metal-fx
import { Textarea } from "./ui/textarea"
import { Liquid } from "liquid-gooey"
import { ArrowUp } from "lucide-react"
import { Button } from "./ui/button";

export function ChatBox() {
  return (
    <BorderBeam>
      <div className="relative flex flex-col rounded-[1.5rem] bg-white p-3 shadow-[0_0_13px_rgba(0,0,0,0.08)] dark:bg-neutral-900 dark:shadow-none">
        <div className="text-whit relative">
          <Textarea
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
              className={"size-8! rounded-full border-none"}
              size={"icon"}
              variant={"outline"}
            >
              <Mic className="size-[1.085rem]! text-black dark:text-white" />
            </Button>
            <MetalFx
              preset="chromatic"
              strength={1}
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
              strength={1}
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
  )
}
