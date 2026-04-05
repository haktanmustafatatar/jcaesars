import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminHeader } from "@/components/admin/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="lg:ml-72">
        <AdminHeader />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
