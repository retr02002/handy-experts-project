import { getMyOrdersAction } from "@/actions/livecall.actions";
import { OrdersHistoryClient } from "@/components/customer/OrdersHistoryClient";

export default async function CustomerOrdersPage() {
  const res = await getMyOrdersAction();
  const orders = res.success ? res.data ?? [] : [];

  return <OrdersHistoryClient orders={orders} />;
}
