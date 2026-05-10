import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit } from 'lucide-react';
import api from '../../config/api';
import toast from 'react-hot-toast';

const ManagePincodes = () => {
  const [pincodes, setPincodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    pincode: '',
    city: '',
    state: '',
    delivery_charge: '',
    min_delivery_days: '',
    max_delivery_days: '',
    status: true
  });

  useEffect(() => {
    fetchPincodes();
  }, []);

  const fetchPincodes = async () => {
    try {
      const res = await api.get('/admin/pincodes');
      setPincodes(res.data.pincodes);
    } catch (error) {
      toast.error('Failed to fetch pincodes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/pincodes', formData);
      toast.success('Pincode added successfully');
      setShowForm(false);
      fetchPincodes();
      setFormData({ pincode: '', city: '', state: '', delivery_charge: '', min_delivery_days: '', max_delivery_days: '', status: true });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add pincode');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this pincode?")) return;
    try {
      await api.delete(`/admin/pincodes/${id}`);
      toast.success('Deleted successfully');
      fetchPincodes();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
     try {
       await api.put(`/admin/pincodes/${id}`, { status: !currentStatus });
       fetchPincodes();
     } catch (error) {
       toast.error('Failed to update status');
     }
  }

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Delivery Pincodes</h1>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus size={18} /> {showForm ? 'Close Form' : 'Add New'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-lg font-bold mb-4 border-b pb-2">Add Serviceable Pincode</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Pincode *</label>
                <input required type="text" maxLength="6" value={formData.pincode} onChange={e => setFormData({...formData, pincode: e.target.value})} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">City *</label>
                <input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">State *</label>
                <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="input-field py-2" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Delivery Charge (₹) *</label>
                <input required type="number" min="0" value={formData.delivery_charge} onChange={e => setFormData({...formData, delivery_charge: e.target.value})} className="input-field py-2" />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Min Days</label>
                  <input required type="number" min="1" value={formData.min_delivery_days} onChange={e => setFormData({...formData, min_delivery_days: e.target.value})} className="input-field py-2" />
                </div>
                <div className="w-1/2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Max Days</label>
                  <input required type="number" min="1" value={formData.max_delivery_days} onChange={e => setFormData({...formData, max_delivery_days: e.target.value})} className="input-field py-2" />
                </div>
              </div>
              <div className="flex items-end">
                <button type="submit" className="btn-primary w-full py-2">Save Pincode</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                <th className="p-4 font-medium">Pincode</th>
                <th className="p-4 font-medium">Location</th>
                <th className="p-4 font-medium">Charge</th>
                <th className="p-4 font-medium">Delivery Time</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {pincodes.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">{item.pincode}</td>
                  <td className="p-4 text-gray-600">{item.city}, {item.state}</td>
                  <td className="p-4 font-medium">₹{item.delivery_charge}</td>
                  <td className="p-4 text-gray-500">{item.min_delivery_days}-{item.max_delivery_days} days</td>
                  <td className="p-4">
                     <button 
                       onClick={() => toggleStatus(item.id, item.status)}
                       className={`px-2 py-1 rounded text-xs font-medium ${item.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                     >
                       {item.status ? 'Active' : 'Disabled'}
                     </button>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePincodes;
