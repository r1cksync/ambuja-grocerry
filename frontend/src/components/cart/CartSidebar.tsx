import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useCartStore, useUIStore, useAuthStore } from '@/store';
import { cartAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CartSidebar() {
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart, isLoading } = useCartStore();
  const { isCartOpen, closeCart } = useUIStore();
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      const response = await cartAPI.update(productId, newQuantity);
      setCart(response.data.cart);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (productId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(productId));
    try {
      const response = await cartAPI.remove(productId);
      setCart(response.data.cart);
      toast.success('Item removed from cart');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove item');
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white z-50 flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShoppingBag size={24} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>
            {cart && cart.totalItems > 0 && (
              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {cart.totalItems} items
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {!isAuthenticated ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Please login
              </h3>
              <p className="text-gray-500 mb-4">
                Login to view your cart and checkout
              </p>
              <Link
                href="/login"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                onClick={closeCart}
              >
                Login
              </Link>
            </div>
          ) : isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-5 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 mb-4">
                Start shopping to add items to your cart
              </p>
              <Link
                href="/"
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700"
                onClick={closeCart}
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.product._id}
                  className="flex gap-3 pb-4 border-b border-gray-100"
                >
                  {/* Product Image */}
                  <Link
                    href={`/product/${item.product.slug}`}
                    onClick={closeCart}
                    className="flex-shrink-0"
                  >
                    <img
                      src={item.product.thumbnail}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </Link>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${item.product.slug}`}
                      onClick={closeCart}
                    >
                      <h4 className="font-medium text-gray-900 truncate hover:text-primary-600">
                        {item.product.name}
                      </h4>
                    </Link>
                    <p className="text-sm text-gray-500">
                      {item.product.quantity} {item.product.unit}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.price)}
                      </span>
                      {item.product.mrp > item.price && (
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(item.product.mrp)}
                        </span>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-gray-100 rounded-lg">
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product._id,
                              item.quantity - 1
                            )
                          }
                          disabled={updatingItems.has(item.product._id)}
                          className="p-1.5 text-gray-600 hover:text-primary-600 disabled:opacity-50"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 font-medium text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleUpdateQuantity(
                              item.product._id,
                              item.quantity + 1
                            )
                          }
                          disabled={
                            updatingItems.has(item.product._id) ||
                            item.quantity >= item.product.maxOrderQty ||
                            item.quantity >= item.product.stock
                          }
                          className="p-1.5 text-gray-600 hover:text-primary-600 disabled:opacity-50"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.product._id)}
                        disabled={updatingItems.has(item.product._id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {isAuthenticated && cart && cart.items.length > 0 && (
          <div className="border-t border-gray-100 p-4 bg-white">
            {/* Pricing Summary */}
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900">{formatPrice(cart.subtotal)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="text-green-600">-{formatPrice(cart.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Delivery</span>
                <span className={cart.deliveryCharge === 0 ? 'text-green-600' : 'text-gray-900'}>
                  {cart.deliveryCharge === 0 ? 'FREE' : formatPrice(cart.deliveryCharge)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>{formatPrice(cart.total)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <Link
              href="/checkout"
              className="block w-full py-3 bg-primary-600 text-white text-center rounded-lg font-semibold hover:bg-primary-700 transition-colors"
              onClick={closeCart}
            >
              Proceed to Checkout
            </Link>

            {cart.subtotal < 500 && (
              <p className="text-sm text-center text-gray-500 mt-2">
                Add {formatPrice(500 - cart.subtotal)} more for free delivery
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
