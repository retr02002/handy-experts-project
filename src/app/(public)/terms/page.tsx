import React from "react";
import { PolicyLayout, PolicySection } from "@/components/layout/PolicyLayout";

export const metadata = {
  title: "Terms of Service | Handy Experts",
  description: "Read our Terms of Service for using Handy Experts.",
};

export default function TermsOfServicePage() {
  const sections: PolicySection[] = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      content: (
        <>
          <p>
            By accessing or using the Handy Experts platform and services (collectively, the &quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to all the terms and conditions of this agreement, then you may not access the website or use any Services.
          </p>
        </>
      ),
    },
    {
      id: "description-of-service",
      title: "2. Description of Service",
      content: (
        <>
          <p>
            Handy Experts provides a digital marketplace connecting homeowners and businesses with independent service professionals (&quot;Professionals&quot;) for various home maintenance, repair, and improvement tasks. We provide the platform for booking, but the actual services are performed by independent contractors.
          </p>
        </>
      ),
    },
    {
      id: "user-obligations",
      title: "3. User Obligations",
      content: (
        <>
          <p>
            As a user of our Services, you agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information when booking a service.</li>
            <li>Ensure a safe working environment for the Professionals you hire.</li>
            <li>Be present or have an authorized representative present during the service window.</li>
            <li>Pay all charges and fees associated with the booked services in a timely manner.</li>
          </ul>
        </>
      ),
    },
    {
      id: "payments",
      title: "4. Payments & Billing",
      content: (
        <>
          <p>
            You agree to pay the quoted fees for any services booked through the Handy Experts platform. Payments are securely processed through our third-party payment gateways. A hold may be placed on your credit card prior to the service, and the final charge will be processed upon service completion.
          </p>
        </>
      ),
    },
    {
      id: "liability",
      title: "5. Limitation of Liability",
      content: (
        <>
          <p>
            Handy Experts acts as a technology platform connecting users with Professionals. We do not directly employ the Professionals. To the maximum extent permitted by law, Handy Experts shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services or the actions of the independent Professionals.
          </p>
        </>
      ),
    },
  ];

  return (
    <PolicyLayout
      title="Terms of Service"
      description="The rules and guidelines for using the Handy Experts platform."
      lastUpdated="February 10, 2026"
      sections={sections}
      contactEmail="support@handyexperts.com"
    />
  );
}
