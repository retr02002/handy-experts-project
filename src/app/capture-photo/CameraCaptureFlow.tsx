"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { CameraCapture } from "@/components/technician/CameraCapture";

/** Full-viewport, no dashboard chrome — this gates entry to /technician, so it can't reuse TechnicianLayoutWrapper. */
export function CameraCaptureFlow() {
  const router = useRouter();
  const { update } = useSession();
  const [done, setDone] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020813] flex flex-col items-center justify-center px-6 py-10 gap-6">
      <Image src="/logo-org.svg" alt="Handyzo" width={140} height={48} className="h-10 w-auto object-contain dark:brightness-0 dark:invert" />

      <div className="text-center max-w-sm">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Add your photo</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Used on your profile and your Handyzo technician ID card. Takes a second.
        </p>
      </div>

      {done ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Photo saved</p>
        </div>
      ) : (
        <CameraCapture
          onUploaded={() => {
            setDone(true);
            void update();
            router.replace("/technician");
          }}
        />
      )}
    </div>
  );
}
