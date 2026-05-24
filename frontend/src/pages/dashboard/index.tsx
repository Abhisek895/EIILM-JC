import React from 'react';
import DashboardLayout from '@layouts/DashboardLayout';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Students', value: '2,543', icon: '👥' },
    { label: 'Courses', value: '24', icon: '📚' },
    { label: 'Faculty', value: '187', icon: '👨‍🏫' },
    { label: 'Events', value: '12', icon: '📅' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="card">
              <div className="text-4xl mb-4">{stat.icon}</div>
              <p className="text-gray-600 text-sm">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent Inquiries */}
        <div className="card">
          <h2 className="text-xl font-bold mb-6">Recent Inquiries</h2>
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-2 px-4 font-semibold">Name</th>
                <th className="text-left py-2 px-4 font-semibold">Email</th>
                <th className="text-left py-2 px-4 font-semibold">Course</th>
                <th className="text-left py-2 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">John Doe</td>
                  <td className="py-3 px-4">john@example.com</td>
                  <td className="py-3 px-4">BCA</td>
                  <td className="py-3 px-4">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
