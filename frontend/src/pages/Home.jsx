import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../config/api';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await api.get('/products?featured=true&limit=8');
        setFeaturedProducts(res.data.products);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-primary-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="md:w-1/2 relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Discover Premium Quality Products
            </h1>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-lg leading-relaxed">
              Shop the latest trends with our curated collection of premium items. Unmatched quality, delivered directly to your door.
            </p>
            <Link to="/products" className="inline-block bg-white text-primary-900 font-bold px-8 py-4 rounded-md hover:bg-gray-100 transition-colors shadow-lg transform hover:-translate-y-1">
              Shop Now
            </Link>
          </div>
        </div>
        {/* Abstract background shape */}
        <div className="absolute right-0 top-0 h-full w-1/2 hidden md:block">
           <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-transparent z-10"></div>
           <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" alt="Hero" className="object-cover h-full w-full opacity-60" />
        </div>
      </div>

      {/* Featured Categories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Shop by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {['Electronics', 'Fashion', 'Home Decor', 'Beauty'].map((cat, idx) => (
            <Link key={idx} to={`/products?category=${cat}`} className="group relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-200 block shadow-sm hover:shadow-md transition-shadow">
              <img src={`https://source.unsplash.com/random/400x300/?${cat.replace(' ', ',')}`} alt={cat} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4 md:p-6">
                <h3 className="text-white font-semibold text-lg md:text-xl">{cat}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white rounded-3xl shadow-sm border border-gray-100 mb-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-500">Handpicked items just for you</p>
          </div>
          <Link to="/products" className="text-primary-600 hover:text-primary-800 font-medium hidden md:block">
            View All &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse flex flex-col h-[350px] bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Newsletter */}
      <div className="bg-primary-50 py-16 border-y border-primary-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscribe to our Newsletter</h2>
          <p className="text-gray-600 mb-8">Get the latest updates on new products and upcoming sales.</p>
          <form className="flex max-w-md mx-auto">
            <input type="email" placeholder="Enter your email" className="input-field rounded-r-none border-r-0 focus:ring-0" required />
            <button type="submit" className="bg-primary-900 text-white px-6 py-3 rounded-r-md font-medium hover:bg-primary-800 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home;
