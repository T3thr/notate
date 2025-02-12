// components/SearchBar.tsx
// components/SearchBar.tsx
'use client'

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobal } from '@/context/GlobalProvider';

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { screenSize } = useGlobal();

  const isMobile = screenSize === 'mobile' || screenSize === 'tablet';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality here
    console.log('Searching for:', searchQuery);
  };

  return (
    <div className="relative">
      {isMobile ? (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSearchOpen(true)}
            className="rounded-md p-2 text-foreground hover:bg-accent hover:text-foreground"
            aria-label="Open search"
          >
            <Search className="h-5 w-5" />
          </motion.button>

          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed inset-x-0 top-0 z-[1000] bg-background p-4 shadow-lg" // Increased z-index
              >
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="w-full rounded-md bg-accent py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground hover:text-foreground"
                    aria-label='button'
                  >
                    <X className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="h-9 w-64 rounded-md bg-accent text-foreground pl-10 pr-4 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:w-80"
          />
        </form>
      )}
    </div>
  );
};

export default SearchBar;