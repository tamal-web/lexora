"use client"

import * as React from "react"
import { ChevronDown, ChevronsUpDown, Plus } from "lucide-react"

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
import { Client } from "@/lib/models"
import { useClient } from "@/app/client-context"

export function ClientSwitcher({ clients }: { clients: Client[] }) {
  const { isMobile } = useSidebar()
  const { client, setClient } = useClient()

  const [activeTeam, setActiveTeam] = React.useState(() => {
    const a = clients.find((x) => x.id === client)

    return {
      id: a?.id ?? "",
      name: a?.name ?? "",
    }
  })
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
                className="flex w-auto flex-row items-center gap-2 py-3 group-data-[collapsible=icon]:px-1! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div className="size-6/ flex aspect-square items-center justify-center rounded-lg bg-sidebar-primary p-[0.3rem] text-sidebar-primary-foreground">
                  <img src={activeTeam.id} className="h-5 w-auto" />
                  {/*
                  <activeTeam.logo className="h-[0.95rem] w-auto" />
                   */}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeTeam.name}
                  </span>
                  {/*

                  <span className="truncate text-xs">{activeTeam.plan}</span>
                      */}
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
                setActiveTeam({ id: "", name: "All Clients" })
                setClient("")
              }}
              className="gap-2 p-2"
            ></DropdownMenuItem>
            {clients.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                onClick={() => {
                  setActiveTeam(team)
                  setClient(team.id)
                }}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <img src={activeTeam.id} className="h-5 w-auto" />
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
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
