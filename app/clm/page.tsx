import { TopNavBar } from "@/components/TopNavBarComp"
import { FileText } from "lucide-react"

export default function CLMPage() {
  return (
    <div className="flex-1 bg-[url('/vid/v2.mp4')] bg-cover bg-center bg-no-repeat">
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
      >
        <source src="/vid/v2.mp4" type="video/mp4" />
      </video>
      <TopNavBar className="sticky top-0 text-black/70">
        <div className="flex flex-col items-start justify-start gap-3">
          <div className="flex flex-row items-center justify-start gap-2">
            <FileText />
            <h1 className="font-medium">CLM</h1>
          </div>
        </div>
      </TopNavBar>
    </div>
  )
}
