import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Building2, Calendar, BookOpen, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab: (tab: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, setActiveTab }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{type: string, data: any}[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      try {
        const [startups, events, hubs] = await Promise.all([
          fetch('/api/startups?limit=100').then(r => r.json()),
          fetch('/api/events?limit=100').then(r => r.json()),
          fetch('/api/hubs').then(r => r.json())
        ]);

        const q = query.toLowerCase();
        
        const filteredStartups = (startups.data || []).filter((s:any) => s.name.toLowerCase().includes(q) || s.sector.toLowerCase().includes(q)).map((d:any) => ({type: 'startup', data: d}));
        
        const filteredEvents = (events.data || []).filter((e:any) => e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)).map((d:any) => ({type: 'event', data: d}));
        
        const filteredHubs = (hubs.data || []).filter((h:any) => h.name.toLowerCase().includes(q) || h.type.toLowerCase().includes(q)).map((d:any) => ({type: 'hub', data: d}));

        setResults([...filteredStartups.slice(0,4), ...filteredEvents.slice(0,3), ...filteredHubs.slice(0,3)]);
      } catch (err) {
        console.error("Error fetching search results", err);
      }
    };

    const debounce = setTimeout(fetchResults, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed z-[9999] inset-0">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-start justify-center pt-20 sm:pt-32 px-4 bg-slate-900/60 backdrop-blur-xl"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[80vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center gap-4 relative">
            <Search className="w-6 h-6 text-slate-400" />
            <input 
              ref={inputRef}
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search startups, events, or hubs..."
              className="flex-grow text-lg sm:text-xl font-medium focus:outline-none bg-transparent placeholder-slate-300"
            />
            <button onClick={onClose} className="p-2 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50/50 min-h-[50vh]">
            {query.length > 0 && query.length < 2 && (
              <div className="text-center text-slate-400 text-sm py-8 font-light tracking-wide">Keep typing...</div>
            )}
            
            {query.length >= 2 && results.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-8 font-light tracking-wide">No results found for "{query}"</div>
            )}

            {results.length > 0 && (
              <div className="space-y-3">
                {results.map((result, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                        if (result.type === 'startup') setActiveTab('directory');
                        if (result.type === 'event') setActiveTab('events');
                        if (result.type === 'hub') setActiveTab('resources');
                        onClose();
                    }}
                    className="w-full p-4 rounded-2xl bg-white border border-slate-100 hover:border-secondary hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-secondary group-hover:bg-blue-50 transition-colors">
                        {result.type === 'startup' && <Building2 className="w-5 h-5" />}
                        {result.type === 'event' && <Calendar className="w-5 h-5" />}
                        {result.type === 'hub' && <BookOpen className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-tight text-lg mb-1">
                          {result.type === 'startup' ? result.data.name : result.type === 'event' ? result.data.title : result.data.name}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {result.type} • {result.type === 'startup' ? result.data.sector : result.type === 'event' ? result.data.category : result.data.location}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-secondary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer Shortcuts */}
          <div className="px-6 py-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5"><kbd className="px-2 py-1 rounded bg-white border border-slate-300 shadow-sm font-sans text-[10px]">esc</kbd> to close</span>
            </div>
            <span className="flex items-center gap-1.5"><kbd className="px-2 py-1 rounded bg-white border border-slate-300 shadow-sm font-sans text-[10px]">↵</kbd> to jump</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
