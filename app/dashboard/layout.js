import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AppSidebar />

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur sticky top-0 z-40">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <SidebarTrigger />
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">Ethical Investment Dashboard</h1>
                </div>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700">
                Admin
              </div>
            </div>
          </header>

          <main className="px-6 py-8">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
