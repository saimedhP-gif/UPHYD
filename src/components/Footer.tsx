import React, { useState } from 'react';
import { Rocket, Twitter, Linkedin, Instagram, Github, Mail, Phone, MapPin, Globe, ArrowRight } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const resp = await fetch('/api/contact/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (resp.ok) {
        setStatus('Subscribed successfully!');
        setEmail('');
      } else {
        const body = await resp.json();
        setStatus(body.message || 'Error subscribing.');
      }
    } catch (err) {
      setStatus('Network error.');
    }
  };

  return (
    <footer className="bg-primary text-white pt-24 pb-12 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,86,197,0.1)_0%,transparent_50%)]"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
          {/* Brand */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                <Rocket className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-headline font-extrabold tracking-tighter leading-none text-white">UPHyd</span>
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none text-blue-200/60">The Frontier of Indian Tech</span>
              </div>
            </div>
            <p className="text-blue-100/60 text-sm leading-relaxed max-w-xs">
              The premier gateway for tech founders, investors, and ecosystem enablers in Hyderabad. Empowering the next generation of global champions.
            </p>
            <div className="flex gap-4">
              {[Twitter, Linkedin, Instagram, Github].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-200/60 hover:bg-secondary hover:text-white hover:border-secondary transition-all">
                  <Icon className="w-5 h-5" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-headline font-bold mb-8">Ecosystem</h4>
            <ul className="space-y-4">
              {['Startup Directory', 'Incubators & Hubs', 'Funding Opportunities', 'Mentor Network', 'Events Calendar'].map((link, i) => (
                <li key={i}>
                  <button className="text-blue-200/60 text-sm hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-headline font-bold mb-8">Resources</h4>
            <ul className="space-y-4">
              {['Startup Playbook', 'Legal & Compliance', 'Hiring Guide', 'Pitch Deck Templates', 'Success Stories'].map((link, i) => (
                <li key={i}>
                  <button className="text-blue-200/60 text-sm hover:text-white hover:translate-x-1 transition-all flex items-center gap-2 group">
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-headline font-bold mb-8">Stay Updated</h4>
            <div className="space-y-6">
              <p className="text-blue-100/60 text-sm">Get the latest news and startup funding updates from Hyderabad directly to your inbox.</p>
              <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-secondary text-sm text-white"
                />
                <button type="submit" className="w-full px-4 py-3 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-secondary/20">
                  Subscribe
                </button>
                {status && <p className="text-xs text-blue-200/80">{status}</p>}
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-blue-200/40 text-xs font-medium">
            © 2026 UPHyd - Hyderabad Startup Portal. All rights reserved.
          </div>
          <div className="flex gap-8">
            <button className="text-blue-200/40 text-xs hover:text-white transition-colors">Privacy Policy</button>
            <button className="text-blue-200/40 text-xs hover:text-white transition-colors">Terms of Service</button>
            <button className="text-blue-200/40 text-xs hover:text-white transition-colors">Cookie Policy</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
