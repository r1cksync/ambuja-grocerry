import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { Search as SearchIcon, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { productAPI } from '@/lib/api';
import { ProductGrid } from '@/components/product';
import { Product } from '@/store';

export default function SearchPage() {
  const router = useRouter();
  const { q, category } = router.query;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  useEffect(() => {
    if (q) {
      searchProducts();
    }
  }, [q, category, sortBy, currentPage]);

  const searchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await productAPI.search({
        q: q as string,
        category: category as string,
        page: currentPage,
        limit: 12,
        sort: sortBy || undefined,
        minPrice: priceRange[0],
        maxPrice: priceRange[1],
      });
      
      setProducts(response.data.products);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotalResults(response.data.pagination?.total || response.data.products.length);
    } catch (error) {
      console.error('Failed to search products:', error);
      setProducts([]);
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
    searchProducts();
  };

  return (
    <>
      <Head>
        <title>
          {q ? `Search: "${q}"` : 'Search'} - Ambuja Neotia Grocery
        </title>
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <Link href="/" className="text-gray-500 hover:text-primary-600">
              Home
            </Link>
            <ChevronRight size={16} className="text-gray-400" />
            <span className="text-gray-900 font-medium">Search Results</span>
          </nav>

          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {q ? (
                <>
                  Search results for{' '}
                  <span className="text-primary-600">"{q}"</span>
                </>
              ) : (
                'Search Products'
              )}
            </h1>
            {!isLoading && (
              <p className="text-gray-500 mt-1">
                {totalResults} {totalResults === 1 ? 'product' : 'products'} found
              </p>
            )}
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 lg:hidden"
              >
                <SlidersHorizontal size={18} />
                Filters
              </button>
            </div>
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

            {/* Results */}
            <div className="flex-1">
              {!q ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Start Searching
                  </h2>
                  <p className="text-gray-500">
                    Use the search bar to find products
                  </p>
                </div>
              ) : isLoading ? (
                <ProductGrid products={[]} isLoading={true} />
              ) : products.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <SearchIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    No products found
                  </h2>
                  <p className="text-gray-500 mb-6">
                    Try adjusting your search or filters
                  </p>
                  <Link href="/" className="btn-primary">
                    Browse All Products
                  </Link>
                </div>
              ) : (
                <>
                  <ProductGrid products={products} isLoading={false} />

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
                </>
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
