import { useState, useEffect } from 'react';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            <span>{change} vs last month</span>
          </div>
        </div>
        <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  total: number;
  status: string;
  date: string;
}

export default function VendorDashboard() {
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([
    {
      id: '1',
      orderNumber: 'AN251230ABC',
      customer: 'John Doe',
      total: 1250,
      status: 'pending',
      date: '2025-12-30',
    },
    {
      id: '2',
      orderNumber: 'AN251230DEF',
      customer: 'Jane Smith',
      total: 890,
      status: 'processing',
      date: '2025-12-30',
    },
    {
      id: '3',
      orderNumber: 'AN251229GHI',
      customer: 'Mike Johnson',
      total: 2100,
      status: 'shipped',
      date: '2025-12-29',
    },
    {
      id: '4',
      orderNumber: 'AN251229JKL',
      customer: 'Sarah Wilson',
      total: 450,
      status: 'delivered',
      date: '2025-12-29',
    },
  ]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value="₹1,25,430"
          change="+12.5%"
          trend="up"
          icon={<DollarSign size={24} />}
        />
        <StatCard
          title="Total Orders"
          value="156"
          change="+8.2%"
          trend="up"
          icon={<ShoppingCart size={24} />}
        />
        <StatCard
          title="Products"
          value="342"
          change="+15 new"
          trend="up"
          icon={<Package size={24} />}
        />
        <StatCard
          title="Customers"
          value="1,234"
          change="+5.3%"
          trend="up"
          icon={<Users size={24} />}
        />
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Recent Orders</h2>
            <Link
              href="/vendor/orders"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All <ArrowRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/vendor/orders/${order.id}`}
                        className="font-medium text-primary-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {order.customer}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      ₹{order.total}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/vendor/products/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                <Package size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-sm text-gray-500">Create a new product</p>
              </div>
            </Link>
            <Link
              href="/vendor/categories/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                <Package size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add Category</p>
                <p className="text-sm text-gray-500">Create a new category</p>
              </div>
            </Link>
            <Link
              href="/vendor/coupons/new"
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                <Package size={20} />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Coupon</p>
                <p className="text-sm text-gray-500">Add a discount code</p>
              </div>
            </Link>
          </div>

          {/* Low Stock Alert */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Low Stock Alert</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <span className="text-sm text-red-700">Organic Apples</span>
                <span className="text-xs font-medium text-red-600">5 left</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <span className="text-sm text-yellow-700">Fresh Milk 1L</span>
                <span className="text-xs font-medium text-yellow-600">12 left</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                <span className="text-sm text-yellow-700">Brown Bread</span>
                <span className="text-xs font-medium text-yellow-600">8 left</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
