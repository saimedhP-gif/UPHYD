import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Users, 
  Globe, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  Shield, 
  Cpu,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  Award,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  Sparkles,
  Target,
  Layers,
  Quote,
  Plus
} from 'lucide-react';
import { AddNewsModal } from './AddNewsModal';

interface HomeProps {
  setActiveTab: (tab: string) => void;
}

const Home: React.FC<HomeProps> = ({ setActiveTab }) => {
  const [news, setNews] = useState<any[]>([]);
  const [isAddNewsOpen, setIsAddNewsOpen] = useState(false);

  const fetchNews = () => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => setNews(data.data || []))
      .catch(err => console.error('Error fetching news:', err));
  };

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="flex flex-col gap-32 pb-32">
      {/* Hero Section - Global Champions */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] text-white rounded-b-[4rem] -mt-28">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0">
          {/* Animated Orbs */}
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-secondary/30 rounded-full blur-[160px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -40, 0],
              y: [0, -60, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[140px]"
          />
          
          {/* Map Background with Parallax-like effect */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
            <img 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=2070" 
              alt="Hyderabad Tech Map" 
              className="w-full h-full object-cover scale-110 opacity-60"
              referrerPolicy="no-referrer"
            />
            {/* Stylized Map Overlay - Circuit Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020617_100%)]"></div>
          </div>

          {/* Startup Hub Markers on Map */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {[
              { name: 'T-HUB 2.0', pos: { top: '58%', left: '47%' }, label: 'Innovation Epicenter', delay: 1 },
              { name: 'Financial District', pos: { top: '45%', left: '35%' }, label: 'FinTech Hub', delay: 1.2 },
              { name: 'Gachibowli', pos: { top: '52%', left: '38%' }, label: 'IT Corridor', delay: 1.4 },
              { name: 'Hitech City', pos: { top: '50%', left: '45%' }, label: 'SaaS Valley', delay: 1.6 },
              { name: 'Uppal', pos: { top: '48%', left: '65%' }, label: 'Emerging Tech', delay: 1.8 },
              { name: 'Begumpet', pos: { top: '42%', left: '55%' }, label: 'Legacy Tech', delay: 2.0 },
            ].map((hub, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: hub.delay, duration: 1.5, ease: "backOut" }}
                className="absolute"
                style={{ top: hub.pos.top, left: hub.pos.left }}
              >
                <div className="relative group">
                  <div className="absolute inset-0 rounded-full bg-secondary animate-ping opacity-20 scale-[4]"></div>
                  <div className="absolute inset-0 rounded-full bg-secondary animate-pulse opacity-40 scale-[2]"></div>
                  <div className="w-3 h-3 rounded-full bg-secondary border border-white shadow-[0_0_20px_rgba(0,86,197,0.8)] relative z-10"></div>
                  
                  <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: hub.delay + 1 }}
                    className="absolute left-6 top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg bg-slate-900/60 backdrop-blur-md border border-white/5 text-[8px] font-black text-white whitespace-nowrap tracking-widest uppercase flex flex-col"
                  >
                    <span className="text-secondary">{hub.name}</span>
                    <span className="text-[6px] text-white/40">{hub.label}</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
            
            {/* Connecting Lines (Visual only) */}
            <svg className="absolute inset-0 w-full h-full opacity-10">
              <motion.path 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, delay: 2 }}
                d="M 35% 45% L 38% 52% L 45% 50% L 47% 58% L 55% 42% L 65% 48%" 
                fill="none" 
                stroke="url(#lineGradient)" 
                strokeWidth="1" 
                strokeDasharray="4 4"
              />
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0056C5" />
                  <stop offset="100%" stopColor="#60A5FA" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#020617]"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 mt-24 md:mt-40">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="inline-flex items-center gap-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white/10 border border-white/20 text-secondary text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] mb-8 sm:mb-10 backdrop-blur-2xl shadow-2xl">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
                </span>
                The Frontier of Indian Tech
              </div>
              
              <h1 className="text-5xl sm:text-7xl md:text-[9rem] font-headline font-black mb-8 sm:mb-10 leading-[0.9] tracking-tighter">
                HYDERABAD <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-secondary to-blue-400">CHAMPIONS</span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-3xl text-slate-400 max-w-3xl mx-auto mb-12 sm:mb-16 leading-tight font-light tracking-tight px-4 sm:px-0">
                Where the world's most ambitious founders build the future. India's fastest-growing ecosystem for <span className="text-white font-medium">DeepTech, SaaS, and Life Sciences.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 px-6 sm:px-0">
                <button 
                  onClick={() => setActiveTab('directory')}
                  className="px-8 sm:px-12 py-4 sm:py-6 bg-secondary text-white rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-secondary/90 hover:scale-105 transition-all shadow-[0_20px_50px_rgba(0,86,197,0.3)] flex items-center justify-center gap-4 group"
                >
                  Explore Directory <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
                <button 
                  onClick={() => setActiveTab('join')}
                  className="px-8 sm:px-12 py-4 sm:py-6 bg-white/5 backdrop-blur-2xl border border-white/10 text-white rounded-2xl sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase tracking-widest hover:bg-white/10 hover:scale-105 transition-all"
                >
                  Join Ecosystem
                </button>
              </div>
            </motion.div>
            
            {/* Stats Grid - Bento Style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 sm:mt-32">
              {[
                { label: 'Startups', value: '5K+', icon: <Rocket className="w-5 h-5" />, color: 'text-blue-400' },
                { label: 'Unicorns', value: '12', icon: <Award className="w-5 h-5" />, color: 'text-secondary' },
                { label: 'Funding', value: '$4.2B', icon: <TrendingUp className="w-5 h-5" />, color: 'text-purple-400' },
                { label: 'Talent', value: '150K', icon: <Users className="w-5 h-5" />, color: 'text-green-400' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] bg-white/5 border border-white/5 backdrop-blur-xl text-left group hover:bg-white/10 transition-all"
                >
                  <div className={`${stat.color} mb-4 sm:mb-6 group-hover:scale-110 transition-transform`}>
                    {stat.icon}
                  </div>
                  <div className="text-2xl sm:text-4xl font-headline font-black text-white mb-1">{stat.value}</div>
                  <div className="text-[8px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-500">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-secondary to-transparent"></div>
        </motion.div>
      </section>

      {/* Pillars of Innovation - Bento Grid Redesign */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12 sm:mb-20">
          <div className="max-w-2xl">
            <div className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-4">The Foundation</div>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter">PILLARS OF <br /><span className="text-secondary">INNOVATION</span></h2>
          </div>
          <p className="text-slate-500 text-lg sm:text-xl max-w-md font-light leading-snug">The strategic infrastructure that makes Hyderabad the most resilient tech ecosystem in the region.</p>
        </div>
        
        <div className="grid md:grid-cols-12 gap-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-8 p-8 sm:p-12 rounded-3xl sm:rounded-[3.5rem] bg-slate-950 text-white border border-white/5 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-secondary/20 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-secondary/20 flex items-center justify-center mb-8 sm:mb-10 group-hover:scale-110 transition-transform">
                <Shield className="text-secondary w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-headline font-black mb-4 sm:mb-6">Pro-Active Governance</h3>
              <p className="text-slate-400 text-base sm:text-lg max-w-md leading-relaxed">Progressive policies like TS-iPASS and direct government support for innovation hubs create a frictionless environment for founders.</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 p-8 sm:p-12 rounded-3xl sm:rounded-[3.5rem] bg-white border border-slate-200 shadow-sm group"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-purple-100 flex items-center justify-center mb-8 sm:mb-10 group-hover:scale-110 transition-transform">
              <Users className="text-purple-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-headline font-black mb-4 sm:mb-6 leading-tight">Elite Talent Pool</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Home to IIT-H, IIIT-H, and ISB, producing world-class tech and business leaders every year.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-4 p-8 sm:p-12 rounded-3xl sm:rounded-[3.5rem] bg-slate-100 group"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-8 sm:mb-10 group-hover:scale-110 transition-transform">
              <Building2 className="text-blue-600 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-headline font-black mb-4 sm:mb-6 leading-tight">Future Infrastructure</h3>
            <p className="text-slate-500 text-sm leading-relaxed">T-Hub, WE Hub, and Genome Valley provide specialized infrastructure for every sector.</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="md:col-span-8 p-8 sm:p-12 rounded-3xl sm:rounded-[3.5rem] bg-secondary text-white relative overflow-hidden group"
          >
            <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_90%_90%,rgba(255,255,255,0.2)_0%,transparent_60%)]"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-8 sm:mb-10 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-white w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-headline font-black mb-4 sm:mb-6">Global Capital</h3>
              <p className="text-blue-100 text-base sm:text-lg max-w-md leading-relaxed">A growing network of VCs, Angel Networks, and Family Offices investing in local talent with global ambitions.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Ecosystem Journey - Vertical Timeline Refinement */}
      <section className="bg-slate-50 py-32 border-y border-slate-200/50">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-24">
            <div className="max-w-2xl">
              <div className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-4">The Roadmap</div>
              <h2 className="text-5xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter">THE FOUNDER'S <br /><span className="text-secondary">JOURNEY</span></h2>
            </div>
            <p className="text-slate-500 text-xl max-w-md font-light leading-snug">From a spark of an idea to a global enterprise, we provide the path at every stage of growth.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {[
              { step: '01', title: 'Ideate', icon: <Lightbulb />, desc: 'Validate your idea with mentors and industry experts.', color: 'text-yellow-500', bg: 'bg-yellow-50' },
              { step: '02', title: 'Incubate', icon: <Layers />, desc: 'Build your MVP at T-Hub or specialized sector hubs.', color: 'text-blue-500', bg: 'bg-blue-50' },
              { step: '03', title: 'Accelerate', icon: <Zap />, desc: 'Scale your product with GTM support and global networks.', color: 'text-secondary', bg: 'bg-secondary/10' },
              { step: '04', title: 'Scale', icon: <Globe />, desc: 'Go global with Series A+ funding and strategic partners.', color: 'text-purple-500', bg: 'bg-purple-50' },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative z-10 p-10 rounded-[3rem] bg-white border border-slate-200 hover:shadow-[0_30px_60px_rgba(0,0,0,0.05)] transition-all group"
              >
                <div className="text-6xl font-headline font-black text-slate-100 mb-6 group-hover:text-secondary/10 transition-colors">{item.step}</div>
                <div className={`w-16 h-16 rounded-2xl ${item.bg} flex items-center justify-center mb-8 ${item.color} group-hover:scale-110 transition-transform`}>
                  {item.icon}
                </div>
                <h4 className="text-2xl font-headline font-black mb-4">{item.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sector Deep Dive - Card Refinement */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-4">Specialized Clusters</div>
            <h2 className="text-5xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter">SECTOR <br /><span className="text-secondary">DEEP DIVE</span></h2>
          </div>
          <p className="text-slate-500 text-xl max-w-md font-light leading-snug">Specialized focus areas where Hyderabad leads the nation in innovation and output.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {[
            { 
              title: 'SaaS & Enterprise', 
              icon: <Sparkles className="text-blue-500" />, 
              metric: '$2.1B', 
              metricLabel: 'Annual Revenue',
              desc: 'Home to global SaaS leaders like Darwinbox and Zenoti, with a focus on AI-driven enterprise solutions.',
              startups: ['Darwinbox', 'Zenoti', 'HighRadius'],
              bg: 'bg-blue-50/50'
            },
            { 
              title: 'DeepTech & AI', 
              icon: <Cpu className="text-purple-500" />, 
              metric: '450+', 
              metricLabel: 'Active Patents',
              desc: 'Leading the charge in SpaceTech, Robotics, and Generative AI with strong academic partnerships.',
              startups: ['Skyroot', 'Dhruva Space', 'GreyOrange'],
              bg: 'bg-purple-50/50'
            },
            { 
              title: 'Life Sciences', 
              icon: <Target className="text-green-500" />, 
              metric: '1/3rd', 
              metricLabel: 'Global Vaccines',
              desc: 'Genome Valley is Asia\'s premier life sciences cluster, producing a third of the world\'s vaccines.',
              startups: ['Bharat Biotech', 'Biological E', 'Dr. Reddys'],
              bg: 'bg-green-50/50'
            }
          ].map((sector, i) => (
            <div key={i} className={`p-12 rounded-[4rem] ${sector.bg} border border-white transition-all hover:shadow-2xl flex flex-col group`}>
              <div className="flex justify-between items-start mb-12">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  {sector.icon}
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-slate-900">{sector.metric}</div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{sector.metricLabel}</div>
                </div>
              </div>
              <h3 className="text-3xl font-headline font-black mb-6">{sector.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-10 flex-grow">{sector.desc}</p>
              <div className="flex flex-wrap gap-2">
                {sector.startups.map((s, j) => (
                  <span key={j} className="px-4 py-1.5 rounded-full bg-white text-[10px] font-black text-slate-400 border border-slate-100 uppercase tracking-widest">{s}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Neon Monolith Section - Performance Engine */}
      <section className="container mx-auto px-6">
        <div className="bg-[#020617] rounded-[4rem] p-12 md:p-24 relative overflow-hidden border border-white/5 shadow-2xl">
          <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(0,86,197,0.2)_0%,transparent_50%)]"></div>
          
          <div className="grid lg:grid-cols-2 gap-24 items-center relative z-10">
            <div>
              <div className="inline-block px-5 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.4em] mb-10">
                The Performance Engine
              </div>
              <h2 className="text-6xl md:text-8xl font-headline font-black text-white mb-10 leading-[0.9] tracking-tighter">
                BUILT FOR <br />
                <span className="text-secondary">GLOBAL SCALE</span>
              </h2>
              <p className="text-slate-400 text-xl mb-12 leading-relaxed font-light">
                Hyderabad isn't just a city; it's a high-performance engine for global disruption. From SaaS to DeepTech, our ecosystem is built to handle the most ambitious visions.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: '24% Growth', desc: 'Year-on-year startup growth' },
                  { title: '45+ Hubs', desc: 'Specialized incubators' },
                  { title: '$1.2B Seed', desc: 'Capital deployed in 2025' },
                  { title: '150K+ Jobs', desc: 'Tech ecosystem employment' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-5 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <CheckCircle2 className="text-secondary w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-white font-black text-lg">{item.title}</div>
                      <div className="text-slate-500 text-xs uppercase tracking-widest font-bold">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-16 px-10 py-5 bg-white text-slate-950 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all flex items-center gap-3">
                Download Ecosystem Report <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-secondary/10 to-blue-600/20 border border-white/10 flex items-center justify-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#0056c5_0%,transparent_70%)]"></div>
                </div>
                
                <div className="w-full h-full rounded-[3rem] bg-slate-900/40 backdrop-blur-3xl border border-white/10 p-10 flex flex-col justify-between relative z-10 shadow-2xl">
                  <div className="flex justify-between items-start">
                    <div className="w-16 h-16 rounded-2xl bg-secondary/20 flex items-center justify-center">
                      <BarChart3 className="text-secondary w-8 h-8" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-secondary uppercase tracking-[0.3em] block mb-2">Live Market Pulse</span>
                      <div className="text-3xl font-black text-white">BULLISH</div>
                    </div>
                  </div>
                  
                  <div className="space-y-8">
                    {[
                      { label: 'DeepTech', value: 85, color: 'bg-secondary' },
                      { label: 'SaaS', value: 92, color: 'bg-blue-400' },
                      { label: 'BioTech', value: 78, color: 'bg-purple-500' },
                    ].map((bar, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[10px] font-black text-slate-400 mb-3 uppercase tracking-[0.2em]">
                          <span>{bar.label}</span>
                          <span>{bar.value}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${bar.value}%` }}
                            transition={{ duration: 1.5, delay: 0.5 + i * 0.2 }}
                            className={`h-full ${bar.color} shadow-[0_0_15px_rgba(0,86,197,0.5)]`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div>
                      <div className="text-4xl font-black text-white">$4.2B</div>
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Total Ecosystem Value</div>
                    </div>
                    <div className="w-14 h-14 rounded-full border-4 border-secondary border-t-transparent animate-spin"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Success Stories - Editorial Layout */}
      <section className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
          <div className="max-w-2xl">
            <div className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-4">The Latest</div>
            <h2 className="text-5xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter">SUCCESS <br /><span className="text-secondary">STORIES</span></h2>
          </div>
          <button onClick={() => setIsAddNewsOpen(true)} className="px-8 py-4 rounded-2xl bg-slate-100 font-black text-xs uppercase tracking-widest hover:bg-secondary hover:text-white transition-all flex items-center gap-3">
            <Plus className="w-4 h-4" /> Post Success Story
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-10">
          {news.slice(0, 3).map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -10 }}
              className="group flex flex-col"
            >
              <div className="aspect-[4/3] rounded-[3rem] overflow-hidden relative mb-8 shadow-lg">
                <img 
                  src={item.image_url || 'https://picsum.photos/seed/startup/800/600'} 
                  alt={item.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  {item.tag}
                </div>
              </div>
              <div className="px-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">{item.date}</div>
                <h3 className="text-2xl font-headline font-black mb-4 group-hover:text-secondary transition-colors leading-tight">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-8 font-light">{item.description}</p>
                {item.source_url ? (
                  <a href={item.source_url} target="_blank" rel="noreferrer" className="text-secondary font-black text-xs uppercase tracking-widest flex items-center gap-2 group/btn hover:text-slate-900 transition-colors cursor-pointer">
                    Read Story <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </a>
                ) : (
                  <div className="text-slate-300 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    Internal Milestone
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Hyderabad? - Visual Grid */}
      <section className="bg-slate-950 py-32 rounded-[4rem] mx-6">
        <div className="container mx-auto px-12">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: <Zap />, title: 'Cost Efficiency', desc: '30% lower operational costs compared to other major tech hubs.' },
                { icon: <Globe />, title: 'Connectivity', desc: 'World-class international airport and robust metro network.' },
                { icon: <Lightbulb />, title: 'Innovation Culture', desc: 'A collaborative spirit fostered by T-Hub and other hubs.' },
                { icon: <Shield />, title: 'Quality of Life', desc: 'Consistently ranked as one of India\'s most livable cities.' },
              ].map((item, i) => (
                <div key={i} className="p-10 rounded-[2.5rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                  <div className="text-secondary mb-6 group-hover:scale-110 transition-transform">{item.icon}</div>
                  <h4 className="text-xl font-headline font-black text-white mb-3">{item.title}</h4>
                  <p className="text-slate-500 text-xs leading-relaxed font-light">{item.desc}</p>
                </div>
              ))}
            </div>
            
            <div>
              <div className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-6">Built For</div>
              <h2 className="text-4xl md:text-6xl font-headline font-black text-white mb-10 leading-[0.9] tracking-tighter">
                GLOBAL <br />
                <span className="text-secondary">SCALE</span>
              </h2>
              <p className="text-slate-400 text-xl mb-12 leading-relaxed font-light">
                Beyond the tech, Hyderabad offers a unique blend of heritage and modernity. With world-class healthcare, education, and a vibrant culinary scene, it's where founders come to build both a company and a life.
              </p>
              
              <div className="space-y-8">
                {[
                  'Ranked #1 in Quality of Living (Mercer) for 5 consecutive years.',
                  'Largest tech workforce growth in India (2023-2025).',
                  'Home to global giants: Google, Microsoft, Amazon, and Meta.'
                ].map((point, i) => (
                  <div key={i} className="flex gap-5 items-start">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center shrink-0 mt-1">
                      <CheckCircle2 className="text-secondary w-4 h-4" />
                    </div>
                    <span className="text-slate-300 font-medium text-lg leading-tight">{point}</span>
                  </div>
                ))}
              </div>
              
              <button className="mt-16 px-12 py-6 bg-secondary text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-secondary/90 transition-all shadow-2xl shadow-secondary/20">
                Relocate to Hyderabad
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Founder Testimonials - High-End Editorial */}
      <section className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-4">Testimonials</div>
          <h2 className="text-5xl md:text-7xl font-headline font-black leading-[0.9] tracking-tighter">VOICES OF THE <br /><span className="text-secondary">FRONTIER</span></h2>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          {[
            { 
              quote: "The support system in Hyderabad, especially through T-Hub, has been instrumental in our journey from a small lab to launching India's first private rocket.",
              author: "Pawan Kumar Chandana",
              role: "Co-founder, Skyroot Aerospace",
              avatar: "🚀"
            },
            { 
              quote: "Hyderabad offers the perfect balance of world-class talent and a supportive government. It's the best place in India to build a global SaaS company.",
              author: "Chaitanya Peddi",
              role: "Co-founder, Darwinbox",
              avatar: "📦"
            }
          ].map((testimonial, i) => (
            <div key={i} className="p-16 rounded-[4rem] bg-white border border-slate-200 relative overflow-hidden group hover:shadow-2xl transition-all">
              <Quote className="absolute top-12 right-12 w-24 h-24 text-slate-100 group-hover:text-secondary/5 transition-colors" />
              <p className="text-2xl text-slate-900 font-light mb-12 leading-relaxed relative z-10 italic tracking-tight">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-3xl shadow-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="text-xl font-headline font-black text-slate-900">{testimonial.author}</div>
                  <div className="text-[10px] font-black text-secondary uppercase tracking-widest mt-1">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners Marquee - Refined */}
      <section className="py-24 bg-[#020617] overflow-hidden">
        <div className="container mx-auto px-6 mb-16">
          <div className="text-center">
            <span className="text-[10px] font-black text-blue-400/80 uppercase tracking-[0.6em] mb-4 block">Global Ecosystem Partners</span>
          </div>
        </div>
        
        <div className="flex whitespace-nowrap animate-marquee">
          {[
            'Google for Startups', 'Microsoft for Startups', 'AWS Activate', 'T-Hub', 'WE Hub', 'IMAGE CoE', 'Genome Valley', 'IIT Hyderabad', 'ISB', 'Hyderabad Angels', 'Anthill Ventures', 'Endiya Partners'
          ].map((partner, i) => (
            <div key={i} className="mx-16 text-3xl font-headline font-black text-white/20 hover:text-secondary transition-all duration-500 cursor-default tracking-tighter">
              {partner}
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {[
            'Google for Startups', 'Microsoft for Startups', 'AWS Activate', 'T-Hub', 'WE Hub', 'IMAGE CoE', 'Genome Valley', 'IIT Hyderabad', 'ISB', 'Hyderabad Angels', 'Anthill Ventures', 'Endiya Partners'
          ].map((partner, i) => (
            <div key={`dup-${i}`} className="mx-16 text-3xl font-headline font-black text-white/20 hover:text-secondary transition-all duration-500 cursor-default tracking-tighter">
              {partner}
            </div>
          ))}
        </div>
      </section>

      {/* Final Call to Action - Massive Impact */}
      <section className="container mx-auto px-6">
        <div className="bg-secondary rounded-[4rem] p-16 md:p-32 text-center text-white relative overflow-hidden shadow-[0_40px_100px_rgba(0,86,197,0.4)]">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.15)_0%,transparent_70%)]"></div>
          
          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-headline font-black mb-8 leading-[0.9] tracking-tighter">READY TO BUILD <br /> THE FUTURE?</h2>
            <p className="text-blue-100 text-2xl mb-16 leading-relaxed font-light max-w-2xl mx-auto">
              Join thousands of founders and investors who have made Hyderabad their home. The UPHyd portal is your gateway to the ecosystem.
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              <button className="px-12 py-6 bg-white text-secondary rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-blue-50 transition-all shadow-2xl">
                Register Your Startup
              </button>
              <button className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all">
                Partner With Us
              </button>
            </div>
          </div>
        </div>
      </section>

      <AddNewsModal isOpen={isAddNewsOpen} onClose={() => setIsAddNewsOpen(false)} onSuccess={fetchNews} />
    </div>
  );
};

export default Home;
