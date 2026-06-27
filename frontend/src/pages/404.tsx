import React from 'react';
import MainLayout from '@layouts/MainLayout';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, Compass, AlertCircle } from 'lucide-react';
import SEO from '@components/SEO';

export default function Custom404() {
  return (
    <MainLayout>
      <SEO title="Page Not Found" description="The page you are looking for does not exist." />
      
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-20 px-6">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          
          {/* Left Decorative Side */}
          <div className="bg-gradient-to-br from-primary-600 to-indigo-700 w-full md:w-2/5 p-10 flex flex-col items-center justify-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-indigo-400 opacity-20 rounded-full blur-2xl" />
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 flex flex-col items-center"
            >
              <div className="bg-white/20 p-4 rounded-full backdrop-blur-sm mb-6">
                <Compass size={48} className="text-white" />
              </div>
              <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-primary-200">
                404
              </h1>
            </motion.div>
          </div>

          {/* Right Content Side */}
          <div className="w-full md:w-3/5 p-10 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-2 text-red-500 font-bold tracking-widest text-sm uppercase mb-4">
              <AlertCircle size={16} />
              <span>Error</span>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4 leading-tight">
              Looks like you've wandered off track.
            </h2>
            
            <p className="text-gray-500 mb-8 leading-relaxed">
              The page you're looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back to familiar territory.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/"
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                <Home size={18} />
                Return Home
              </Link>
              
              <Link 
                href="/courses"
                className="flex-1 flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 font-bold py-3 px-6 rounded-xl transition-all shadow-sm hover:shadow-md"
              >
                <Search size={18} />
                Explore Courses
              </Link>
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}
