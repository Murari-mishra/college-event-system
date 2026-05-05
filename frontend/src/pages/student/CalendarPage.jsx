import { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enIN } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { eventService } from '../../services/eventService';
import { registrationService } from '../../services/registrationService';
import { Modal } from '../../components/Modal';

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { 'en-IN': enIN },
});

const categoryColors = {
  Technical:  '#3b6ef5',
  Cultural:   '#8b5cf6',
  Sports:     '#10b981',
  Academic:   '#f59e0b',
  Workshop:   '#f43f5e',
  Other:      '#64748b',
};

export const CalendarPage = () => {
  const [events, setEvents]               = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [calEvents, setCalEvents]         = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [toast, setToast]                 = useState('');
  const [view, setView]                   = useState('month');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  useEffect(() => {
    Promise.all([eventService.getAll(), registrationService.getMyRegistrations()])
      .then(([evRes, regRes]) => {
        const evs = evRes.events || [];
        const regs = regRes.registrations || [];
        setEvents(evs);
        setRegistrations(regs);

        const mapped = evs.map((e) => {
          const start = new Date(e.date);
          const end   = new Date(e.date);
          end.setHours(end.getHours() + 2);
          return {
            id:           e._id,
            title:        e.title,
            start,
            end,
            resource:     e,
            isRegistered: e.isRegistered,
            color:        categoryColors[e.category] || categoryColors.Other,
          };
        });
        setCalEvents(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRegister = async (eventId) => {
    try {
      await registrationService.register(eventId);
      setCalEvents((prev) =>
        prev.map((e) => e.id === eventId ? { ...e, isRegistered: true } : e)
      );
      setSelectedEvent((prev) => prev ? { ...prev, isRegistered: true } : prev);
      showToast('🎉 Successfully registered!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Registration failed.');
    }
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      border: 'none',
      borderRadius: '6px',
      color: 'white',
      fontSize: '12px',
      fontWeight: '600',
      padding: '2px 6px',
      opacity: event.isRegistered ? 1 : 0.85,
      cursor: 'pointer',
    },
  });

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {toast && (
        <div className="fixed top-20 right-4 z-50 alert-success shadow-lg animate-slide-up px-4 py-3 rounded-xl text-sm font-medium">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Event Calendar</h1>
          <p className="page-subtitle">View all campus events on a calendar.</p>
        </div>
      </div>

      {/* Legend */}
      <div className="card p-4">
        <div className="flex flex-wrap gap-3">
          {Object.entries(categoryColors).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-surface-600 font-medium">{cat}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 ml-4 pl-4 border-l border-surface-200">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-surface-600 font-medium">Registered</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="card p-4 overflow-hidden">
        <style>{`
          .rbc-calendar { font-family: 'Plus Jakarta Sans', sans-serif; }
          .rbc-header { background: #f8fafc; padding: 10px; font-weight: 600; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-color: #e2e8f0; }
          .rbc-today { background-color: #eef5ff !important; }
          .rbc-off-range-bg { background-color: #f8fafc; }
          .rbc-day-bg:hover { background-color: #f1f5f9; }
          .rbc-toolbar button { border-radius: 8px; font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; font-size: 13px; color: #475569; border-color: #e2e8f0; padding: 6px 14px; }
          .rbc-toolbar button:hover { background: #f1f5f9; color: #1e293b; }
          .rbc-toolbar button.rbc-active { background: #3b6ef5 !important; color: white !important; border-color: #3b6ef5 !important; }
          .rbc-toolbar .rbc-toolbar-label { font-weight: 700; font-size: 18px; color: #0f172a; font-family: 'Syne', sans-serif; }
          .rbc-event:focus { outline: none; }
          .rbc-show-more { color: #3b6ef5; font-weight: 600; font-size: 11px; }
          .rbc-month-row { border-color: #e2e8f0; }
          .rbc-day-slot .rbc-time-slot { border-color: #f1f5f9; }
        `}</style>
        <Calendar
          localizer={localizer}
          events={calEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={(event) => setSelectedEvent(event.resource)}
          view={view}
          onView={setView}
          views={['month', 'week', 'agenda']}
          popup
        />
      </div>

      {/* Event Detail Modal */}
      <Modal isOpen={!!selectedEvent} onClose={() => setSelectedEvent(null)} title="Event Details">
        {selectedEvent && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span
                className="badge text-white"
                style={{ backgroundColor: categoryColors[selectedEvent.category] || categoryColors.Other }}
              >
                {selectedEvent.category || 'Other'}
              </span>
              {selectedEvent.isRegistered && (
                <span className="badge badge-green">✓ Registered</span>
              )}
              {new Date(selectedEvent.date) < new Date() && (
                <span className="badge bg-surface-100 text-surface-500">Concluded</span>
              )}
            </div>

            <h2 className="text-xl font-bold font-display text-surface-900">
              {selectedEvent.title}
            </h2>

            <p className="text-sm text-surface-600 leading-relaxed">
              {selectedEvent.description}
            </p>

            <div className="space-y-2 p-4 bg-surface-50 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-surface-700">
                <span>📅</span>
                <span className="font-medium">
                  {new Date(selectedEvent.date).toLocaleDateString('en-IN', {
                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-700">
                <span>🕐</span>
                <span className="font-medium">{selectedEvent.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-700">
                <span>📍</span>
                <span className="font-medium">{selectedEvent.venue}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-surface-700">
                <span>👥</span>
                <span className="font-medium">Max {selectedEvent.maxParticipants} participants</span>
              </div>
            </div>

            {!selectedEvent.isRegistered && new Date(selectedEvent.date) >= new Date() && (
              <button
                onClick={() => handleRegister(selectedEvent._id)}
                className="btn-primary w-full justify-center py-3"
              >
                 Register for this Event
              </button>
            )}

            {selectedEvent.isRegistered && (
              <div className="flex items-center justify-center gap-2 py-3 text-emerald-600 font-semibold">
                You're registered for this event!
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};