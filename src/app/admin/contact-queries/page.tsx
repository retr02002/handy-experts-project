import { getAllContactQueriesForAdminAction } from "@/actions/contactquery.actions";
import { ContactQueriesManager } from "@/components/admin/contact-queries/ContactQueriesManager";

export default async function AdminContactQueriesPage() {
  const res = await getAllContactQueriesForAdminAction();
  return <ContactQueriesManager initialQueries={res.success ? res.data ?? [] : []} />;
}
