import { getAllTicketsForAdminAction } from "@/actions/supportticket.actions";
import { AdminSupportTicketsClient } from "@/components/admin/AdminSupportTicketsClient";

export default async function AdminSupportPage() {
  const res = await getAllTicketsForAdminAction();
  return <AdminSupportTicketsClient initialTickets={res.success ? res.data ?? [] : []} />;
}
