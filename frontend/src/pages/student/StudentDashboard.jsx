import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [evRes, regRes] = await Promise.all([
          eventService.getAll(),
          registrationService.getMyRegistrations(),
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
  const myUpcoming = registrations.filter(
    (r) => r.eventId && new Date(r.eventId.date) >= new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="relative overflow-hidden card p-8 bg-gradient-to-br from-brand-600 to-violet-700 text-white border-0">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <p className="text-brand-200 text-sm font-semibold mb-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h1 className="text-3xl font-bold font-display mb-2">
            Hey, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-brand-100 text-sm max-w-sm">
            You have <strong>{myUpcoming.length}</strong> upcoming registered event{myUpcoming.length !== 1 ? 's' : ''}. Stay active on campus!
          </p>
          {user?.department && (
            <span className="inline-flex items-center gap-1.5 mt-4 px-3 py-1 bg-white/15 rounded-full text-xs font-medium">
              🏛️ {user.department}
              {user.rollNo && <span className="text-brand-200">· {user.rollNo}</span>}
            </span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-icon bg-brand-50">🎯</div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Available Events</p>
            <p className="text-3xl font-bold font-display text-surface-900 mt-0.5">{upcomingEvents.length}</p>
            <p className="text-xs text-surface-400 mt-1">events to explore</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-emerald-50">✅</div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Registered</p>
            <p className="text-3xl font-bold font-display text-surface-900 mt-0.5">{registrations.length}</p>
            <p className="text-xs text-surface-400 mt-1">total registrations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-50">🔥</div>
          <div>
            <p className="text-xs font-semibold text-surface-500 uppercase tracking-wider">Upcoming</p>
            <p className="text-3xl font-bold font-display text-surface-900 mt-0.5">{myUpcoming.length}</p>
            <p className="text-xs text-surface-400 mt-1">events ahead</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Campus Events */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Upcoming Campus Events</h2>
            <Link to="/student/events" className="text-xs text-brand-600 font-semibold hover:text-brand-700">
              View all →
            </Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="empty-state py-8">
              <p className="empty-icon">📭</p>
              <p className="empty-title">No upcoming events</p>
              <p className="empty-desc">Check back later for new events.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.slice(0, 5).map((event) => (
                <div key={event._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-colors group">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-50 to-violet-50 flex flex-col items-center justify-center flex-shrink-0 border border-brand-100">
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
                  {event.isRegistered ? (
                    <span className="badge badge-green flex-shrink-0">✓ Joined</span>
                  ) : (
                    <Link to="/student/events" className="flex-shrink-0 text-xs font-semibold text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Register →
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Registered Events */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">My Registrations</h2>
            <Link to="/student/my-registrations" className="text-xs text-brand-600 font-semibold hover:text-brand-700">
              See all →
            </Link>
          </div>
          {registrations.length === 0 ? (
            <div className="empty-state py-8">
              <p className="empty-icon">🎟️</p>
              <p className="empty-title">No registrations yet</p>
              <p className="empty-desc">Browse events and register to get started.</p>
              <Link to="/student/events" className="btn-primary mt-4 text-xs">Browse Events</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {registrations.slice(0, 5).map((reg) => (
                <div key={reg._id} className="p-3 rounded-xl bg-surface-50 border border-surface-100">
                  <p className="text-sm font-semibold text-surface-800 line-clamp-1">{reg.eventId?.title}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-surface-400">{formatDate(reg.eventId?.date)}</p>
                    <span className="badge badge-green text-[10px]">Confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
