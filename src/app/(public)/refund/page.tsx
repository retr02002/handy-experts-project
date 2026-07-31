import React from "react";
import { PolicyLayout, PolicySection } from "@/components/layout/PolicyLayout";

export const metadata = {
  title: "Refund Policy | Handyzo",
  description: "Read our Refund Policy for services provided by Handyzo.",
};

export default function RefundPolicyPage() {
  const sections: PolicySection[] = [
    {
      id: "general-refunds",
      title: "1. General Refund Policy",
      content: (
        <>
          <p>
            At Handyzo, we strive to ensure you are completely satisfied with the services you receive. If you are not satisfied with the quality of the work provided by a Professional, please contact us within 24 hours of the service completion.
          </p>
        </>
      ),
    },
    {
      id: "eligibility",
      title: "2. Eligibility for Refunds",
      content: (
        <>
          <p>
            Refunds are evaluated on a case-by-case basis. You may be eligible for a full or partial refund if:
          </p>
          <ul>
            <li>The Professional did not arrive for the scheduled booking and a suitable replacement could not be found.</li>
            <li>The service provided fundamentally deviated from the agreed-upon scope of work.</li>
            <li>Damage occurred to your property directly caused by the Professional&apos;s negligence (subject to our property damage claim process).</li>
          </ul>
        </>
      ),
    },
    {
      id: "process",
      title: "3. Refund Process",
      content: (
        <>
          <p>
            To request a refund, please contact our support team at support@Handyzo.com with your booking reference and evidence (e.g., photos) of the issue. We will review your claim and respond within 3-5 business days. Approved refunds will be credited back to your original payment method within 5-10 business days.
          </p>
        </>
      ),
    },
    {
      id: "non-refundable",
      title: "4. Non-Refundable Items",
      content: (
        <>
          <p>
            Please note that the following are generally non-refundable:
          </p>
          <ul>
            <li>Material costs for items custom-purchased for your specific project.</li>
            <li>Services that you personally signed off on as &quot;completed to satisfaction&quot; at the end of the appointment.</li>
          </ul>
        </>
      ),
    },
  ];

  return (
    <PolicyLayout
      title="Refund Policy"
      description="Our guidelines for refunds and service satisfaction guarantees."
      lastUpdated="March 1, 2026"
      sections={sections}
      contactEmail="support@Handyzo.com"
    />
  );
}
