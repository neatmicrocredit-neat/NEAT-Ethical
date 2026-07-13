import Link from "next/link";
import { LayoutDashboard, Users, Briefcase, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";

const links = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/investments", label: "Investments", icon: Briefcase },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <div>
          <Link href="/dashboard" className="mt-2 block text-lg font-semibold text-slate-900">
            NEAT Dashboard
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="px-2">
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  <Icon size={18} />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-200 px-4 py-4">
        <form action="/api/auth/logout" method="post">
          <button className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <LogOut size={16} />
            Logout
          </button>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}