import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Tag, Edit3, Users, CheckCircle } from 'lucide-react';

interface HostEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const HostEventModal: React.FC<HostEventModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '', date: '', time: '', location: '', category: 'Conference', description: ''
  });
  const [step, setStep] = useState<'form' | 'success'>('form');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, is_virtual: false, logo: '🎉' })
      });
      if (res.ok) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
          setStep('form');
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
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-[101] p-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
              {step === 'form' ? (
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white"><Calendar className="w-5 h-5 text-secondary" /></div>
                      <h2 className="text-xl font-bold text-slate-900">Host an Event</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Event Title</label>
                      <input type="text" required value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary" placeholder="Tech Meetup 2026" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Date</label>
                        <input type="date" required value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Time</label>
                        <input type="time" required value={formData.time} onChange={e=>setFormData({...formData, time: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                        <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm">
                          <option>Conference</option><option>Workshop</option><option>Networking</option><option>Social</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Location</label>
                        <input type="text" required value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" placeholder="T-Hub 2.0" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 mt-6 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-secondary transition-colors shadow-lg">Publish Event</button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Event Listed!</h2>
                  <p className="text-slate-500">Your event has been successfully added to the ecosystem calendar.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
