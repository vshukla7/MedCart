import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchLatestOrder, createOrder as apiCreateOrder } from '../services/api';

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState([
    {
      _id: 'ord_101',
      orderNumber: 'MED-784920',
      createdAt: new Date().toISOString(),
      items: [
        { name: 'Paracetamol 650mg Extra', quantity: 2, price: 45 },
        { name: 'Vitamin C 1000mg', quantity: 1, price: 95 }
      ],
      totalAmount: 185,
      grandTotal: 185,
      status: 'Out for Delivery',
      statusStep: 3,
      paymentMethod: 'UPI',
      estimatedDelivery: 'Today, by 6:00 PM'
    }
  ]);

  const [activeOrder, setActiveOrder] = useState(orders[0]);

  const loadLatestOrder = async () => {
    const latest = await fetchLatestOrder();
    if (latest) {
      setActiveOrder(latest);
    }
  };

  useEffect(() => {
    loadLatestOrder();
  }, []);

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

  return (
    <OrderContext.Provider value={{
      orders,
      activeOrder,
      placeOrder,
      advanceOrderStep,
      refreshOrders: loadLatestOrder
    }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
