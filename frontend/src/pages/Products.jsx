import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Filter, X, ChevronDown } from 'lucide-react';
import api from '../config/api';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || '';

  const [filters, setFilters] = useState({
    search: initialSearch,
    category: initialCategory,
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  });

  const categories = ['All', 'Electronics', 'Fashion', 'Home Decor', 'Beauty', 'Sports'];

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  // Update filters if URL changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || prev.category
    }));
  }, [location.search]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let query = '/products?';
      if (filters.search) query += `search=${filters.search}&`;
      if (filters.category && filters.category !== 'All') query += `category=${filters.category}&`;
      if (filters.minPrice) query += `min_price=${filters.minPrice}&`;
      if (filters.maxPrice) query += `max_price=${filters.maxPrice}&`;
      if (filters.sort) query += `sort=${filters.sort}&`;

      const res = await api.get(query);
      setProducts(res.data.products);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryClick = (cat) => {
    setFilters(prev => ({ ...prev, category: cat }));
  };

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Mobile Filter Toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
            {filters.search && <p className="text-gray-500 mt-1">Search results for "{filters.search}"</p>}
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              className="md:hidden flex items-center justify-center gap-2 btn-secondary w-full"
              onClick={() => setShowFilters(true)}
            >
              <Filter size={20} /> Filters
            </button>
            
            <div className="relative w-full md:w-64 hidden md:block">
              <select 
                name="sort" 
                value={filters.sort} 
                onChange={handleFilterChange}
                className="input-field appearance-none"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Filters (Desktop) & Modal (Mobile) */}
          <div className={`
            fixed inset-0 z-50 bg-black bg-opacity-50 transition-opacity md:relative md:bg-transparent md:z-auto md:w-1/4
            ${showFilters ? 'opacity-100 visible' : 'opacity-0 invisible md:opacity-100 md:visible'}
          `}>
            <div className={`
              absolute right-0 top-0 h-full w-4/5 max-w-sm bg-white shadow-xl p-6 overflow-y-auto transform transition-transform duration-300 md:relative md:w-full md:max-w-none md:shadow-none md:p-0 md:transform-none md:bg-transparent
              ${showFilters ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
            `}>
              <div className="flex justify-between items-center mb-6 md:hidden">
                <h2 className="text-xl font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-gray-500 hover:text-gray-900">
                  <X size={24} />
                </button>
              </div>

              {/* Categories */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Categories</h3>
                <ul className="space-y-2">
                  {categories.map((cat, idx) => (
                    <li key={idx}>
                      <button 
                        onClick={() => handleCategoryClick(cat)}
                        className={`text-left w-full text-sm transition-colors ${filters.category === cat || (cat === 'All' && !filters.category) ? 'text-primary-900 font-bold' : 'text-gray-600 hover:text-primary-600'}`}
                      >
                        {cat}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Price Range</h3>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    name="minPrice" 
                    placeholder="Min" 
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="input-field py-1 px-2 text-sm w-full"
                  />
                  <span className="text-gray-400">-</span>
                  <input 
                    type="number" 
                    name="maxPrice" 
                    placeholder="Max" 
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="input-field py-1 px-2 text-sm w-full"
                  />
                </div>
              </div>

              <div className="md:hidden">
                 <button onClick={() => setShowFilters(false)} className="btn-primary w-full mt-4">Apply Filters</button>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="md:w-3/4">
            {/* Sort for mobile */}
            <div className="md:hidden mb-4 relative">
              <select 
                name="sort" 
                value={filters.sort} 
                onChange={handleFilterChange}
                className="input-field appearance-none text-sm font-medium bg-white"
              >
                <option value="newest">Sort by: Newest</option>
                <option value="price_asc">Sort by: Price Low-High</option>
                <option value="price_desc">Sort by: Price High-Low</option>
                <option value="rating">Sort by: Top Rated</option>
              </select>
              <ChevronDown className="absolute right-3 top-3 text-gray-500 pointer-events-none" size={18} />
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse flex flex-col h-[350px] bg-white rounded-xl shadow-sm border border-gray-100"></div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-8 text-center rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-400 mb-4 flex justify-center">
                  <Filter size={48} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">Try adjusting your search or filters to find what you're looking for.</p>
                <button 
                  onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', sort: 'newest' })}
                  className="btn-secondary"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
