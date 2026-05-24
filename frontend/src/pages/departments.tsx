import React from 'react';
import MainLayout from '@layouts/MainLayout';

export default function DepartmentsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Departments</h1>
        <div className="card">
          Department module is ready for API integration. Add department records and endpoints
          to display department-specific content here.
        </div>
      </div>
    </MainLayout>
  );
}
