import Link from 'next/link';
import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product, useCartStore, useAuthStore } from '@/store';
import { cartAPI } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const cartItem = cart?.items.find(
    (item) => item.product._id === product._id
  );
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }

    setIsLoading(true);
    try {
      const response = await cartAPI.add(product._id, 1);
      setCart(response.data.cart);
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await cartAPI.update(product._id, newQuantity);
      setCart(response.data.cart);
      if (newQuantity === 0) {
        toast.success('Removed from cart');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
    } finally {
      setIsLoading(false);
    }
  };

  const outOfStock = product.stock === 0;

  return (
    <div className="card group">
      {/* Product Image */}
      <Link href={`/product/${product.slug}`}>
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={product.thumbnail}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.discount > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                {product.discount}% OFF
              </span>
            )}
            {product.isVeg && (
              <span className="w-5 h-5 border-2 border-green-600 flex items-center justify-center bg-white rounded">
                <span className="w-2 h-2 bg-green-600 rounded-full" />
              </span>
            )}
          </div>

          {outOfStock && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
              <span className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-3">
        <Link href={`/product/${product.slug}`}>
          <p className="text-xs text-gray-500 mb-1">{product.brand}</p>
          <h3 className="font-medium text-gray-900 line-clamp-2 min-h-[2.5rem] hover:text-primary-600">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {product.quantity} {product.unit}
          </p>
        </Link>

        {/* Price */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {product.mrp > product.price && (
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {/* Add to Cart */}
        <div className="mt-3">
          {outOfStock ? (
            <button
              disabled
              className="w-full py-2 px-4 bg-gray-100 text-gray-400 rounded-lg font-medium cursor-not-allowed"
            >
              Out of Stock
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <ShoppingCart size={18} />
              Add to Cart
            </button>
          ) : (
            <div className="flex items-center justify-between bg-primary-50 rounded-lg">
              <button
                onClick={() => handleUpdateQuantity(quantity - 1)}
                disabled={isLoading}
                className="p-2 text-primary-600 hover:bg-primary-100 rounded-l-lg disabled:opacity-50"
              >
                <Minus size={20} />
              </button>
              <span className="font-semibold text-primary-700 min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => handleUpdateQuantity(quantity + 1)}
                disabled={isLoading || quantity >= product.maxOrderQty || quantity >= product.stock}
                className="p-2 text-primary-600 hover:bg-primary-100 rounded-r-lg disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
