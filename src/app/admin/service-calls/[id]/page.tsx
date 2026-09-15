import { notFound } from "next/navigation";
import { getServiceCallFullDetailAction } from "@/actions/servicecall.actions";
import { AdminServiceCallDetailClient } from "@/components/admin/AdminServiceCallDetailClient";

export default async function AdminServiceCallDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getServiceCallFullDetailAction(id);
  if (!res.success || !res.data) notFound();

  return <AdminServiceCallDetailClient initialDetail={res.data} />;
}
