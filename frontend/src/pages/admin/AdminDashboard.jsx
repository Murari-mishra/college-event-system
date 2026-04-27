import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';

const StatCard = ({ icon, label, value, sub, color }) => (
  <div className="stat-card animate-slide-up">
    <div className={`stat-icon ${color}`}>
      <span>{icon}</span>
    </div>
    <div>
      <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">{label}</p>
      <p className="text-3xl font-bold font-display text-surface-900 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-surface-400 mt-1">{sub}</p>}
    </div>
  </div>
);

const formatDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regRes] = await Promise.all([
          eventService.getAll(),
          registrationService.getAll(),
        ]);
        setEvents(evRes.events || []);
        setRegistrations(regRes.registrations || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const upcomingEvents = events.filter((e) => new Date(e.date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.date) < new Date());
  const totalParticipants = registrations.filter((r) => r.status !== 'cancelled').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="page-subtitle">Here's what's happening on campus today.</p>
        </div>
        <Link to="/admin/create-event" className="btn-primary whitespace-nowrap">
          <span>+</span> New Event
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="📅" label="Total Events" value={events.length} sub={`${upcomingEvents.length} upcoming`} color="bg-brand-50" />
        <StatCard icon="👥" label="Registrations" value={totalParticipants} sub="across all events" color="bg-violet-50" />
        <StatCard icon="🔥" label="Upcoming" value={upcomingEvents.length} sub="events scheduled" color="bg-amber-50" />
        <StatCard icon="✅" label="Concluded" value={pastEvents.length} sub="past events" color="bg-emerald-50" />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Events */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Upcoming Events</h2>
            <Link to="/admin/events" className="text-xs text-brand-600 font-semibold hover:text-brand-700">
              View all →
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="empty-state py-8">
              <p className="empty-icon">📭</p>
              <p className="empty-title">No upcoming events</p>
              <p className="empty-desc">Create your first event to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] text-brand-500 font-bold uppercase">
                      {new Date(event.date).toLocaleString('en', { month: 'short' })}
                    </span>
                    <span className="text-lg font-bold text-brand-700 leading-none">
                      {new Date(event.date).getDate()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-surface-900 text-sm truncate">{event.title}</p>
                    <p className="text-xs text-surface-500 mt-0.5">📍 {event.venue} · {event.time}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-blue">{event.participantCount ?? 0} joined</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Registrations */}
        <div className="card p-6">
          <h2 className="section-title mb-5">Recent Registrations</h2>
          {registrations.length === 0 ? (
            <div className="empty-state py-8">
              <p className="empty-icon">📋</p>
              <p className="empty-title">No registrations yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.slice(0, 6).map((reg) => (
                <div key={reg._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {reg.userId?.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-surface-800 truncate">{reg.userId?.name}</p>
                    <p className="text-xs text-surface-400 truncate">{reg.eventId?.title}</p>
                  </div>
                  <span className="badge badge-green text-[10px]">✓</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
