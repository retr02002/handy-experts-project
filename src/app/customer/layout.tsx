import React from "react";
import { Metadata } from "next";
import { CustomerLayoutWrapper } from "@/components/customer/layout/CustomerLayoutWrapper";

export const metadata: Metadata = {
  title: "Customer Portal | Handy Experts",
  description: "Customer portal for Handy Experts",
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return <CustomerLayoutWrapper>{children}</CustomerLayoutWrapper>;
}
