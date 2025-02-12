'use client';

import React from 'react';
import { Share2, Ellipsis, Menu ,X} from 'lucide-react';
import SearchBar from './SearchBar';
import { useGlobal } from '@/context/GlobalProvider';
import { motion } from 'framer-motion';

interface NavBarProps {
  currentPath: string[];
}

const NavBar: React.FC<NavBarProps> = ({ currentPath }) => {
  const { isSidebarOpen, toggleSidebar, screenSize } = useGlobal();
  const isDesktop = screenSize === 'desktop';
  const isTablet = screenSize === 'tablet';
  const isMobile = screenSize === 'mobile'; // for small screens

  const navVariants = {
    expanded: {
      marginLeft: isMobile ? '0' : '0rem',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
    collapsed: {
      marginLeft: '0',
      transition: { type: 'spring', stiffness: 300, damping: 30 },
    },
  };

  return (
    <motion.nav
      initial="collapsed"
      animate={isSidebarOpen && !isMobile ? 'expanded' : 'collapsed'}
      variants={navVariants}
      className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-divider bg-background px-4 shadow-sm"
    >
      <div className="flex items-center space-x-4">
        {(isDesktop || isTablet) && (
          <motion.button
            onClick={toggleSidebar}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="rounded-md p-2 text-muted hover:bg-accent hover:text-foreground"
          >
            <Menu className="h-6 w-6" />
          </motion.button>
        )}

        {isMobile && (
          <motion.button
            onClick={toggleSidebar}
            className="rounded-md p-2 text-muted hover:bg-accent hover:text-foreground"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-foreground" />
            ) : (
              <Menu className="h-6 w-6 text-foreground" />
            )}
          </motion.button>
        )}

        <div className="flex items-center space-x-2 text-muted">
          {currentPath.map((path, index) => (
            <React.Fragment key={path}>
              {index > 0 && <span>/</span>}
              <span className={index === currentPath.length - 1 ? 'text-foreground' : ''}>
                {path}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <SearchBar />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-md p-2 text-muted hover:bg-accent hover:text-foreground"
          aria-label="share"
        >
          <Share2 className="h-5 w-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="rounded-md p-2 text-muted hover:bg-accent hover:text-foreground"
          aria-label="Ellipsis"
        >
          <Ellipsis className="h-5 w-5" />
        </motion.button>
      </div>
    </motion.nav>
  );
};

export default NavBar;