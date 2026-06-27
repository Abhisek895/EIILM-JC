import React, { useEffect, useState } from 'react';
import DashboardLayout from '@layouts/DashboardLayout';
import { chatbotApi, siteSettingsApi } from '@api/endpoints';
import { MessageSquare, Users, BrainCircuit, Save, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function ChatbotOverview() {
  const [stats, setStats] = useState({ totalSessions: 0, totalMessages: 0 });
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settings, setSettings] = useState({
    chatbot_name: 'EIILM Assistant',
    chatbot_subtitle: 'EIILM Assistant',
    chatbot_enabled: 'true'
  });
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({show: false, message: '', type: 'success'});

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000);
  };

  useEffect(() => {
    Promise.all([
      chatbotApi.getAnalytics(),
      siteSettingsApi.getMap()
    ]).then(([analyticsRes, settingsRes]: [any, any]) => {
      if (analyticsRes?.data) setStats(analyticsRes.data);
      if (settingsRes?.data) {
        setSettings({
          chatbot_name: settingsRes.data.chatbot_name || 'EIILM Assistant',
          chatbot_subtitle: settingsRes.data.chatbot_subtitle || 'EIILM Assistant',
          chatbot_enabled: settingsRes.data.chatbot_enabled || 'true'
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveSettings = async () => {
    setSettingsLoading(true);
    try {
      await siteSettingsApi.bulkUpdate([
        { key: 'chatbot_name', value: settings.chatbot_name },
        { key: 'chatbot_subtitle', value: settings.chatbot_subtitle },
        { key: 'chatbot_enabled', value: String(settings.chatbot_enabled) }
      ]);
      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chatbot Analytics</h1>
          <p className="text-gray-500">Monitor AI assistant usage and performance.</p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 pb-4 border-b border-gray-100">
          <Link href="/dashboard/chatbot" className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Overview Settings
          </Link>
          <Link href="/dashboard/chatbot/knowledge" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Manage Knowledge Base
          </Link>
          <Link href="/dashboard/chatbot/training" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-bold shadow-sm transition-all hover:shadow-md">
            Upload Documents
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse flex gap-4">
            <div className="h-32 w-64 bg-gray-200 rounded-2xl" />
            <div className="h-32 w-64 bg-gray-200 rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Total Sessions</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalSessions}</p>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase">Messages Exchanged</p>
                <p className="text-3xl font-black text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Chatbot Configuration</h2>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Chatbot Display Name</label>
              <input 
                type="text" 
                value={settings.chatbot_name}
                onChange={e => setSettings({...settings, chatbot_name: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Chatbot Subtitle (Status Text)</label>
              <input 
                type="text" 
                value={settings.chatbot_subtitle}
                onChange={e => setSettings({...settings, chatbot_subtitle: e.target.value})}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
                placeholder="e.g. EIILM Assistant or Online"
              />
            </div>
            <div className="flex items-center justify-between bg-gray-50 border border-gray-100 p-4 rounded-xl">
              <div>
                <label className="block text-sm font-bold text-gray-900">Chatbot Status</label>
                <p className="text-xs text-gray-500">{settings.chatbot_enabled === 'true' ? 'Enabled (Visible to public)' : 'Disabled (Hidden)'}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.chatbot_enabled === 'true'}
                onClick={() => setSettings({...settings, chatbot_enabled: settings.chatbot_enabled === 'true' ? 'false' : 'true'})}
                className={`${settings.chatbot_enabled === 'true' ? 'bg-primary-600' : 'bg-gray-300'} relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
              >
                <span
                  aria-hidden="true"
                  className={`${settings.chatbot_enabled === 'true' ? 'translate-x-7' : 'translate-x-0'} pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={settingsLoading}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
            >
              <Save size={18} /> {settingsLoading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm mt-8">
          <div className="flex items-center justify-center flex-col text-center py-12">
            <BrainCircuit size={64} className="text-primary-200 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI is Active and Learning</h3>
            <p className="text-gray-500 max-w-md">
              The AI Chatbot uses Retrieval-Augmented Generation (RAG). It will prioritize answers based on the manual Knowledge Base and uploaded Documents you provide in the Training Center.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className="fixed top-8 right-8 z-[9999] animate-in slide-in-from-top-4 fade-in duration-300">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-md ${toast.type === 'success' ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900' : 'bg-red-50/90 border-red-200 text-red-900'}`}>
            {toast.type === 'success' ? <CheckCircle className="text-emerald-500" size={20} /> : <XCircle className="text-red-500" size={20} />}
            <span className="font-extrabold text-sm tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
