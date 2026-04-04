import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, Database, Link, Briefcase, Info } from 'lucide-react';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddResourceModal: React.FC<AddResourceModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState<{id: number, title: string}[]>([]);
  const [formData, setFormData] = useState({
    category_id: '', name: '', type: '', location: '', logo: '', website: '', description: ''
  });
  const [step, setStep] = useState<'form' | 'success'>('form');

  useEffect(() => {
    if (isOpen && categories.length === 0) {
      fetch('/api/resources')
        .then(res => res.json())
        .then(data => {
          setCategories(data.data || []);
          if (data.data?.length > 0) {
             setFormData(prev => ({ ...prev, category_id: String(data.data[0].id) }));
          }
        });
    }
  }, [isOpen, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/resources/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData, category_id: parseInt(formData.category_id, 10)})
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
                      <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white"><Database className="w-5 h-5 text-secondary" /></div>
                      <h2 className="text-xl font-bold text-slate-900">Add Resource</h2>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Resource Name</label>
                      <input type="text" required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary" placeholder="DPIIT Portal" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                        <select value={formData.category_id} onChange={e=>setFormData({...formData, category_id: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm">
                          {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Resource Type</label>
                        <input type="text" required value={formData.type} onChange={e=>setFormData({...formData, type: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" placeholder="Govt Scheme, PDF..." />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Link (Optional)</label>
                        <input type="url" value={formData.website} onChange={e=>setFormData({...formData, website: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" placeholder="https://" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-2">Logo Emoji</label>
                        <input type="text" maxLength={2} value={formData.logo} onChange={e=>setFormData({...formData, logo: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-secondary text-sm" placeholder="🔗" />
                      </div>
                    </div>
                    <button type="submit" className="w-full py-4 mt-6 bg-slate-900 text-white font-bold text-sm uppercase tracking-widest rounded-xl hover:bg-secondary transition-colors shadow-lg">Submit Resource</button>
                  </form>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-500" /></motion.div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Resource Added!</h2>
                  <p className="text-slate-500">Thank you for contributing to the Hyderabad ecosystem.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
