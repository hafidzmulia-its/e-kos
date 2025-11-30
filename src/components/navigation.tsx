'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import { MapPin, User, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const { data: session, status } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <Link href="/" className="flex items-center space-x-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ITS KosFinder</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Find Your Perfect Kos</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Home
            </Link>
            
            <Link 
              href="/map" 
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Map
            </Link>
            
            {session?.user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  My Kos
                </Link>
                
                {session.user.role === 'ADMIN' && (
                  <Link 
                    href="/admin" 
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Admin
                  </Link>
                )}
                
                <div className="flex items-center space-x-3">
                  <img
                    src={session.user.image || '/default-avatar.png'}
                    alt={session.user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-gray-700 text-sm font-medium">
                    {session.user.name}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="text-gray-500 hover:text-red-600 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <a
                href="/api/auth/signin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 rounded-lg mt-2">
              <Link 
                href="/" 
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              <Link 
                href="/map" 
                className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Map
              </Link>
              
              {session?.user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Kos
                  </Link>
                  
                  {session.user.role === 'ADMIN' && (
                    <Link 
                      href="/admin" 
                      className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <img
                      src={session.user.image || '/default-avatar.png'}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full"
                    />
                    <span className="text-gray-700 text-sm font-medium">
                      {session.user.name}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-base font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <a
                  href="/api/auth/signin"
                  className="block w-full text-left bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In with Google
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}