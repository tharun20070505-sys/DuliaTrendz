import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import App from './App';
import './index.css';

import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SettingsProvider>
          <CartProvider>
            <WishlistProvider>
              <App />
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: '#292524',
                    color: '#F7F0E8',
                    fontSize: '12px',
                    borderRadius: '2px',
                    border: '1px solid rgba(217, 185, 155, 0.4)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#641F36',
                      secondary: '#F7F0E8',
                    },
                  },
                }}
              />
            </WishlistProvider>
          </CartProvider>
        </SettingsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
