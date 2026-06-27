import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@layouts/MainLayout';
import { useAuth } from '@hooks/useAuth';
import { studentApi } from '@api/endpoints';
import Link from 'next/link';
import { CreditCard, CheckCircle, AlertCircle, FileText } from 'lucide-react';

export default function FeesPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuth();
  const [fees, setFees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<number | null>(null);

  const loadFees = () => {
    setLoading(true);
    studentApi.fees()
      .then((res: any) => {
        if (res?.data) setFees(res.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    loadFees();
  }, [isAuthenticated, isHydrated, router]);

  const handlePay = async (feeId: number) => {
    if (!confirm('This will simulate a secure payment gateway transaction. Continue?')) return;
    
    setPayingId(feeId);
    try {
      await studentApi.payFee(feeId);
      alert('Payment successful! Your receipt has been generated.');
      loadFees();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Payment failed.');
    } finally {
      setPayingId(null);
    }
  };

  return (
    <MainLayout>
      <div className="bg-gray-50 min-h-screen pb-12">
        <div className="bg-primary-900 text-white pt-16 pb-24">
          <div className="max-w-6xl mx-auto px-6">
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Fee Management</h1>
            <p className="text-primary-200">View pending dues, payment history, and download receipts.</p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 -mt-12">
          {/* Quick Links */}
          <div className="flex gap-3 mb-8 bg-white p-2 rounded-2xl shadow-lg border border-gray-100 max-w-fit">
            <Link href="/student" className="px-5 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Dashboard
            </Link>
            <Link href="/student/grades" className="px-5 py-2 rounded-xl font-bold text-gray-500 hover:text-gray-900 transition-colors">
              Grades & Results
            </Link>
            <Link href="/student/fees" className="px-5 py-2 bg-primary-50 text-primary-700 rounded-xl font-bold transition-colors">
              Fee Management
            </Link>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Invoices & Receipts</h2>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4">Title / Description</th>
                    <th className="px-6 py-4">Amount (INR)</th>
                    <th className="px-6 py-4">Due Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500 animate-pulse">Loading fee records...</td></tr>
                  ) : fees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <CheckCircle size={48} className="mb-4 text-emerald-300" />
                          <p className="text-lg font-bold text-gray-900">All Clear!</p>
                          <p>You have no pending fees or past records.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    fees.map((f) => (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-gray-900">{f.title}</td>
                        <td className="px-6 py-4 font-mono font-bold text-gray-700">₹{parseFloat(f.amount).toLocaleString('en-IN')}</td>
                        <td className="px-6 py-4 text-gray-500">{new Date(f.due_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${f.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : f.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            {f.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {f.status === 'Paid' ? (
                            <button className="flex items-center justify-end gap-1 text-emerald-600 hover:text-emerald-700 font-bold text-xs w-full">
                              <FileText size={14} /> Download Receipt
                            </button>
                          ) : (
                            <button 
                              onClick={() => handlePay(f.id)}
                              disabled={payingId === f.id}
                              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm transition-all"
                            >
                              {payingId === f.id ? 'Processing...' : 'Pay Securely'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
