import React from 'react';
import MainLayout from '@layouts/MainLayout';

export default function AboutPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">About College ERP</h1>
        <div className="card space-y-3">
          <p>
            College ERP is designed to unify admissions, academics, and administration in one
            secure, scalable platform.
          </p>
          <p>
            This implementation includes role-based APIs, inquiry management, course publishing,
            and an authenticated dashboard foundation.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
