import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Rocket, Search, Globe, ChevronDown, LogIn, User } from 'lucide-react';
import { AuthModal } from './AuthModal';
interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenSearch }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'directory', label: 'Directory' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'explore', label: 'Explore' },
    { id: 'resources', label: 'Resources' },
    { id: 'events', label: 'Events' },
  ];

  const isDarkTheme = !isScrolled && activeTab === 'home';

  return (
    <>
      <motion.nav 
        initial={false}
        animate={{
          y: isScrolled ? 0 : 0,
          width: isScrolled ? '90%' : '92%',
          paddingTop: isScrolled ? '10px' : '16px',
          paddingBottom: isScrolled ? '10px' : '16px',
          backgroundColor: isDarkTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(16px) saturate(180%)',
          borderColor: isDarkTheme ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
          boxShadow: isScrolled ? '0 20px 50px rgba(0,0,0,0.1)' : '0 0 0 rgba(0,0,0,0)',
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-6 left-1/2 -translate-x-1/2 max-w-6xl z-50 rounded-3xl border"
      >
        <div className="container mx-auto px-8 flex justify-between items-center">
          {/* Logo */}
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-blue-400 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-white shadow-2xl group-hover:scale-105 transition-transform">
                <Rocket className="w-5 h-5 text-secondary" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-xl font-headline font-black tracking-tight leading-none transition-colors duration-500 ${isDarkTheme ? 'text-white' : 'text-slate-900'}`}>UPHyd</span>
              <span className={`text-[8px] font-bold uppercase tracking-[0.2em] leading-none mt-1 transition-colors duration-500 ${isDarkTheme ? 'text-blue-300/80' : 'text-secondary'}`}>The Frontier of Indian Tech</span>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`text-[13px] font-bold uppercase tracking-widest transition-all relative group py-2 ${activeTab === link.id ? (isDarkTheme ? 'text-white' : 'text-secondary') : (isDarkTheme ? 'text-white/60 hover:text-white' : 'text-slate-500 hover:text-secondary')}`}
              >
                {link.label}
                {activeTab === link.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className={`absolute -bottom-1 left-0 w-full h-0.5 rounded-full ${isDarkTheme ? 'bg-white' : 'bg-secondary'}`}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={onOpenSearch}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95 border ${isDarkTheme ? 'text-white/70 hover:text-white border-white/10 hover:bg-white/10' : 'text-slate-400 hover:text-slate-900 border-slate-200 hover:bg-slate-50'}`}
              title="Search Directory"
            >
              <Search className="w-4 h-4" />
              <div className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border opacity-70 ${isDarkTheme ? 'border-white/20' : 'border-slate-300'}`}>⌘K</div>
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('join')}
                  className={`px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${isDarkTheme ? 'bg-secondary text-white hover:bg-white shadow-xl shadow-secondary/20 hover:text-slate-900' : 'bg-secondary text-white hover:bg-slate-900 shadow-lg shadow-secondary/20 hover:shadow-xl'}`}
                >
                  Join Directory
                </button>
                <button
                  onClick={() => setIsLoggedIn(false)}
                  className={`flex items-center justify-center w-10 h-10 rounded-2xl font-bold transition-all shadow-xl hover:scale-105 ${isDarkTheme ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                  title="Sign Out"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm uppercase tracking-widest transition-all ${isDarkTheme ? 'bg-white text-slate-950 hover:bg-blue-50 shadow-2xl shadow-white/10' : 'bg-slate-950 text-white hover:bg-slate-800 shadow-xl'}`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className={isDarkTheme ? 'text-white' : 'text-primary'} /> : <Menu className={isDarkTheme ? 'text-white' : 'text-primary'} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay & Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[55] md:hidden"
            />
            
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[280px] sm:w-[320px] bg-white z-[60] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex flex-col h-full">
                <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-white">
                      <Rocket className="w-4 h-4" />
                    </div>
                    <span className="font-headline font-black tracking-tight text-slate-900">UPHyd</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  {navLinks.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveTab(link.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`text-3xl font-headline font-black text-left tracking-tighter transition-colors ${
                        activeTab === link.id ? 'text-secondary' : 'text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100">
                  <button 
                    onClick={() => {
                      setActiveTab('join');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-5 rounded-2xl bg-secondary text-white font-bold text-lg shadow-xl shadow-secondary/20 hover:bg-secondary/90 transition-all"
                  >
                    Join Ecosystem
                  </button>
                  <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">
                    The Frontier of Indian Tech
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
