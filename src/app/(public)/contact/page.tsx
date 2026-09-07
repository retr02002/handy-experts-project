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

      
      <ContactPageSection />
    </div>
  );
}
