"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/shared/Modal";
import { StarInput } from "@/components/shared/StarRating";
import { submitReviewAction } from "@/actions/review.actions";

export function RateJobModal({
  serviceCallId,
  technicianName,
  onClose,
  onSubmitted,
}: {
  serviceCallId: string;
  technicianName: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [technicianRating, setTechnicianRating] = useState(0);
  const [technicianComment, setTechnicianComment] = useState("");
  const [serviceRating, setServiceRating] = useState(0);
  const [serviceComment, setServiceComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (technicianRating === 0 || serviceRating === 0) {
      toast.error("Please give both a technician and a service rating.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitReviewAction(serviceCallId, {
        technicianRating,
        technicianComment,
        serviceRating,
        serviceComment,
      });
      if (!res.success) {
        toast.error(res.error || "Couldn't submit your review");
        return;
      }
      toast.success("Thanks for the feedback!");
      onSubmitted();
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClass =
    "w-full mt-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#00B4FF]/40";

  return (
    <Modal
      title="Rate your experience"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="w-full h-11 rounded-xl bg-[#00B4FF] hover:bg-[#0096fa] disabled:opacity-60 text-white text-sm font-bold transition-colors cursor-pointer"
        >
          {isSubmitting ? "Submitting..." : "Submit review"}
        </button>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <StarInput
            value={technicianRating}
            onChange={setTechnicianRating}
            label={technicianName ? `Your technician, ${technicianName}` : "Your technician"}
          />
          <textarea
            value={technicianComment}
            onChange={(e) => setTechnicianComment(e.target.value)}
            placeholder="How did they do? (optional)"
            maxLength={1000}
            className={fieldClass}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <StarInput value={serviceRating} onChange={setServiceRating} label="The service itself" />
          <textarea
            value={serviceComment}
            onChange={(e) => setServiceComment(e.target.value)}
            placeholder="Anything about the service? (optional)"
            maxLength={1000}
            className={fieldClass}
          />
        </div>
      </div>
    </Modal>
  );
}
