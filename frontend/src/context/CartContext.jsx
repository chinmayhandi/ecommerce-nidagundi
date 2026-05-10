import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import api from '../config/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  // Load cart from local storage initially, then sync with backend if user is logged in
  useEffect(() => {
    const savedCart = localStorage.getItem('ecommerce_cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse cart');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchCartFromBackend();
    }
  }, [user]);

  // Save cart to local storage whenever it changes (if not logged in)
  useEffect(() => {
    if (!user) {
      localStorage.setItem('ecommerce_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const fetchCartFromBackend = async () => {
    try {
      setLoading(true);
      const res = await api.get('/cart');
      setCart(res.data.cart || []);
    } catch (error) {
      console.error('Failed to fetch cart', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    // Check if item already in cart
    const existingItem = cart.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        toast.error(`Cannot add more than ${product.stock} items`);
        return;
      }
    }

    if (user) {
      try {
        await api.post('/cart/add', { product_id: product.id, quantity });
        await fetchCartFromBackend();
        toast.success('Added to cart');
      } catch (error) {
        toast.error('Failed to add to cart');
      }
    } else {
      // Local cart
      const newCart = [...cart];
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        newCart.push({
          id: Date.now().toString(), // fake id
          product_id: product.id,
          quantity: quantity,
          products: product // Store product details locally
        });
      }
      setCart(newCart);
      toast.success('Added to cart');
    }
  };

  const updateQuantity = async (cartItemId, newQuantity, maxStock) => {
    if (newQuantity < 1) return;
    if (newQuantity > maxStock) {
      toast.error(`Only ${maxStock} items available`);
      return;
    }

    if (user) {
      try {
        await api.put('/cart/update', { cart_item_id: cartItemId, quantity: newQuantity });
        await fetchCartFromBackend();
      } catch (error) {
        toast.error('Failed to update quantity');
      }
    } else {
      setCart(cart.map(item => item.id === cartItemId ? { ...item, quantity: newQuantity } : item));
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (user) {
      try {
        await api.delete(`/cart/remove/${cartItemId}`);
        await fetchCartFromBackend();
        toast.success('Removed from cart');
      } catch (error) {
        toast.error('Failed to remove from cart');
      }
    } else {
      setCart(cart.filter(item => item.id !== cartItemId));
      toast.success('Removed from cart');
    }
  };

  const clearCart = async () => {
    if (user) {
      // Backend clear cart logic could be implemented here
    }
    setCart([]);
    localStorage.removeItem('ecommerce_cart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.products?.discount_price || item.products?.price || 0;
      return total + (price * item.quantity);
    }, 0);
  };

  const value = {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
