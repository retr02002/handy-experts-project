"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ServiceFormWizard } from "./ServiceFormWizard";
import { ServicePreviewModal } from "./ServicePreviewModal";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { deleteService } from "@/actions/service.actions";
import { serviceToFormInput } from "./utils";
import type { ServiceWithPackages } from "./utils";

type Props = {
  services: ServiceWithPackages[];
  categories: { id: string; name: string }[];
};

/**
 * DataTable searches with `String(val)` and sorts with raw `<`/`>` on the raw
 * accessor value, so an object accessor would search as "[object Object]" and
 * never sort. The category name has to be flattened onto the row itself.
 */
type ServiceRow = ServiceWithPackages & { categoryName: string };

export function ServicesManager({ services, categories }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "card">("card");
  const [cardSearch, setCardSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceWithPackages | null>(null);
  const [previewService, setPreviewService] = useState<ServiceWithPackages | null>(null);
  const [deletingService, setDeletingService] = useState<ServiceWithPackages | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditingService(null);
    setWizardOpen(true);
  };

  const openEdit = (service: ServiceWithPackages) => {
    setEditingService(service);
    setWizardOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingService) return;
    setIsDeleting(true);
    try {
      const res = await deleteService(deletingService.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Service deleted");
      setDeletingService(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const rows: ServiceRow[] = useMemo(
    () => services.map((s) => ({ ...s, categoryName: s.category?.name ?? "" })),
    [services]
  );

  const filteredCardServices = useMemo(() => {
    const q = cardSearch.trim().toLowerCase();
    if (!q) return services;
    return services.filter(
      (s) => s.title.toLowerCase().includes(q) || (s.category?.name ?? "").toLowerCase().includes(q)
    );
  }, [services, cardSearch]);

  const columns: ColumnDef<ServiceRow>[] = [
    {
      header: "Service",
      accessorKey: "title",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.image})` }} />
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-white">{item.title}</span>
            <span className="text-xs text-slate-500">{item.slug}</span>
          </div>
        </div>
      ),
    },
    { header: "Category", accessorKey: "categoryName", sortable: true, cell: (item) => item.category?.name ?? "—" },
    { header: "Rating", accessorKey: "rating", sortable: true, cell: (item) => item.rating || "—" },
    {
      header: "Packages",
      cell: (item) => (
        <Link
          href={`/admin/packages?serviceId=${item.id}`}
          className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
        >
          {item.packages.length}
        </Link>
      ),
    },
    {
      header: "Actions",
      cell: (item) => (
        <ServiceActions
          serviceId={item.id}
          onView={() => setPreviewService(item)}
          onEdit={() => openEdit(item)}
          onDelete={() => setDeletingService(item)}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Services</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage the services shown on the site.{" "}
            <Link href="/admin/packages" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Manage packages →
            </Link>
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shrink-0 cursor-pointer"
        >
          <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
          Create Service
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {services.length} service{services.length === 1 ? "" : "s"} total
        </span>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {services.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <ClientIcon icon="ph:wrench-duotone" className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No services yet. Create your first one to get started.</p>
        </div>
      ) : view === "table" ? (
        <DataTable data={rows} columns={columns} searchPlaceholder="Search services..." searchableFields={["title", "categoryName", "slug"]} />
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={cardSearch}
            onChange={(e) => setCardSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCardServices.map((service) => (
              <div key={service.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
                <div className="h-36 bg-slate-200 dark:bg-slate-700 bg-cover bg-center relative" style={{ backgroundImage: `url(${service.image})` }}>
                  {service.badge && (
                    <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${service.badgeColor || "bg-slate-900 text-white"}`}>
                      {service.badge}
                    </span>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
                    {service.category?.name ?? "Uncategorised"}
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white leading-tight">{service.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{service.description}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {service.rating && (
                      <span className="flex items-center gap-1">
                        <ClientIcon icon="ph:star-fill" className="w-3.5 h-3.5 text-amber-400" />
                        {service.rating}
                      </span>
                    )}
                    <Link
                      href={`/admin/packages?serviceId=${service.id}`}
                      className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
                    >
                      {service.packages.length} package{service.packages.length === 1 ? "" : "s"}
                    </Link>
                  </div>
                  <div className="mt-auto pt-2">
                    <ServiceActions
                      serviceId={service.id}
                      onView={() => setPreviewService(service)}
                      onEdit={() => openEdit(service)}
                      onDelete={() => setDeletingService(service)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredCardServices.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No services match your search.</p>}
        </div>
      )}

      {wizardOpen && (
        <ServiceFormWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSuccess={() => router.refresh()}
          initialData={editingService ? serviceToFormInput(editingService) : undefined}
          serviceId={editingService?.id}
          categories={categories}
        />
      )}

      {previewService && <ServicePreviewModal isOpen={Boolean(previewService)} onClose={() => setPreviewService(null)} service={previewService} />}

      <ConfirmDeleteDialog
        isOpen={Boolean(deletingService)}
        title="Delete this service?"
        description={`"${deletingService?.title}" and all ${deletingService?.packages.length ?? 0} of its packages will be permanently removed. This can't be undone.`}
        isDeleting={isDeleting}
        onCancel={() => setDeletingService(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ViewToggle({ view, onChange }: { view: "table" | "card"; onChange: (v: "table" | "card") => void }) {
  return (
    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
      <button
        onClick={() => onChange("card")}
        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
          view === "card" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <ClientIcon icon="ph:squares-four-bold" className="w-4 h-4" />
        Cards
      </button>
      <button
        onClick={() => onChange("table")}
        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
          view === "table" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 dark:text-slate-400"
        }`}
      >
        <ClientIcon icon="ph:list-bold" className="w-4 h-4" />
        Table
      </button>
    </div>
  );
}

function ServiceActions({
  serviceId,
  onView,
  onEdit,
  onDelete,
}: {
  serviceId: string;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <ActionButton icon="ph:eye-bold" label="View" onClick={onView} />
      <Link
        href={`/admin/packages?serviceId=${serviceId}`}
        aria-label="Packages"
        title="Packages"
        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <ClientIcon icon="ph:package-bold" className="w-4 h-4" />
      </Link>
      <ActionButton icon="ph:pencil-simple-bold" label="Edit" onClick={onEdit} />
      <ActionButton icon="ph:trash-bold" label="Delete" onClick={onDelete} variant="danger" />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  variant,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: "danger";
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
        variant === "danger"
          ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
      }`}
    >
      <ClientIcon icon={icon} className="w-4 h-4" />
    </button>
  );
}
