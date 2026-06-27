import React, { useEffect, useState } from 'react';
import { siteSettingsApi } from '@api/endpoints';
import { X } from 'lucide-react';
import { getImageUrl } from '@utils/getImageUrl';

export const GlobalModalBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const initializeModal = async () => {
      try {
        const res: any = await siteSettingsApi.getMap();
        const data = res?.data || {};
        
        setSettings(data);

        // Check if enabled and has image
        if (data.modal_enabled !== 'true' || !data.modal_banner_image) {
          return;
        }

        // Check dates if set
        const now = new Date();
        if (data.modal_start_date && new Date(data.modal_start_date) > now) return;
        if (data.modal_end_date && new Date(data.modal_end_date) < now) return;

        // Check repeat interval in localStorage
        const repeatIntervalSeconds = parseInt(data.modal_repeat_interval) || 86400; // default 1 day
        const lastClosedTime = localStorage.getItem('global_modal_last_closed');
        
        if (lastClosedTime) {
          const timeSinceClose = (Date.now() - parseInt(lastClosedTime)) / 1000;
          if (timeSinceClose < repeatIntervalSeconds) {
            return; // Not enough time has passed
          }
        }

        // Set initial delay
        const initialDelaySeconds = parseInt(data.modal_initial_delay) || 5;
        
        timeoutId = setTimeout(() => {
          setIsVisible(true);
        }, initialDelaySeconds * 1000);

      } catch (err) {
        console.error('Failed to load modal settings', err);
      }
    };

    initializeModal();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('global_modal_last_closed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden max-w-2xl w-full mx-auto transform transition-all animate-scaleUp z-10 flex flex-col items-center justify-center">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-primary-600 transition-colors backdrop-blur-xl shadow-lg cursor-pointer hover:scale-110 active:scale-95"
          aria-label="Close modal"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {settings.modal_target_link ? (
          <a href={settings.modal_target_link} target="_blank" rel="noopener noreferrer" className="w-full h-full block group relative overflow-hidden" onClick={handleClose}>
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors z-10 pointer-events-none"></div>
            <img 
              src={getImageUrl(settings.modal_banner_image)} 
              alt="Promotional Banner" 
              className="w-full h-auto max-h-[85vh] object-cover sm:object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </a>
        ) : (
          <div className="w-full h-full block relative overflow-hidden">
            <img 
              src={getImageUrl(settings.modal_banner_image)} 
              alt="Promotional Banner" 
              className="w-full h-auto max-h-[85vh] object-cover sm:object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalModalBanner;
