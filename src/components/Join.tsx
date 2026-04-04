import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Rocket, 
  Users, 
  Globe, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  Shield, 
  CheckCircle2,
  Building2,
  Mail,
  Briefcase,
  MessageSquare,
  Sparkles
} from 'lucide-react';

const Join = () => {
  const [formType, setFormType] = useState<'startup' | 'individual'>('startup');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const payload = {
      name: data.get('name'),
      email: data.get('email'),
      company: formType === 'startup' ? data.get('company') : data.get('skill'),
      message: (data.get('message') as string) + (formType === 'startup' ? `\nSector: ${data.get('sector')}\nStage: ${data.get('stage')}` : `\nLinkedIn: ${data.get('linkedin')}`),
      type: formType,
    };
    try {
      const res = await fetch('/api/contact/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-32 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center mb-10"
        >
          <CheckCircle2 className="w-12 h-12 text-secondary" />
        </motion.div>
        <h2 className="text-5xl font-headline font-black mb-6 tracking-tighter">APPLICATION RECEIVED</h2>
        <p className="text-slate-500 text-xl max-w-xl mx-auto font-light leading-relaxed">
          Thank you for applying to join the Hyderabad Startup Ecosystem. Our team will review your application and get back to you within 48 hours.
        </p>
        <button 
          onClick={() => setSubmitted(false)}
          className="mt-12 px-10 py-4 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          Back to Form
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-24 pb-32">
      {/* Header Section */}
      <section className="relative py-32 bg-slate-950 text-white rounded-b-[5rem] -mt-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,86,197,0.4)_0%,transparent_70%)]"></div>
          <img 
            src="https://picsum.photos/seed/hyderabad-join/1920/1080?blur=4" 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
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
              Join the Frontier
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-2xl sm:text-3xl md:text-5xl font-headline font-black leading-[0.85] tracking-tighter mb-6 sm:mb-8 uppercase"
            >
              BUILT FOR <br /><span className="text-secondary">GLOBAL SCALE</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg sm:text-xl font-light max-w-2xl leading-relaxed"
            >
              Whether you're a founder building the next unicorn or a talent looking to join a high-growth team, your journey starts here.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Selection Section */}
      <section className="container mx-auto px-6 -mt-32 sm:-mt-40 relative z-20">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-6 sm:gap-8">
          <button 
            onClick={() => setFormType('startup')}
            className={`group p-8 sm:p-12 rounded-3xl sm:rounded-[4rem] text-left transition-all duration-500 border-2 ${formType === 'startup' ? 'bg-white border-secondary shadow-2xl' : 'bg-white/80 backdrop-blur-xl border-transparent hover:border-secondary/30 shadow-xl'}`}
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-8 sm:mb-10 transition-all duration-500 ${formType === 'startup' ? 'bg-secondary text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
              <Rocket className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className={`text-3xl sm:text-4xl font-headline font-black mb-4 tracking-tight ${formType === 'startup' ? 'text-slate-900' : 'text-slate-400'}`}>I'm a Founder</h3>
            <p className={`text-base sm:text-lg font-light leading-relaxed ${formType === 'startup' ? 'text-slate-500' : 'text-slate-400'}`}>
              Register your startup to get access to funding, mentorship, and the global network.
            </p>
          </button>

          <button 
            onClick={() => setFormType('individual')}
            className={`group p-8 sm:p-12 rounded-3xl sm:rounded-[4rem] text-left transition-all duration-500 border-2 ${formType === 'individual' ? 'bg-white border-secondary shadow-2xl' : 'bg-white/80 backdrop-blur-xl border-transparent hover:border-secondary/30 shadow-xl'}`}
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-8 sm:mb-10 transition-all duration-500 ${formType === 'individual' ? 'bg-secondary text-white scale-110' : 'bg-slate-100 text-slate-400'}`}>
              <Users className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className={`text-3xl sm:text-4xl font-headline font-black mb-4 tracking-tight ${formType === 'individual' ? 'text-slate-900' : 'text-slate-400'}`}>I'm a Talent</h3>
            <p className={`text-base sm:text-lg font-light leading-relaxed ${formType === 'individual' ? 'text-slate-500' : 'text-slate-400'}`}>
              Join our talent pool and get matched with the fastest-growing startups in Hyderabad.
            </p>
          </button>
        </div>
      </section>

      {/* Form Section */}
      <section className="container mx-auto px-6 max-w-3xl">
        <motion.div
          key={formType}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 sm:p-12 md:p-20 rounded-3xl sm:rounded-[4rem] shadow-2xl border border-slate-100"
        >
          <div className="flex items-center gap-4 mb-12">
            <Sparkles className="text-secondary w-8 h-8" />
            <h2 className="text-3xl font-headline font-black tracking-tight uppercase">
              {formType === 'startup' ? 'Startup Registration' : 'Talent Application'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Name</label>
                <div className="relative">
                  <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    required
                    name="name"
                    type="text" 
                    placeholder="John Doe"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                  <input 
                    required
                    name="email"
                    type="email" 
                    placeholder="john@example.com"
                    className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {formType === 'startup' ? (
              <>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Startup Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      required
                      name="company"
                      type="text" 
                      placeholder="Acme Corp"
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Sector</label>
                    <select name="sector" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium appearance-none">
                      <option>SaaS</option>
                      <option>FinTech</option>
                      <option>DeepTech</option>
                      <option>BioTech</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Current Stage</label>
                    <select name="stage" className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium appearance-none">
                      <option>Seed</option>
                      <option>Series A</option>
                      <option>Series B</option>
                      <option>Growth</option>
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Skill</label>
                  <div className="relative">
                    <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      required
                      name="skill"
                      type="text" 
                      placeholder="Full Stack Developer"
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">LinkedIn Profile</label>
                  <div className="relative">
                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                    <input 
                      required
                      name="linkedin"
                      type="url" 
                      placeholder="https://linkedin.com/in/username"
                      className="w-full pl-16 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Tell us more</label>
              <div className="relative">
                <MessageSquare className="absolute left-6 top-8 text-slate-300 w-5 h-5" />
                <textarea 
                  rows={4}
                  name="message"
                  required
                  placeholder="What are you building or looking for?"
                  className="w-full pl-16 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-secondary/20 transition-all font-medium resize-none"
                ></textarea>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-6 bg-secondary text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-secondary/90 hover:scale-[1.02] transition-all shadow-[0_20px_50px_rgba(0,86,197,0.3)] flex items-center justify-center gap-4 group"
            >
              Submit Application <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </button>
          </form>
        </motion.div>
      </section>

      {/* Benefits Grid */}
      <section className="container mx-auto px-6">
        <div className="text-center mb-20">
          <div className="text-secondary font-black text-[10px] uppercase tracking-[0.4em] mb-6">Why Join?</div>
          <h2 className="text-5xl md:text-7xl font-headline font-black tracking-tighter uppercase">Ecosystem Benefits</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {[
            { icon: <TrendingUp />, title: 'Capital Access', desc: 'Direct connections to India\'s leading VCs and angel networks.' },
            { icon: <Zap />, title: 'Fast-Track Growth', desc: 'Priority access to T-Hub programs and government grants.' },
            { icon: <Shield />, title: 'Global Network', desc: 'Soft-landing programs in 20+ global tech ecosystems.' },
          ].map((benefit, i) => (
            <div key={i} className="p-12 rounded-[3.5rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all group">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-secondary mb-8 shadow-sm group-hover:scale-110 transition-transform">
                {benefit.icon}
              </div>
              <h4 className="text-2xl font-headline font-black mb-4 tracking-tight">{benefit.title}</h4>
              <p className="text-slate-500 font-light leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Join;
