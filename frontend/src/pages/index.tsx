import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Truck, Clock, Shield, Award } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { productAPI, categoryAPI } from '@/lib/api';
import { Product } from '@/store';

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
}

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          productAPI.getAll({ isFeatured: true, limit: 10 }),
          categoryAPI.getAll('root'),
        ]);
        setFeaturedProducts(productsRes.data.products);
        setCategories(categoriesRes.data.categories);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium mb-4">
              Exclusive for Ambuja Neotia Employees
            </span>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Fresh Groceries Delivered to Your Doorstep
            </h1>
            <p className="text-lg text-primary-100 mb-6">
              Get the freshest fruits, vegetables, and daily essentials with express delivery.
              Enjoy special employee discounts on every order.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/categories"
                className="px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-primary-50 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/offers"
                className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-400 transition-colors"
              >
                View Offers
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-full opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="80" fill="white" />
          </svg>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Truck className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Free Delivery</h3>
                <p className="text-sm text-gray-500">Orders above ₹500</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Clock className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Express Delivery</h3>
                <p className="text-sm text-gray-500">Within 2 hours</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Shield className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Secure Payment</h3>
                <p className="text-sm text-gray-500">100% secure</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <Award className="text-primary-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Best Quality</h3>
                <p className="text-sm text-gray-500">Fresh products</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Shop by Category
            </h2>
            <Link
              href="/categories"
              className="flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700"
            >
              View All <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {isLoading
              ? [...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-square bg-gray-200 rounded-2xl mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
                  </div>
                ))
              : categories.slice(0, 8).map((category) => (
                  <Link
                    key={category._id}
                    href={`/category/${category.slug}`}
                    className="group text-center"
                  >
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-2 group-hover:shadow-lg transition-shadow">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-gray-700 group-hover:text-primary-600">
                      {category.name}
                    </h3>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              Featured Products
            </h2>
            <Link
              href="/products"
              className="flex items-center gap-1 text-primary-600 font-medium hover:text-primary-700"
            >
              View All <ChevronRight size={20} />
            </Link>
          </div>

          <ProductGrid products={featuredProducts} isLoading={isLoading} />
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              Employee Special Offer
            </h2>
            <p className="text-lg text-gray-800 mb-4">
              Get 10% extra discount on your first order with code{' '}
              <span className="font-bold bg-white px-2 py-1 rounded">ANWELCOME</span>
            </p>
            <Link
              href="/categories"
              className="inline-block px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* App Download */}
      <section className="py-8 md:py-12 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Download Our App
              </h2>
              <p className="text-gray-400">
                Get exclusive app-only offers and faster checkout
              </p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                App Store
              </button>
              <button className="px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Play Store
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
