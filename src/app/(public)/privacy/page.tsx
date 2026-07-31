import React from "react";
import { PolicyLayout, PolicySection } from "@/components/layout/PolicyLayout";

export const metadata = {
  title: "Privacy Policy | Handyzo",
  description: "Learn how we collect, use, and protect your personal information at Handyzo.",
};

export default function PrivacyPolicyPage() {
  const sections: PolicySection[] = [
    {
      id: "information-we-collect",
      title: "1. Information We Collect",
      content: (
        <>
          <p>
            This Privacy Policy (&quot;Policy&quot;) outlines how Handyzo (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses, and protects your personal information when you access our website and use our home services platform (&quot;Services&quot;). This Policy also explains your rights regarding the information we collect. By accessing our website and using our Services, you consent to the terms of this Policy.
          </p>
          <p>
            <strong>Personal Information:</strong> When you book a service or interact with our website, we may collect personal information such as your name, email address, phone number, physical address, and payment details. We only collect personal information that is relevant and necessary for providing our Services.
          </p>
          <p>
            <strong>Automatically Collected Information:</strong> We may automatically collect certain information about your device, browsing actions, and patterns, such as your IP address, browser type, referring/exit pages, and operating system. This information is collected using cookies and similar technologies and is used for analytics purposes to improve our Services.
          </p>
        </>
      ),
    },
    {
      id: "use-of-information",
      title: "2. Use of Information",
      content: (
        <>
          <p>
            We use the information we collect for various purposes, including but not limited to:
          </p>
          <ul>
            <li>Providing and managing the home services you request.</li>
            <li>Processing payments and sending related information, including confirmations and invoices.</li>
            <li>Communicating with you about your bookings, account, or customer service inquiries.</li>
            <li>Improving our website, services, and overall customer experience.</li>
            <li>Detecting, preventing, and addressing fraud or technical issues.</li>
          </ul>
        </>
      ),
    },
    {
      id: "information-sharing",
      title: "3. Information Sharing",
      content: (
        <>
          <p>
            We respect your privacy and will not sell, rent, or lease your personal information to third parties. We may share your information only in the following circumstances:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> We may share your information with trusted third-party service providers (like payment processors and our verified professionals) who need access to such information to carry out work on our behalf.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information when we believe it is appropriate to comply with the law, enforce our site policies, or protect ours or others&apos; rights, property, or safety.</li>
          </ul>
        </>
      ),
    },
    {
      id: "data-security",
      title: "4. Data Security",
      content: (
        <>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems and are required to keep the information confidential. 
          </p>
          <p>
            However, no method of transmission over the Internet, or method of electronic storage, is 100% secure. Therefore, while we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </>
      ),
    },
    {
      id: "your-rights",
      title: "5. Your Rights",
      content: (
        <>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, such as the right to access, update, or delete the information we have on you. If you wish to exercise any of these rights, please contact us using the information provided in the &quot;Contact Us&quot; section.
          </p>
        </>
      ),
    },
    {
      id: "childrens-privacy",
      title: "6. Children's Privacy",
      content: (
        <>
          <p>
            Our Services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that a child under 18 has provided us with personal information, we will take steps to delete such information.
          </p>
        </>
      ),
    },
    {
      id: "changes-to-policy",
      title: "7. Changes to Policy",
      content: (
        <>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </>
      ),
    },
  ];

  return (
    <PolicyLayout
      title="Privacy Policy"
      description="Learn how Handyzo collects, uses, and protects your personal information."
      lastUpdated="January 15, 2026"
      sections={sections}
      contactEmail="support@Handyzo.com"
    />
  );
}
