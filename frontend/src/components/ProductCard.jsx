import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const [inWishlist, setInWishlist] = React.useState(false);

  const toggleWishlist = async (e) => {
    e.preventDefault(); // Prevent Link navigation
    try {
      if (inWishlist) {
        // We'd need the wishlist item ID to remove it, but since we don't have it here easily, 
        // a robust approach is to let the wishlist page handle removals, or we fetch wishlist state.
        // For simplicity in a card, we just add it.
        toast.success('Already in wishlist');
      } else {
        await api.post('/wishlist/add', { product_id: product.id });
        setInWishlist(true);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error('Please login to add to wishlist');
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart(product);
    }
  };

  const discountPercentage = product.price > product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <div className="card group hover:shadow-lg transition-all duration-300 flex flex-col h-full bg-white relative">
      {discountPercentage > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
          {discountPercentage}% OFF
        </div>
      )}
      
      <button 
        onClick={toggleWishlist}
        className="absolute top-2 right-2 z-20 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 transition-colors"
      >
        <Heart size={18} className={inWishlist ? "fill-red-500 text-red-500" : ""} />
      </button>
      
      <Link to={`/products/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img 
          src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'} 
          alt={product.name} 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold px-4 py-2 border-2 border-white rounded">OUT OF STOCK</span>
          </div>
        )}
      </Link>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="text-xs text-gray-500 mb-1">{product.category}</div>
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="font-semibold text-gray-800 text-sm md:text-base line-clamp-2 hover:text-primary-600 mb-2">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex items-center mb-2 mt-auto">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} className={i < (product.rating || 4) ? "fill-current" : "text-gray-300"} />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">({product.reviews_count || 0})</span>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-900">₹{product.discount_price || product.price}</span>
            {product.discount_price && product.discount_price < product.price && (
              <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-full flex items-center justify-center transition-colors ${
              product.stock === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-50 text-primary-900 hover:bg-primary-900 hover:text-white'
            }`}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
