"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ClientIcon } from "@/components/ui/ClientIcon";
import {
  getVendorPricingDataAction,
  setVendorCategoryPricingAction,
  setVendorServicePricingAction,
  setVendorPackagePricingAction,
  type CategoryPricingNode,
  type PricingNode,
  type PricingInputType,
} from "@/actions/vendorpricing.actions";

type Level = "CATEGORY" | "SERVICE" | "PACKAGE";

function PricingRow({
  node,
  level,
  onSave,
  hasChildren,
  isExpanded,
  onToggleExpand,
}: {
  node: PricingNode;
  level: Level;
  onSave: (type: PricingInputType | null, value: number | null) => Promise<void>;
  hasChildren?: boolean;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  const [type, setType] = useState<PricingInputType | null>(node.type);
  const [value, setValue] = useState<string>(node.value !== null ? String(node.value) : "");
  const [isSaving, setIsSaving] = useState(false);

  const hasOverride = node.type !== null && node.value !== null;
  const hasGlobal = node.globalType !== null && node.globalValue !== null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const numVal = value ? Number(value) : null;
      let finalType = type;
      if (numVal !== null && !finalType) finalType = "FLAT";
      if (numVal === null) finalType = null;
      
      await onSave(finalType, numVal);
      toast.success("Pricing override saved");
    } finally {
      setIsSaving(false);
    }
  };

  const mlClass = level === "SERVICE" ? "ml-6" : level === "PACKAGE" ? "ml-12" : "";
  const bgClass = level === "CATEGORY" ? "bg-white dark:bg-[#0F172A]" : level === "SERVICE" ? "bg-slate-50 dark:bg-slate-900/50" : "bg-transparent";

  return (
    <div className={`flex flex-col gap-2 p-4 border-b border-slate-100 dark:border-slate-800 ${bgClass}`}>
      <div className={`flex items-center justify-between gap-4 ${mlClass}`}>
        <div className="flex items-center gap-3">
          {hasChildren && onToggleExpand && (
            <button type="button" onClick={onToggleExpand} className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700">
              <ClientIcon icon={isExpanded ? "ph:caret-down-bold" : "ph:caret-right-bold"} className="w-4 h-4 text-slate-500" />
            </button>
          )}
          {!hasChildren && <div className="w-6 shrink-0" />}
          <div className="flex flex-col">
            <span className={`font-semibold text-slate-900 dark:text-white ${level === "CATEGORY" ? "text-sm" : "text-xs"}`}>
              {node.name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">
              {level}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-medium text-slate-400">Global Default</span>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {hasGlobal ? `${node.globalType === "FLAT" ? "₹" : ""}${node.globalValue}${node.globalType === "PERCENTAGE" ? "%" : ""}` : "—"}
            </span>
          </div>
          
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden shrink-0">
              <button
                type="button"
                onClick={() => setType("FLAT")}
                className={`px-3 h-9 text-xs font-bold cursor-pointer ${type === "FLAT" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                Flat ₹
              </button>
              <button
                type="button"
                onClick={() => setType("PERCENTAGE")}
                className={`px-3 h-9 text-xs font-bold cursor-pointer ${type === "PERCENTAGE" ? "bg-[#00B4FF] text-white" : "bg-white dark:bg-slate-900 text-slate-500"}`}
              >
                %
              </button>
            </div>
            <input
              type="number"
              min={0}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (e.target.value && !type) setType("FLAT");
              }}
              placeholder="e.g. 50"
              className={`w-20 h-9 rounded-lg px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 border ${
                hasOverride 
                  ? "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-200" 
                  : "bg-slate-50 border-slate-200 text-slate-900 dark:bg-slate-900/50 dark:border-slate-700/80 dark:text-white"
              }`}
            />
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (type === node.type && (value ? Number(value) : null) === node.value)}
              className="h-9 px-3 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold disabled:opacity-40 cursor-pointer"
            >
              {isSaving ? "..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function VendorPricingTab({ vendorId }: { vendorId: string }) {
  const [data, setData] = useState<CategoryPricingNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set());
  const [expandedSvcs, setExpandedSvcs] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    // Avoid showing loading spinner on reload so the UI doesn't flash
    const res = await getVendorPricingDataAction(vendorId);
    if (!res.success) {
      toast.error("error" in res && res.error ? res.error : "Failed to load pricing data");
    } else if (res.data) {
      setData(res.data);
    }
  }, [vendorId]);

  useEffect(() => {
    let mounted = true;

    async function fetchInitial() {
      const res = await getVendorPricingDataAction(vendorId);
      if (!mounted) return;

      if (!res.success) {
        toast.error("error" in res && res.error ? res.error : "Failed to load pricing data");
      } else if (res.data) {
        setData(res.data);
        // Auto-expand all by default only on initial load, don't reset user state on save
        setExpandedCats(new Set(res.data.map(c => c.id)));
        setExpandedSvcs(new Set(res.data.flatMap(c => c.services.map(s => s.id))));
      }
      setLoading(false);
    }

    void fetchInitial();

    return () => {
      mounted = false;
    };
  }, [vendorId]);

  const toggleCat = (id: string) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSvc = (id: string) => {
    setExpandedSvcs(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-slate-500">Loading pricing tree...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        This vendor has no assigned categories. Assign categories in the Coverage tab first.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Custom Pricing Tree:</strong> Set specific overrides for this vendor. These values apply only to this vendor and override their global &quot;Call Pricing&quot; default as well as any global category/service defaults.
        </p>
      </div>

      <div className="flex flex-col bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {data.map((cat) => (
          <div key={cat.id} className="flex flex-col">
            <PricingRow
              node={cat}
              level="CATEGORY"
              hasChildren={cat.services.length > 0}
              isExpanded={expandedCats.has(cat.id)}
              onToggleExpand={() => toggleCat(cat.id)}
              onSave={async (t, v) => {
                const res = await setVendorCategoryPricingAction(vendorId, cat.id, t, v);
                if (res.success) load();
              }}
            />
            
            {expandedCats.has(cat.id) && cat.services.map((svc) => (
              <div key={svc.id} className="flex flex-col">
                <PricingRow
                  node={svc}
                  level="SERVICE"
                  hasChildren={svc.packages.length > 0}
                  isExpanded={expandedSvcs.has(svc.id)}
                  onToggleExpand={() => toggleSvc(svc.id)}
                  onSave={async (t, v) => {
                    const res = await setVendorServicePricingAction(vendorId, svc.id, t, v);
                    if (res.success) load();
                  }}
                />

                {expandedSvcs.has(svc.id) && svc.packages.map((pkg) => (
                  <PricingRow
                    key={pkg.id}
                    node={pkg}
                    level="PACKAGE"
                    onSave={async (t, v) => {
                      const res = await setVendorPackagePricingAction(vendorId, pkg.id, t, v);
                      if (res.success) load();
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
