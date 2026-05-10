import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-6">
              <Package className="h-8 w-8 text-primary-400" />
              <span className="font-bold text-2xl tracking-tight text-white">PremiumCart</span>
            </Link>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Your one-stop destination for premium products. Experience the best quality and seamless shopping with us.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white transition-colors">Categories</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Customer Service</h3>
            <ul className="space-y-3">
              <li><Link to="/my-orders" className="text-gray-400 hover:text-white transition-colors">Track Order</Link></li>
              <li><Link to="/returns" className="text-gray-400 hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-gray-400">
                <MapPin size={20} className="flex-shrink-0 mt-1 text-primary-400" />
                <span>123 Commerce St, Tech Park, Business City 500001</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Phone size={20} className="flex-shrink-0 text-primary-400" />
                <span>+1 (800) 123-4567</span>
              </li>
              <li className="flex items-center gap-3 text-gray-400">
                <Mail size={20} className="flex-shrink-0 text-primary-400" />
                <span>support@premiumcart.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} PremiumCart. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Payment icons placeholders */}
            <div className="h-8 w-12 bg-white rounded-md opacity-20"></div>
            <div className="h-8 w-12 bg-white rounded-md opacity-20"></div>
            <div className="h-8 w-12 bg-white rounded-md opacity-20"></div>
            <div className="h-8 w-12 bg-white rounded-md opacity-20"></div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
