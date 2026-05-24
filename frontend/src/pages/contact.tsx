import React from 'react';
import MainLayout from '@layouts/MainLayout';

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-6 py-10">
        <h1 className="text-3xl font-bold mb-6">Contact</h1>
        <div className="card space-y-2">
          <p>Email: info@eiilm.edu</p>
          <p>Phone: +91 00000 00000</p>
          <p>Address: Kolkata, West Bengal</p>
        </div>
      </div>
    </MainLayout>
  );
}
