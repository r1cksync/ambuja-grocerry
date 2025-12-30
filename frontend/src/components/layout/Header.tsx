import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X, MessageCircle } from 'lucide-react';
import { useAuthStore, useCartStore, useUIStore } from '@/store';
import SearchBar from './SearchBar';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { toggleCart, toggleChat, toggleSidebar, isSidebarOpen } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const cartItemCount = cart?.totalItems || 0;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white text-sm py-1.5">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <span>Exclusive for Ambuja Neotia Employees</span>
          <span>Free delivery on orders above ₹500</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AN</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-bold text-lg text-gray-900 leading-tight">
                Ambuja Neotia
              </h1>
              <p className="text-xs text-gray-500">Grocery</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:block flex-1 max-w-2xl">
            <SearchBar />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Mobile */}
            <button
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search size={24} className="text-gray-600" />
            </button>

            {/* AI Chat */}
            <button
              className="p-2 hover:bg-gray-100 rounded-lg relative"
              onClick={toggleChat}
              title="AI Assistant"
            >
              <MessageCircle size={24} className="text-gray-600" />
            </button>

            {/* Cart */}
            <button
              className="p-2 hover:bg-gray-100 rounded-lg relative"
              onClick={toggleCart}
            >
              <ShoppingCart size={24} className="text-gray-600" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-semibold text-sm">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user?.name?.split(' ')[0]}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/addresses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Addresses
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        href="/vendor/dashboard"
                        className="block px-4 py-2 text-sm text-primary-600 font-medium hover:bg-gray-50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Vendor Dashboard
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <User size={20} />
                <span className="hidden sm:block">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Search */}
        {showSearch && (
          <div className="lg:hidden mt-3">
            <SearchBar onSearch={() => setShowSearch(false)} />
          </div>
        )}
      </div>

      {/* Categories Nav */}
      <nav className="hidden lg:block border-t border-gray-100">
        <div className="container mx-auto px-4">
          <ul className="flex items-center gap-6 py-2 text-sm">
            <li>
              <Link href="/categories" className="text-gray-700 hover:text-primary-600 font-medium">
                All Categories
              </Link>
            </li>
            <li>
              <Link href="/category/fruits-vegetables" className="text-gray-600 hover:text-primary-600">
                Fruits & Vegetables
              </Link>
            </li>
            <li>
              <Link href="/category/dairy-bread-eggs" className="text-gray-600 hover:text-primary-600">
                Dairy, Bread & Eggs
              </Link>
            </li>
            <li>
              <Link href="/category/rice-dal-oil" className="text-gray-600 hover:text-primary-600">
                Rice, Dal & Oil
              </Link>
            </li>
            <li>
              <Link href="/category/masala-dry-fruits" className="text-gray-600 hover:text-primary-600">
                Masala & Dry Fruits
              </Link>
            </li>
            <li>
              <Link href="/category/snacks-beverages" className="text-gray-600 hover:text-primary-600">
                Snacks & Beverages
              </Link>
            </li>
            <li>
              <Link href="/offers" className="text-brand-orange font-medium">
                Offers
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
