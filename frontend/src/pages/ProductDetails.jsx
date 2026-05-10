import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Truck, ShieldCheck, RefreshCw, ShoppingCart, Check, X, MapPin } from 'lucide-react';
import api from '../config/api';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data.product);
        
        // Fetch reviews
        const reviewRes = await api.get(`/reviews/${id}`);
        setReviews(reviewRes.data.reviews || []);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === 'inc' && quantity < product.stock) {
      setQuantity(q => q + 1);
    } else if (type === 'dec' && quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      toast.error("Enter a valid 6-digit pincode");
      return;
    }
    
    setPincodeLoading(true);
    try {
      const res = await api.post('/check-pincode', { pincode });
      setPincodeResult(res.data);
    } catch (error) {
      setPincodeResult({ available: false, message: error.response?.data?.error || "Not serviceable" });
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (pincodeResult && !pincodeResult.available) {
      toast.error("Cannot add to cart. Pincode not serviceable.");
      return;
    }
    addToCart(product, quantity);
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  if (!product) {
    return <div className="text-center py-20 text-xl text-gray-600">Product not found</div>;
  }

  const discountPercentage = product.price > product.discount_price 
    ? Math.round(((product.price - product.discount_price) / product.price) * 100) 
    : 0;

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Breadcrumbs */}
      <div className="bg-gray-50 border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm text-gray-500 flex items-center space-x-2">
            <Link to="/" className="hover:text-primary-900">Home</Link>
            <span>/</span>
            <Link to={`/products?category=${product.category}`} className="hover:text-primary-900">{product.category}</Link>
            <span>/</span>
            <span className="text-gray-900 truncate w-32 md:w-auto">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Image Gallery */}
          <div className="lg:w-1/2">
            <div className="bg-gray-100 rounded-2xl overflow-hidden mb-4 relative aspect-square">
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-sm">
                  {discountPercentage}% OFF
                </div>
              )}
              <img 
                src={product.image_url || 'https://via.placeholder.com/600x600?text=Product'} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            {/* Future thumbnail gallery can go here */}
          </div>

          {/* Product Info */}
          <div className="lg:w-1/2 flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={18} className={i < (product.rating || 4) ? "fill-current" : "text-gray-300"} />
                ))}
              </div>
              <span className="text-gray-500 text-sm hover:underline cursor-pointer">{reviews.length} reviews</span>
              <span className="text-gray-300">|</span>
              {product.stock > 0 ? (
                <span className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded">In Stock ({product.stock})</span>
              ) : (
                <span className="text-red-600 text-sm font-medium bg-red-50 px-2 py-1 rounded">Out of Stock</span>
              )}
            </div>

            <div className="flex items-end gap-3 mb-6">
              <span className="text-4xl font-bold text-gray-900">₹{product.discount_price || product.price}</span>
              {product.discount_price && product.discount_price < product.price && (
                <span className="text-xl text-gray-500 line-through mb-1">₹{product.price}</span>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>

            {/* Pincode Checker */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-3 text-gray-800 font-medium">
                <MapPin size={18} /> Check Delivery Availability
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  maxLength="6"
                  placeholder="Enter Pincode" 
                  className="input-field bg-white"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                />
                <button 
                  onClick={checkPincode} 
                  disabled={pincodeLoading || pincode.length !== 6}
                  className="btn-secondary whitespace-nowrap disabled:opacity-50"
                >
                  {pincodeLoading ? 'Checking...' : 'Check'}
                </button>
              </div>
              {pincodeResult && (
                <div className={`mt-3 text-sm flex items-start gap-2 ${pincodeResult.available ? 'text-green-700' : 'text-red-600'}`}>
                  {pincodeResult.available ? <Check size={16} className="mt-0.5" /> : <X size={16} className="mt-0.5" />}
                  <div>
                    <span className="font-medium">{pincodeResult.message}</span>
                    {pincodeResult.available && (
                      <div className="text-gray-600 mt-1">
                        Delivery Charge: ₹{pincodeResult.delivery_charge} | Delivered in {pincodeResult.min_days}-{pincodeResult.max_days} days
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex border border-gray-300 rounded-md bg-white items-center h-12 w-32">
                <button onClick={() => handleQuantityChange('dec')} className="px-4 py-2 text-gray-600 hover:text-primary-900 transition-colors">-</button>
                <span className="flex-1 text-center font-medium">{quantity}</span>
                <button onClick={() => handleQuantityChange('inc')} className="px-4 py-2 text-gray-600 hover:text-primary-900 transition-colors">+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || (pincodeResult && !pincodeResult.available)}
                className="flex-1 btn-primary h-12 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={20} /> Add to Cart
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-8 mt-auto">
              <div className="flex items-center gap-3 text-gray-600">
                <Truck className="text-primary-600" size={24} />
                <span className="text-sm font-medium">Fast Delivery</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <RefreshCw className="text-primary-600" size={24} />
                <span className="text-sm font-medium">7 Days Return</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <ShieldCheck className="text-primary-600" size={24} />
                <span className="text-sm font-medium">1 Year Warranty</span>
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
          {reviews.length === 0 ? (
            <div className="bg-gray-50 p-8 text-center rounded-xl">
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-medium text-gray-900">{review.users_profile?.full_name || 'Anonymous'}</div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "fill-current" : "text-gray-300"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ProductDetails;
