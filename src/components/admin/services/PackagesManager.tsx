"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { PackageFormWizard } from "./PackageFormWizard";
import { PackagePreviewModal } from "./PackagePreviewModal";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { deletePackage } from "@/actions/package.actions";
import { packageToFormInput } from "./utils";
import type { PackageWithService } from "./utils";

type Props = {
  packages: PackageWithService[];
  services: { id: string; title: string }[];
  initialServiceId?: string;
};

export function PackagesManager({ packages, services, initialServiceId }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "card">("card");
  const [serviceFilter, setServiceFilter] = useState(initialServiceId ?? "");
  const [cardSearch, setCardSearch] = useState("");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<PackageWithService | null>(null);
  const [previewPkg, setPreviewPkg] = useState<PackageWithService | null>(null);
  const [deletingPkg, setDeletingPkg] = useState<PackageWithService | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditingPkg(null);
    setWizardOpen(true);
  };

  const openEdit = (pkg: PackageWithService) => {
    setEditingPkg(pkg);
    setWizardOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingPkg) return;
    setIsDeleting(true);
    try {
      const res = await deletePackage(deletingPkg.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Package deleted");
      setDeletingPkg(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPackages = useMemo(() => {
    if (!serviceFilter) return packages;
    return packages.filter((p) => p.serviceId === serviceFilter);
  }, [packages, serviceFilter]);

  const filteredCardPackages = useMemo(() => {
    const q = cardSearch.trim().toLowerCase();
    if (!q) return filteredPackages;
    return filteredPackages.filter((p) => p.name.toLowerCase().includes(q) || p.service.title.toLowerCase().includes(q));
  }, [filteredPackages, cardSearch]);

  const columns: ColumnDef<PackageWithService>[] = [
    {
      header: "Package",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0" style={{ backgroundImage: `url(${item.image || item.service.image})` }} />
          <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
        </div>
      ),
    },
    {
      header: "Service",
      cell: (item) => (
        <button
          onClick={() => setServiceFilter(item.serviceId)}
          className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
        >
          {item.service.title}
        </button>
      ),
    },
    {
      header: "Price",
      accessorKey: "price",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-900 dark:text-white">₹{item.price}</span>
          {item.originalPrice > item.price && <span className="text-xs text-slate-400 line-through">₹{item.originalPrice}</span>}
        </div>
      ),
    },
    { header: "Duration", accessorKey: "time", sortable: true, cell: (item) => item.time || "—" },
    { header: "Tag", accessorKey: "tag", sortable: true, cell: (item) => item.tag || "—" },
    {
      header: "Actions",
      cell: (item) => (
        <PackageActions onView={() => setPreviewPkg(item)} onEdit={() => openEdit(item)} onDelete={() => setDeletingPkg(item)} />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Packages</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage packages offered across all services.{" "}
            <Link href="/admin/services" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
              Manage services →
            </Link>
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-colors shrink-0 cursor-pointer"
        >
          <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
          Create Package
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All services</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.title}
              </option>
            ))}
          </select>
          {serviceFilter && (
            <button
              onClick={() => setServiceFilter("")}
              className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex items-center gap-1 cursor-pointer"
            >
              <ClientIcon icon="ph:x-bold" className="w-3 h-3" />
              Clear filter
            </button>
          )}
          <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {filteredPackages.length} package{filteredPackages.length === 1 ? "" : "s"}
          </span>
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {filteredPackages.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <ClientIcon icon="ph:package-duotone" className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {packages.length === 0 ? "No packages yet. Create your first one to get started." : "No packages match this filter."}
          </p>
        </div>
      ) : view === "table" ? (
        <DataTable data={filteredPackages} columns={columns} searchPlaceholder="Search packages..." searchableFields={["name", "tag", "category"]} />
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={cardSearch}
            onChange={(e) => setCardSearch(e.target.value)}
            placeholder="Search packages..."
            className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCardPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col">
                <div className="h-28 bg-slate-200 dark:bg-slate-700 bg-cover bg-center" style={{ backgroundImage: `url(${pkg.image || pkg.service.image})` }} />
                <div className="p-3.5 flex flex-col gap-2 flex-1">
                  <button
                    onClick={() => setServiceFilter(pkg.serviceId)}
                    className="w-fit text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors cursor-pointer"
                  >
                    {pkg.service.title}
                  </button>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white leading-tight">{pkg.name}</span>
                    {pkg.tag && (
                      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400">
                        {pkg.tag}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-900 dark:text-white">₹{pkg.price}</span>
                    {pkg.originalPrice > pkg.price && <span className="text-xs text-slate-400 line-through">₹{pkg.originalPrice}</span>}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{pkg.time || "Duration not set"}</span>
                  <div className="mt-auto pt-2">
                    <PackageActions onView={() => setPreviewPkg(pkg)} onEdit={() => openEdit(pkg)} onDelete={() => setDeletingPkg(pkg)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredCardPackages.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No packages match your search.</p>}
        </div>
      )}

      {wizardOpen && (
        <PackageFormWizard
          isOpen={wizardOpen}
          onClose={() => setWizardOpen(false)}
          onSuccess={() => router.refresh()}
          services={services}
          initialServiceId={editingPkg ? undefined : serviceFilter || undefined}
          initialData={editingPkg ? packageToFormInput(editingPkg) : undefined}
          packageId={editingPkg?.id}
        />
      )}

      {previewPkg && (
        <PackagePreviewModal isOpen={Boolean(previewPkg)} onClose={() => setPreviewPkg(null)} pkg={previewPkg} serviceImage={previewPkg.service.image} />
      )}

      <ConfirmDeleteDialog
        isOpen={Boolean(deletingPkg)}
        title="Delete this package?"
        description={`"${deletingPkg?.name}" will be permanently removed. This can't be undone.`}
        isDeleting={isDeleting}
        onCancel={() => setDeletingPkg(null)}
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

function PackageActions({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <ActionButton icon="ph:eye-bold" label="View" onClick={onView} />
      <ActionButton icon="ph:pencil-simple-bold" label="Edit" onClick={onEdit} />
      <ActionButton icon="ph:trash-bold" label="Delete" onClick={onDelete} variant="danger" />
    </div>
  );
}

function ActionButton({ icon, label, onClick, variant }: { icon: string; label: string; onClick: () => void; variant?: "danger" }) {
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
