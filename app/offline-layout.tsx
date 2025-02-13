'use client';
import { useEffect, useState } from 'react';

const OfflineLayout = ({ children }: { children: React.ReactNode }) =>{
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Register the service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          console.log('Service Worker registered');
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    }

    // Detect online/offline status
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <html>
      <body>
        {/* Display offline message */}
        {offline && <div className="bg-red-500 text-white p-2 text-center">You&apos;re offline</div>}
        {children}
      </body>
    </html>
  );
};

export default OfflineLayout;
