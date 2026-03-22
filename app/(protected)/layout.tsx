import { AppSidebar } from '@/components/app-sidebar'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import React from 'react'

export default function Layout({children}:{children:React.ReactNode}) {
  return (
    <SidebarProvider>
        <AppSidebar variant='inset'/>
        <header className="h-14 flex items-center border-b bg-card px-4">
            <SidebarTrigger className="mr-4" />
          </header>

          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
    </SidebarProvider>
  )
}

