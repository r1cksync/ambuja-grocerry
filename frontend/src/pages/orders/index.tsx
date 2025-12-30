import { useState, useEffect } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { Package, ChevronRight, Clock, MapPin, Phone } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import { useStore } from '@/store';

interface OrderItem {
  product: {
    _id: string;
    name: string;
    thumbnail: string;
    slug: string;
  };
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  createdAt: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500',
  confirmed: 'bg-blue-500',
  processing: 'bg-purple-500',
  shipped: 'bg-indigo-500',
  delivered: 'bg-green-500',
  cancelled: 'bg-red-500',
};

const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getAll({});
      setOrders(response.data.orders || response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIndex = (status: string) => {
    return statusSteps.indexOf(status);
  };

  if (!user) {
    return (
      <>
        <Head>
          <title>My Orders - Ambuja Neotia Grocery</title>
        </Head>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Please login to view your orders</p>
            <Link href="/login" className="btn-primary">
              Login
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>My Orders - Ambuja Neotia Grocery</title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="animate-pulse">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 rounded w-1/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                      </div>
                    </div>
                    <div className="h-24 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No orders yet
              </h2>
              <p className="text-gray-500 mb-6">
                Start shopping to see your orders here
              </p>
              <Link href="/" className="btn-primary">
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary-50 rounded-lg">
                        <Package size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'px-3 py-1 text-sm font-medium rounded-full text-white',
                          statusColors[order.status]
                        )}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>

                  {/* Order Status Tracker */}
                  {order.status !== 'cancelled' && (
                    <div className="p-4 bg-gray-50">
                      <div className="flex items-center justify-between max-w-lg mx-auto">
                        {statusSteps.map((step, index) => {
                          const currentIndex = getStatusIndex(order.status);
                          const isCompleted = index <= currentIndex;
                          const isCurrent = index === currentIndex;

                          return (
                            <div
                              key={step}
                              className="flex flex-col items-center relative"
                            >
                              <div
                                className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                                  isCompleted
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                )}
                              >
                                {index + 1}
                              </div>
                              <p
                                className={cn(
                                  'text-xs mt-1 capitalize',
                                  isCurrent
                                    ? 'text-primary-600 font-medium'
                                    : 'text-gray-500'
                                )}
                              >
                                {step}
                              </p>
                              {index < statusSteps.length - 1 && (
                                <div
                                  className={cn(
                                    'absolute top-4 left-full w-[calc(100%-2rem)] h-0.5 -translate-y-1/2',
                                    index < currentIndex
                                      ? 'bg-primary-600'
                                      : 'bg-gray-200'
                                  )}
                                  style={{ width: '50px', marginLeft: '4px' }}
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="p-4">
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item, index) => (
                        <Link
                          key={index}
                          href={`/product/${item.product.slug}`}
                          className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg -m-2"
                        >
                          <img
                            src={item.product.thumbnail}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {item.product.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              Qty: {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <ChevronRight size={20} className="text-gray-400" />
                        </Link>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500 text-center py-2">
                          +{order.items.length - 3} more items
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-start gap-3">
                      <MapPin size={18} className="text-gray-400 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {order.shippingAddress.fullName}
                        </p>
                        <p className="text-gray-500">
                          {order.shippingAddress.address},{' '}
                          {order.shippingAddress.city},{' '}
                          {order.shippingAddress.state} -{' '}
                          {order.shippingAddress.pincode}
                        </p>
                        <p className="text-gray-500 flex items-center gap-1 mt-1">
                          <Phone size={14} />
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions */}
                  <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                    <Link
                      href={`/orders/${order._id}`}
                      className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                    >
                      View Details
                    </Link>
                    {order.status === 'delivered' && (
                      <button className="text-sm text-gray-600 hover:text-gray-800">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
