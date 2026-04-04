import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Coins, 
  BookOpen, 
  Users, 
  MapPin, 
  ArrowRight, 
  ExternalLink, 
  Download,
  Zap,
  Shield,
  Globe,
  Plus,
  Minus,
  RotateCcw,
  X,
  Palette,
  Layout,
  Filter
} from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { AddResourceModal } from './AddResourceModal';

const iconMap: Record<string, React.ReactNode> = {
  Building2: <Building2 className="w-8 h-8" />,
  Coins: <Coins className="w-8 h-8" />,
  BookOpen: <BookOpen className="w-8 h-8" />,
  Users: <Users className="w-8 h-8" />,
  Shield: <Shield className="w-8 h-8" />,
  Layout: <Layout className="w-8 h-8" />,
};

const Resources = () => {
  const [selectedHub, setSelectedHub] = useState<any>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [hubs, setHubs] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAddResourceOpen, setIsAddResourceOpen] = useState(false);

  const fetchResources = () => {
    fetch('/api/resources')
      .then(r => r.json())
      .then(res => setCategories(res.data || []))
      .catch(err => console.error('Error fetching resources:', err));
  };

  useEffect(() => {
    fetch('/api/hubs')
      .then(r => r.json())
      .then(res => setHubs(res.data || []))
      .catch(err => console.error('Error fetching hubs:', err));
      
    fetchResources();
  }, []);

  const hubTypes = useMemo(() => Array.from(new Set(hubs.map((h: any) => h.type))), [hubs]);

  const filteredHubs = useMemo(() => {
    if (activeFilters.length === 0) return hubs;
    return hubs.filter(h => activeFilters.includes(h.type));
  }, [hubs, activeFilters]);

  useEffect(() => {
    if (selectedHub && activeFilters.length > 0 && !activeFilters.includes(selectedHub.type)) {
      setSelectedHub(null);
    }
  }, [activeFilters, selectedHub]);

  const toggleFilter = (type: string) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Resources Header - High-End Editorial */}
      <section className="relative py-32 bg-slate-950 text-white rounded-b-[5rem] -mt-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,86,197,0.4)_0%,transparent_70%)]"></div>
          <img 
            src="https://picsum.photos/seed/hyderabad-resources/1920/1080?blur=4" 
            alt="Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 mt-16 sm:mt-20">
          <div className="max-w-4xl">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-secondary font-black text-[8px] sm:text-[10px] uppercase tracking-[0.4em] mb-4 sm:mb-6"
            >
              The Toolkit
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-9xl font-headline font-black leading-[0.85] tracking-tighter mb-8 sm:mb-10"
            >
              ARCHITECTING <br /><span className="text-secondary">SUCCESS</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg sm:text-xl font-light max-w-2xl leading-relaxed"
            >
              The UPHyd ecosystem provides the tools, capital, and mentorship you need to scale your vision from Hyderabad to the world.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Resource Grid */}
      <section className="container mx-auto px-6 grid md:grid-cols-2 gap-12">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 sm:p-12 rounded-3xl sm:rounded-[4rem] bg-white border border-slate-200 hover:border-secondary/30 transition-all group shadow-xl hover:shadow-2xl"
          >
            <div className="flex items-center gap-6 sm:gap-8 mb-8 sm:mb-12">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.5rem] bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-all shadow-sm group-hover:scale-110">
                {iconMap[cat.icon_name] || <Globe className="w-8 h-8" />}
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-headline font-black tracking-tight">{cat.title}</h3>
                <p className="text-slate-500 text-sm sm:text-base font-light">{cat.description}</p>
              </div>
            </div>
            
            <div className="space-y-4 mb-12">
              {cat.items.map((item, j) => (
                <div key={j} className="flex items-center justify-between p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:border-secondary/20 hover:shadow-sm transition-all group/item">
                  <div className="flex items-center gap-5">
                    <div className="text-3xl group-hover/item:scale-110 transition-transform">{item.logo}</div>
                    <div>
                      <div className="font-black text-base tracking-tight text-slate-900">{item.name}</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.type}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <MapPin className="w-3.5 h-3.5" /> {item.location}
                    </div>
                    {item.website && (
                       <a href={item.website} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-white border border-transparent hover:border-secondary transition-colors cursor-pointer shrink-0">
                         <ExternalLink className="w-3.5 h-3.5" />
                       </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <button onClick={() => setIsAddResourceOpen(true)} className="w-full py-6 rounded-2xl bg-secondary text-white font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20">
              <Plus className="w-5 h-5" /> Propose a Resource
            </button>
          </motion.div>
        ))}
      </section>
      
      <AddResourceModal isOpen={isAddResourceOpen} onClose={() => setIsAddResourceOpen(false)} onSuccess={fetchResources} />

      {/* Map Section */}
      <section className="container mx-auto px-6">
        <div className="bg-slate-950 rounded-[5rem] p-12 md:p-24 relative overflow-hidden text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(0,86,197,0.3)_0%,transparent_70%)]"></div>
          
          <div className="grid md:grid-cols-2 gap-20 items-center relative z-10">
            <div>
              <div className="inline-block px-6 py-2 rounded-full bg-white/5 border border-white/10 text-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-10">
                Interactive Map
              </div>
              <h2 className="text-5xl md:text-7xl font-headline font-black mb-10 leading-[0.9] tracking-tighter">
                THE GEOGRAPHY OF <br />
                <span className="text-secondary">INNOVATION</span>
              </h2>
              <p className="text-slate-400 text-xl font-light mb-12 leading-relaxed">
                Navigate the startup hubs, coworking spaces, and innovation centers across Hyderabad. From the high-rises of Hitech City to the labs of Genome Valley.
              </p>
              
              <div className="grid grid-cols-2 gap-10">
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                  <div className="text-4xl font-black mb-2 tracking-tight">12+</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Tech Clusters</div>
                </div>
                <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                  <div className="text-4xl font-black mb-2 tracking-tight">45+</div>
                  <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Incubators</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-8">
              {/* Filter UI */}
              <div className="flex flex-wrap gap-3 mb-2">
                <div className="flex items-center gap-2 mr-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                  <Filter className="w-3.5 h-3.5" /> Filter:
                </div>
                {hubTypes.map(type => (
                  <motion.button
                    key={type}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleFilter(type)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      activeFilters.includes(type)
                        ? 'bg-secondary border-secondary text-white shadow-lg shadow-secondary/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {type}
                  </motion.button>
                ))}
                {activeFilters.length > 0 && (
                  <button
                    onClick={() => setActiveFilters([])}
                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="relative aspect-[4/3] rounded-[4rem] bg-slate-900 border border-white/10 overflow-hidden group shadow-2xl">
              <TransformWrapper
                initialScale={1}
                initialPositionX={0}
                initialPositionY={0}
                minScale={1}
                maxScale={8}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <div className="absolute top-6 right-6 z-20 flex flex-col gap-3">
                      <button 
                        onClick={() => zoomIn()}
                        className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => zoomOut()}
                        className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => resetTransform()}
                        className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all shadow-lg"
                      >
                        <RotateCcw className="w-5 h-5" />
                      </button>
                    </div>

                    <TransformComponent
                      wrapperStyle={{ width: '100%', height: '100%' }}
                      contentStyle={{ width: '100%', height: '100%' }}
                    >
                      <div className="relative w-full h-full cursor-grab active:cursor-grabbing">
                        <img 
                          src="https://picsum.photos/seed/hyderabad-map/1200/900?blur=1" 
                          alt="Hyderabad Map" 
                          className="w-full h-full object-cover opacity-70"
                          referrerPolicy="no-referrer"
                        />
                        
                        {/* Map Markers */}
                        {filteredHubs.map((hub) => (
                          <div
                            key={hub.id}
                            className="absolute z-10 -translate-x-1/2 -translate-y-1/2"
                            style={{ left: `${hub.x}%`, top: `${hub.y}%` }}
                          >
                            {/* Selected Ping Effect */}
                            {selectedHub?.id === hub.id && (
                              <motion.div
                                initial={{ scale: 1, opacity: 0.8 }}
                                animate={{ scale: 2.5, opacity: 0 }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                                className="absolute inset-0 rounded-full bg-secondary"
                              />
                            )}
                            
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedHub(hub);
                              }}
                              className={`relative w-5 h-5 rounded-full border-2 border-white shadow-lg transition-colors group/marker ${
                                selectedHub?.id === hub.id ? 'bg-secondary ring-4 ring-secondary/30' : 'bg-blue-400'
                              }`}
                              animate={selectedHub?.id === hub.id ? {
                                scale: [1.5, 1.8, 1.5],
                                boxShadow: [
                                  "0 0 20px rgba(0,86,197,0.8)",
                                  "0 0 40px rgba(0,86,197,1)",
                                  "0 0 20px rgba(0,86,197,0.8)"
                                ]
                              } : {
                                scale: [1, 1.2, 1],
                                boxShadow: "0 0 15px rgba(0,86,197,0.4)"
                              }}
                              transition={{
                                duration: selectedHub?.id === hub.id ? 1.5 : 3,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              whileHover={{ scale: 1.8, zIndex: 20 }}
                            >
                              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-sm text-[10px] font-black text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest shadow-xl">
                                {hub.name}
                              </span>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>

              {/* Selected Hub Details Overlay */}
              <AnimatePresence>
                {selectedHub && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="absolute bottom-6 left-6 right-6 z-30 p-10 rounded-[2.5rem] bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl"
                  >
                    <button 
                      onClick={() => setSelectedHub(null)}
                      className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-start gap-8">
                      <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center shrink-0 shadow-inner">
                        <MapPin className="text-secondary w-8 h-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <h4 className="text-3xl font-headline font-black text-white tracking-tight">{selectedHub.name}</h4>
                          <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase tracking-widest">
                            {selectedHub.type}
                          </span>
                        </div>
                        <p className="text-slate-400 text-base mb-8 leading-relaxed font-light">
                          {selectedHub.description}
                        </p>
                        <div className="flex items-center gap-8">
                          <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                            <MapPin className="w-4 h-4" /> {selectedHub.location}
                          </div>
                          <button className="text-[10px] font-black text-secondary uppercase tracking-widest flex items-center gap-2 hover:underline">
                            View Details <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              {!selectedHub && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center">
                    <div className="w-24 h-24 rounded-full bg-secondary/20 backdrop-blur-xl border border-secondary/50 flex items-center justify-center mx-auto mb-6 animate-pulse shadow-[0_0_30px_rgba(0,86,197,0.3)]">
                      <MapPin className="text-secondary w-12 h-12" />
                    </div>
                    <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em]">Click markers to explore hubs</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
