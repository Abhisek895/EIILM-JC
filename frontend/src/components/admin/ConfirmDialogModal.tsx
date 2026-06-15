import React from 'react';

export type ConfirmDialogState = {
  visible: boolean;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
} | null;

interface ConfirmDialogModalProps {
  dialog: ConfirmDialogState;
  onCancel: () => void;
}

export default function ConfirmDialogModal({ dialog, onCancel }: ConfirmDialogModalProps) {
  if (!dialog || !dialog.visible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm flex flex-col animate-scaleUp p-6 text-center">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner ${
          dialog.type === 'danger' ? 'bg-red-100 text-red-500' : 
          dialog.type === 'warning' ? 'bg-yellow-100 text-yellow-500' : 
          'bg-blue-100 text-blue-500'
        }`}>
          <span className="text-3xl">
            {dialog.type === 'danger' ? '🗑️' : dialog.type === 'warning' ? '⚠️' : 'ℹ️'}
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{dialog.title}</h3>
        <p className="text-sm text-gray-500 mb-6">{dialog.message}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={onCancel} 
            className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={dialog.onConfirm} 
            className={`flex-1 px-4 py-2.5 text-white font-bold rounded-xl shadow-md transition-all ${
              dialog.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 
              dialog.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600' : 
              'bg-primary-600 hover:bg-primary-700'
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
