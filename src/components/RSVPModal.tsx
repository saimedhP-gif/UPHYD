import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Ticket, User, Mail, Building } from 'lucide-react';

interface RSVPModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: number | null;
  eventTitle: string;
}

export const RSVPModal: React.FC<RSVPModalProps> = ({ isOpen, onClose, eventId, eventTitle }) => {
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;

    try {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStep('success');
        setTimeout(() => {
          onClose();
          setStep('form');
          setFormData({ name: '', email: '', company: '' });
        }, 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[100]" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-[101] p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              {step === 'form' ? (
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center"><Ticket className="w-5 h-5 text-secondary" /></div>
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">RSVP</h2>
                        <p className="text-xs text-secondary font-bold truncate max-w-[200px]">{eventTitle}</p>
                      </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" placeholder="John Doe" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Work Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" placeholder="john@startup.com" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Company (Optional)</label>
                      <div className="relative">
                        <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input type="text" value={formData.company} onChange={e=>setFormData({...formData, company: e.target.value})} className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" placeholder="Acme Corp" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 mt-6 bg-secondary text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-slate-900 transition-colors shadow-lg">Confirm RSVP</button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">You're on the list!</h2>
                  <p className="text-slate-500 mb-6">We've reserved your spot for {eventTitle}.</p>
                  <button className="px-6 py-2.5 rounded-xl bg-slate-50 text-slate-500 font-bold hover:bg-slate-100" onClick={onClose}>Close</button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
