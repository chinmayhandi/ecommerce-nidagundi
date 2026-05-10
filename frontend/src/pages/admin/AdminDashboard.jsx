import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Package, ShoppingBag, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import api from '../../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalSales: 0,
    pendingOrders: 0,
    lowStockAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  const mockChartData = [
    { name: 'Jan', sales: 4000, orders: 240 },
    { name: 'Feb', sales: 3000, orders: 139 },
    { name: 'Mar', sales: 2000, orders: 980 },
    { name: 'Apr', sales: 2780, orders: 390 },
    { name: 'May', sales: 1890, orders: 480 },
    { name: 'Jun', sales: 2390, orders: 380 },
    { name: 'Jul', sales: 3490, orders: 430 },
  ];

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data.stats);
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { title: 'Add Product', path: '/admin/products/add', icon: Package, color: 'bg-blue-500' },
    { title: 'Manage Products', path: '/admin/products', icon: Package, color: 'bg-indigo-500' },
    { title: 'Manage Orders', path: '/admin/orders', icon: ShoppingBag, color: 'bg-green-500' },
    { title: 'Manage Customers', path: '/admin/customers', icon: Users, color: 'bg-purple-500' },
    { title: 'Delivery Pincodes', path: '/admin/pincodes', icon: TrendingUp, color: 'bg-yellow-500' },
    { title: 'Coupons', path: '/admin/coupons', icon: DollarSign, color: 'bg-red-500' },
  ];

  if (loading) {
    return <div className="flex h-[calc(100vh-64px)] items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-64px)] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-blue-50 p-4 rounded-full text-blue-600"><DollarSign size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sales</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{stats.totalSales.toFixed(2)}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-indigo-50 p-4 rounded-full text-indigo-600"><ShoppingBag size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalOrders}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-purple-50 p-4 rounded-full text-purple-600"><Users size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Customers</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalUsers}</h3>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="bg-yellow-50 p-4 rounded-full text-yellow-600"><Package size={24} /></div>
            <div>
              <p className="text-sm font-medium text-gray-500">Products</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalProducts}</h3>
            </div>
          </div>
        </div>

        {/* Charts & Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Sales Overview</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Legend />
                  <Bar dataKey="sales" name="Sales (₹)" fill="#111827" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col gap-6 lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-1">
               <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-900">Pending Orders</h3>
                  <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">{stats.pendingOrders}</span>
               </div>
               <p className="text-gray-600 text-sm">You have {stats.pendingOrders} orders that need processing.</p>
               <Link to="/admin/orders" className="text-primary-600 hover:text-primary-800 text-sm font-medium mt-4 inline-block">View Orders &rarr;</Link>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex-1">
               <div className="flex items-center justify-between mb-4 border-b pb-2">
                  <h3 className="text-lg font-bold text-gray-900">Low Stock Alerts</h3>
                  <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">{stats.lowStockAlerts}</span>
               </div>
               <p className="text-gray-600 text-sm">You have {stats.lowStockAlerts} products with low stock levels.</p>
               <Link to="/admin/products" className="text-primary-600 hover:text-primary-800 text-sm font-medium mt-4 inline-block">Manage Inventory &rarr;</Link>
            </div>
          </div>
        </div>      </div>
    </div>
  );
};

export default AdminDashboard;
