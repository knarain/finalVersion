'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-white text-xl font-bold">
              Rashmi Photography
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                href="/"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/' ? 'text-amber-400' : 'text-white hover:text-amber-400'
                }`}
              >
                Home
              </Link>
              <Link 
                href="/gallery"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/gallery' ? 'text-amber-400' : 'text-white hover:text-amber-400'
                }`}
              >
                Gallery
              </Link>
              <Link 
                href="/contact"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/contact' ? 'text-amber-400' : 'text-white hover:text-amber-400'
                }`}
              >
                Contact
              </Link>
              <Link 
                href="/login"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname === '/login' ? 'text-amber-400' : 'text-white hover:text-amber-400'
                }`}
              >
                Login
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-amber-400 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/90 backdrop-blur-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/' ? 'text-amber-400' : 'text-white hover:text-amber-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/gallery"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/gallery' ? 'text-amber-400' : 'text-white hover:text-amber-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/contact' ? 'text-amber-400' : 'text-white hover:text-amber-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/login"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/login' ? 'text-amber-400' : 'text-white hover:text-amber-400'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
