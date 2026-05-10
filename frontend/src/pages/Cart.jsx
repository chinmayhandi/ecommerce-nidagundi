import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const { cart, updateQuantity, removeFromCart, getCartTotal, loading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: '/cart' } });
    } else {
      navigate('/checkout');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16 flex flex-col items-center justify-center px-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
          <div className="bg-primary-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-primary-900">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/products" className="btn-primary w-full inline-block py-3">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  const total = getCartTotal();
  const tax = total * 0.18; // 18% GST example

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-gray-100 text-sm font-medium text-gray-500 bg-gray-50">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
              </div>
              
              {/* Items */}
              <div className="divide-y divide-gray-100">
                {cart.map((item) => {
                  const product = item.products;
                  const price = product.discount_price || product.price;
                  
                  return (
                    <div key={item.id} className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center group">
                      {/* Product details */}
                      <div className="col-span-1 md:col-span-6 flex items-center gap-4">
                        <Link to={`/products/${product.id}`} className="flex-shrink-0 w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </Link>
                        <div>
                          <Link to={`/products/${product.id}`}>
                            <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 mb-1">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="text-sm text-gray-500">{product.category}</div>
                          {/* Mobile Price */}
                          <div className="mt-2 md:hidden font-medium text-gray-900">₹{price}</div>
                        </div>
                      </div>
                      
                      {/* Desktop Price */}
                      <div className="hidden md:block col-span-2 text-center font-medium text-gray-900">
                        ₹{price}
                      </div>
                      
                      {/* Quantity */}
                      <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-center mt-2 md:mt-0">
                        <div className="flex border border-gray-300 rounded-md bg-white items-center h-9 w-24">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1, product.stock)} 
                            className="px-2 py-1 text-gray-600 hover:text-primary-900 transition-colors"
                          >-</button>
                          <span className="flex-1 text-center font-medium text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1, product.stock)} 
                            className="px-2 py-1 text-gray-600 hover:text-primary-900 transition-colors"
                          >+</button>
                        </div>
                        {/* Mobile Remove */}
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="md:hidden text-red-500 hover:text-red-700 p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      
                      {/* Total & Desktop Remove */}
                      <div className="hidden md:flex col-span-2 items-center justify-end gap-4">
                        <div className="font-bold text-gray-900">
                          ₹{(price * item.quantity).toFixed(2)}
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {!user && (
               <div className="mt-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                 <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={20} />
                 <p className="text-sm text-blue-800">
                   You are not logged in. <Link to="/login" className="font-bold underline">Login</Link> to sync your cart across devices and proceed to checkout smoothly.
                 </p>
               </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-medium text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (Estimated)</span>
                  <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-sm text-gray-500">Calculated at checkout</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total Estimate</span>
                  <span className="text-2xl font-bold text-primary-900">₹{(total + tax).toFixed(2)}</span>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full btn-primary py-4 flex items-center justify-center gap-2 text-lg shadow-md hover:shadow-lg transform transition-all hover:-translate-y-0.5"
              >
                Proceed to Checkout <ArrowRight size={20} />
              </button>
              
              <div className="mt-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                <ShieldCheck size={16} /> Secure Checkout Guaranteed
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Cart;
