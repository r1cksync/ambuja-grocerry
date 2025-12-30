import Link from 'next/link';
import { X, Home, Grid, Tag, Package, User, LogOut, Settings } from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';

export default function MobileSidebar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();

  if (!isSidebarOpen) return null;

  const categories = [
    { name: 'Fruits & Vegetables', slug: 'fruits-vegetables' },
    { name: 'Dairy, Bread & Eggs', slug: 'dairy-bread-eggs' },
    { name: 'Rice, Dal & Oil', slug: 'rice-dal-oil' },
    { name: 'Masala & Dry Fruits', slug: 'masala-dry-fruits' },
    { name: 'Snacks & Beverages', slug: 'snacks-beverages' },
    { name: 'Cleaning & Household', slug: 'cleaning-household' },
    { name: 'Personal Care', slug: 'personal-care' },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={closeSidebar}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">AN</span>
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Ambuja Neotia</h2>
              <p className="text-xs text-gray-500">Grocery</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* User Section */}
        {isAuthenticated ? (
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-700 font-bold text-lg">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <Link
              href="/login"
              className="block w-full py-2 px-4 bg-primary-600 text-white text-center rounded-lg font-medium"
              onClick={closeSidebar}
            >
              Login / Register
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className="p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={closeSidebar}
              >
                <Home size={20} />
                <span>Home</span>
              </Link>
            </li>
            <li>
              <Link
                href="/categories"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={closeSidebar}
              >
                <Grid size={20} />
                <span>All Categories</span>
              </Link>
            </li>
            <li>
              <Link
                href="/offers"
                className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                onClick={closeSidebar}
              >
                <Tag size={20} />
                <span>Offers</span>
              </Link>
            </li>
            {isAuthenticated && (
              <>
                <li>
                  <Link
                    href="/orders"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={closeSidebar}
                  >
                    <Package size={20} />
                    <span>My Orders</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                    onClick={closeSidebar}
                  >
                    <User size={20} />
                    <span>My Profile</span>
                  </Link>
                </li>
                {user?.role === 'admin' && (
                  <li>
                    <Link
                      href="/vendor/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-primary-600 font-medium hover:bg-primary-50 rounded-lg"
                      onClick={closeSidebar}
                    >
                      <Settings size={20} />
                      <span>Vendor Dashboard</span>
                    </Link>
                  </li>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* Categories */}
        <div className="p-4 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            Shop by Category
          </h3>
          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/category/${category.slug}`}
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg"
                  onClick={closeSidebar}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Logout */}
        {isAuthenticated && (
          <div className="p-4 border-t border-gray-100">
            <button
              onClick={() => {
                logout();
                closeSidebar();
              }}
              className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg w-full"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
}
