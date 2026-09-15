import { getMyTicketsAction } from "@/actions/supportticket.actions";
import { getCategoriesWithServiceOptionsAction } from "@/actions/category.actions";
import { getMyServiceAreasAction, getMyVendorCategoriesAction } from "@/actions/vendorservicearea.actions";
import { getSupportContactsAction } from "@/actions/supportcontact.actions";
import { SupportTicketsClient } from "@/components/vendor/SupportTicketsClient";

export default async function VendorSupportPage() {
  const [ticketsRes, categoriesRes, myCategoriesRes, myAreasRes, contactsRes] = await Promise.all([
    getMyTicketsAction(),
    getCategoriesWithServiceOptionsAction(),
    getMyVendorCategoriesAction(),
    getMyServiceAreasAction(),
    getSupportContactsAction(),
  ]);

  return (
    <SupportTicketsClient
      initialTickets={ticketsRes.success ? ticketsRes.data ?? [] : []}
      categories={categoriesRes.success ? categoriesRes.data ?? [] : []}
      myCategories={myCategoriesRes.success ? myCategoriesRes.data ?? [] : []}
      myAreas={myAreasRes.success ? myAreasRes.data ?? [] : []}
      supportContacts={contactsRes.success ? contactsRes.data ?? [] : []}
    />
  );
}
