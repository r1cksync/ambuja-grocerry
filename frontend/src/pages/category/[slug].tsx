import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { categoryAPI, productAPI } from '@/lib/api';
import { ProductGrid } from '@/components/product';
import { Product } from '@/store';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
}

export default function CategoryPage() {
  const router = useRouter();
  const { slug } = router.query;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndProducts();
    }
  }, [slug, sortBy, currentPage]);

  const fetchCategoryAndProducts = async () => {
    setIsLoading(true);
    try {
      // Fetch category details
      const categoryRes = await categoryAPI.getBySlug(slug as string);
      setCategory(categoryRes.data);

      // Fetch products in this category
      const productsRes = await productAPI.getAll({
        category: categoryRes.data._id,
        page: currentPage,
        limit: 12,
        sort: sortBy || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
      
      setProducts(productsRes.data.products);
      setTotalPages(productsRes.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch category:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1);
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    setShowFilters(false);
    fetchCategoryAndProducts();
  };

  if (!slug) return null;

  return (
    <>
      <Head>
        <title>{category?.name || 'Category'} - Ambuja Neotia Grocery</title>
        <meta 
          name="description" 
          content={category?.description || `Browse ${category?.name} products`} 
        />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Category Header */}
        {category?.image && (
          <div className="relative h-48 md:h-64 bg-gray-200">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <div className="container">
                <h1 className="text-3xl font-bold">{category.name}</h1>
                {category.description && (
                  <p className="text-white/80 mt-1">{category.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="container py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-primary-600">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <Link href="/categories" className="text-gray-500 hover:text-primary-600">
              Categories
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">
              {category?.name || 'Loading...'}
            </span>
          </nav>

          {/* Title (if no banner image) */}
          {!category?.image && category && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{category.name}</h1>
              {category.description && (
                <p className="text-gray-500 mt-1">{category.description}</p>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p className="text-gray-600">
              {isLoading ? 'Loading...' : `${products.length} products`}
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 lg:hidden"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="input w-auto"
              >
                <option value="">Sort by: Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          <div className="flex gap-6">
            {/* Filters Sidebar - Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
                
                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    Price Range
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                      }
                      className="input text-sm"
                      placeholder="Min"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])
                      }
                      className="input text-sm"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <button
                  onClick={handleApplyFilters}
                  className="btn-primary w-full"
                >
                  Apply Filters
                </button>
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              <ProductGrid products={products} isLoading={isLoading} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Modal */}
        {showFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setShowFilters(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Price Range
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) =>
                      setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])
                    }
                    className="input text-sm"
                    placeholder="Min"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])
                    }
                    className="input text-sm"
                    placeholder="Max"
                  />
                </div>
              </div>

              <button
                onClick={handleApplyFilters}
                className="btn-primary w-full"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
