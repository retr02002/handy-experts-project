import React from "react";
import { PolicyLayout, PolicySection } from "@/components/layout/PolicyLayout";

export const metadata = {
  title: "Cancellation Policy | Handy Experts",
  description: "Read our Cancellation Policy for booking and managing services.",
};

export default function CancellationPolicyPage() {
  const sections: PolicySection[] = [
    {
      id: "customer-cancellations",
      title: "1. Customer Cancellations",
      content: (
        <>
          <p>
            We understand that plans change. You can cancel or reschedule your booking through our platform without any penalty if done with sufficient notice.
          </p>
          <ul>
            <li><strong>More than 24 hours notice:</strong> Full refund or free rescheduling.</li>
            <li><strong>Less than 24 hours notice:</strong> You may be charged a late cancellation fee to compensate the Professional for their reserved time.</li>
            <li><strong>At the door / No-show:</strong> If the Professional arrives and you cancel or are not present, you will be charged the full minimum service fee.</li>
          </ul>
        </>
      ),
    },
    {
      id: "professional-cancellations",
      title: "2. Professional Cancellations",
      content: (
        <>
          <p>
            In the rare event that a Professional needs to cancel your booking due to an emergency, we will notify you immediately and attempt to find a replacement Professional for your scheduled time. If a replacement cannot be found, you will receive a full refund and a credit towards your next booking.
          </p>
        </>
      ),
    },
    {
      id: "rescheduling",
      title: "3. Rescheduling",
      content: (
        <>
          <p>
            Rescheduling a service is completely free if done more than 24 hours in advance. Repeated rescheduling of the same booking may flag your account and require manual review.
          </p>
        </>
      ),
    },
  ];

  return (
    <PolicyLayout
      title="Cancellation Policy"
      description="Rules for cancelling or rescheduling your Handy Experts bookings."
      lastUpdated="March 5, 2026"
      sections={sections}
      contactEmail="support@handyexperts.com"
    />
  );
}
