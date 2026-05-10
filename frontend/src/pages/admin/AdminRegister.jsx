import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../config/api';

const AdminRegister = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    secretKey: ''
  });
  const [loading, setLoading] = useState(false);
  const { register, logout } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create the account via Supabase Auth
      await register(formData.email, formData.password, formData.fullName);
      
      // Wait for trigger to create the users_profile row
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 2. Call backend to elevate role to admin
      const res = await api.post('/elevate-admin', {
        email: formData.email,
        secret_key: formData.secretKey
      });
      if (res.status === 200) {
         toast.success('Admin account created successfully! Please log in.');
         // Log them out to clear the stale 'customer' state
         try { await logout(); } catch(e) {}
         navigate('/admin/login');
      }
    } catch (error) {
      if (error.response?.data?.error) {
         toast.error(error.response.data.error);
      } else if (error.message) {
         toast.error(error.message);
      } else {
         toast.error("Failed to create admin");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
             <ShieldCheck className="h-8 w-8 text-primary-900" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Create Admin</h2>
          <p className="mt-2 text-sm text-gray-600">Enter the secret key to get access</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="input-field"
              placeholder="John Doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="input-field"
              placeholder="admin@premiumcart.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-red-600">Admin Secret Key *</label>
            <input
              type="password"
              name="secretKey"
              required
              value={formData.secretKey}
              onChange={handleChange}
              className="input-field border-red-200 focus:border-red-500 focus:ring-red-500"
              placeholder="Enter the secret code"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors mt-6"
          >
            {loading ? 'Creating Account...' : 'Register as Admin'}
          </button>
        </form>
        
        <div className="mt-6 text-center text-sm">
           <Link to="/admin/login" className="text-primary-600 font-medium hover:underline">Already have an admin account? Login</Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
