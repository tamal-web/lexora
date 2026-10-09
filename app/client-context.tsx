"use client"

import { createContext, useContext, useState, ReactNode } from "react"

type ClientContextType = {
  client: string
  setClient: React.Dispatch<React.SetStateAction<string>>
}

const ClientContext = createContext<ClientContextType | undefined>(undefined)

export function ClientProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState("all-clients")

  return (
    <ClientContext.Provider value={{ client, setClient }}>
      {children}
    </ClientContext.Provider>
  )
}

export function useClient() {
  const context = useContext(ClientContext)

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider")
  }
  return context
}
