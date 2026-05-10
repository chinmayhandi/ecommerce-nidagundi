import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, User, Menu, X, Search, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Package className="h-8 w-8 text-primary-900" />
              <span className="font-bold text-xl tracking-tight text-primary-900">PremiumCart</span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-600 hover:text-primary-900 font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Bar Desktop */}
          <div className="hidden md:flex flex-1 max-w-md ml-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-500 hover:text-primary-900">
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Icons */}
          <div className="hidden md:flex items-center space-x-6 ml-6">
            <Link to="/wishlist" className="text-gray-600 hover:text-primary-900 transition-colors">
              <Heart className="h-6 w-6" />
            </Link>
            
            <Link to="/cart" className="text-gray-600 hover:text-primary-900 transition-colors relative">
              <ShoppingCart className="h-6 w-6" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </Link>

            <div className="relative cursor-pointer">
              <div 
                className="flex items-center text-gray-600 hover:text-primary-900 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <User className="h-6 w-6" />
              </div>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">{user.email}</div>
                      <Link to="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                      {isAdmin && (
                        <Link to="/admin" className="block px-4 py-2 text-sm text-primary-900 font-medium hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Admin Dashboard</Link>
                      )}
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Logout</button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Login</Link>
                      <Link to="/register" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setUserMenuOpen(false)}>Register</Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 hover:text-primary-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 py-2">
          <div className="px-4 pt-2 pb-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 rounded-md py-2 pl-4 pr-10 focus:outline-none"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-gray-500">
                <Search size={18} />
              </button>
            </form>
            
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-900 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            
            <Link to="/wishlist" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>
              Wishlist
            </Link>
            
            <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-900 hover:bg-gray-50 flex items-center justify-between" onClick={() => setIsOpen(false)}>
              <span>Cart</span>
              {cart.length > 0 && <span className="bg-primary-900 text-white px-2 py-1 rounded-full text-xs">{cart.length}</span>}
            </Link>

            <div className="border-t border-gray-200 pt-3 mt-3">
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">{user.email}</div>
                  <Link to="/my-orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>My Orders</Link>
                  {isAdmin && (
                    <Link to="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-primary-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Admin Dashboard</Link>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Login</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-900 hover:bg-gray-50" onClick={() => setIsOpen(false)}>Register</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
