import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import api from '../config/api';
import toast from 'react-hot-toast';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', formData);
      toast.success('Message sent successfully. We will get back to you soon!');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-primary-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-primary-100 max-w-2xl mx-auto text-lg">
            Have a question, feedback, or need assistance? We're here to help. Get in touch with our team today.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          {/* Contact Info */}
          <div className="lg:w-1/3 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                We value your feedback and are committed to providing you with the best possible service. 
                Whether you have a product inquiry or need support with an order, please don't hesitate to reach out.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-full text-primary-900 flex-shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Our Location</h3>
                  <p className="text-gray-600 mt-1">123 Commerce St, Tech Park<br/>Business City, 500001, India</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-full text-primary-900 flex-shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Call Us</h3>
                  <p className="text-gray-600 mt-1">+1 (800) 123-4567<br/>Mon-Fri: 9am - 6pm</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-primary-50 p-3 rounded-full text-primary-900 flex-shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Email Us</h3>
                  <p className="text-gray-600 mt-1">support@premiumcart.com<br/>info@premiumcart.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                    <input 
                      required type="text" name="name" 
                      value={formData.name} onChange={handleChange} 
                      className="input-field bg-gray-50" 
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      required type="email" name="email" 
                      value={formData.email} onChange={handleChange} 
                      className="input-field bg-gray-50" 
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input 
                    required type="text" name="subject" 
                    value={formData.subject} onChange={handleChange} 
                    className="input-field bg-gray-50" 
                    placeholder="How can we help?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea 
                    required name="message" rows="5" 
                    value={formData.message} onChange={handleChange} 
                    className="input-field bg-gray-50 resize-none" 
                    placeholder="Write your message here..."
                  ></textarea>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : <><Send size={18} /> Send Message</>}
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Contact;
