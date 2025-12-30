import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronLeft, Plus, Minus, ShoppingCart, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { productAPI, cartAPI } from '@/lib/api';
import { Product, useCartStore, useAuthStore } from '@/store';
import { formatPrice } from '@/lib/utils';
import { ProductGrid } from '@/components/product';
import toast from 'react-hot-toast';

export default function ProductPage() {
  const router = useRouter();
  const { slug } = router.query;
  const { isAuthenticated } = useAuthStore();
  const { cart, setCart } = useCartStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const cartItem = cart?.items.find((item) => item.product._id === product?._id);
  const quantity = cartItem?.quantity || 0;

  useEffect(() => {
    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  const fetchProduct = async () => {
    setIsLoading(true);
    try {
      const response = await productAPI.getBySlug(slug as string);
      setProduct(response.data.product);
      
      // Fetch related products
      const relatedRes = await productAPI.getAll({
        category: response.data.product.category._id,
        limit: 5,
      });
      setRelatedProducts(
        relatedRes.data.products.filter((p: Product) => p._id !== response.data.product._id)
      );
    } catch (error) {
      console.error('Failed to fetch product:', error);
      toast.error('Product not found');
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    if (!product) return;

    setIsAddingToCart(true);
    try {
      const response = await cartAPI.add(product._id, 1);
      setCart(response.data.cart);
      toast.success('Added to cart');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add to cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (!isAuthenticated || !product) return;

    setIsAddingToCart(true);
    try {
      const response = await cartAPI.update(product._id, newQuantity);
      setCart(response.data.cart);
      if (newQuantity === 0) {
        toast.success('Removed from cart');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update cart');
    } finally {
      setIsAddingToCart(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-4 w-32 bg-gray-200 rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-gray-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-10 bg-gray-200 rounded w-1/3" />
              <div className="h-24 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const images = product.images.length > 0 ? product.images : [product.thumbnail];

  return (
    <>
      <Head>
        <title>{product.name} - Ambuja Neotia Grocery</title>
        <meta name="description" content={product.shortDescription || product.description} />
      </Head>

      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary-600">Home</Link>
          <span>/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-primary-600">
            {product.category.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? 'border-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            {/* Badges */}
            <div className="flex items-center gap-2 mb-3">
              {product.isVeg && (
                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                  <span className="w-2 h-2 bg-green-600 rounded-full" />
                  Vegetarian
                </span>
              )}
              {product.discount > 0 && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>
            
            <p className="text-gray-600 mb-4">
              {product.quantity} {product.unit}
            </p>

            {/* Rating */}
            {product.totalReviews > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white text-sm font-medium rounded">
                  <Star size={14} fill="currentColor" />
                  {product.avgRating.toFixed(1)}
                </div>
                <span className="text-sm text-gray-500">
                  ({product.totalReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.mrp)}
                  </span>
                  <span className="text-lg text-green-600 font-medium">
                    Save {formatPrice(product.mrp - product.price)}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {product.stock === 0 ? (
              <div className="inline-block px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg mb-6">
                Out of Stock
              </div>
            ) : product.stock < 10 ? (
              <div className="inline-block px-4 py-2 bg-yellow-100 text-yellow-700 font-medium rounded-lg mb-6">
                Only {product.stock} left in stock
              </div>
            ) : (
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg mb-6">
                In Stock
              </div>
            )}

            {/* Add to Cart */}
            {product.stock > 0 && (
              <div className="mb-6">
                {quantity === 0 ? (
                  <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="w-full md:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingCart size={20} />
                    Add to Cart
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-primary-50 rounded-lg">
                      <button
                        onClick={() => handleUpdateQuantity(quantity - 1)}
                        disabled={isAddingToCart}
                        className="p-3 text-primary-600 hover:bg-primary-100 rounded-l-lg disabled:opacity-50"
                      >
                        <Minus size={24} />
                      </button>
                      <span className="px-6 font-bold text-xl text-primary-700">
                        {quantity}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(quantity + 1)}
                        disabled={isAddingToCart || quantity >= product.maxOrderQty || quantity >= product.stock}
                        className="p-3 text-primary-600 hover:bg-primary-100 rounded-r-lg disabled:opacity-50"
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">
                      Max {Math.min(product.maxOrderQty, product.stock)} items
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 py-6 border-t border-b border-gray-200">
              <div className="text-center">
                <Truck className="mx-auto text-primary-600 mb-2" size={24} />
                <p className="text-xs text-gray-600">Free Delivery</p>
              </div>
              <div className="text-center">
                <Shield className="mx-auto text-primary-600 mb-2" size={24} />
                <p className="text-xs text-gray-600">Quality Assured</p>
              </div>
              <div className="text-center">
                <RotateCcw className="mx-auto text-primary-600 mb-2" size={24} />
                <p className="text-xs text-gray-600">Easy Returns</p>
              </div>
            </div>

            {/* Description */}
            <div className="mt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-line">{product.description}</p>
            </div>

            {/* Nutritional Info */}
            {product.nutritionalInfo && Object.keys(product.nutritionalInfo).length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Nutritional Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {product.nutritionalInfo.calories && (
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Calories</p>
                      <p className="font-semibold">{product.nutritionalInfo.calories}</p>
                    </div>
                  )}
                  {product.nutritionalInfo.protein && (
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Protein</p>
                      <p className="font-semibold">{product.nutritionalInfo.protein}</p>
                    </div>
                  )}
                  {product.nutritionalInfo.carbs && (
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Carbs</p>
                      <p className="font-semibold">{product.nutritionalInfo.carbs}</p>
                    </div>
                  )}
                  {product.nutritionalInfo.fat && (
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Fat</p>
                      <p className="font-semibold">{product.nutritionalInfo.fat}</p>
                    </div>
                  )}
                  {product.nutritionalInfo.fiber && (
                    <div className="p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">Fiber</p>
                      <p className="font-semibold">{product.nutritionalInfo.fiber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Related Products</h2>
            <ProductGrid products={relatedProducts} />
          </section>
        )}
      </div>
    </>
  );
}
