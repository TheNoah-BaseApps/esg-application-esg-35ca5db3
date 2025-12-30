'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import AppBar from './AppBar';

export default function DashboardLayout({ children, user }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppBar 
        user={user} 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)} 
      />
      <div className="flex pt-16">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 p-6 lg:pl-72">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}