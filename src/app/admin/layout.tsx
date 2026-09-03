import React from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminLayoutWrapper } from '@/components/admin/layout/AdminLayoutWrapper';
import { AdminLoginGate } from '@/components/admin/AdminLoginGate';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== 'SUPER_ADMIN') {
    return <AdminLoginGate />;
  }

  return (
    <AdminLayoutWrapper>
      {children}
    </AdminLayoutWrapper>
  );
}
