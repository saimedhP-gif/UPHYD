import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Briefcase, MapPin, DollarSign, Building2, ExternalLink, Activity, Target } from 'lucide-react';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => {
        setJobs(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch jobs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col gap-12 pb-24 min-h-screen">
      {/* Jobs Header */}
      <section className="relative py-32 bg-slate-950 text-white rounded-b-[5rem] -mt-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <img src="https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80&w=2070" alt="Tech Office" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>
        </div>
        <div className="container mx-auto px-6 relative z-10 pt-20">
          <div className="max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl md:text-9xl font-headline font-black leading-[0.85] tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
            >
              STARTUP <br /><span className="text-secondary">JOBS</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg sm:text-xl font-light max-w-2xl leading-relaxed"
            >
              The premium hiring network. Connect directly with the fastest growing tech companies, unicorns, and stealth startups in Hyderabad.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="container mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
             <Activity className="w-6 h-6 text-secondary" />
             Actively Hiring
          </h2>
          <span className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-600 rounded-full border border-green-200">
             {jobs.length} Open Roles
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center p-20"><Activity className="w-8 h-8 text-secondary animate-spin" /></div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job: any, i: number) => (
              <motion.div key={job.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-6 rounded-[2rem] bg-white border border-slate-200 hover:border-secondary/30 hover:shadow-2xl transition-all group flex flex-col">
                
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <Building2 className="w-6 h-6 text-slate-400" />
                  </div>
                  {job.equity === 'Yes' && (
                    <span className="text-[10px] font-black px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl uppercase tracking-widest shadow-md">
                      Equity Offered
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1">{job.title}</h3>
                <p className="text-secondary font-bold text-sm mb-6">{job.company}</p>

                <div className="space-y-3 mb-8 flex-grow">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" /> {job.location}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Briefcase className="w-4 h-4 text-slate-400" /> {job.type}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                    <DollarSign className="w-4 h-4 text-slate-400" /> {job.salary}
                  </div>
                </div>

                <a href={job.link} target="_blank" rel="noreferrer" 
                   className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-secondary hover:text-white text-slate-700 font-bold rounded-xl transition-colors border border-slate-200 hover:border-secondary group/btn">
                   Apply Now
                   <ExternalLink className="w-4 h-4 text-slate-400 group-hover/btn:text-white" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Jobs;
