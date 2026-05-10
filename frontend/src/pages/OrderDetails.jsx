import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Package, Download, XCircle, ArrowLeft, Truck, MapPin } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data.order);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load order details');
      navigate('/my-orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.post('/cancel-order', { order_id: order.id });
      toast.success('Order cancelled successfully');
      fetchOrderDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to cancel order');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  if (!order) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/my-orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-primary-600 mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back to My Orders
        </Link>
        
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-500 mt-1">Order #{order.id}</p>
          </div>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold capitalize
            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
              'bg-blue-100 text-blue-800'}`}>
            {order.status}
          </span>
        </div>

        <div className="space-y-6">
          {/* Main Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap gap-8">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                <p className="text-sm font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                <p className="text-sm font-bold text-primary-900">₹{order.total_amount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                <p className="text-sm font-medium text-gray-900 capitalize">{order.payment_method}</p>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><MapPin size={18} className="text-gray-400"/> Shipping Address</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  <span className="font-medium text-gray-900">{order.shipping_address?.fullName}</span><br/>
                  {order.shipping_address?.houseNo}, {order.shipping_address?.street}<br/>
                  {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}<br/>
                  Phone: {order.shipping_address?.phone}
                </p>
              </div>
              <div>
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-3"><Truck size={18} className="text-gray-400"/> Tracking Information</h3>
                {order.tracking_id ? (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-600 mb-1">Courier: <span className="font-medium text-gray-900">{order.courier_name}</span></p>
                    <p className="text-sm text-gray-600 mb-3">Tracking ID: <span className="font-bold text-gray-900">{order.tracking_id}</span></p>
                    <a 
                      href={`https://www.google.com/search?q=${order.courier_name}+tracking+${order.tracking_id}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-block text-xs font-bold text-blue-600 hover:text-blue-800 underline"
                    >
                      Track Package Online
                    </a>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic bg-gray-50 p-4 rounded-lg">
                    Tracking details will be available here once your order is shipped.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h3 className="px-6 py-4 font-bold text-gray-900 border-b border-gray-100 bg-gray-50">Items Ordered</h3>
            <div className="p-6">
              {order.items && order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-6 py-4 first:pt-0 last:pb-0 border-b last:border-0 border-gray-100 group">
                  <Link to={`/products/${item.product_id}`} className="shrink-0">
                    <img src={item.product_image || 'https://via.placeholder.com/100'} alt={item.product_name} className="w-20 h-20 object-cover rounded-md bg-gray-100 group-hover:opacity-80 transition-opacity" />
                  </Link>
                  <div className="flex-1">
                    <Link to={`/products/${item.product_id}`} className="font-medium text-gray-900 hover:text-primary-600 line-clamp-1">
                      {item.product_name}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price}</p>
                  </div>
                  
                  {/* Review Button for Delivered Items */}
                  {order.status === 'delivered' && (
                    <Link to={`/products/${item.product_id}#reviews`} className="text-sm font-medium btn-secondary py-1 px-3 hidden md:block">
                      Write Review
                    </Link>
                  )}
                </div>
              ))}
            </div>
            
            {/* Actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end items-center gap-3">
              {order.status !== 'cancelled' && order.status !== 'delivered' && order.status !== 'shipped' && order.status !== 'packed' && (
                <button 
                  onClick={handleCancelOrder}
                  className="flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-200"
                >
                  <XCircle size={18} /> Cancel Order
                </button>
              )}
              {order.status !== 'cancelled' && (
                <button className="flex items-center gap-1 text-sm text-gray-700 hover:bg-gray-100 font-medium border border-gray-300 px-4 py-2 rounded-lg bg-white transition-colors">
                  <Download size={18} /> Download Invoice
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
