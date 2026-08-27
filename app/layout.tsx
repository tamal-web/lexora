import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { ClientProvider } from "./client-context"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const tabs = [
  {
    id: "tab-1",
    type: "matter",
    resourceId: "m-11",
    title: "Acme Corp v. XYZ",
  },
]

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body>
        <ThemeProvider>
          <TooltipProvider>
            <ClientProvider>
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="flex flex-col">
                  {/*
                                  <div className="z-1 flex flex-row items-center justify-start gap-2 bg-background/36 px-3 py-2 backdrop-blur-[0.4rem]">
                  {tabs.map((t, i) => (
                    <div
                      className="rounded-[0.95rem] bg-primary-foreground px-4 py-3"
                      key={i}
                    >
                      <div className="">
                        <h1 className="text-[0.8rem] leading-none">
                          {t.title}
                        </h1>
                      </div>
                    </div>
                  ))}
                </div>

                 */}
                  <main className="flex flex-1 flex-col">{children}</main>
                </SidebarInset>
              </SidebarProvider>
            </ClientProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
