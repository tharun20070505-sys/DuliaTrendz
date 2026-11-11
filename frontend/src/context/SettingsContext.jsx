import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    storeName: 'Dulia Trendz',
    tagline: 'Your Style, Our Passion...',
    announcementBar: {
      text: 'NEW SEASON COLLECTION — FREE SHIPPING ON ELIGIBLE ORDERS',
      enabled: true,
      link: '/shop',
    },
    shipping: {
      freeShippingThreshold: 999,
      standardShippingFee: 99,
      expressShippingFee: 199,
    },
    cod: {
      enabled: true,
      minOrderAmount: 499,
      maxOrderAmount: 10000,
      codFee: 49,
    },
  });

  const fetchSettings = async () => {
    try {
      const { data } = await API.get('/settings');
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (e) {
      console.warn('Settings load error:', e.message);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, refreshSettings: fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
