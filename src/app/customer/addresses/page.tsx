import { getMyAddressesAction } from "@/actions/address.actions";
import { AddressesClient } from "@/components/customer/AddressesClient";

export default async function CustomerAddressesPage() {
  const res = await getMyAddressesAction();
  return <AddressesClient initialAddresses={res.success ? res.data ?? [] : []} />;
}
