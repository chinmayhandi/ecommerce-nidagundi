import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/my-orders');
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm text-center border border-gray-100">
            <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-medium text-gray-900 mb-2">No orders found</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't placed any orders yet.</p>
            <Link to="/products" className="btn-primary inline-block">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden">
                <Link to={`/my-orders/${order.id}`} className="block">
                  <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Show thumbnail of the first item */}
                      {order.items && order.items.length > 0 && (
                        <div className="w-16 h-16 shrink-0 bg-gray-100 rounded-lg overflow-hidden hidden sm:block">
                          <img src={order.items[0].product_image} alt={order.items[0].product_name} className="w-full h-full object-cover" />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">Order #{order.id.slice(0, 8)}...</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Placed on {new Date(order.created_at).toLocaleDateString()} • {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Total Amount</p>
                        <p className="text-lg font-bold text-gray-900">₹{order.total_amount}</p>
                      </div>
                      <div className="flex items-center text-primary-600 font-medium">
                        View Details <ChevronRight size={18} className="ml-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
