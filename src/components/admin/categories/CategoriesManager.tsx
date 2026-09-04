"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { DataTable, ColumnDef } from "@/components/ui/DataTable";
import { ConfirmDeleteDialog } from "@/components/admin/services/ConfirmDeleteDialog";
import { CategoryFormModal } from "./CategoryFormModal";
import { deleteCategory } from "@/actions/category.actions";
import { categoryToFormInput } from "./utils";
import type { CategoryWithCount } from "./utils";

type Props = {
  categories: CategoryWithCount[];
};

/** Same flattening reason as ServicesManager — DataTable sorts/searches raw values. */
type CategoryRow = CategoryWithCount & { serviceCount: number; status: string };

export function CategoriesManager({ categories }: Props) {
  const router = useRouter();
  const [view, setView] = useState<"table" | "card">("card");
  const [cardSearch, setCardSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryWithCount | null>(null);
  const [deleting, setDeleting] = useState<CategoryWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (category: CategoryWithCount) => {
    setEditing(category);
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      const res = await deleteCategory(deleting.id);
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Category deleted");
      setDeleting(null);
      router.refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const rows: CategoryRow[] = useMemo(
    () =>
      categories.map((c) => ({
        ...c,
        serviceCount: c._count.services,
        status: c.isActive ? "Active" : "Hidden",
      })),
    [categories]
  );

  const filteredCards = useMemo(() => {
    const q = cardSearch.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [categories, cardSearch]);

  const columns: ColumnDef<CategoryRow>[] = [
    {
      header: "Category",
      accessorKey: "name",
      sortable: true,
      cell: (item) => (
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 bg-cover bg-center shrink-0 flex items-center justify-center"
            style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
          >
            {!item.image && <ClientIcon icon={item.icon || "ph:tag-bold"} className="w-4 h-4 text-slate-500" />}
          </div>
          <div className="flex flex-col">
            <span className="font-medium text-slate-900 dark:text-white">{item.name}</span>
            <span className="text-xs text-slate-500">{item.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Services",
      accessorKey: "serviceCount",
      sortable: true,
      cell: (item) => (
        <Link
          href={`/admin/services`}
          className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors"
        >
          {item.serviceCount}
        </Link>
      ),
    },
    { header: "Order", accessorKey: "sortOrder", sortable: true },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (item) => <StatusPill isActive={item.isActive} />,
    },
    {
      header: "Actions",
      cell: (item) => (
        <div className="flex items-center gap-1">
          <ActionButton icon="ph:pencil-simple-bold" label="Edit" onClick={() => openEdit(item)} />
          <ActionButton icon="ph:trash-bold" label="Delete" onClick={() => setDeleting(item)} variant="danger" />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Group services for the homepage grid, slider and filters.{" "}
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
          Create Category
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {categories.length} categor{categories.length === 1 ? "y" : "ies"} total
        </span>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <ClientIcon icon="ph:tag-duotone" className="w-10 h-10 text-slate-300" />
          <p className="text-sm text-slate-500 dark:text-slate-400">No categories yet. Create one before adding services.</p>
        </div>
      ) : view === "table" ? (
        <DataTable data={rows} columns={columns} searchPlaceholder="Search categories..." searchableFields={["name", "slug", "status"]} />
      ) : (
        <div className="flex flex-col gap-4">
          <input
            type="text"
            value={cardSearch}
            onChange={(e) => setCardSearch(e.target.value)}
            placeholder="Search categories..."
            className="w-full sm:w-80 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCards.map((category) => (
              <div
                key={category.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm flex flex-col"
              >
                <div
                  className="h-32 bg-slate-200 dark:bg-slate-700 bg-cover bg-center relative flex items-center justify-center"
                  style={category.image ? { backgroundImage: `url(${category.image})` } : undefined}
                >
                  {!category.image && <ClientIcon icon={category.icon || "ph:tag-duotone"} className="w-10 h-10 text-slate-400" />}
                  <span className="absolute top-3 left-3">
                    <StatusPill isActive={category.isActive} />
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1">
                  <div className="flex items-center gap-2">
                    {category.icon && <ClientIcon icon={category.icon} className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
                    <h3 className="font-black text-slate-900 dark:text-white leading-tight">{category.name}</h3>
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{category.slug}</span>
                  {category.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{category.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold">
                      {category._count.services} service{category._count.services === 1 ? "" : "s"}
                    </span>
                    <span className="font-semibold">Order {category.sortOrder}</span>
                  </div>
                  <div className="mt-auto pt-2 flex items-center gap-1">
                    <ActionButton icon="ph:pencil-simple-bold" label="Edit" onClick={() => openEdit(category)} />
                    <ActionButton icon="ph:trash-bold" label="Delete" onClick={() => setDeleting(category)} variant="danger" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredCards.length === 0 && <p className="text-sm text-slate-400 text-center py-8">No categories match your search.</p>}
        </div>
      )}

      {modalOpen && (
        <CategoryFormModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={() => router.refresh()}
          initialData={editing ? categoryToFormInput(editing) : undefined}
          categoryId={editing?.id}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={Boolean(deleting)}
        title="Delete this category?"
        description={
          deleting && deleting._count.services > 0
            ? `"${deleting.name}" still has ${deleting._count.services} service${
                deleting._count.services === 1 ? "" : "s"
              } attached. Reassign them from the Service Catalog before deleting.`
            : `"${deleting?.name}" will be permanently removed. This can't be undone.`
        }
        isDeleting={isDeleting}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

function StatusPill({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide ${
        isActive
          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
      }`}
    >
      {isActive ? "Active" : "Hidden"}
    </span>
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
