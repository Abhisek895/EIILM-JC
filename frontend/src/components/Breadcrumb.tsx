import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-gray-500 py-3 px-4 sm:px-6 bg-gray-50 border-b border-gray-100">
      <Link href="/" className="flex items-center gap-1 hover:text-primary-600 transition-colors font-medium min-h-[36px] px-1">
        <Home size={14} />
        <span className="sr-only">Home</span>
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-gray-300 shrink-0" />
          {item.href && index < items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-primary-600 transition-colors font-medium min-h-[36px] flex items-center px-1"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-semibold min-h-[36px] flex items-center px-1 truncate max-w-[160px] sm:max-w-none">
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
