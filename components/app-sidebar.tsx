"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  BriefcaseBusiness,
  Calendar,
  GalleryVerticalEnd,
  LayoutGrid,
  Search,
  Settings2,
  Target,
  UsersRound,
  CommandIcon,
} from "lucide-react"
import { Button } from "./ui/button"
import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useEffect } from "react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { CommandDialog, CommandInput } from "./ui/command"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "./ui/command"
import { ClientSwitcher } from "./client-switcher"
import { clients } from "@/lib/data"

// This is sample data.
//
const mainLinks = [
  {
    title: "Home",
    icon: LayoutGrid,
    url: "/",
  },
  {
    title: "Deadlines",
    icon: Target,
    url: "/deadlines",
  },
  {
    title: "Calendar",
    icon: Calendar,
    url: "/calendar",
  },
]
const data = {
  user: {
    name: "Tamal",
    email: "tamal@clinentora.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Prosectuion",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Litigation",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "IP",
      logo: CommandIcon,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Matters",
      url: "/matters",
      icon: BriefcaseBusiness,
      isActive: true,
      items: [
        {
          title: "All",
          url: "/matters",
        },
        // {
        //   title: "Doketts",
        //   url: "/deadlines",
        // },
        {
          title: "Billings",
          url: "/billings",
        },

        {
          title: "Documents",
          url: "/documents",
        },
      ],
    },
    {
      title: "Clients",
      url: "/clients",
      icon: UsersRound,
      items: [
        {
          title: "Analytics",
          url: "/clients/analytics",
        },
      ],
    },
    {
      title: "History",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Chat",
          url: "/chats",
        },
        {
          title: "Imports",
          url: "/imports",
        },
      ],
    },
  ],
  projects: [
    {
      name: "E-Discovery",
      url: "/ediscovery",
      icon: "/ed2.png",
    },
    {
      name: "Contract Lifecycle Management",
      url: "/clm",
      icon: "/clm3.png",
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [searchOpen, setSearchOpen] = React.useState(false)
  const path = usePathname()
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mt-2 flex flex-col">
        <div className="flex flex-row items-center justify-between">
          <ClientSwitcher clients={clients} />
          {/*
           *           <TeamSwitcher teams={data.teams} />

           */}
          <SidebarTrigger
            size={"lg"}
            className={"group-data-[collapsible=icon]:hidden"}
          />
        </div>
        <Button
          variant="outline"
          className="m-1 items-center justify-start gap-2 px-2 py-3 text-muted-foreground group-data-[collapsible=icon]:hidden md:flex"
          onClick={() => setSearchOpen(true)}
          aria-label="Open global search"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left text-sm">Quick actions</span>
          <kbd className="hidden h-5 items-center gap-0.5 rounded border bg-muted px-1 font-mono text-[10px] sm:inline-flex">
            <span>K</span>
          </kbd>
        </Button>
      </SidebarHeader>
      <SidebarContent className="overscroll-none- relative overflow-y-scroll!">
        <SidebarGroup>
          <SidebarMenu>
            {mainLinks.map((l, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton
                  isActive={path == l.url}
                  className={`${path == l.url ? "text-primary-foreground" : "text-muted-foreground"}`}
                  render={
                    <Link href={l.url}>
                      <l.icon />
                      <span className="font-medium">{l.title}</span>
                    </Link>
                  }
                ></SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={data.navMain} path={path} />
        <NavProjects projects={data.projects} path={path} />
        <div className="absolute bottom-3 w-full text-white! group-data-[collapsible=icon]:hidden">
          <div className="dark:::shadow-[0_4px_13px_rgba(1,1,1,0.08)] mx-3 flex transform cursor-pointer flex-row items-center justify-between rounded-[0.82rem] bg-[url('/bg/bg.png')] bg-cover bg-center px-3 py-2 shadow-[0_6px_12px_rgba(0,0,0,0.22)] transition-all hover:translate-y-[-0.14rem] hover:scale-[1.01]">
            <div className="flex flex-row items-center justify-start gap-2">
              <div className="relative size-4">
                <svg
                  className="size-full -rotate-90"
                  viewBox="0 0 36 36"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-white/20"
                    strokeWidth="5"
                  ></circle>
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-current text-white"
                    strokeWidth="5"
                    strokeDasharray="100"
                    strokeDashoffset="75"
                    strokeLinecap="round"
                  ></circle>
                </svg>
              </div>
              <h1 className="text-[0.9rem] font-medium">Getting started</h1>
            </div>
            <h1 className="text-[0.75rem] font-normal opacity-75">1 of 5</h1>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t-2">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
      <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
        <Command>
          <CommandInput placeholder="Type and search..." />{" "}
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Navigation">
              {mainLinks.map((l, i) => (
                <CommandItem key={i}>
                  <l.icon /> <span>{l.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </Sidebar>
  )
}
