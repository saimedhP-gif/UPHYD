import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Search, 
  Filter, 
  Plus, 
  ArrowRight,
  Zap,
  Globe,
  LayoutGrid,
  List,
  Ticket
} from 'lucide-react';
import { HostEventModal } from './HostEventModal';
import { RSVPModal } from './RSVPModal';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  category: string;
  logo: string;
  description: string | null;
  registration_url: string | null;
  is_virtual: number;
}

const Events = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const [isHostOpen, setIsHostOpen] = useState(false);
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{id: number, title: string} | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/events?limit=100').then(r => r.json());
      setEvents(res.data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(currentDate.getFullYear(), parseInt(e.target.value), 1));
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentDate(new Date(parseInt(e.target.value), currentDate.getMonth(), 1));
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const calendarDays = [];

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="h-20 sm:h-32 border border-slate-100 bg-slate-50/30"></div>);
    }

    // Days of the month
    for (let d = 1; d <= days; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateStr);
      
      calendarDays.push(
        <div key={d} className="h-20 sm:h-32 border border-slate-100 p-2 sm:p-3 hover:bg-slate-50 transition-colors group relative">
          <span className="text-xs sm:text-sm font-black text-slate-300 group-hover:text-secondary transition-colors">{d}</span>
          <div className="mt-1 sm:mt-2 space-y-1 sm:space-y-1.5 overflow-hidden">
            {dayEvents.map(e => (
              <div 
                key={e.id} 
                onClick={(ev) => {
                  ev.stopPropagation();
                  setSelectedEvent({ id: e.id, title: e.title });
                  setIsRsvpOpen(true);
                }}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-secondary/10 text-secondary text-[7px] sm:text-[9px] font-black truncate border border-secondary/20 shadow-sm cursor-pointer hover:bg-secondary hover:text-white transition-colors"
                title="Click to RSVP"
              >
                {e.title}
              </div>
            ))}
          </div>
          {dayEvents.length > 0 && (
            <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-secondary shadow-[0_0_10px_rgba(0,86,197,0.5)]"></div>
          )}
        </div>
      );
    }

    return calendarDays;
  };

  return (
    <div className="flex flex-col gap-12 pb-24">
      {/* Events Header - High-End Editorial */}
      <section className="relative py-32 bg-slate-950 text-white rounded-b-[5rem] -mt-28 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-40">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,86,197,0.4)_0%,transparent_70%)]"></div>
          <img 
            src="https://picsum.photos/seed/hyderabad-events/1920/1080?blur=4" 
            alt="Background" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 mt-16 sm:mt-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 sm:gap-12">
            <div className="max-w-3xl">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-secondary font-black text-[8px] sm:text-[10px] uppercase tracking-[0.4em] mb-4 sm:mb-6"
              >
                The Nexus
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-6xl md:text-9xl font-headline font-black leading-[0.85] tracking-tighter mb-8 sm:mb-10"
              >
                ECOSYSTEM <br /><span className="text-secondary">EVENTS</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-400 text-lg sm:text-xl font-light max-w-2xl leading-relaxed"
              >
                Stay connected with the ecosystem through workshops, meetups, and summits. The pulse of Hyderabad's innovation.
              </motion.p>
            </div>
            <motion.button 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setIsHostOpen(true)}
              className="px-8 sm:px-10 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] bg-secondary text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-secondary/90 transition-all shadow-2xl shadow-secondary/30 shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Host an Event
            </motion.button>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-6 grid lg:grid-cols-4 gap-12">
        {/* Sidebar - Upcoming */}
        <div className="lg:col-span-1 space-y-10">
          <div className="p-10 rounded-[3rem] bg-white border border-slate-200 shadow-xl">
            <h3 className="text-2xl font-headline font-black mb-10 flex items-center gap-3 tracking-tight">
              <Zap className="w-6 h-6 text-secondary" /> Upcoming
            </h3>
            <div className="space-y-10">
              {events.slice(0, 3).map((e, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl group-hover:bg-secondary/10 transition-colors shadow-sm">
                      {e.logo}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{e.category}</div>
                      <div className="text-base font-black group-hover:text-secondary transition-colors tracking-tight leading-tight">{e.title}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {e.date}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {e.location}</div>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-12 py-5 rounded-2xl bg-slate-50 font-black text-xs uppercase tracking-widest text-slate-400 hover:bg-secondary hover:text-white transition-all shadow-sm">
              View All Events
            </button>
          </div>

          <div className="p-10 rounded-[3rem] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(0,86,197,0.3)_0%,transparent_70%)]"></div>
            <h4 className="text-2xl font-headline font-black mb-4 relative z-10 tracking-tight">Never Miss a Beat</h4>
            <p className="text-slate-400 text-sm mb-8 relative z-10 font-light leading-relaxed">Subscribe to our weekly newsletter for curated ecosystem updates.</p>
            <div className="relative z-10 space-y-4">
              <input type="email" placeholder="Email Address" className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-white/30 transition-all font-medium" />
              <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-lg">Subscribe</button>
            </div>
          </div>
        </div>

        {/* Main Calendar View */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-[4rem] border border-slate-200 overflow-hidden shadow-2xl">
            {/* Calendar Controls */}
            <div className="p-4 sm:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 bg-slate-50/30">
              <div className="flex items-center gap-3 sm:gap-6">
                <button 
                  onClick={prevMonth}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm"
                  aria-label="Previous Month"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
                
                <div className="flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-2 sm:py-3.5 rounded-xl sm:rounded-[1.5rem] bg-white border border-slate-200 shadow-sm">
                  <select 
                    value={currentDate.getMonth()} 
                    onChange={handleMonthChange}
                    className="bg-transparent font-headline font-black text-lg sm:text-2xl outline-none cursor-pointer hover:text-secondary transition-colors appearance-none pr-1 sm:pr-2 tracking-tight"
                  >
                    {months.map((month, index) => (
                      <option key={month} value={index}>{month}</option>
                    ))}
                  </select>
                  
                  <div className="w-px h-6 sm:h-8 bg-slate-200"></div>
                  
                  <select 
                    value={currentDate.getFullYear()} 
                    onChange={handleYearChange}
                    className="bg-transparent font-headline font-black text-lg sm:text-2xl outline-none cursor-pointer hover:text-secondary transition-colors appearance-none tracking-tight"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={nextMonth}
                  className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:bg-secondary hover:text-white hover:border-secondary transition-all shadow-sm"
                  aria-label="Next Month"
                >
                  <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              </div>
              
              <div className="flex p-1.5 rounded-xl sm:rounded-[1.5rem] bg-slate-100 shadow-inner">
                <button 
                  onClick={() => setView('calendar')}
                  className={`px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-lg sm:rounded-2xl transition-all font-black text-[10px] sm:text-xs uppercase tracking-widest ${view === 'calendar' ? 'bg-white text-secondary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  Calendar
                </button>
                <button 
                  onClick={() => setView('list')}
                  className={`px-6 sm:px-10 py-2.5 sm:py-3.5 rounded-lg sm:rounded-2xl transition-all font-black text-[10px] sm:text-xs uppercase tracking-widest ${view === 'list' ? 'bg-white text-secondary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  List View
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            {view === 'calendar' ? (
              <div className="grid grid-cols-7">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 bg-slate-50/20">
                    {day}
                  </div>
                ))}
                {renderCalendar()}
              </div>
            ) : (
              <div className="p-5 sm:p-10 space-y-6 sm:space-y-8">
                {events.map((e, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-6 sm:p-8 rounded-3xl sm:rounded-[3rem] bg-slate-50/50 border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 hover:border-secondary/30 transition-all group shadow-sm hover:shadow-xl"
                  >
                    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-[1.5rem] bg-white flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                        {e.logo}
                      </div>
                      <div>
                        <div className="text-[8px] sm:text-[10px] font-black text-secondary uppercase tracking-widest mb-1 sm:mb-2">{e.category}</div>
                        <h3 className="text-xl sm:text-2xl font-headline font-black group-hover:text-secondary transition-colors tracking-tight leading-tight">{e.title}</h3>
                        <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 sm:gap-6 mt-3 sm:mt-4 text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5 sm:gap-2"><Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {e.date}</div>
                          <div className="flex items-center gap-1.5 sm:gap-2"><Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {e.time}</div>
                          <div className="flex items-center gap-1.5 sm:gap-2"><MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {e.location}</div>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setSelectedEvent({ id: e.id, title: e.title });
                        setIsRsvpOpen(true);
                      }}
                      className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-xl sm:rounded-2xl bg-white border border-slate-200 font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-secondary hover:text-white hover:border-secondary transition-all flex items-center justify-center gap-3 group/btn shadow-sm"
                    >
                      RSVP / Tickets <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-2 transition-transform" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <HostEventModal isOpen={isHostOpen} onClose={() => setIsHostOpen(false)} onSuccess={fetchEvents} />
      <RSVPModal isOpen={isRsvpOpen} onClose={() => setIsRsvpOpen(false)} eventId={selectedEvent?.id || null} eventTitle={selectedEvent?.title || ''} />
    </div>
  );
};

export default Events;
