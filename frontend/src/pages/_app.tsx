import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout';
import VendorLayout from '@/components/vendor/VendorLayout';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isVendorRoute = router.pathname.startsWith('/vendor');
  const isAuthRoute = router.pathname === '/login' || router.pathname === '/register';

  // Auth pages without layout
  if (isAuthRoute) {
    return <Component {...pageProps} />;
  }

  // Vendor pages with vendor layout
  if (isVendorRoute) {
    return (
      <VendorLayout>
        <Component {...pageProps} />
      </VendorLayout>
    );
  }

  // User pages with main layout
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}
