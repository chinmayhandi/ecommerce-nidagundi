import React, { useState, useEffect } from 'react';
import { Star, Trash2 } from 'lucide-react';
import api from '../../config/api';
import toast from 'react-hot-toast';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await api.get('/admin/reviews'); // Assuming we create an endpoint to fetch all reviews
      setReviews(res.data.reviews || []);
    } catch (error) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Deleted successfully');
      setReviews(reviews.filter(r => r.id !== id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-900"></div></div>;

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Reviews</h1>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                <th className="p-4 font-medium">Product</th>
                <th className="p-4 font-medium">Customer</th>
                <th className="p-4 font-medium">Rating</th>
                <th className="p-4 font-medium">Comment</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {reviews.map(item => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{item.products?.name}</td>
                  <td className="p-4 text-gray-600">{item.users_profile?.full_name}</td>
                  <td className="p-4">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} className={i < item.rating ? "fill-current" : "text-gray-300"} />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-gray-600 line-clamp-2 max-w-xs">{item.comment}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {reviews.length === 0 && (
             <div className="p-8 text-center text-gray-500">No reviews found.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reviews;
