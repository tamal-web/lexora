"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronsUpDown,
  LandmarkIcon,
  ListChecks,
  Plus,
} from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { ApiClient } from "@/lib/api"
import { useClient } from "@/app/client-context"
import { ClientSheet } from "@/components/entity-sheets"

export function ClientSwitcher({
  clients,
  className,
  onRefresh,
}: {
  clients: ApiClient[]
  className?: string
  onRefresh?: () => void
}) {
  const { isMobile } = useSidebar()
  const { client, setClient } = useClient()
  const [sheetOpen, setSheetOpen] = React.useState(false)

  const activeTeam = React.useMemo(() => {
    if (client === "all-clients")
      return { id: "all-clients", name: "All Clients" }
    const found = clients.find((c) => c.id === client)
    if (found) return { id: found.id, name: found.name }
    return { id: "all-clients", name: "All Clients" }
  }, [client, clients])
  if (!activeTeam) {
    return null
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                // size="lg"
                className={`${className} flex w-auto flex-row items-center gap-2 py-3 group-data-[collapsible=icon]:px-1! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground`}
              >
                <div className="size-6/ flex aspect-square items-center justify-center rounded-lg bg-sidebar-primary p-[0.3rem] text-sidebar-primary-foreground">
                  {/*
                  <img
                    src={
                      activeTeam.id == "all-clients"
                        ? `/all-clients.png`
                        : `/${activeTeam.id}.png`
                    }
                    className="size-3!"
                  />
                   */}
                  <LandmarkIcon />
                  {/*
                  <activeTeam.logo className="h-[0.95rem] w-auto" />
                   */}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeTeam.name}
                  </span>
                </div>
                <ChevronDown className="ml-auto" />
              </SidebarMenuButton>
            }
          ></DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Clients
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => {
                setClient("all-clients")
              }}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border">
                <ListChecks className="size-4!" />
              </div>
              All Clients{" "}
            </DropdownMenuItem>
            {clients.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => {
                  setClient(team.id)
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  {/*
                  <img src={`/${team.id}.png`} className="h-4 w-auto" />
            */}
                  <LandmarkIcon />
                </div>
                {team.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                Add Client
              </div>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                setSheetOpen(true)
              }}
              className="gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">
                New Client
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
      <ClientSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSaved={() => {
          onRefresh?.()
          setSheetOpen(false)
        }}
      />
    </SidebarMenu>
  )
}
