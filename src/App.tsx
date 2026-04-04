/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './components/Home';
import Directory from './components/Directory';
import Resources from './components/Resources';
import Events from './components/Events';
import Join from './components/Join';
import Explore from './components/Explore';
import Jobs from './components/Jobs';
import { SearchModal } from './components/SearchModal';
import { AnimatePresence, motion } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global search shortcut Cmd+K or Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Scroll to top on tab change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <Home setActiveTab={setActiveTab} />;
      case 'directory':
        return <Directory />;
      case 'resources':
        return <Resources />;
      case 'events':
        return <Events />;
      case 'explore':
        return <Explore />;
      case 'jobs':
        return <Jobs />;
      case 'join':
        return <Join />;
      default:
        return <Home />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col mesh-gradient">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenSearch={() => setIsSearchOpen(true)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} setActiveTab={setActiveTab} />
      
      <main className="flex-grow pt-28">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

