import React from "react";
import { VendorLayoutWrapper } from "@/components/vendor/layout/VendorLayoutWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vendor Dashboard | Handy Experts",
  description: "Manage your technicians, services, and live calls.",
};

export default function VendorRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VendorLayoutWrapper>{children}</VendorLayoutWrapper>;
}
