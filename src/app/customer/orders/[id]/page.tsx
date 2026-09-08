import { notFound } from "next/navigation";
import { getMyOrderDetailAction } from "@/actions/livecall.actions";
import { OrderDetailClient } from "@/components/customer/OrderDetailClient";

export default async function CustomerOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await getMyOrderDetailAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <OrderDetailClient orderId={id} initialOrder={res.data} />;
}
