import { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { EventCard } from '../../components/EventCard';

const CATEGORIES = ['All', 'Technical', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Other'];

export const EventListPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [filter, setFilter] = useState('all');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3500);
  };

  useEffect(() => {
    eventService.getAll()
      .then((res) => setEvents(res.events || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await registrationService.register(eventId);
      setEvents((prev) =>
        prev.map((e) => e._id === eventId ? { ...e, isRegistered: true, registrationStatus: 'confirmed' } : e)
      );
      showToast('🎉 Successfully registered for the event!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed.', 'error');
    }
  };

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venue.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || e.category === category;
    const isPast = new Date(e.date) < new Date();
    const matchTime = filter === 'all' || (filter === 'upcoming' && !isPast) || (filter === 'past' && isPast);
    const matchReg = filter === 'registered' ? e.isRegistered : true;
    return matchSearch && matchCat && matchTime && matchReg;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-20 right-4 z-50 shadow-lg animate-slide-up px-4 py-3 rounded-xl text-sm font-medium ${
          toast.type === 'error' ? 'alert-error' : 'alert-success'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Campus Events</h1>
        <p className="page-subtitle">Discover and register for events happening around campus.</p>
      </div>

      {/* Search & Filters */}
      <div className="card p-4 space-y-4">
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search events by name or venue..."
            className="input pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* Time filter */}
          <div className="flex gap-1 p-1 bg-surface-100 rounded-xl">
            {['all', 'upcoming', 'past', 'registered'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  filter === f ? 'bg-white text-surface-900 shadow-card' : 'text-surface-500 hover:text-surface-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {/* Category filter */}
          <div className="flex flex-wrap gap-1">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  category === c
                    ? 'bg-brand-600 text-white shadow-brand'
                    : 'bg-surface-100 text-surface-600 hover:bg-surface-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-surface-500">
        Showing <span className="font-semibold text-surface-800">{filtered.length}</span> event{filtered.length !== 1 ? 's' : ''}
        {search && <> matching <em>"{search}"</em></>}
      </p>

      {/* Events grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">🔍</p>
          <p className="empty-title">No events found</p>
          <p className="empty-desc">Try adjusting your search or filters to find events.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              role="student"
              onRegister={handleRegister}
            />
          ))}
        </div>
      )}
    </div>
  );
};
