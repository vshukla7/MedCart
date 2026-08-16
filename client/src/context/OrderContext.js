import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchLatestOrder, createOrder as apiCreateOrder, fetchOrders, updateOrderStatus } from '../services/api';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  const loadUserOrders = async (userId, role = 'user') => {
    if (!userId) return;
    try {
      const history = await fetchOrders({ role, userId });
      if (history) {
        setOrders(prev => {
          const map = new Map();
          // Server/incoming orders take precedence
          history.forEach(o => {
            if (o && o._id) map.set(o._id, o);
          });
          // Merge local orders that are not in the fetched history
          prev.forEach(o => {
            if (o && o._id && !map.has(o._id)) {
              map.set(o._id, o);
            }
          });
          const merged = Array.from(map.values()).sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
          });
          if (merged.length > 0) {
            setActiveOrder(merged[0]);
          }
          return merged;
        });
      }
    } catch (e) {
      console.error('Error loading user orders:', e);
    }
  };

  const placeOrder = async (orderPayload) => {
    const newOrd = await apiCreateOrder(orderPayload);
    setOrders(prev => [newOrd, ...prev]);
    setActiveOrder(newOrd);
    return newOrd;
  };

  const advanceOrderStep = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o._id === orderId) {
        const nextStep = o.statusStep < 4 ? o.statusStep + 1 : 4;
        const statusMap = { 1: 'Preparing', 2: 'Packed', 3: 'Out for Delivery', 4: 'Delivered' };
        const updated = { ...o, statusStep: nextStep, status: statusMap[nextStep] };
        if (activeOrder && activeOrder._id === orderId) {
          setActiveOrder(updated);
        }
        return updated;
      }
      return o;
    }));
  };

  const cancelOrder = async (orderId) => {
    const res = await updateOrderStatus(orderId, 'Cancelled');
    if (res.success) {
      setOrders(prev => prev.map(o => {
        if (o._id === orderId) {
          const updated = { ...o, statusStep: 0, status: 'Cancelled' };
          if (activeOrder && activeOrder._id === orderId) {
            setActiveOrder(updated);
          }
          return updated;
        }
        return o;
      }));
      return true;
    }
    return false;
  };

  return (
    <OrderContext.Provider value={{
      orders,
      activeOrder,
      placeOrder,
      loadUserOrders,
      setOrders,
      advanceOrderStep,
      cancelOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
