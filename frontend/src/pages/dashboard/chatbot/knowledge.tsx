import React, { useEffect, useState } from 'react';
import DashboardLayout from '@layouts/DashboardLayout';
import { chatbotApi } from '@api/endpoints';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';
import Link from 'next/link';

export default function KnowledgeBase() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ category: 'General', question: '', answer: '', keywords: '' });

  const loadRecords = () => {
    setLoading(true);
    chatbotApi.getAllKnowledge()
      .then((res: any) => setRecords(res?.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadRecords(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await chatbotApi.updateKnowledge(editId, formData);
      } else {
        await chatbotApi.createKnowledge(formData);
      }
      setIsModalOpen(false);
      setFormData({ category: 'General', question: '', answer: '', keywords: '' });
      setEditId(null);
      loadRecords();
    } catch (err) {
      alert('Failed to save record.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await chatbotApi.deleteKnowledge(id);
      loadRecords();
    }
  };

  const filteredRecords = records.filter(r => 
    r.question.toLowerCase().includes(search.toLowerCase()) || 
    r.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="text-gray-500">Train the AI by adding exact Questions and Answers.</p>
          </div>
          <button 
            onClick={() => { setEditId(null); setFormData({ category: 'General', question: '', answer: '', keywords: '' }); setIsModalOpen(true); }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-sm transition-colors"
          >
            <Plus size={18} /> Add Record
          </button>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-100">
          <Link href="/dashboard/chatbot" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Overview Settings
          </Link>
          <Link href="/dashboard/chatbot/knowledge" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Manage Knowledge Base
          </Link>
          <Link href="/dashboard/chatbot/training" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Upload Documents
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search knowledge..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none flex-1 text-sm text-gray-700 placeholder-gray-400"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-bold uppercase text-xs">
                <tr>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4 w-1/3">Question / Topic</th>
                  <th className="px-6 py-4 w-1/3">Answer / Content</th>
                  <th className="px-6 py-4">Source</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
                ) : filteredRecords.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">No records found.</td></tr>
                ) : (
                  filteredRecords.map(r => (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-gray-900">{r.category}</td>
                      <td className="px-6 py-4 text-gray-700">{r.question.length > 80 ? r.question.substring(0, 80) + '...' : r.question}</td>
                      <td className="px-6 py-4 text-gray-500">{r.answer.length > 80 ? r.answer.substring(0, 80) + '...' : r.answer}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${r.source === 'manual' ? 'bg-sky-100 text-sky-700' : 'bg-fuchsia-100 text-fuchsia-700'}`}>
                          {r.source === 'manual' ? 'Manual' : 'Document'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex justify-end gap-3">
                        <button onClick={() => { setEditId(r.id); setFormData({ category: r.category, question: r.question, answer: r.answer, keywords: r.keywords || '' }); setIsModalOpen(true); }} className="text-gray-400 hover:text-primary-600 transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(r.id)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-2xl shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{editId ? 'Edit Record' : 'Add Knowledge Record'}</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border-gray-200 rounded-xl px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-primary-500/20">
                  <option>General</option>
                  <option>Admissions</option>
                  <option>Courses</option>
                  <option>Fees</option>
                  <option>Scholarships</option>
                  <option>Placements</option>
                  <option>Hostel</option>
                  <option>Faculty</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Question or Topic</label>
                <input required type="text" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10" placeholder="e.g. What is the admission process?" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Answer</label>
                <textarea required rows={5} value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10" placeholder="Provide a concise and direct answer..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Keywords (Comma separated)</label>
                <input type="text" value={formData.keywords} onChange={e => setFormData({...formData, keywords: e.target.value})} className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10" placeholder="admission, apply, online" />
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-sm transition-colors">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
