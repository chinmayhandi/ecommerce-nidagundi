import React, { useEffect, useState } from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, Package, Truck, ArrowRight } from 'lucide-react';
import api from '../config/api';

const OrderConfirmed = () => {
  const location = useLocation();
  const orderId = location.state?.orderId;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${orderId}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  if (!order) {
    return <div className="text-center py-20">Order not found.</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-50 p-8 text-center border-b border-green-100">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Thank you for your purchase. Your order has been placed successfully.</p>
        </div>

        <div className="p-8">
          <div className="flex flex-col md:flex-row justify-between mb-8 pb-8 border-b border-gray-100 gap-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-bold text-gray-900">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Date</p>
              <p className="font-bold text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Payment Method</p>
              <p className="font-bold text-gray-900">Online (Razorpay)</p>
            </div>
          </div>

          {/* Tracking Pipeline */}
          <div className="mb-12">
            <h3 className="font-bold text-gray-900 mb-6">Order Status</h3>
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                <div style={{ width: "25%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 font-medium">
                <div className="text-green-600 font-bold flex flex-col items-center gap-1"><Package size={16}/>Placed</div>
                <div className="flex flex-col items-center gap-1"><Package size={16}/>Packed</div>
                <div className="flex flex-col items-center gap-1"><Truck size={16}/>Shipped</div>
                <div className="flex flex-col items-center gap-1"><CheckCircle size={16}/>Delivered</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 mb-4">Delivery Address</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              <span className="font-medium text-gray-900 block mb-1">{order.shipping_address.fullName}</span>
              {order.shipping_address.houseNo}, {order.shipping_address.street}<br/>
              {order.shipping_address.city}, {order.shipping_address.state} - {order.shipping_address.pincode}<br/>
              Phone: {order.shipping_address.phone}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link to="/my-orders" className="btn-secondary flex items-center justify-center gap-2">
              View All Orders
            </Link>
            <Link to="/products" className="btn-primary flex items-center justify-center gap-2">
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmed;
