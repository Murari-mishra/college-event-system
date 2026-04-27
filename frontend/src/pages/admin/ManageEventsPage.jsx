import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import { EventCard } from '../../components/EventCard';
import { Modal } from '../../components/Modal';

const CATEGORIES = ['Academic', 'Cultural', 'Sports', 'Technical', 'Workshop', 'Other'];

const EditForm = ({ event, onSave, onCancel }) => {
  const [form, setForm] = useState({
    title: event.title,
    description: event.description,
    date: event.date?.split('T')[0],
    time: event.time,
    venue: event.venue,
    category: event.category,
    maxParticipants: event.maxParticipants,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onSave(event._id, form);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="alert-error"><span>⚠️</span>{error}</div>}
      <div className="form-group">
        <label className="label">Title</label>
        <input name="title" value={form.title} onChange={handleChange} className="input" required />
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="input resize-none" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">Date</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} className="input" required />
        </div>
        <div className="form-group">
          <label className="label">Time</label>
          <input name="time" value={form.time} onChange={handleChange} placeholder="e.g. 10:00 AM" className="input" required />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Venue</label>
        <input name="venue" value={form.venue} onChange={handleChange} className="input" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="form-group">
          <label className="label">Category</label>
          <select name="category" value={form.category} onChange={handleChange} className="input">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label">Max Participants</label>
          <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} className="input" min="1" />
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1 justify-center">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export const ManageEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [editEvent, setEditEvent] = useState(null);
  const [toast, setToast]       = useState('');
  const [filter, setFilter]     = useState('all');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const fetchEvents = async () => {
    try {
      const res = await eventService.getAll();
      setEvents(res.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? All registrations will also be removed.')) return;
    try {
      await eventService.delete(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      showToast('Event deleted successfully.');
    } catch (err) {
      showToast('Failed to delete event.');
    }
  };

  const handleEdit = async (id, data) => {
    const res = await eventService.update(id, data);
    setEvents((prev) => prev.map((e) =>
      e._id === id ? { ...res.event, participantCount: e.participantCount } : e
    ));
    setEditEvent(null);
    showToast('Event updated successfully.');
  };

  // Navigate to full participants page instead of modal
  const handleViewParticipants = (eventId) => {
    navigate(`/admin/participants/${eventId}`);
  };

  const filteredEvents = events.filter((e) => {
    if (filter === 'upcoming') return new Date(e.date) >= new Date();
    if (filter === 'past')     return new Date(e.date) < new Date();
    return true;
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
      {toast && (
        <div className="fixed top-20 right-4 z-50 alert-success shadow-lg animate-slide-up">
          ✅ {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Manage Events</h1>
          <p className="page-subtitle">{events.length} total events</p>
        </div>
        <Link to="/admin/create-event" className="btn-primary">
          <span>+</span> Create Event
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-surface-100 rounded-xl w-fit">
        {['all', 'upcoming', 'past'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
              filter === f
                ? 'bg-white text-surface-900 shadow-card'
                : 'text-surface-500 hover:text-surface-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Events grid */}
      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <p className="empty-icon">📭</p>
          <p className="empty-title">No events found</p>
          <p className="empty-desc">Create your first event using the button above.</p>
          <Link to="/admin/create-event" className="btn-primary mt-4">+ Create Event</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              role="admin"
              onDelete={handleDelete}
              onEdit={setEditEvent}
              onViewParticipants={handleViewParticipants}
            />
          ))}
        </div>
      )}

      {/* Edit Modal — kept as modal since it's a small form */}
      <Modal isOpen={!!editEvent} onClose={() => setEditEvent(null)} title="Edit Event">
        {editEvent && (
          <EditForm
            event={editEvent}
            onSave={handleEdit}
            onCancel={() => setEditEvent(null)}
          />
        )}
      </Modal>
    </div>
  );
};