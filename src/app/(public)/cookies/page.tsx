import React from "react";
import { PolicyLayout, PolicySection } from "@/components/layout/PolicyLayout";

export const metadata = {
  title: "Cookie Settings | Handy Experts",
  description: "Learn about how Handy Experts uses cookies and similar technologies.",
};

export default function CookieSettingsPage() {
  const sections: PolicySection[] = [
    {
      id: "what-are-cookies",
      title: "1. What are Cookies?",
      content: (
        <>
          <p>
            Cookies are small text files that are stored on your device (computer, smartphone, tablet) when you visit a website. They are widely used to make websites work more efficiently and provide information to the website owners.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use-cookies",
      title: "2. How We Use Cookies",
      content: (
        <>
          <p>
            Handy Experts uses cookies for the following purposes:
          </p>
          <ul>
            <li><strong>Essential Cookies:</strong> These are required for the operation of our website, such as enabling you to log into secure areas of the site and completing bookings.</li>
            <li><strong>Analytical/Performance Cookies:</strong> These allow us to recognize and count the number of visitors and see how they navigate our website. This helps us improve the way our website works.</li>
            <li><strong>Functionality Cookies:</strong> These are used to recognize you when you return to our website, allowing us to personalize our content for you and remember your preferences.</li>
          </ul>
        </>
      ),
    },
    {
      id: "managing-cookies",
      title: "3. Managing Your Cookies",
      content: (
        <>
          <p>
            You can set your browser to refuse all or some browser cookies, or to alert you when websites set or access cookies. If you disable or refuse cookies, please note that some parts of this website may become inaccessible or not function properly.
          </p>
          <p>
            For more information on how to manage cookies on popular browsers, please visit your browser&apos;s official support documentation.
          </p>
        </>
      ),
    },
    {
      id: "third-party",
      title: "4. Third-Party Cookies",
      content: (
        <>
          <p>
            We may also use trusted third-party services (like Google Analytics or payment processors) that track this information on our behalf. These third parties may use cookies, web beacons, and other tracking technologies to collect information about your use of the website and other websites.
          </p>
        </>
      ),
    },
  ];

  return (
    <PolicyLayout
      title="Cookie Settings"
      description="Information about our use of cookies and tracking technologies."
      lastUpdated="January 20, 2026"
      sections={sections}
      contactEmail="support@handyexperts.com"
    />
  );
}
