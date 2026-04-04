import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UtensilsCrossed, Beer, Music, Hospital, Building2, Cloud, MapPin, Users, Lightbulb,
  Star, ExternalLink, Thermometer, Droplets, Wind, ArrowRight, Briefcase,
  Phone, AlertTriangle, Coffee, Heart, Compass, DollarSign, Target, Check
} from 'lucide-react';

const tabs = [
  { id: 'food', label: 'Food & Drink', icon: UtensilsCrossed },
  { id: 'nightlife', label: 'Nightlife', icon: Music },
  { id: 'health', label: 'Healthcare', icon: Hospital },
  { id: 'weather', label: 'Weather', icon: Cloud },
  { id: 'projects', label: 'Mega Projects', icon: Building2 },
  { id: 'getaways', label: 'Getaways', icon: Compass },
  { id: 'tips', label: 'Essentials', icon: Lightbulb },
  { id: 'people', label: 'People', icon: Users },
  { id: 'coworking', label: 'Coworking', icon: Briefcase },
  { id: 'cost', label: 'Cost of Living', icon: DollarSign },
];

const categoryImages: Record<string, string[]> = {
  'food': [
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&q=80&w=800'
  ],
  'nightlife': [
    'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&q=80&w=800',
  ],
  'projects': [
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=800'
  ],
  'getaways': [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800'
  ],
  'coworking': [
    'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800'
  ],
  'health': [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800'
  ],
  'people': [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800'
  ]
};

const getImage = (category: string, index: number) => {
  const images = categoryImages[category] || categoryImages['coworking'];
  return images[index % images.length];
};

const Explore: React.FC = () => {
  const [activeTab, setActiveTab] = useState('food');
  const [data, setData] = useState<Record<string, any[]>>({
    food: [], breweries: [], nightlife: [], health: [], weather: [], projects: [], getaways: [], tips: [], people: [], coworking: [], cost: []
  });
  const [foodFilter, setFoodFilter] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchJSON = (url: string) => fetch(url).then(r => r.json()).then(d => d.data || []);
        const [food, breweries, nightlife, health, weather, projects, getaways, tips, people, coworking, cost] = await Promise.all([
          fetchJSON('/api/restaurants'), fetchJSON('/api/breweries'), fetchJSON('/api/nightlife'),
          fetchJSON('/api/healthcare'), fetchJSON('/api/weather'), fetchJSON('/api/megaprojects'),
          fetchJSON('/api/getaways'), fetchJSON('/api/tips'), fetchJSON('/api/people'),
          fetchJSON('/api/coworking'), fetchJSON('/api/cost')
        ]);
        setData({ food, breweries, nightlife, health, weather, projects, getaways, tips, people, coworking, cost });
      } catch (err) {
        console.error('Failed to fetch explore data', err);
      }
    };
    fetchData();
  }, []);

  const foodCategories = ['All', ...new Set(data.food.map((r: any) => r.category))];
  const filteredFood = foodFilter === 'All' ? data.food : data.food.filter((r: any) => r.category === foodFilter);

  const categoryEmoji: Record<string, string> = {
    'Biryani Legend': '🍗', 'Fine Dining': '🍽️', 'New & Trending': '🔥', 'Local Gem': '💎'
  };

  const statusColor: Record<string, string> = {
    'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-200', 'Phase 1 Active': 'bg-blue-50 text-blue-600 border-blue-200',
    'Going Live': 'bg-purple-50 text-purple-600 border-purple-200', 'Launching': 'bg-orange-50 text-orange-600 border-orange-200',
    'Foundation Laid': 'bg-yellow-50 text-yellow-600 border-yellow-200', 'Planning': 'bg-slate-50 text-slate-600 border-slate-200',
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'food':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="flex flex-wrap gap-2 mb-8">
              {foodCategories.map(c => (
                <button key={c} onClick={() => setFoodFilter(c)} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${foodFilter === c ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/30' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-900'}`}>
                  {c}
                </button>
              ))}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFood.map((r: any, i: number) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-[2rem] bg-white border border-slate-200 hover:border-secondary/30 hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
                  <div className="h-48 bg-slate-100 relative overflow-hidden">
                    <img src={getImage('food', i)} alt={r.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                       <h3 className="text-xl font-bold text-white">{r.name}</h3>
                       <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xl">{categoryEmoji[r.category] || '🍴'}</div>
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <p className="text-xs text-secondary font-black uppercase tracking-widest mb-3">{r.category} • {r.area}</p>
                    <p className="text-sm text-slate-600 mb-4 flex-grow">{r.description}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold"><Star className="w-3.5 h-3.5 fill-current" />{r.rating}</div>
                      <div className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg">₹{r.price_for_two} for two</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-20">
              <h3 className="text-3xl font-headline font-black text-slate-900 mb-8 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center"><Beer className="w-6 h-6 text-amber-500" /></div>
                Craft Breweries
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                {data.breweries.map((b: any, i: number) => (
                  <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="p-6 rounded-[2rem] bg-gradient-to-br from-amber-500/5 to-orange-500/5 border border-amber-500/20 hover:border-amber-500/40 hover:shadow-xl transition-all">
                    <h4 className="text-xl font-bold text-slate-900 mb-2">{b.name}</h4>
                    <p className="text-xs text-amber-600 font-black uppercase tracking-widest mb-3">{b.area}</p>
                    <p className="text-sm text-slate-600 mb-4">{b.description}</p>
                    <p className="text-xs text-slate-900 bg-white px-3 py-2 rounded-xl shadow-sm border border-slate-100 inline-block">
                      <span className="text-amber-500 font-bold uppercase tracking-widest">Beers: </span>{b.signature_beers}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'nightlife':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {data.nightlife.map((n: any, i: number) => (
              <motion.div key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-[2rem] bg-white border border-slate-200 hover:border-purple-500/30 hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <img src={getImage('nightlife', i)} alt={n.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 via-transparent to-transparent"></div>
                  <span className="absolute bottom-4 left-4 text-[10px] font-black px-3 py-1.5 rounded-xl bg-white text-purple-600 shadow-xl uppercase tracking-widest">
                    {n.type}
                  </span>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{n.name}</h3>
                  <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-3">{n.area}</p>
                  <p className="text-sm text-slate-600 mb-4 flex-grow">{n.description}</p>
                  {n.highlights && <p className="text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-xl italic">{n.highlights}</p>}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'projects':
        return (
          <div className="grid md:grid-cols-2 gap-6 animate-in fade-in duration-500">
            {data.projects.map((p: any, i: number) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-[2rem] bg-white border border-slate-200 hover:border-secondary/30 hover:shadow-2xl transition-all group overflow-hidden flex flex-col sm:flex-row">
                <div className="sm:w-2/5 h-48 sm:h-auto relative overflow-hidden">
                  <img src={getImage('projects', i)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent sm:hidden"></div>
                </div>
                <div className="p-6 sm:w-3/5 flex flex-col justify-center">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-bold text-slate-900">{p.name}</h3>
                  </div>
                  <span className={`inline-block self-start text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl mb-3 border ${statusColor[p.status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                    {p.status}
                  </span>
                  <p className="text-sm text-slate-600 mb-4">{p.description}</p>
                  {p.impact && (
                    <div className="mt-auto flex items-start gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <Target className="w-4 h-4 text-secondary mt-0.5" />
                      <p className="text-xs text-slate-600"><strong>Impact:</strong> {p.impact}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'coworking':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {data.coworking.map((c: any, i: number) => (
              <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-[2rem] bg-white border border-slate-200 hover:border-secondary/30 hover:shadow-2xl transition-all group overflow-hidden flex flex-col">
                <div className="h-48 bg-slate-100 relative overflow-hidden">
                  <img src={getImage('coworking', i)} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-end">
                    <h3 className="text-xl font-bold text-white drop-shadow-md">{c.name}</h3>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <p className="text-xs text-secondary font-black uppercase tracking-widest mb-3">{c.location} • {c.vibe}</p>
                  <p className="text-sm text-slate-600 mb-4 flex-grow">{c.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {c.amenities?.split(',').map((am: string) => (
                       <span key={am} className="text-[10px] font-bold px-2 py-1 bg-slate-50 border border-slate-200 text-slate-500 rounded-lg">{am.trim()}</span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-sm font-bold text-slate-900">{c.pricing}</div>
                    {c.website && (
                      <a href={c.website} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-secondary hover:bg-blue-50 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'cost':
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
             <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 sm:p-8 flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 flex-shrink-0">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Cost of Living Estimates</h3>
                <p className="text-sm text-slate-600">Based on data from the 2026 Ultimate Guide for founders and talent relocating to Hyderabad.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.cost.map((c: any, i: number) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-slate-300 transition-all shadow-sm flex items-center justify-between group">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{c.category}</div>
                    <h3 className="text-sm font-bold text-slate-900">{c.item}</h3>
                    {c.notes && <p className="text-[10px] text-slate-500 mt-1">{c.notes}</p>}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-black text-secondary group-hover:scale-105 transition-transform">
                      ₹{c.cost_min.toLocaleString()} {c.cost_min !== c.cost_max && `- ${c.cost_max.toLocaleString()}`}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{c.unit}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'health':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {data.health.map((h: any, i: number) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-red-500/30 hover:shadow-xl transition-all flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center font-black">
                    <Hospital className="w-6 h-6" />
                  </div>
                  {h.national_rank && <span className="text-[10px] font-black uppercase tracking-widest text-secondary px-3 py-1 bg-secondary/10 rounded-full">{h.national_rank} India</span>}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{h.name}</h3>
                <p className="text-xs text-slate-400 font-black uppercase tracking-widest mb-4">{h.location} • {h.type}</p>
                <p className="text-sm text-slate-600 flex-grow mb-6">{h.description}</p>
                
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Specialty:</span> <strong className="text-slate-900">{h.specialty}</strong>
                  </div>
                  {h.emergency_number && (
                    <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-red-50 rounded-lg text-red-600 font-bold text-xs uppercase tracking-widest">
                      <Phone className="w-3.5 h-3.5" /> {h.emergency_number}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'weather':
        return (
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in duration-500">
            {data.weather.map((w: any, i: number) => (
              <motion.div key={w.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-black text-slate-900">{w.month}</h3>
                  <span className="text-[10px] font-black text-secondary bg-secondary/10 px-2 py-1 rounded-lg uppercase tracking-widest">{w.season}</span>
                </div>
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-100">
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{w.avg_high}°<span className="text-sm font-normal text-slate-400">High</span></div>
                    <div className="text-sm font-bold text-slate-500">{w.avg_low}°<span className="text-[10px] font-normal text-slate-400 uppercase ml-1">Low</span></div>
                  </div>
                  <div className="w-px h-10 bg-slate-200"></div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500"><Droplets className="w-3.5 h-3.5" />{w.rainfall_mm}mm</div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500"><Wind className="w-3.5 h-3.5" />{w.humidity_pct}% RH</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-600 leading-snug">{w.advice}</p>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'getaways':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {data.getaways.map((g: any, i: number) => (
              <motion.div key={g.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-[2rem] bg-white border border-slate-200 hover:border-emerald-500/30 hover:shadow-xl transition-all group overflow-hidden flex flex-col">
                <div className="h-40 bg-slate-100 relative overflow-hidden">
                  <img src={getImage('getaways', i)} alt={g.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold">{g.name}</h3>
                  </div>
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">{g.distance_km} km</span>
                    <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">{g.drive_time} Drive</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 flex-grow">{g.description}</p>
                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>Best For:</span> <span className="text-slate-900">{g.best_for}</span></div>
                    <div className="flex justify-between text-xs font-bold text-slate-500"><span>Best Season:</span> <span className="text-emerald-600">{g.best_season}</span></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'people':
        return (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {data.people.map((p: any, i: number) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-[2rem] bg-slate-50 border border-slate-200 hover:bg-white hover:shadow-xl transition-all group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-full bg-secondary/10 flex items-center justify-center text- secondary overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt="avatar" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{p.name}</h3>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest">{p.platform}: {p.handle}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Role</div>
                  <p className="text-sm font-bold text-slate-700 leading-snug">{p.role}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Why Follow?</div>
                  <p className="text-sm text-slate-600 italic">"{p.why_follow}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        );

      case 'tips':
        return (
          <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-6 sm:p-8 flex items-center gap-6 mb-8">
              <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Survival Essentials</h3>
                <p className="text-sm text-slate-600">Unwritten rules for relocating and navigating life in Hyderabad effectively.</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {data.tips.map((t: any, i: number) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/40 hover:shadow-lg transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-2 h-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="text-[10px] font-black bg-slate-100 inline-block px-2 py-1 rounded-md text-slate-500 uppercase tracking-widest mb-3" >
                    {t.category}
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">{t.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-light">{t.content}</p>
                </motion.div>
              ))}
            </div>
          </div>
        );

      default: return null;
    }
  };

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Explore Header - High-End Editorial */}
      <section className="relative py-32 bg-slate-950 text-white rounded-b-[5rem] -mt-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=2070" alt="Hyderabad Charminar" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-4xl mb-12">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl md:text-9xl font-headline font-black leading-[0.85] tracking-tighter mb-8 sm:mb-10 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
            >
              EXPLORE <br /><span className="text-secondary">HYDERABAD</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg sm:text-xl font-light max-w-2xl leading-relaxed"
            >
              Everything you need — from biryani joints to billion-dollar mega projects. Curated insights from the 2026 Ultimate Guide.
            </motion.p>
          </div>

          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === tab.id ? 'bg-secondary text-white shadow-lg shadow-secondary/30 border border-secondary' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white backdrop-blur-md'}`}>
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </section>
    </div>
  );
};

export default Explore;
