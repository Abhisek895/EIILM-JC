import React from 'react';
import MainLayout from '@layouts/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">🎓 Welcome to College ERP</h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Excellence in Education Management. Complete college operations platform for admissions, academics, and administration.
          </p>
          <div className="flex justify-center gap-4">
            <a href="/admissions" className="btn-primary">Admission Portal</a>
            <a href="/courses" className="btn-secondary">Explore Courses</a>
          </div>
        </div>
      </div>

      {/* Features section */}
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">College Management System</h2>
        <div className="grid grid-cols-3 gap-8">
          {[
            { title: '📚 Academic Management', desc: 'Manage courses, departments, faculty, and syllabus' },
            { title: '📋 Admission & CRM', desc: 'Handle student inquiries, applications, and enrollment' },
            { title: '⚙️ Dynamic CMS', desc: 'Update website content without technical knowledge' },
          ].map((feature, idx) => (
            <div key={idx} className="card hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </MainLayout>
  );
}
