import { ReactNode, useEffect } from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import CartSidebar from '../cart/CartSidebar';
import ChatBot from '../chat/ChatBot';
import MobileSidebar from './MobileSidebar';
import { useAuthStore, useCartStore } from '@/store';
import { authAPI, cartAPI } from '@/lib/api';
import { Toaster } from 'react-hot-toast';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({
  children,
  title = 'Ambuja Neotia Grocery',
  description = 'Fresh groceries delivered to your doorstep. Exclusively for Ambuja Neotia employees.',
}: LayoutProps) {
  const { isAuthenticated, setUser, setLoading } = useAuthStore();
  const { setCart, setLoading: setCartLoading } = useCartStore();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authAPI.getMe();
          setUser(response.data.user);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [setUser, setLoading]);

  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        setCartLoading(true);
        try {
          const response = await cartAPI.get();
          setCart(response.data.cart);
        } catch (error) {
          console.error('Failed to fetch cart:', error);
        } finally {
          setCartLoading(false);
        }
      }
    };

    fetchCart();
  }, [isAuthenticated, setCart, setCartLoading]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>

      {/* Sidebars & Modals */}
      <CartSidebar />
      <ChatBot />
      <MobileSidebar />

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}
