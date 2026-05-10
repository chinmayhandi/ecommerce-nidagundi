import React, { useState, useEffect } from 'react';
import { Truck, Package, XCircle, CheckCircle } from 'lucide-react';
import api from '../../config/api';
import toast from 'react-hot-toast';

const ManageOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [trackingModal, setTrackingModal] = useState({ show: false, orderId: null });
  const [trackingData, setTrackingData] = useState({ tracking_id: '', courier_name: '' });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const openTrackingModal = (orderId) => {
    setTrackingModal({ show: true, orderId });
    setTrackingData({ tracking_id: '', courier_name: '' });
  };

  const submitTracking = async () => {
    if (!trackingData.tracking_id || !trackingData.courier_name) {
      toast.error('Please fill both fields');
      return;
    }
    
    try {
      await api.put(`/admin/orders/${trackingModal.orderId}/tracking`, trackingData);
      toast.success('Tracking updated');
      setTrackingModal({ show: false, orderId: null });
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update tracking');
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Orders</h1>

        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-gray-100">No orders found.</div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex gap-6 text-sm">
                     <div>
                        <span className="text-gray-500 block mb-1">Order ID</span>
                        <span className="font-bold text-gray-900">{order.id}</span>
                     </div>
                     <div>
                        <span className="text-gray-500 block mb-1">Customer</span>
                        <span className="font-medium text-gray-900">{order.users_profile?.full_name}</span>
                        <span className="text-gray-500 block text-xs">{order.users_profile?.email}</span>
                     </div>
                     <div>
                        <span className="text-gray-500 block mb-1">Total</span>
                        <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                     </div>
                     <div>
                        <span className="text-gray-500 block mb-1">Date</span>
                        <span className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
                  <div>
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="input-field py-1 text-sm font-medium w-36 bg-white"
                      disabled={order.status === 'cancelled'}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-8">
                  <div className="md:w-1/2">
                    <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Items</h4>
                    <div className="space-y-3">
                      {order.items && order.items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 text-sm">
                          <span className="font-medium text-gray-500">{item.quantity}x</span>
                          <span className="text-gray-900 flex-1">{item.product_name}</span>
                          <span className="font-medium text-gray-900">₹{item.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="md:w-1/2">
                     <h4 className="text-sm font-bold text-gray-900 mb-3 border-b pb-2">Shipping Details</h4>
                     <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                       {order.shipping_address?.fullName}<br/>
                       {order.shipping_address?.houseNo}, {order.shipping_address?.street}<br/>
                       {order.shipping_address?.city}, {order.shipping_address?.state} - {order.shipping_address?.pincode}<br/>
                       Phone: {order.shipping_address?.phone}
                     </p>

                     <h4 className="text-sm font-bold text-gray-900 mb-2">Tracking Info</h4>
                     <div className="bg-gray-50 p-3 rounded text-sm mb-3">
                       {order.tracking_id ? (
                         <>
                           <span className="text-gray-500">ID:</span> <span className="font-medium mr-4">{order.tracking_id}</span>
                           <span className="text-gray-500">Courier:</span> <span className="font-medium">{order.courier_name}</span>
                         </>
                       ) : (
                         <span className="text-gray-500 italic">No tracking info added</span>
                       )}
                     </div>
                     <button 
                       onClick={() => openTrackingModal(order.id)}
                       disabled={order.status === 'cancelled' || order.status === 'pending'}
                       className="text-sm btn-secondary py-1 disabled:opacity-50"
                     >
                       Update Tracking
                     </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Tracking Modal */}
      {trackingModal.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Update Tracking Info</h3>
              <button onClick={() => setTrackingModal({ show: false, orderId: null })} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Courier Name</label>
                <input 
                  type="text" 
                  value={trackingData.courier_name}
                  onChange={(e) => setTrackingData({...trackingData, courier_name: e.target.value})}
                  className="input-field"
                  placeholder="e.g. DTDC, BlueDart"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tracking ID / AWB</label>
                <input 
                  type="text" 
                  value={trackingData.tracking_id}
                  onChange={(e) => setTrackingData({...trackingData, tracking_id: e.target.value})}
                  className="input-field"
                  placeholder="Enter tracking number"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setTrackingModal({ show: false, orderId: null })} className="flex-1 btn-secondary py-2">Cancel</button>
              <button onClick={submitTracking} className="flex-1 btn-primary py-2">Save Updates</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
