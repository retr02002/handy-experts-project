import React from "react";
import { TechnicianLayoutWrapper } from "@/components/technician/layout/TechnicianLayoutWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Technician Dashboard | Handy Experts",
  description: "Technician portal for Handy Experts",
};

export default function TechnicianLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TechnicianLayoutWrapper>{children}</TechnicianLayoutWrapper>;
}
