import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: user?.email || '',
    houseNo: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  const [loading, setLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(0);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'pincode' && value.length === 6) {
      verifyPincode(value);
    } else if (name === 'pincode') {
      setPincodeError('');
      setDeliveryCharge(0);
    }
  };

  const verifyPincode = async (pin) => {
    try {
      const res = await api.post('/check-pincode', { pincode: pin });
      if (res.data.available) {
        setPincodeError('');
        setDeliveryCharge(res.data.delivery_charge);
      } else {
        setPincodeError(res.data.message || 'Pincode not serviceable');
        setDeliveryCharge(0);
      }
    } catch (error) {
      setPincodeError(error.response?.data?.error || 'Pincode not serviceable');
      setDeliveryCharge(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pincodeError || formData.pincode.length !== 6) {
      toast.error('Please provide a valid serviceable pincode');
      return;
    }

    setLoading(true);
    try {
      // Save address/order details temporarily or pass them to payment
      const orderData = {
        address: formData,
        deliveryCharge,
        cartItems: cart,
        totalAmount: getCartTotal() + deliveryCharge
      };
      
      // We will pass this data to the payment page via route state
      navigate('/payment', { state: { orderData } });
    } catch (error) {
      toast.error('Failed to process checkout');
    } finally {
      setLoading(false);
    }
  };

  const total = getCartTotal();

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Shipping Address</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input required type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                    <input required type="tel" pattern="[0-9]{10}" title="10 digit mobile number" name="phone" value={formData.phone} onChange={handleInputChange} className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field bg-gray-50" readOnly />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">House/Flat No *</label>
                    <input required type="text" name="houseNo" value={formData.houseNo} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street/Area *</label>
                    <input required type="text" name="street" value={formData.street} onChange={handleInputChange} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleInputChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleInputChange} className="input-field" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                    <input 
                      required 
                      type="text" 
                      maxLength="6" 
                      name="pincode" 
                      value={formData.pincode} 
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        handleInputChange({ target: { name: 'pincode', value: val } });
                      }} 
                      className={`input-field ${pincodeError ? 'border-red-500 focus:ring-red-500' : ''}`} 
                    />
                    {pincodeError && <p className="text-red-500 text-xs mt-1">{pincodeError}</p>}
                    {!pincodeError && formData.pincode.length === 6 && <p className="text-green-600 text-xs mt-1">Serviceable (Delivery: ₹{deliveryCharge})</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
                    <input type="text" name="landmark" value={formData.landmark} onChange={handleInputChange} className="input-field" />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit" 
                    disabled={loading || !!pincodeError || formData.pincode.length !== 6}
                    className="w-full btn-primary py-4 text-lg shadow-md disabled:opacity-50"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Details</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div className="flex gap-2 w-3/4">
                      <span className="text-gray-500">{item.quantity}x</span>
                      <span className="text-gray-900 line-clamp-2">{item.products?.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">₹{((item.products?.discount_price || item.products?.price) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">₹{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charge</span>
                  <span className="font-medium text-gray-900">₹{deliveryCharge.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total to Pay</span>
                  <span className="text-2xl font-bold text-primary-900">₹{(total + deliveryCharge).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Checkout;
