import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-primary/30 selection:text-primary-foreground">
      {/* Background Polish */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(226,91,49,0.05),transparent)] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none brightness-150 contrast-150" />

      <AdminSidebar />
      <div className="transition-all duration-500 lg:pl-72">
        <AdminHeader />
        <main className="p-8 lg:p-12 relative z-10">{children}</main>
      </div>
    </div>
  );
}
