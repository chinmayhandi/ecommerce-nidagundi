import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import api from '../../config/api';
import toast from 'react-hot-toast';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    coupon_code: '',
    discount_percentage: '',
    minimum_order_amount: '',
    expiry_date: '',
    status: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/coupons');
      setCoupons(res.data.coupons);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', formData);
      toast.success('Coupon added successfully');
      setShowForm(false);
      fetchCoupons();
      setFormData({ coupon_code: '', discount_percentage: '', minimum_order_amount: '', expiry_date: '', status: true });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add coupon');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await api.delete(`/admin/coupons/${id}`);
      toast.success('Deleted successfully');
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manage Coupons</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> {showForm ? 'Close Form' : 'Create Coupon'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Create New Coupon</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Coupon Code *</label>
                <input required type="text" value={formData.coupon_code} onChange={e => setFormData({...formData, coupon_code: e.target.value.toUpperCase()})} className="input-field py-2 uppercase" placeholder="SUMMER50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Discount (%) *</label>
                <input required type="number" min="1" max="100" value={formData.discount_percentage} onChange={e => setFormData({...formData, discount_percentage: e.target.value})} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                <input type="number" min="0" value={formData.minimum_order_amount} onChange={e => setFormData({...formData, minimum_order_amount: e.target.value})} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date *</label>
                <input required type="date" value={formData.expiry_date} onChange={e => setFormData({...formData, expiry_date: e.target.value})} className="input-field py-2" />
              </div>
              <div className="md:col-span-4 flex justify-end mt-2">
                <button type="submit" className="btn-primary py-2 px-6">Save Coupon</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                <th className="p-4 font-medium">Code</th>
                <th className="p-4 font-medium">Discount</th>
                <th className="p-4 font-medium">Min Order</th>
                <th className="p-4 font-medium">Expiry Date</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {coupons.map(item => {
                const isExpired = new Date(item.expiry_date) < new Date();
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold text-primary-900">{item.coupon_code}</td>
                    <td className="p-4 font-medium">{item.discount_percentage}%</td>
                    <td className="p-4">₹{item.minimum_order_amount || 0}</td>
                    <td className="p-4 text-gray-600">{new Date(item.expiry_date).toLocaleDateString()}</td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded text-xs font-medium ${isExpired ? 'bg-red-100 text-red-800' : (item.status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800')}`}>
                         {isExpired ? 'Expired' : (item.status ? 'Active' : 'Disabled')}
                       </span>
                    </td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Coupons;
