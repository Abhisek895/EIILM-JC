import React from 'react';
import DashboardLayout from '@layouts/DashboardLayout';
import HomeSliderManager from '@components/admin/HomeSliderManager';

export default function AdminHomeSliderPage() {
  return (
    <DashboardLayout>
      <div className="bg-slate-50 min-h-[80vh] rounded-3xl p-6 lg:p-8">
        <HomeSliderManager />
      </div>
    </DashboardLayout>
  );
}
