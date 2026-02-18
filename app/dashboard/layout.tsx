import { AppSidebar } from "@/components/app-sidebar"

export const dynamic = "force-dynamic"
import { ImportDataProvider } from "@/lib/import-store"
import type { ImportData } from "@/lib/import-types"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "./data.json"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ImportDataProvider initialData={data as ImportData}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {children}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ImportDataProvider>
  )
}
