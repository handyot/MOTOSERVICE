import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-xs">
        {/* Logo NeroElectric Motors */}
        <div className="flex flex-col items-center text-center mb-6">
          <Link href="/" className="inline-block mb-3 hover:opacity-90 transition-opacity">
            <Image
              src="/branding/nero-electric-motors-optimized.png"
              alt="NeroElectric Motors"
              width={195}
              height={55}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>

          <h1 className="text-xl font-bold tracking-tight text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 mt-1 max-w-sm">{subtitle}</p>
        </div>

        {/* Form Body */}
        {children}

        {/* Card Footer */}
        {footer && (
          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
