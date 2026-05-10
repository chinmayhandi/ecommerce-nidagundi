import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../config/api';
import toast from 'react-hot-toast';
import { ShieldCheck, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (!location.state?.orderData) {
      navigate('/cart');
      return;
    }
    setOrderData(location.state.orderData);
  }, [location, navigate]);

  const handlePayment = async () => {
    if (!orderData) return;
    setLoading(true);
    
    try {
      // 1. Create order on backend
      const res = await api.post('/create-payment-order', {
        amount: orderData.totalAmount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`
      });
      
      const { id: order_id, amount, currency } = res.data.order;

      // 2. Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Enter the Key ID generated from the Dashboard
        amount: amount.toString(),
        currency: currency,
        name: "PremiumCart",
        description: "Order Payment",
        order_id: order_id,
        handler: async function (response) {
          // 3. Verify payment on backend
          try {
            toast.loading('Verifying payment...', { id: 'payment' });
            const verifyRes = await api.post('/verify-payment', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: orderData // Pass the address and cart data to save
            });
            
            if (verifyRes.data.success) {
              toast.success('Payment successful!', { id: 'payment' });
              clearCart(); // Empty the cart
              navigate('/order-confirmed', { state: { orderId: verifyRes.data.db_order_id } });
            } else {
              toast.error('Payment verification failed', { id: 'payment' });
            }
          } catch (err) {
            console.error(err);
            toast.error('Payment verification failed', { id: 'payment' });
          }
        },
        prefill: {
          name: orderData.address.fullName,
          email: orderData.address.email,
          contact: orderData.address.phone
        },
        theme: {
          color: "#0a0a0a" // primary-900
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response){
        toast.error('Payment failed or cancelled.');
        setLoading(false);
      });
      
      rzp.open();

    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || 'Failed to initialize payment';
      toast.error(errorMsg);
      setLoading(false);
    }
  };

  if (!orderData) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-16 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 text-white p-6 text-center">
          <ShieldCheck size={48} className="mx-auto mb-4 text-primary-400" />
          <h2 className="text-2xl font-bold mb-1">Secure Payment</h2>
          <p className="text-gray-400 text-sm">You are about to pay for your order</p>
        </div>
        
        <div className="p-8">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-100">
            <span className="text-gray-600">Amount to Pay</span>
            <span className="text-3xl font-bold text-gray-900">₹{orderData.totalAmount.toFixed(2)}</span>
          </div>
          
          <div className="space-y-4 mb-8 text-sm">
            <div className="flex text-gray-600">
              <span className="w-24 font-medium text-gray-900">Deliver To:</span>
              <span className="flex-1">{orderData.address.fullName}, {orderData.address.houseNo}, {orderData.address.street}, {orderData.address.city} - {orderData.address.pincode}</span>
            </div>
            <div className="flex text-gray-600">
              <span className="w-24 font-medium text-gray-900">Items:</span>
              <span className="flex-1">{orderData.cartItems.length} product(s)</span>
            </div>
          </div>
          
          <button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
          >
            {loading ? (
               <span className="animate-pulse">Processing...</span>
            ) : (
               <>
                 <Lock size={18} /> Pay ₹{orderData.totalAmount.toFixed(2)} Securely
               </>
            )}
          </button>
          
          <div className="mt-6 text-center flex justify-center items-center gap-2 text-xs text-gray-400">
             <span>Secured by Razorpay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
