import React from 'react';
import { Banner } from '@/components/ui/Banner';
import { ContactPageSection } from '@/components/ui/ContactPageSection';

export const metadata = {
  title: 'Contact Us | Handyzo',
  description: 'Get in touch with the Handyzo team for support, inquiries, or feedback.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Banner 
        title="Contact Us" 
        highlightedWord="Contact"
        badge="Get In Touch"
        badgeIcon="ph:envelope-simple-fill"
        description="We are here to help. Reach out to our support team for any inquiries, feedback, or assistance you need."
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Contact Us' }
        ]}
        bgImage="/banner_contact.png"
      />
      
      <ContactPageSection />
    </div>
  );
}
