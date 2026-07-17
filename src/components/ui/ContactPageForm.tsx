import React from "react";
import { ClientIcon } from "@/components/ui/ClientIcon";
import { Input } from "@/components/ui/Input";

export function ContactPageForm() {
  return (
    <div className="h-auto lg:h-full bg-slate-50 dark:bg-[#0B1120] rounded-[24px] border border-slate-200 dark:border-slate-800/60 p-6 sm:p-8 shadow-sm flex flex-col">
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">Send a Message</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Fill out the form below and we&apos;ll get back to you shortly.</p>
      </div>

      <form className="space-y-5" action="">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input 
            inputType="input"
            type="text"
            placeholder="First Name"
            icon="ph:user"
          />
          <Input 
            inputType="input"
            type="text"
            placeholder="Last Name"
            icon="ph:user"
          />
        </div>

        <Input 
          inputType="input"
          type="email"
          placeholder="Email Address"
          icon="ph:envelope-simple"
        />

        <Input 
          inputType="select"
          placeholder="How can we help you?"
          icon="ph:question"
          options={[
            { value: "general", label: "General Inquiry" },
            { value: "support", label: "Customer Support" },
            { value: "sales", label: "Sales & Pricing" },
          ]}
        />

        <Input 
          inputType="textarea"
          placeholder="Write your message here..."
          rows={5}
          className="resize-none !pl-5" 
        />

        <div className="pt-4">
          <button 
            type="submit"
            className="w-full bg-[#00B4FF] hover:bg-[#009EE0] text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(0,180,255,0.3)] hover:shadow-[0_0_25px_rgba(0,180,255,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            Send Message
            <ClientIcon icon="ph:paper-plane-tilt-bold" className="w-4 h-4" />
          </button>
          
          <div className="text-center mt-6">
            <p className="text-[11px] text-slate-500">
              By submitting, you agree to our <a href="#" className="text-slate-900 dark:text-white hover:underline">Privacy Policy</a>.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
