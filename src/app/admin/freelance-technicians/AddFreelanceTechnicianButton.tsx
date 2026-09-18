"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { CreateFreelanceTechnicianModal } from "@/components/admin/technicians/CreateFreelanceTechnicianModal";

export function AddFreelanceTechnicianButton() {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center gap-2 bg-[#00B4FF] hover:bg-[#0096fa] text-white text-sm font-bold rounded-xl px-4 py-2.5 transition-colors cursor-pointer"
      >
        <ClientIcon icon="ph:plus-bold" className="w-4 h-4" />
        Add Technician
      </button>

      {modalOpen && (
        <CreateFreelanceTechnicianModal
          onClose={() => setModalOpen(false)}
          onCreated={() => {
            setModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
